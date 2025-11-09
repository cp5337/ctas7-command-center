# CTAS 7.3 - Complete Slack Integration

**Purpose**: Unified Slack integration across all agents, services, and workflows

---

## Overview

Slack will be the **command and control interface** for:
- All 17 AI agents (Natasha, Cove, Marcus, Elena, etc.)
- PM2 service alerts
- Git workflow notifications
- Linear task updates
- System health monitoring
- Voice command pipeline
- Emergency escalations

---

## Architecture

### **Hub & Spoke Model**

```
Slack Workspace: ctas-synaptix.slack.com
├─ #command-center (main dashboard)
├─ #git-alerts (commits, PRs, conflicts)
├─ #linear-updates (task assignments, completions)
├─ #service-health (PM2, Docker, ports)
├─ #agent-coordination (inter-agent communication)
├─ #elena-mentoring (Mackenzie's learning)
├─ #voice-commands (Natasha voice interface)
└─ #escalations (critical alerts)

DMs:
├─ @natasha-ai (AI/ML architecture)
├─ @cove-ai (repository ops)
├─ @marcus-ai (Neural Mux)
├─ @elena-ai (QA + mentor)
├─ @sarah-ai (Linear coordination)
├─ @abe-ai (document intelligence)
├─ ... (all 17 agents)
└─ @you (leadership)
```

---

## Implementation Components

### **1. Slack Bot Configuration**

**App Name**: CTAS Command Center
**Scopes Needed**:
```
chat:write          # Post messages
chat:write.public   # Post in public channels
channels:read       # List channels
channels:history    # Read channel messages
users:read          # Get user info
users:read.email    # Get emails
files:write         # Upload files (logs, reports)
commands            # Slash commands
reactions:write     # Add reactions (status indicators)
```

**Slash Commands**:
```
/ctas-status          → Overall system health
/ctas-git-status      → Uncommitted work across repos
/ctas-linear-triage   → Open Linear triage
/ctas-service [name]  → Check service health
/ctas-agent [name]    → Agent status
/ctas-deploy [env]    → Deploy to environment
/ctas-rollback        → Emergency rollback
/natasha [command]    → Talk to Natasha
/elena [question]     → Ask Elena
```

---

### **2. Integration Points**

#### **A. PM2 Service Monitoring**

**File**: `slack-integration/pm2-slack-monitor.js`

```javascript
// Monitor PM2 services, alert on status changes
const pm2 = require('pm2');
const { WebClient } = require('@slack/web-api');

setInterval(async () => {
  pm2.list((err, processes) => {
    processes.forEach(proc => {
      if (proc.pm2_env.status === 'errored') {
        slack.chat.postMessage({
          channel: '#service-health',
          text: `🚨 *${proc.name}* is errored (${proc.pm2_env.restart_time} restarts)`
        });
      }
    });
  });
}, 60000); // Check every minute
```

**Notifications**:
- Service starts/stops
- Errors (immediate alert)
- Restarts (> 3 = warning)
- Resource usage spikes

---

#### **B. Git Workflow Integration**

**File**: `slack-integration/git-slack-notifier.sh`

```bash
#!/bin/bash
# Post-commit hook → Slack notification

SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
REPO=$(basename $(git rev-parse --show-toplevel))
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
AUTHOR=$(git log -1 --pretty=%an)

curl -X POST $SLACK_WEBHOOK -H 'Content-Type: application/json' -d '{
  "channel": "#git-alerts",
  "text": "'"📝 *$AUTHOR* committed to *$REPO* ($BRANCH)\n\`$COMMIT_MSG\`"'"
}'
```

**Notifications**:
- Commits (with author, repo, branch)
- PR created/merged
- Merge conflicts detected
- Uncommitted work > 1 day old

---

#### **C. Linear Task Integration**

**File**: `slack-integration/linear-slack-sync.ts`

```typescript
// Bidirectional Linear ↔ Slack sync
import { LinearClient } from '@linear/sdk';
import { WebClient } from '@slack/web-api';

// When Linear issue created → Slack notification
linear.onIssueCreate((issue) => {
  slack.chat.postMessage({
    channel: '#linear-updates',
    text: `📋 New issue: *${issue.title}*\nAssigned to: @${issue.assignee.name}\nPriority: ${issue.priority}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${issue.title}*\n${issue.description}` },
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: 'View in Linear' },
          url: issue.url
        }
      }
    ]
  });
});

// When Slack message in #linear-updates → Create Linear issue
slack.message((message) => {
  if (message.channel === 'linear-updates' && message.text.startsWith('create:')) {
    const title = message.text.replace('create:', '').trim();
    linear.createIssue({ title, teamId: TEAM_ID });
  }
});
```

