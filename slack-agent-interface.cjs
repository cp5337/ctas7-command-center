#!/usr/bin/env node
/**
 * Synaptix Slack Agent Interface
 * Bridge until iOS ready - task agents via Slack
 *
 * Usage in Slack:
 *   @natasha run discovery scripts
 *   @cove check repository status
 *   @marcus configure neural mux
 *   /synaptix-status - Check all agents
 */

const http = require('http');
const { LinearClient } = require('@linear/sdk');

// Load environment variables
require('dotenv').config();

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID || '979acadf-8301-459e-9e51-bf3c1f60e496';
const PORT = process.env.SLACK_INTERFACE_PORT || 18299;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set! Configure in .env file');
  process.exit(1);
}

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// Agent registry
const AGENTS = {
  natasha: { name: 'Natasha', port: 50052, slack: '@natasha', status: 'checking...' },
  cove: { name: 'Cove', port: 50053, slack: '@cove', status: 'checking...' },
  marcus: { name: 'Marcus', port: 50051, slack: '@marcus', status: 'checking...' },
  elena: { name: 'Elena', port: 50054, slack: '@elena', status: 'checking...' },
  sarah: { name: 'Sarah', port: 18180, slack: '@sarah', status: 'checking...' },
  abe: { name: 'ABE', port: 50058, slack: '@abe', status: 'checking...' },
};

// Simple command parser
function parseCommand(text) {
  const mention = text.match(/@(\w+)/);
  const command = text.replace(/@\w+/, '').trim();

  return {
    agent: mention ? mention[1].toLowerCase() : null,
    command: command,
    isStatus: text.includes('/synaptix-status') || text.includes('status')
  };
}

// Create Linear issue from Slack command
async function createTaskFromSlack(agentName, command, slackUser) {
  try {
    const agent = AGENTS[agentName];
    if (!agent) {
      return `❌ Unknown agent: ${agentName}. Available: ${Object.keys(AGENTS).join(', ')}`;
    }

    // Create issue in Linear
    const result = await linear.createIssue({
      teamId: TEAM_ID,
      title: `[Slack] ${command.substring(0, 60)}`,
      description: `Task from Slack by ${slackUser}

Command: ${command}

🤖 Agent: ${agent.name}
📡 Port: ${agent.port}
💬 Slack: ${agent.slack}
🎯 Source: Slack voice/mobile interface`,
      priority: 2 // High priority for Slack tasks
    });

    const issueId = result.issue.identifier;

    return `✅ Task created: ${issueId}
🤖 Assigned to: ${agent.name}
📋 "${command}"
🔗 https://linear.app/cognetixalpha/issue/${issueId}`;

  } catch (error) {
    return `❌ Error creating task: ${error.message}`;
  }
}

// Get system status
async function getSystemStatus() {
  let status = '📊 *SYNAPTIX AGENT STATUS*\n\n';

  // Check PM2 services
  const { execSync } = require('child_process');
  try {
    const pm2Status = execSync('pm2 jlist').toString();
    const services = JSON.parse(pm2Status);

    const running = services.filter(s => s.pm2_env.status === 'online');
    const stopped = services.filter(s => s.pm2_env.status !== 'online');

    status += `*Running Services:* ${running.length}\n`;
    running.forEach(s => {
      status += `  ✅ ${s.name}\n`;
    });

    if (stopped.length > 0) {
      status += `\n*Stopped Services:* ${stopped.length}\n`;
      stopped.slice(0, 5).forEach(s => {
        status += `  ❌ ${s.name}\n`;
      });
    }
  } catch (error) {
    status += '⚠️ Could not check PM2 status\n';
  }

  status += '\n*Available Agents:*\n';
  Object.entries(AGENTS).forEach(([key, agent]) => {
    status += `  ${agent.slack} - ${agent.name} (Port ${agent.port})\n`;
  });

  status += '\n*Usage:*\n';
  status += '  `@natasha run discovery scripts`\n';
  status += '  `@cove check repository`\n';
  status += '  `/synaptix-status` - This message\n';

  return status;
}

// HTTP server for Slack webhooks
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        // Handle Slack challenge
        if (data.challenge) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ challenge: data.challenge }));
          return;
        }

        // Handle message
        if (data.event && data.event.type === 'message') {
          const text = data.event.text;
          const user = data.event.user;

          const parsed = parseCommand(text);

          let response;
          if (parsed.isStatus) {
            response = await getSystemStatus();
          } else if (parsed.agent) {
            response = await createTaskFromSlack(parsed.agent, parsed.command, user);
          } else {
            response = 'Use @agentname to assign tasks. Type `/synaptix-status` for help.';
          }

          console.log('Slack Command:', text);
          console.log('Response:', response);

          // Send response (you'll need to configure Slack webhook URL)
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ text: response }));
          return;
        }

        res.writeHead(200);
        res.end('OK');

      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end('Error');
      }
    });
  } else if (req.method === 'GET') {
    // Health check
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Synaptix Slack Interface Running\n');
  }
});

server.listen(PORT, () => {
  console.log('🚀 SYNAPTIX SLACK AGENT INTERFACE');
  console.log('=' .repeat(60));
  console.log(`✅ Running on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/slack`);
  console.log('');
  console.log('📋 Available Commands:');
  console.log('  @natasha <task> - Assign to Natasha');
  console.log('  @cove <task> - Assign to Cove');
  console.log('  @marcus <task> - Assign to Marcus');
  console.log('  @elena <task> - Assign to Elena');
  console.log('  @sarah <task> - Assign to Sarah');
  console.log('  @abe <task> - Assign to ABE');
  console.log('  /synaptix-status - Check system status');
  console.log('');
  console.log('🎯 All tasks auto-created in Linear!');
  console.log('📱 Use from Slack mobile until iOS ready');
  console.log('');
});

// Log status on startup
(async () => {
  console.log('Checking agent status...\n');
  const status = await getSystemStatus();
  console.log(status);
})();
