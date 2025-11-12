#!/usr/bin/env node
/**
 * Register All Agents in Linear
 * Creates labels and assigns agents to appropriate projects
 */

const { LinearClient } = require('@linear/sdk');
const dotenv = require('dotenv');
const fs = require('fs/promises');

dotenv.config();

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID || '979acadf-8301-459e-9e51-bf3c1f60e496';

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set. Add it to your .env file before running this script.');
  process.exit(1);
}

const client = new LinearClient({ apiKey: LINEAR_API_KEY });

// Define all agents
const AGENTS = [
  {
    id: 'claude-meta',
    name: 'Claude Meta-Agent',
    role: 'Orchestrator',
    port: 50050,
    pm2: true,
    slack: '@claude-meta',
    email: 'claude@ctas.local',
    skills: ['orchestration', 'routing', 'coordination', 'meta-cognition'],
    color: '#8B5CF6',
    description: 'Meta-agent coordinator for multi-agent systems'
  },
  {
    id: 'natasha',
    name: 'Natasha Volkov',
    role: 'AI/ML Lead',
    port: 50052,
    pm2: true,
    slack: '@natasha',
    email: 'natasha@ctas.local',
    skills: ['ai', 'ml', 'discovery', 'architecture', 'kali', 'apt', 'threat-emulation'],
    color: '#EF4444',
    description: 'AI/ML architecture, discovery systems, Kali tools, APT countermeasures'
  },
  {
    id: 'cove',
    name: 'Cove Harris',
    role: 'Repository Operations',
    port: 50053,
    pm2: true,
    slack: '@cove',
    email: 'cove@ctas.local',
    skills: ['git', 'repository', 'devops', 'operations', 'smart-crates'],
    color: '#10B981',
    description: 'Repository operations, Git workflows, Smart Crate management'
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Neural Mux Architect',
    port: 50051,
    pm2: true,
    slack: '@marcus',
    email: 'marcus@ctas.local',
    skills: ['neural-mux', 'routing', 'architecture', 'performance'],
    color: '#3B82F6',
    description: 'Neural Mux architect, deterministic routing, performance optimization'
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    role: 'Documentation & QA',
    port: 50054,
    pm2: true,
    slack: '@elena',
    email: 'elena@ctas.local',
    skills: ['documentation', 'qa', 'testing', 'psyco', 'playwright'],
    color: '#F59E0B',
    description: 'Documentation, QA, testing, PhD code analysis'
  },
  {
    id: 'sarah',
    name: 'Sarah Kim',
    role: 'Linear Integration',
    port: 18180,
    pm2: true,
    slack: '@sarah',
    email: 'sarah@ctas.local',
    skills: ['linear', 'project-management', 'coordination', 'task-orchestration'],
    color: '#8B5CF6',
    description: 'Linear integration specialist, project management, task coordination'
  },
  {
    id: 'abe',
    name: 'ABE',
    role: 'Document Intelligence',
    port: 50058,
    pm2: true,
    slack: '@abe',
    email: 'abe@ctas.local',
    skills: ['documents', 'google-workspace', 'organization', 'automation'],
    color: '#06B6D4',
    description: 'Automated Business Environment, document intelligence, Google Workspace'
  },
  {
    id: 'lachlan',
    name: 'Lachlan',
    role: 'Voice Interface',
    port: 19015,
    pm2: true,
    slack: '@lachlan',
    email: 'lachlan@ctas.local',
    skills: ['voice', 'elevenlabs', 'whisper', 'tts', 'stt'],
    color: '#EC4899',
    description: 'Voice interface specialist, ElevenLabs integration, speech processing'
  },
  // Design System Agents
  {
    id: 'buildsync',
    name: 'BuildSync',
    role: 'Build Pipeline',
    port: 50059,
    pm2: true,
    slack: '@buildsync',
    email: 'buildsync@ctas.local',
    skills: ['build', 'sync', 'ci-cd', 'deployment'],
    color: '#14B8A6',
    description: 'Build synchronization, CI/CD pipeline management'
  },
  {
    id: 'designaudit',
    name: 'DesignAudit',
    role: 'Design Validation',
    port: 50060,
    pm2: true,
    slack: '@designaudit',
    email: 'designaudit@ctas.local',
    skills: ['design', 'validation', 'tokens', 'consistency'],
    color: '#8B5CF6',
    description: 'Design token validation, consistency checks'
  },
  {
    id: 'iosvalidator',
    name: 'iOSValidator',
    role: 'iOS Compliance',
    port: 50061,
    pm2: true,
    slack: '@iosvalidator',
    email: 'iosvalidator@ctas.local',
    skills: ['ios', 'apple-hig', 'webkit', 'compliance'],
    color: '#3B82F6',
    description: 'iOS compliance validation, Apple HIG checks'
  },
  {
    id: 'docgen',
    name: 'DocumentGenerator',
    role: 'Document Generation',
    port: 50064,
    pm2: true,
    slack: '@docgen',
    email: 'docgen@ctas.local',
    skills: ['documents', 'quad-charts', 'presentations', 'google-workspace'],
    color: '#F59E0B',
    description: 'Executive document generation, quad charts, presentations'
  },
  {
    id: 'themevalidator',
    name: 'ThemeValidator',
    role: 'Theme Validation',
    port: 50066,
    pm2: true,
    slack: '@themevalidator',
    email: 'themevalidator@ctas.local',
    skills: ['theme', 'design-system', 'validation', 'professional-standards'],
    color: '#0A0E17',
    description: 'Theme validation, enforces professional standards (NO EMOJIS)'
  },
  // API-based agents (no PM2)
  {
    id: 'grok',
    name: 'Grok',
    role: 'xAI Model',
    port: null,
    pm2: false,
    slack: '@grok',
    email: 'grok@ctas.local',
    skills: ['llm', 'reasoning', 'xai'],
    color: '#000000',
    description: 'xAI Grok model integration'
  },
  {
    id: 'altair',
    name: 'Altair',
    role: 'Search Intelligence',
    port: null,
    pm2: false,
    slack: '@altair',
    email: 'altair@ctas.local',
    skills: ['search', 'perplexity', 'research'],
    color: '#06B6D4',
    description: 'Perplexity-powered search and research'
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    role: 'OpenAI Model',
    port: null,
    pm2: false,
    slack: '@gpt4',
    email: 'gpt4@ctas.local',
    skills: ['llm', 'reasoning', 'openai'],
    color: '#10A37F',
    description: 'OpenAI GPT-4 integration'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    role: 'Google Model',
    port: null,
    pm2: false,
    slack: '@gemini',
    email: 'gemini@ctas.local',
    skills: ['llm', 'reasoning', 'google'],
    color: '#4285F4',
    description: 'Google Gemini model integration'
  }
];