**Notifications**:
- Issue created/updated/completed
- Assignments changed
- Blocked issues
- Deadline approaching
- Agent took action

---

#### **D. Agent Communication**

**File**: `slack-integration/agent-slack-interface.ts`

```typescript
// Each agent has Slack presence
class AgentSlackInterface {
  constructor(agentName: string, port: number) {
    this.name = agentName;
    this.slackUserId = `@${agentName}-ai`;
  }
  
  async sendMessage(channel: string, message: string) {
    await slack.chat.postMessage({
      channel,
      username: this.name,
      icon_emoji: this.getAgentEmoji(),
      text: message
    });
  }
  
  async respondToDM(userId: string, question: string) {
    const answer = await this.processQuestion(question);
    await slack.chat.postMessage({
      channel: userId, // DM
      text: answer
    });
  }
  
  async escalate(issue: string) {
    await slack.chat.postMessage({
      channel: '#escalations',
      text: `🚨 *${this.name}* escalation:\n${issue}`,
      blocks: [{
        type: 'section',
        text: { type: 'mrkdwn', text: issue },
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: 'Acknowledge' },
          action_id: `ack_${this.name}`
        }
      }]
    });
  }
}
```

**Agent Capabilities in Slack**:
- Respond to DMs
- Post status updates
- Coordinate with other agents
- Escalate to leadership
- Request human input
- Share results

---

#### **E. Voice Command Pipeline**

**File**: `slack-integration/voice-slack-bridge.ts`

```typescript
// Slack → Voice Gateway → Agent → Response
slack.command('/natasha', async ({ command, ack, respond }) => {
  await ack();
  
  // Send to voice gateway
  const response = await fetch('http://localhost:19015/voice-command', {
    method: 'POST',
    body: JSON.stringify({
      command: command.text,
      user: command.user_id
    })
  });
  
  const result = await response.json();
  
  await respond({
    text: `🎤 *Natasha*: ${result.response}`,
    response_type: 'in_channel'
  });
});
```

**Voice Integration**:
- `/natasha [command]` → Voice gateway → Natasha
- Natasha responds in Slack
- Voice logs in #voice-commands
- Transcripts saved

---

#### **F. Service Health Dashboard**

**File**: `slack-integration/health-dashboard-bot.ts`

```typescript
// Post live dashboard to #command-center every 5 minutes
setInterval(async () => {
  const health = await getSystemHealth();
  
  await slack.chat.postMessage({
    channel: '#command-center',
    text: 'System Health Dashboard',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📊 CTAS System Health' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*PM2 Services*\n${health.pm2}` },
          { type: 'mrkdwn', text: `*Docker*\n${health.docker}` },
          { type: 'mrkdwn', text: `*Ports*\n${health.ports}` },
          { type: 'mrkdwn', text: `*Agents*\n${health.agents}` }
        ]
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: health.alerts || '✅ All systems operational' }
      }
    ]
  });
}, 300000); // Every 5 minutes
```

**Dashboard Shows**:
- PM2 services (online/errored)
- Docker containers
- Port health
- Agent status
- Git uncommitted work
- Linear task velocity
- Shitshow detector alerts

---

#### **G. Elena Mentor Integration**

**File**: `slack-integration/elena-slack-mentor.ts`

```typescript
// Elena posts morning tasks to Mackenzie via Slack
class ElenaMentorSlack {
  async assignDailyTask(task: Task) {
    await slack.chat.postMessage({
      channel: '@mackenzie', // DM
      text: `Good morning! ☀️\n\n*Today's Task*: ${task.title}\n\n*Before you start, think about:*\n1. ${task.question1}\n2. ${task.question2}\n3. ${task.question3}\n\nPing me when you're ready or if you get stuck!`,
      blocks: [
        // ... formatted blocks with task details
      ]
    });
  }
  
  async reviewPR(pr: PullRequest) {
    await slack.chat.postMessage({
      channel: '@mackenzie',
      text: `I reviewed your PR #${pr.number}. A few Socratic questions:\n\n${pr.questions.join('\n')}\n\nUpdate the PR with your answers, then I'll approve!`
    });
  }
  
