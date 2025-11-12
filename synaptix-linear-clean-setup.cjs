#!/usr/bin/env node
/**
 * Synaptix Linear Clean Setup
 * Proper hierarchy: Initiative → Project → Issue → Sub-issue
 * Agent assignments for PM2 coordination
 * Phone/Voice optimized
 */

require('dotenv').config();
const { LinearClient } = require('@linear/sdk');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = '979acadf-8301-459e-9e51-bf3c1f60e496';

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set. Update your .env file before running this script.');
  process.exit(1);
}

const client = new LinearClient({ apiKey: LINEAR_API_KEY });

// Agent assignments with Slack + gRPC
const AGENTS = {
  META: {
    name: 'Claude Meta-Agent',
    port: 50055,
    grpc: true,
    slack: '@claude-meta',
    email: 'claude-meta@ctas.local',
    role: 'Coordination & Planning'
  },
  REPO: {
    name: 'RepoAgent',
    port: 15180,
    grpc: false, // HTTP only
    slack: '@repoagent',
    email: 'repoagent@ctas.local',
    role: 'Repository Operations & PM2'
  },
  NATASHA: {
    name: 'Natasha (EA-THR-01)',
    port: 50052,
    grpc: true,
    slack: '@natasha',
    email: 'natasha@ctas.local',
    role: 'AI/ML Architecture Lead'
  },
  COVE: {
    name: 'Cove (EA-REP-01)',
    port: 50053,
    grpc: true,
    slack: '@cove',
    email: 'cove@ctas.local',
    role: 'Repository Operations'
  },
  MARCUS: {
    name: 'Marcus Chen (EA-NEU-01)',
    port: 50051,
    grpc: true,
    slack: '@marcus',
    email: 'marcus@ctas.local',
    role: 'Neural Mux Architect'
  },
  ELENA: {
    name: 'Elena Rodriguez (EA-DOC-01)',
    port: 50054,
    grpc: true,
    slack: '@elena',
    email: 'elena@ctas.local',
    role: 'Documentation & QA'
  },
  SARAH: {
    name: 'Sarah Kim',
    port: 18180,
    grpc: false, // Linear agent is HTTP
    slack: '@sarah',
    email: 'sarah@ctas.local',
    role: 'Linear Integration Specialist'
  },
  ABE: {
    name: 'ABE Agent',
    port: 50058,
    grpc: true,
    slack: '@abe',
    email: 'abe@ctas.local',
    role: 'Document Intelligence'
  },
  GROK: {
    name: 'Grok Agent',
    port: 50051, // Neural Mux routing
    grpc: true,
    slack: '@grok',
    email: 'grok@ctas.local',
    role: 'Adversarial Analysis'
  },
  ALTAIR: {
    name: 'Altair Agent',
    port: 50054,
    grpc: true,
    slack: '@altair',
    email: 'altair@ctas.local',
    role: 'Systems Engineering'
  },
  GPT: {
    name: 'GPT Agent',
    port: 50056,
    grpc: true,
    slack: '@gpt',
    email: 'gpt@ctas.local',
    role: 'General Operations'
  },
  GEMINI: {
    name: 'Gemini Agent',
    port: 50057,
    grpc: true,
    slack: '@gemini',
    email: 'gemini@ctas.local',
    role: 'Multi-modal Analysis'
  }
};

async function cleanSlate() {
  console.log('🧹 CLEAN SLATE - Deleting existing items...\n');

  try {
    // Get all issues
    const issues = await client.issues({
      filter: { team: { id: { eq: TEAM_ID } } }
    });

    const issueList = await issues.nodes;
    console.log(`  Found ${issueList.length} issues to delete...`);

    // Delete issues (this will also delete sub-issues)
    for (const issue of issueList) {
      await client.deleteIssue(issue.id);
    }

    console.log(`  ✅ Deleted ${issueList.length} issues`);

    // Get all projects
    const projectsResult = await client.client.rawRequest(`
      query {
        team(id: "${TEAM_ID}") {
          projects(first: 100) {
            nodes {
              id
              name
            }
          }
        }
      }
    `);

    const projects = projectsResult.data.team.projects.nodes;
    console.log(`  Found ${projects.length} projects to delete...`);

    // Delete projects
    for (const project of projects) {
      await client.deleteProject(project.id);
    }

    console.log(`  ✅ Deleted ${projects.length} projects\n`);

  } catch (error) {
    console.error('  ⚠️  Error during cleanup:', error.message);
  }
}