async function main() {
  console.log('🤖 REGISTERING AGENTS IN LINEAR');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Get team
    const team = await client.team(TEAM_ID);
    console.log(`✅ Connected to team: ${team.name}`);
    console.log('');

    // Create labels for each agent
    console.log('📋 Creating agent labels...');
    console.log('');

    let created = 0;
    let exists = 0;

    for (const agent of AGENTS) {
      try {
        const labelName = `agent:${agent.id}`;
        
        // Check if label exists
        const existingLabels = await client.issueLabels({
          filter: {
            team: { id: { eq: TEAM_ID } },
            name: { eq: labelName }
          }
        });

        if (existingLabels.nodes.length > 0) {
          console.log(`  ✓ ${agent.name} - Label already exists`);
          exists++;
          continue;
        }

        // Create label
        await client.createIssueLabel({
          teamId: TEAM_ID,
          name: labelName,
          description: `${agent.name} (${agent.role}) - ${agent.description}`,
          color: agent.color
        });

        console.log(`  ✅ ${agent.name} - Created label`);
        created++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`  ❌ ${agent.name} - Failed: ${error.message}`);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('SUMMARY:');
    console.log(`  ✅ Created: ${created} labels`);
    console.log(`  ✓  Already existed: ${exists} labels`);
    console.log(`  📊 Total agents: ${AGENTS.length}`);
    console.log('');

    // Save agent config
    const configPath = '/Users/cp5337/Developer/ctas7-command-center/agents/linear-agents.json';
    await fs.writeFile(configPath, JSON.stringify({
      teamId: TEAM_ID,
      agents: AGENTS,
      lastUpdated: new Date().toISOString()
    }, null, 2));

    console.log(`✅ Agent configuration saved to: ${configPath}`);
    console.log('');

    // Show how to use
    console.log('🎯 HOW TO ASSIGN AGENTS TO TASKS:');
    console.log('');
    console.log('Method 1: Add label in Linear UI');
    console.log('  - Open issue in Linear');
    console.log('  - Add label: agent:natasha (or any agent)');
    console.log('');
    console.log('Method 2: Mention in description');
    console.log('  - Description: "@natasha please analyze this"');
    console.log('  - System auto-detects and assigns');
    console.log('');
    console.log('Method 3: Voice command');
    console.log('  - "Natasha, create a task to fix the auth bug"');
    console.log('  - Custom GPT → Linear → Agent');
    console.log('');
    console.log('📊 Agent Status Dashboard:');
    console.log('  pm2 list');
    console.log('  ./agents/check-agent-status.sh');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