  async weeklyReport() {
    await slack.chat.postMessage({
      channel: '@leadership',
      text: `📊 *Mackenzie's Weekly Summary*\n\nTasks: ${completed}/${total}\nSkills: ${skillsProgress}\nConcerns: ${concerns}\n\nFull report: [link]`
    });
  }
}
```

---

### **3. Setup Instructions**

#### **Step 1: Create Slack App**

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "CTAS Command Center"
4. Workspace: Your workspace
5. Add scopes (see list above)
6. Install to workspace
7. Copy Bot Token: `xoxb-...`

#### **Step 2: Configure Environment**

```bash
# Add to .env
echo "SLACK_BOT_TOKEN=xoxb-YOUR-TOKEN-HERE" >> .env
echo "SLACK_SIGNING_SECRET=your-signing-secret" >> .env
echo "SLACK_WORKSPACE_ID=your-workspace-id" >> .env
```

#### **Step 3: Create Channels**

```bash
# Run channel setup script
node slack-integration/setup-channels.js
```

This creates:
- #command-center
- #git-alerts
- #linear-updates
- #service-health
- #agent-coordination
- #elena-mentoring
- #voice-commands
- #escalations

#### **Step 4: Start Slack Integration Services**

```bash
# Add to PM2 ecosystem.config.cjs
pm2 start slack-integration/pm2-slack-monitor.js
pm2 start slack-integration/health-dashboard-bot.js
pm2 start slack-integration/agent-slack-interface.js

# Or start all
pm2 start ecosystem.config.cjs --only slack-*
```

#### **Step 5: Install Git Hooks**

```bash
# Add Slack notifier to post-commit hook
cp slack-integration/git-slack-notifier.sh .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

---

### **4. Usage Examples**

#### **Check System Status**

In Slack:
```
/ctas-status
```

Response:
```
📊 CTAS System Status

✅ PM2: 7/8 services online (1 errored: neural-mux)
✅ Docker: 5 containers running
✅ Ports: 42/50 responding
⚠️  Git: 2 repos with uncommitted work
✅ Agents: 15/17 online
✅ Linear: 23 issues in progress

🚨 Alerts:
- neural-mux service needs restart
- ctas7-command-center has uncommitted work (2 days old)
```

#### **Deploy via Slack**

```
/ctas-deploy staging
```

Response:
```
🚀 Deploying to staging...
✅ Git pull: main branch
✅ npm install
✅ Build: Complete
✅ PM2 restart
✅ Health check: Passed

Deployment complete! 
View: http://staging.ctas.local
```

#### **Talk to Agent**

```
/natasha analyze satellite TLE data for anomalies
```

Response:
```
🎤 Natasha: I've analyzed the TLE data. Found 3 anomalies:
1. Satellite X234 - Unexpected orbital decay
2. Satellite Y567 - Altitude mismatch
3. Satellite Z890 - Position error > 5km

Full report: [attachment]
Linear issue created: COG-234
```

#### **Git Alert Example**

Automatic post after commit:
```
📝 @chris committed to ctas7-command-center (feature/slack-integration)
`feat(slack): add agent communication interface`

View diff: [link]
```

#### **Elena Mentor Example**

Morning task (DM to Mackenzie):
```
Good morning, Mackenzie! ☀️

Today's Task: Integrate Nmap into Training Range

Before you start, think about:
1. What's the difference between -sS and -sT scans?
2. How would Plasma detect this scan?
3. What false positives might occur?

Linear Issue: COG-156
Estimated Time: 2-3 hours

Ping me when you're ready or if you get stuck!
```

---

### **5. Advanced Features**

#### **A. Interactive Buttons**

```typescript
// Approve PR via Slack
slack.action('approve_pr', async ({ action, ack, respond }) => {
  await ack();
  
  // Approve in GitHub
  await github.pulls.createReview({
    owner: 'cp5337',
    repo: 'ctas7-command-center',
    pull_number: action.value,
    event: 'APPROVE'
  });
  
  await respond({
    text: '✅ PR approved and merged!',
    replace_original: true
  });
});
```

#### **B. File Uploads**

```typescript
// Upload logs to Slack
await slack.files.upload({
  channels: '#service-health',
  file: fs.createReadStream('/var/log/ctas7/error.log'),
  title: 'Error Log - PM2 Neural Mux',
  initial_comment: '🚨 Neural Mux crashed, attaching logs'
});
```

#### **C. Threads for Context**

```typescript
// Keep related messages in threads
const parentMessage = await slack.chat.postMessage({
  channel: '#linear-updates',
  text: '📋 New issue: COG-234'
});

// Follow-up in thread
await slack.chat.postMessage({
  channel: '#linear-updates',
  thread_ts: parentMessage.ts,
  text: '🤖 Natasha: I\'ll handle this one'
});
```

#### **D. Reactions as Status**