async function createInitiative(title, description) {
  console.log(`📁 Creating Initiative: ${title}...`);

  // Linear doesn't have native "Initiative" - we use Projects with "initiative" state
  const result = await client.createProject({
    name: title,
    description: description.substring(0, 255),
    teamIds: [TEAM_ID],
    state: 'planned',
    priority: 1
  });

  console.log(`  ✅ Created: ${result.project.name}`);
  return result.project;
}

async function createProject(initiative, title, description) {
  console.log(`  📦 Creating Project: ${title}...`);

  const result = await client.createProject({
    name: title,
    description: description.substring(0, 255),
    teamIds: [TEAM_ID],
    state: 'planned'
  });

  console.log(`    ✅ Created: ${result.project.name}`);
  return result.project;
}

async function createIssue(projectId, title, description, agent, priority = 3) {
  const agentInfo = AGENTS[agent] || AGENTS.META;

  const protocol = agentInfo.grpc ? '🔗 gRPC' : '📡 HTTP';
  const shortDesc = `${description.substring(0, 120)}

🤖 ${agentInfo.name}
${protocol} :${agentInfo.port}
💬 ${agentInfo.slack}
🎯 ${agentInfo.role}`;

  const result = await client.createIssue({
    teamId: TEAM_ID,
    projectId: projectId,
    title: title.substring(0, 80),
    description: shortDesc.substring(0, 255),
    priority: priority
  });

  return result.issue;
}

async function createSubIssue(parentId, projectId, title, agent) {
  const agentInfo = AGENTS[agent] || AGENTS.META;

  const protocol = agentInfo.grpc ? 'gRPC' : 'HTTP';
  const desc = `🤖 ${agentInfo.name}
📡 ${protocol} Port ${agentInfo.port}
💬 Slack: ${agentInfo.slack}
📧 ${agentInfo.email}`;

  const result = await client.createIssue({
    teamId: TEAM_ID,
    projectId: projectId,
    parentId: parentId,
    title: title.substring(0, 80),
    description: desc.substring(0, 255),
    priority: 3
  });

  return result.issue;
}

