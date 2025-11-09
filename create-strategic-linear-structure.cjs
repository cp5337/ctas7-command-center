#!/usr/bin/env node
/**
 * Synaptix Strategic Linear Structure
 * Creates overarching Initiatives for "tour-ready" presentation
 * 
 * Initiatives are domain-agnostic, core-focused, strategic themes
 * Projects fall under these initiatives
 * Integrates with VS Code/Cursor and Raycast
 */

const { LinearClient } = require('@linear/sdk');

// Load environment variables
require('dotenv').config();

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID || '979acadf-8301-459e-9e51-bf3c1f60e496';

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not set!');
  console.error('   Set it in .env file or export LINEAR_API_KEY=your_key');
  process.exit(1);
}

const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

// Rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Strategic Initiatives - Top-level organization
 * These are the "big ticket items" for tours/demos
 */
const STRATEGIC_INITIATIVES = [
  {
    name: 'Core Infrastructure & Containerization',
    description: 'Foundation systems: Docker, service mesh, ports, databases, memory fabric',
    icon: '🏗️',
    projects: [
      {
        name: 'Docker Containerization',
        description: 'Container all services: backend, agents, voice, intelligence',
        issues: [
          'Core Backend Container (Port Manager, Synaptix Core, Neural Mux)',
          'Agent Mesh Container (RepoAgent, Natasha, Marcus, Cove, Elena)',
          'Intelligence Container (NYX-TRACE, OSINT, Corporate Analysis)',
          'Voice Container (Whisper, ElevenLabs, Voice Gateway)',
          'ABE Document Intelligence Container'
        ]
      },
      {
        name: 'Service Mesh & Discovery',
        description: 'Real Port Manager, service registry, health monitoring',
        issues: [
          'Real Port Manager (Port 18103) - Authoritative registry',
          'Service Discovery Protocol (gRPC + HTTP)',
          'Health Check System (Automated monitoring)',
          'Port Allocation Strategy (Above 10000, hardened low ports)'
        ]
      },
      {
        name: 'Memory Fabric & Databases',
        description: 'Sledis, SurrealDB, Supabase, SlotGraph, Redis integration',
        issues: [
          'Sledis Cache (Port 19014) - Memory Mesh RC1',
          'Database Mux Connector (Multi-DB routing)',
          'SlotGraph Integration (Entity relationships)',
          'Supabase Task System (CTAS tasks with primitives)'
        ]
      }
    ]
  },
  {
    name: 'Agent Coordination & Intelligence',
    description: 'Multi-agent mesh, gRPC coordination, PM2 orchestration, Slack integration',
    icon: '🤖',
    projects: [
      {
        name: 'gRPC Agent Mesh (PRIORITY)',
        description: 'Primary inter-agent communication protocol',
        issues: [
          'Setup gRPC Service Mesh (Ports 50050-50058)',
          'Agent .proto Definitions (All 12 agents)',
          'Health Check & Discovery (Concurrent pings)',
          'Failover & Redundancy (Primary + fallback)',
          'Load Balancing (Neural Mux routing)'
        ]
      },
      {
        name: 'PM2 Meta-Agent Coordination',
        description: 'Native service management with Claude orchestration',
        issues: [
          'PM2 Ecosystem Configuration (ecosystem.config.cjs)',
          'Meta-Agent Gateway (Port 15180 - RepoAgent)',
          'Agent Assignment Logic (Skills-based routing)',
          'Task Queue Management (Supabase integration)',
          'Monitoring Dashboard (PM2 Plus or custom)'
        ]
      },
      {
        name: 'Slack Integration',
        description: 'Mobile-first agent tasking via Slack',
        issues: [
          'Slack Bot Setup (App configuration)',
          'ngrok Tunnel (External access)',
          'Voice-to-Slack-to-Linear Pipeline',
          'Agent Notification System',
          'Status Commands (/synaptix-status)'
        ]
      }
    ]
  },
  {
    name: 'Primary Interfaces & User Experience',
    description: 'Main Ops, Command Center, Orbital Control, mobile apps, voice interface',
    icon: '🎨',
    projects: [
      {
        name: 'Main Ops Platform (CTAS v6.6)',
        description: 'Primary operational interface with HD4 phases',
        issues: [
          'Mapbox GL Integration (Geospatial ops)',
          'HD4 Phase Components (Hunt, Detect, Disrupt, Disable, Dominate)',
          'RedTeam Runner & PhaseMapping',
          'DeceptionDashboard & KaliGUI',
          'Database Connectivity (Neural Mux routing)'
        ]
      },
      {
        name: 'Command Center Dashboard',
        description: 'Agent mesh control, voice interface, system monitoring',
        issues: [
          'Agent Status Dashboard (Real-time monitoring)',
          'Voice Interface Panel (Whisper + ElevenLabs)',
          'PM2 Process Viewer (Service management)',
          'Linear Task Board (Kanban view)',
          'System Health Metrics (Ports, memory, CPU)'
        ]
      },
      {
        name: 'Orbital Control (Zoe)',
        description: 'Cesium satellite viewer, ground stations, SGP4 propagation',
        issues: [
          'Cesium Viewer (Port 21575) - 3D globe',
          '289 WASM Ground Stations (GraphZilla v1)',
          'SGP4 Propagation Engine',
          'Camera Control & Tracking',
          'Neural Mux Routing for orbital ops'
        ]
      },
      {
        name: 'Mobile & Voice Interface',
        description: 'iOS app, voice commands, Slack bridge',
        issues: [
          'Voice Gateway (Port 19015) - Operational',
          'Slack Mobile Integration - Ready',
          'iOS SwiftUI App (Future)',
          'React Native Framework (Transpiler target)',
          'Biometric Auth (iPhone Touch ID / Face ID)'
        ]
      }
    ]
  },
  {
    name: 'Universal Execution Framework',
    description: 'TTL, PTCC, primitives, Layer 2, hash-addressable operations, domain-agnostic tasks',
    icon: '⚡',
    projects: [
      {
        name: 'CTAS TTL Framework',
        description: 'Task taxonomy, EEI system, domain-agnostic operations',
        issues: [
          'Discovery Scripts (Extract knowledge from codebase)',
          'Manifest Generation (Components, tools, tasks)',
          'Framework Document Generator (TTL structure)',
          'Universal Primitives (32 core operations)',
          'Hash-Addressable Tasks (Unicode + Murmur3)'
        ]
      },
      {
        name: 'PTCC System',
        description: 'Persona-Tool-Chain-Context framework for primitives',
        issues: [
          'PTCC Profiles (1000+ existing profiles)',
          'ATT&CK Mapping (MITRE techniques)',
          'Caldera Integration (Adversary emulation)',
          'Monte Carlo Simulations (Risk analysis)',
          'TETH Threat Profiles'
        ]
      },
      {
        name: 'Layer 2 Mathematical Intelligence',
        description: 'Combinatorial optimization, entity extraction, graph analysis',
        issues: [
          'Unicode Assembly Language (U+E000-E9FF)',
          'Murmur3 Trivariate Hash (SCH-CUID-UUID)',
          'L* Learning Algorithm (Tool interface discovery)',
          'Matroid Theory (Critical node discovery)',
          'HMM & Emerging Matroid Detection'
        ]
      },
      {
        name: 'Dynamic Escalation Ladder',
        description: 'Script → WASM → Microkernel → Crate → System → IaC',
        issues: [
          'WASM Task Nodes (200KB-1MB executables)',
          'Firefly Microkernel (Rocket-grade embedded)',
          'Alpine Microkernel (Docker single-purpose)',
          'Smart Crate System (Auto-scaffolding)',
          'IaC Deployment (Full infrastructure from hash)'
        ]
      }
    ]
  },
  {
    name: 'Tool Development & Integration',
    description: 'Kali tools, OSINT, analysis engines, workflow orchestration, HFT',
    icon: '🔧',
    projects: [
      {
        name: 'Kali Purple Toolkit',
        description: 'Full Kali + Purple team tools, custom ISO',
        issues: [
          'Kali Base System (Alpine + tools)',
          'Layer 2 Integration (Unicode + hashing)',
          'Microkernel Tools (Single-purpose executables)',
          'Custom ISO Generation (Bootable Kali)',
          'vKali Micro Instances (Lightweight VMs)'
        ]
      },
      {
        name: 'NYX-TRACE Intelligence Platform',
        description: 'OSINT, GEOINT, entity tracking, OpenCTI replacement',
        issues: [
          'OSINT Engine (Port 18200) - 15+ tools',
          'Corporate Entity Analyzer (Port 18201)',
          'EDGAR Connector (SEC filings)',
          'Crawl4AI Integration (Web intelligence)',
          'Media Monitoring (6,474 sources)'
        ]
      },
      {
        name: 'Forge Workflow Engine',
        description: 'Pure Rust n8n replacement, TAPS pub-sub',
        issues: [
          'Forge Core (Port 18220)',
          'Supabase Task Integration',
          'SlotGraph Tool Chains',
          'Domain-Agnostic Workflows',
          'CogniGraph Planning Integration'
        ]
      },
      {
        name: 'HFT Ground Station System',
        description: '289 WASM stations, sub-microsecond operations',
        issues: [
          'Ground Station Array (289 WASM nodes)',
          'Monte Carlo Risk Analysis',
          'Orbital Operations (Cesium integration)',
          'Neural Mux CDN (Hash-based routing)',
          'GraphZilla v1 (WASM graph primitives)'
        ]
      }
    ]
  },
  {
    name: 'Security & Defense Systems',
    description: 'Synaptix Plasma, Kali JeetTek, deception, threat detection, AXON',
    icon: '🛡️',
    projects: [
      {
        name: 'Synaptix Plasma (Threat Detection)',
        description: 'Wazuh + AXON + Legion + Phi-3 LoRA',
        issues: [
          'Wazuh Integration (Data collection shell)',
          'AXON Processing (CTAS-7 native analysis)',
          'Legion ECS (Entity tracking)',
          'Phi-3 LoRA Farm (Fine-tuned models)',
          'HFT Integration (Sub-microsecond detection)'
        ]
      },
      {
        name: 'Kali JeetTek (Perimeter Defense)',
        description: 'Sensors, tarpits, deception, quantum scaffolding',
        issues: [
          'Scorpion System (Advanced sensors)',
          'Port Hardening (Low-number tarpits)',
          'Twin Spawning (Honeypots)',
          'Cobalt Strike Detection',
          'LOTL Prevention (Neural Mux CDN)'
        ]
      },
      {
        name: 'Deception & Twinning',
        description: 'Digital twins, adversary confusion, intelligence gathering',
        issues: [
          'Network Twinning (Port Manager twins)',
          'Service Deception (Fake endpoints)',
          'Adversary Tracking (Behavior analysis)',
          'Intelligence Collection (Threat intel)',
          'Confidence Erosion (Tool unreliability)'
        ]
      },
      {
        name: 'PhD QA & Code Analysis',
        description: 'Embedded QA system, provably correct code',
        issues: [
          'Psyco Integration (Code analysis)',
          'Playwright Testing (Automated QA)',
          'Universal Base Image (Docker QA layer)',
          'Blockchain Certification (Provable correctness)',
          'Model Drift Prevention (Statistical outputs)'
        ]
      }
    ]
  }
];