```typescript
// Use reactions for workflow
// 👀 = acknowledged
// 🏗️ = in progress
// ✅ = complete
// 🚨 = blocked

await slack.reactions.add({
  channel: 'C1234567890',
  timestamp: '1234567890.123456',
  name: 'eyes' // 👀
});
```

---

### **6. Mobile App Integration**

Slack as bridge between iPhone and system:

```
iPhone → Slack app → CTAS bot → Agents → Response → Slack → iPhone
```

**Commands from iPhone**:
```
/ctas-status                    → Quick health check
/ctas-deploy production         → Emergency deploy
/ctas-rollback                  → Undo last deploy
/natasha [voice command]        → AI assistance
/ctas-service restart neural-mux → Restart service
```

**Notifications to iPhone**:
- Push notifications via Slack
- Critical alerts (service down, security)
- Daily summaries
- PR approvals needed

---

### **7. Security**

**Bot Token**: Store in `.env`, never commit
**Webhook URLs**: Rotate monthly
**Signing Secret**: Verify all Slack requests
**Channel Permissions**: Private channels for sensitive data
**Audit Log**: Track all bot actions
**Rate Limiting**: Handle Slack API limits (1 req/sec)

---

## Integration with Existing Systems

### **PM2 Integration**

Already has `slack-interface` service running (port 26046)

**Enhance it**:
```javascript
// ecosystem.config.cjs
{
  name: 'slack-interface',
  script: 'slack-integration/unified-slack-bot.js',
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET
  }
}
```

### **Voice Gateway Integration**

Already has `voice-gateway` service (port 31831)

**Connect to Slack**:
```typescript
// Add Slack as input/output channel
voiceGateway.addChannel('slack', {
  onMessage: (msg) => processSlackCommand(msg),
  onResponse: (res) => postToSlack(res)
});
```

### **Linear Integration**

Already has Linear scripts

**Add Slack webhooks**:
```typescript
// In synaptix-linear-clean-setup.cjs
linear.onIssueUpdate(async (issue) => {
  await postToSlack('#linear-updates', `Updated: ${issue.title}`);
});
```

---

## File Structure

```
ctas7-command-center/
├─ slack-integration/
│  ├─ unified-slack-bot.js           (main bot)
│  ├─ pm2-slack-monitor.js           (PM2 alerts)
│  ├─ git-slack-notifier.sh          (git hooks)
│  ├─ linear-slack-sync.ts           (Linear integration)
│  ├─ agent-slack-interface.ts       (agent communication)
│  ├─ voice-slack-bridge.ts          (voice commands)
│  ├─ health-dashboard-bot.ts        (system health)
│  ├─ elena-slack-mentor.ts          (Elena for Mackenzie)
│  ├─ setup-channels.js              (create channels)
│  ├─ slash-commands.ts              (command handlers)
│  └─ README.md                      (this file)
```

---

## Quick Start

```bash
# 1. Install dependencies
cd /Users/cp5337/Developer/ctas7-command-center/slack-integration
npm install @slack/web-api @slack/bolt

# 2. Configure tokens
cp .env.example .env
# Edit .env with your Slack tokens

# 3. Setup channels
node setup-channels.js

# 4. Start integration services
pm2 start ecosystem.config.cjs --only slack-*

# 5. Test
curl -X POST http://localhost:3000/slack/events \
  -H 'Content-Type: application/json' \
  -d '{"type":"url_verification","challenge":"test"}'
```

---

## Success Criteria

✅ All 17 agents have Slack presence  
✅ PM2 alerts post to #service-health  
✅ Git commits post to #git-alerts  
✅ Linear issues sync to #linear-updates  
✅ Voice commands work via `/natasha`  
✅ System health dashboard auto-updates  
✅ Elena can mentor via Slack DMs  
✅ Mobile commands work from iPhone  
✅ Escalations trigger push notifications  

---

## Monitoring

**Slack Bot Health**:
```bash
# Check bot is running
pm2 logs slack-interface

# Test bot connection
curl http://localhost:3000/health

# View Slack API usage
https://api.slack.com/apps/YOUR_APP_ID/event-subscriptions
```

---

## Troubleshooting

**Bot not responding**:
```bash
pm2 restart slack-interface
pm2 logs slack-interface --lines 100
```

**Rate limit errors**:
- Reduce polling frequency
- Batch messages
- Use threads instead of new messages

**Missing permissions**:
- Check app scopes in Slack admin
- Reinstall app to workspace
- Verify bot token in .env

---

**This integration runs parallel to all other work. No interference with night shift tasks!** 🚀