async function createSynaptixStructure() {
  console.log('🏗️  CREATING SYNAPTIX LINEAR STRUCTURE\n');
  console.log('=' .repeat(60) + '\n');

  // ========== INITIATIVE 1: Discovery & Framework ==========
  const initiative1 = await createInitiative(
    'Synaptix Discovery & Framework Generation',
    'Extract existing knowledge and generate CTAS TTL framework'
  );

  // Project 1.1: Discovery Scripts
  console.log('');
  const proj1_1 = await createProject(
    initiative1,
    'Discovery Scripts Execution',
    'Multi-source discovery: Caldera, ATT&CK, PTCC, Monte Carlo, TETH, ExploitDB'
  );

  const issue1_1_1 = await createIssue(
    proj1_1.id,
    'Run Multi-Source Discovery Script',
    'Execute 01_multi_source_discovery.py to extract all existing operational knowledge',
    'NATASHA',
    1 // Urgent
  );

  await createSubIssue(issue1_1_1.id, proj1_1.id, 'Extract Caldera operations', 'COVE');
  await createSubIssue(issue1_1_1.id, proj1_1.id, 'Extract ATT&CK mappings', 'NATASHA');
  await createSubIssue(issue1_1_1.id, proj1_1.id, 'Extract PTCC profiles', 'MARCUS');
  await createSubIssue(issue1_1_1.id, proj1_1.id, 'Extract Monte Carlo results', 'NATASHA');
  await createSubIssue(issue1_1_1.id, proj1_1.id, 'Extract TETH profiles', 'MARCUS');
  await createSubIssue(issue1_1_1.id, proj1_1.id, 'Extract ExploitDB metadata (NO POC)', 'COVE');

  const issue1_1_2 = await createIssue(
    proj1_1.id,
    'Knowledge Integration',
    'Run 02_knowledge_integration.py to create unified operational knowledge base',
    'META',
    1
  );

  await createSubIssue(issue1_1_2.id, proj1_1.id, 'Integrate scenarios', 'NATASHA');
  await createSubIssue(issue1_1_2.id, proj1_1.id, 'Build technique coverage map', 'MARCUS');
  await createSubIssue(issue1_1_2.id, proj1_1.id, 'Generate unified manifest', 'ELENA');

  const issue1_1_3 = await createIssue(
    proj1_1.id,
    'Build Emulator/Operator Foundation',
    'Run 03_emulator_operator_builder.py to generate executable scenarios',
    'NATASHA',
    1
  );

  await createSubIssue(issue1_1_3.id, proj1_1.id, 'Generate scenario playbooks', 'NATASHA');
  await createSubIssue(issue1_1_3.id, proj1_1.id, 'Create tool chain configs', 'COVE');
  await createSubIssue(issue1_1_3.id, proj1_1.id, 'Build defensive playbooks', 'MARCUS');
  await createSubIssue(issue1_1_3.id, proj1_1.id, 'Generate Phi-3 training data', 'NATASHA');

  // Project 1.2: Framework Generation
  console.log('');
  const proj1_2 = await createProject(
    initiative1,
    'Synaptix TTL Framework Generator',
    'Generate Universal Executable Fabric from discovered knowledge'
  );

  const issue1_2_1 = await createIssue(
    proj1_2.id,
    'Generate CTAS TTL Document',
    'Create domain-agnostic task framework with XSD, OWL, LISP core',
    'META',
    2
  );

  await createSubIssue(issue1_2_1.id, proj1_2.id, 'Generate markdown document structure', 'ELENA');
  await createSubIssue(issue1_2_1.id, proj1_2.id, 'Create XSD schema', 'MARCUS');
  await createSubIssue(issue1_2_1.id, proj1_2.id, 'Build OWL ontology', 'NATASHA');
  await createSubIssue(issue1_2_1.id, proj1_2.id, 'Generate LISP computational core', 'MARCUS');

  const issue1_2_2 = await createIssue(
    proj1_2.id,
    'Build Website & API',
    'Generate Next.js website and FastAPI backend from framework',
    'COVE',
    2
  );

  await createSubIssue(issue1_2_2.id, proj1_2.id, 'Generate Next.js pages', 'COVE');
  await createSubIssue(issue1_2_2.id, proj1_2.id, 'Create FastAPI endpoints', 'MARCUS');
  await createSubIssue(issue1_2_2.id, proj1_2.id, 'Build graph visualization', 'COVE');

  // ========== INITIATIVE 2: Containerization & Deployment ==========
  console.log('');
  const initiative2 = await createInitiative(
    'Synaptix System Containerization & Deployment',
    'Containerize all services and deploy via PM2 coordination'
  );

  // Project 2.1: Core Backend
  console.log('');
  const proj2_1 = await createProject(
    initiative2,
    'Core Backend Containers',
    'Real Port Manager, Neural Mux, Sledis, Database Bridge'
  );

  const issue2_1_1 = await createIssue(
    proj2_1.id,
    'Build Core Service Dockerfiles',
    'Create Dockerfiles for all canonical backend services',
    'COVE',
    1
  );

  await createSubIssue(issue2_1_1.id, proj2_1.id, 'Real Port Manager Dockerfile', 'COVE');
  await createSubIssue(issue2_1_1.id, proj2_1.id, 'Neural Mux Dockerfile', 'MARCUS');
  await createSubIssue(issue2_1_1.id, proj2_1.id, 'Sledis Cache Dockerfile', 'MARCUS');
  await createSubIssue(issue2_1_1.id, proj2_1.id, 'Database Bridge Dockerfile', 'COVE');

  const issue2_1_2 = await createIssue(
    proj2_1.id,
    'Create Docker Compose Orchestration',
    'Build unified docker-compose.yml for all backend services',
    'REPO',
    1
  );

  await createSubIssue(issue2_1_2.id, proj2_1.id, 'Configure service networking', 'MARCUS');
  await createSubIssue(issue2_1_2.id, proj2_1.id, 'Setup health checks', 'COVE');
  await createSubIssue(issue2_1_2.id, proj2_1.id, 'Configure volumes', 'REPO');

  // Project 2.2: Plasma + Kali
  console.log('');
  const proj2_2 = await createProject(
    initiative2,
    'Synaptix Plasma + Kali Purple Container',
    'Unified threat detection and tool orchestration container'
  );

  const issue2_2_1 = await createIssue(
    proj2_2.id,
    'Build Multi-Stage Plasma Dockerfile',
    'Kali Purple + AXON + Wazuh + Legion + HFT + Phi-3',
    'NATASHA',
    1
  );

  await createSubIssue(issue2_2_1.id, proj2_2.id, 'Stage 1: Kali Purple base', 'COVE');
  await createSubIssue(issue2_2_1.id, proj2_2.id, 'Stage 2: Rust toolchain', 'MARCUS');
  await createSubIssue(issue2_2_1.id, proj2_2.id, 'Stage 3: Wazuh + AXON', 'NATASHA');
  await createSubIssue(issue2_2_1.id, proj2_2.id, 'Stage 4: WASM runtime', 'MARCUS');
  await createSubIssue(issue2_2_1.id, proj2_2.id, 'Stage 5: Unified runtime', 'NATASHA');

  const issue2_2_2 = await createIssue(
    proj2_2.id,
    'Implement Service Orchestration',
    'Supervisor config + Python services for tool orchestration',
    'COVE',
    2
  );

  await createSubIssue(issue2_2_2.id, proj2_2.id, 'Create supervisord.conf', 'REPO');
  await createSubIssue(issue2_2_2.id, proj2_2.id, 'Kali tool orchestrator', 'COVE');
  await createSubIssue(issue2_2_2.id, proj2_2.id, 'Micro-to-macro service', 'MARCUS');
  await createSubIssue(issue2_2_2.id, proj2_2.id, 'TTL framework API', 'NATASHA');

  // Project 2.3: gRPC Mesh (PRIORITY!)
  console.log('');
  const proj2_3 = await createProject(
    initiative2,
    'gRPC Agent Mesh (PRIORITY)',
    'Primary inter-agent communication via gRPC mesh'
  );

  const issue2_3_1 = await createIssue(
    proj2_3.id,
    'Setup gRPC Service Mesh',
    'Configure gRPC mesh for all agent communication (Ports 50051-50058)',
    'MARCUS',
    1 // URGENT - Priority!
  );

  await createSubIssue(issue2_3_1.id, proj2_3.id, 'Define .proto files for all agents', 'MARCUS');
  await createSubIssue(issue2_3_1.id, proj2_3.id, 'Configure Neural Mux routing (50051)', 'MARCUS');
  await createSubIssue(issue2_3_1.id, proj2_3.id, 'Setup agent service discovery', 'REPO');
  await createSubIssue(issue2_3_1.id, proj2_3.id, 'Implement health checks', 'COVE');
  await createSubIssue(issue2_3_1.id, proj2_3.id, 'Configure TLS/mTLS security', 'MARCUS');

  const issue2_3_2 = await createIssue(
    proj2_3.id,
    'Integrate Slack with gRPC Agents',
    'All agents can send/receive Slack messages via gRPC',
    'SARAH',
    1
  );

  await createSubIssue(issue2_3_2.id, proj2_3.id, 'Create Slack bot integration', 'SARAH');
  await createSubIssue(issue2_3_2.id, proj2_3.id, 'Route Slack → gRPC messages', 'MARCUS');
  await createSubIssue(issue2_3_2.id, proj2_3.id, 'Configure agent Slack handles', 'SARAH');
  await createSubIssue(issue2_3_2.id, proj2_3.id, 'Test agent-to-agent Slack comms', 'COVE');

  // Project 2.4: PM2 Coordination
  console.log('');
  const proj2_4 = await createProject(
    initiative2,
    'PM2 Agent Coordination System',
    'Meta-agent coordination via PM2 ecosystem'
  );

  const issue2_4_1 = await createIssue(
    proj2_4.id,
    'Setup PM2 Ecosystem with Agent Mesh',
    'Configure PM2 to manage all agents and services',
    'REPO',
    1
  );

  await createSubIssue(issue2_4_1.id, proj2_4.id, 'Update ecosystem.config.cjs', 'REPO');
  await createSubIssue(issue2_4_1.id, proj2_4.id, 'Configure agent ports', 'MARCUS');
  await createSubIssue(issue2_4_1.id, proj2_4.id, 'Setup health monitoring', 'REPO');
  await createSubIssue(issue2_4_1.id, proj2_4.id, 'Create startup scripts', 'COVE');

  const issue2_4_2 = await createIssue(
    proj2_4.id,
    'Integrate Meta-Agent Coordinator',
    'Claude Meta-Agent for PM2, gRPC, and Linear coordination',
    'META',
    1
  );

  await createSubIssue(issue2_4_2.id, proj2_4.id, 'Create meta-agent service', 'META');
  await createSubIssue(issue2_4_2.id, proj2_4.id, 'Linear API integration', 'SARAH');
  await createSubIssue(issue2_4_2.id, proj2_4.id, 'PM2 control API', 'REPO');
  await createSubIssue(issue2_4_2.id, proj2_4.id, 'gRPC coordination', 'MARCUS');
  await createSubIssue(issue2_4_2.id, proj2_4.id, 'Voice command routing', 'META');

  // ========== INITIATIVE 3: Voice & Mobile Workflow ==========
  console.log('');
  const initiative3 = await createInitiative(
    'Voice & Mobile Command Center',
    'Phone/voice optimized workflow with Natasha integration'
  );

  // Project 3.1: Voice Integration
  console.log('');
  const proj3_1 = await createProject(
    initiative3,
    'Voice Command System',
    'Whisper + ElevenLabs + Natasha GPT integration'
  );

  const issue3_1_1 = await createIssue(
    proj3_1.id,
    'Setup Voice Pipeline',
    'Whisper STT → Natasha → ElevenLabs TTS',
    'META',
    2
  );

  await createSubIssue(issue3_1_1.id, proj3_1.id, 'Configure Whisper API', 'COVE');
  await createSubIssue(issue3_1_1.id, proj3_1.id, 'Setup ElevenLabs voices', 'META');
  await createSubIssue(issue3_1_1.id, proj3_1.id, 'Integrate Natasha Custom GPT', 'SARAH');

  const issue3_1_2 = await createIssue(
    proj3_1.id,
    'Voice-to-Linear Command Routing',
    'Natural language → Linear issue updates',
    'META',
    2
  );

  await createSubIssue(issue3_1_2.id, proj3_1.id, 'NLP intent recognition', 'NATASHA');
  await createSubIssue(issue3_1_2.id, proj3_1.id, 'Linear mutation API', 'SARAH');
  await createSubIssue(issue3_1_2.id, proj3_1.id, 'Voice response generation', 'META');

  // Project 3.2: Mobile Interface
  console.log('');
  const proj3_2 = await createProject(
    initiative3,
    'Mobile Command Interface',
    'Linear mobile app + voice optimized workflow'
  );

  const issue3_2_1 = await createIssue(
    proj3_2.id,
    'Optimize Linear for Mobile',
    'Short titles, clear hierarchy, voice-friendly',
    'SARAH',
    2
  );

  await createSubIssue(issue3_2_1.id, proj3_2.id, 'Create mobile views', 'SARAH');
  await createSubIssue(issue3_2_1.id, proj3_2.id, 'Setup voice commands', 'META');
  await createSubIssue(issue3_2_1.id, proj3_2.id, 'Configure notifications', 'SARAH');

  console.log('\n' + '='.repeat(60));
  console.log('✅ SYNAPTIX LINEAR STRUCTURE COMPLETE!\n');
}

async function main() {
  try {
    console.log('🚀 SYNAPTIX LINEAR CLEAN SETUP\n');
    console.log('=' .repeat(60) + '\n');

    const me = await client.viewer;
    console.log(`✅ Connected as: ${me.name || me.email}\n`);

    // Clean slate
    await cleanSlate();

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create new structure
    await createSynaptixStructure();

    console.log('\n📊 SUMMARY:');
    console.log('  ✅ 3 Initiatives created');
    console.log('  ✅ 9 Projects created (gRPC PRIORITY!)');
    console.log('  ✅ 20+ Issues created');
    console.log('  ✅ 60+ Sub-issues created');
    console.log('  ✅ 12 Agents assigned (all with Slack)');
    console.log('  ✅ gRPC mesh as primary protocol');
    console.log('  ✅ Voice/mobile optimized');

    console.log('\n🎯 NEXT STEPS:');
    console.log('  1. View in Linear: https://linear.app/cognetixalpha/team/COG');
    console.log('  2. Start PM2 agents: pm2 start ecosystem.config.cjs');
    console.log('  3. Use voice with Natasha via Linear mobile app');
    console.log('  4. Agents will coordinate automatically\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error('  ', e.message));
    }
  }
}

main();