/**
 * Create initiative
 */
async function createInitiative(name, description) {
  try {
    const result = await linear.createProject({
      teamIds: [TEAM_ID],
      name: name.substring(0, 80),
      description: description.substring(0, 255),
      state: 'planned'
    });
    console.log(`✅ Initiative: ${name}`);
    await delay(500); // Rate limiting
    return result;
  } catch (error) {
    console.error(`❌ Failed to create initiative "${name}":`, error.message);
    return null;
  }
}

/**
 * Create project under initiative
 */
async function createProject(initiativeId, name, description) {
  try {
    const result = await linear.createProject({
      teamIds: [TEAM_ID],
      name: name.substring(0, 80),
      description: description.substring(0, 255),
      state: 'started'
    });
    console.log(`  📋 Project: ${name}`);
    await delay(500);
    return result;
  } catch (error) {
    console.error(`  ❌ Failed to create project "${name}":`, error.message);
    return null;
  }
}

/**
 * Create issue under project
 */
async function createIssue(projectId, title, description = '') {
  try {
    const result = await linear.createIssue({
      teamId: TEAM_ID,
      projectId: projectId,
      title: title.substring(0, 80),
      description: description.substring(0, 255),
      priority: 2 // High
    });
    console.log(`    ✓ ${title}`);
    await delay(500);
    return result;
  } catch (error) {
    console.error(`    ✗ Failed: ${title}`, error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🏗️  CREATING STRATEGIC LINEAR STRUCTURE');
  console.log('=' .repeat(80));
  console.log('');
  
  try {
    const viewer = await linear.viewer;
    console.log(`✅ Connected as: ${viewer.name}`);
    console.log('');
    
    let totalInitiatives = 0;
    let totalProjects = 0;
    let totalIssues = 0;
    
    for (const initiative of STRATEGIC_INITIATIVES) {
      console.log(`${initiative.icon} ${initiative.name}`);
      console.log('-'.repeat(80));
      
      const initiativeResult = await createInitiative(
        initiative.name,
        initiative.description
      );
      
      if (!initiativeResult) continue;
      totalInitiatives++;
      
      for (const project of initiative.projects) {
        const projectResult = await createProject(
          initiativeResult.id,
          project.name,
          project.description
        );
        
        if (!projectResult) continue;
        totalProjects++;
        
        for (const issueTitle of project.issues) {
          const issueResult = await createIssue(
            projectResult.id,
            issueTitle,
            `Part of ${project.name}`
          );
          if (issueResult) totalIssues++;
        }
      }
      
      console.log('');
    }
    
    console.log('=' .repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`  ✅ ${totalInitiatives} Initiatives created`);
    console.log(`  ✅ ${totalProjects} Projects created`);
    console.log(`  ✅ ${totalIssues} Issues created`);
    console.log('');
    console.log('🔗 View in Linear: https://linear.app/cognetixalpha/team/COG');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('  1. Configure VS Code/Cursor MCP integration');
    console.log('  2. Setup Raycast scripts for quick access');
    console.log('  3. Build containerization roadmap');
    console.log('  4. Assign agents to each initiative');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

