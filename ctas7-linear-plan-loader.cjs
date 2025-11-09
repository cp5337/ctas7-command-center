#!/usr/bin/env node
/**
 * CTAS7 Linear Plan Loader
 *
 * PM2-managed service that loads all plans, phases, and documentation into Linear
 * for agent coordination after discovery scripts run.
 *
 * Naming Convention: ctas7-linear-<service>
 * No dashes before "linear" - consistent naming
 */

const fs = require('fs');
const path = require('path');
const { LinearClient } = require('@linear/sdk');

// Linear Configuration
const LINEAR_API_KEY = process.env.LINEAR_API_KEY || 'YOUR_LINEAR_API_KEY';
const TEAM_ID = '979acadf-8301-459e-9e51-bf3c1f60e496'; // CognetixALPHA
const TEAM_KEY = 'COG';

// Initialize Linear client
const client = new LinearClient({ apiKey: LINEAR_API_KEY });

// Plan directories to load
const PLAN_DIRS = [
  '/Users/cp5337/Developer/ctas7-command-center',
  '/Users/cp5337/Desktop/CUSTOM_GPT_KNOWLEDGE_BASE'
];

// Plan files to load (prioritized)
const PRIORITY_PLANS = [
  // Deployment Layer (CLI Claude)
  'PHASED_CONTAINERIZATION_PLAN.md',
  'SERVICE_AUDIT_REPORT.md',
  'SERVICE_REGISTRY.json',
  'OPTION_A_EXECUTION_PLAN.md',

  // Discovery/Framework Layer (This Session)
  'CTAS_FRAMEWORK_GENERATOR_BUILD_PROMPT.md',
  'COMPLETE_DISCOVERY_AND_BUILD_SYSTEM.md',
  'UNIVERSAL_EXECUTABLE_FABRIC_SPEC.md',
  'PLASMA_KALI_PURPLE_CONTAINER_BUILD_PROMPT.md',

  // Integration Layer
  'CTAS7_COMPLETE_SYSTEM_INTEGRATION.md',
  'CTAS7_Integration_Architecture_Plan.md',
  'FRONTEND_6.6_TO_7.1_PROMOTION_PLAN.md',
];

/**
 * Find plan file in directories
 */
function findPlanFile(filename) {
  for (const dir of PLAN_DIRS) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Parse markdown into Linear tasks
 */
function parseMarkdownToTasks(content, filename) {
  const tasks = [];
  const lines = content.split('\n');

  let currentEpic = null;
  let currentSection = null;
  let currentTask = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H1 = Epic
    if (line.startsWith('# ')) {
      currentEpic = {
        title: line.replace('# ', '').trim(),
        description: '',
        source: filename,
        type: 'epic',
        tasks: []
      };
      tasks.push(currentEpic);
    }

    // H2 = Section/Milestone
    else if (line.startsWith('## ')) {
      currentSection = {
        title: line.replace('## ', '').trim(),
        description: '',
        source: filename,
        type: 'section',
        parent: currentEpic,
        tasks: []
      };
      if (currentEpic) {
        currentEpic.tasks.push(currentSection);
      } else {
        tasks.push(currentSection);
      }
    }

    // H3 = Task
    else if (line.startsWith('### ')) {
      currentTask = {
        title: line.replace('### ', '').trim(),
        description: '',
        source: filename,
        type: 'task',
        parent: currentSection || currentEpic,
        priority: 0
      };
      if (currentSection) {
        currentSection.tasks.push(currentTask);
      } else if (currentEpic) {
        currentEpic.tasks.push(currentTask);
      } else {
        tasks.push(currentTask);
      }
    }

    // Checkbox items = subtasks
    else if (line.match(/^- \[[ x]\]/)) {
      const isComplete = line.includes('[x]');
      const taskTitle = line.replace(/^- \[[ x]\] /, '').trim();

      const subtask = {
        title: taskTitle,
        completed: isComplete,
        source: filename,
        type: 'subtask',
        parent: currentTask || currentSection || currentEpic
      };

      if (currentTask) {
        if (!currentTask.subtasks) currentTask.subtasks = [];
        currentTask.subtasks.push(subtask);
      } else if (currentSection) {
        currentSection.tasks.push(subtask);
      }
    }

    // Priority indicators
    else if (line.includes('🔴') || line.includes('CRITICAL') || line.includes('URGENT')) {
      if (currentTask) currentTask.priority = 1; // Urgent
    }
    else if (line.includes('🟡') || line.includes('HIGH')) {
      if (currentTask) currentTask.priority = 2; // High
    }

    // Description accumulation
    else if (line.trim() && currentTask) {
      currentTask.description += line + '\n';
    }
  }

  return tasks;
}

/**
 * Create Linear epic
 */
async function createEpic(epic) {
  try {
    const result = await client.createProject({
      name: epic.title,
      description: epic.description + `\n\n**Source:** ${epic.source}`,
      teamIds: [TEAM_ID],
      state: 'planned'
    });

    console.log(`✅ Created epic: ${epic.title} (${result.project.id})`);
    return result.project;
  } catch (error) {
    console.error(`❌ Failed to create epic ${epic.title}:`, error.message);
    return null;
  }
}

/**
 * Create Linear issue
 */
async function createIssue(task, projectId = null, parentId = null) {
  try {
    const priorityMap = {
      0: 0, // No priority
      1: 1, // Urgent
      2: 2, // High
      3: 3, // Normal
      4: 4  // Low
    };

    const issueData = {
      teamId: TEAM_ID,
      title: task.title,
      description: task.description + `\n\n**Source:** ${task.source}`,
      priority: priorityMap[task.priority || 0],
    };

    if (projectId) issueData.projectId = projectId;
    if (parentId) issueData.parentId = parentId;

    const result = await client.createIssue(issueData);

    console.log(`  ✅ Created issue: ${task.title} (${TEAM_KEY}-${result.issue.number})`);
    return result.issue;
  } catch (error) {
    console.error(`  ❌ Failed to create issue ${task.title}:`, error.message);
    return null;
  }
}

/**
 * Load single plan into Linear
 */
async function loadPlan(filename) {
  console.log(`\n📋 Loading plan: ${filename}`);

  const filePath = findPlanFile(filename);
  if (!filePath) {
    console.log(`  ⚠️  File not found: ${filename}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const tasks = parseMarkdownToTasks(content, filename);

  console.log(`  📊 Parsed ${tasks.length} top-level items`);

  // Create epics and their child tasks
  for (const item of tasks) {
    if (item.type === 'epic') {
      const project = await createEpic(item);
      if (project && item.tasks) {
        for (const task of item.tasks) {
          const issue = await createIssue(task, project.id);

          // Create subtasks if any
          if (issue && task.subtasks) {
            for (const subtask of task.subtasks) {
              await createIssue(subtask, project.id, issue.id);
            }
          }

          // Create nested tasks
          if (issue && task.tasks) {
            for (const nestedTask of task.tasks) {
              await createIssue(nestedTask, project.id, issue.id);
            }
          }
        }
      }
    } else if (item.type === 'task') {
      const issue = await createIssue(item);

      if (issue && item.subtasks) {
        for (const subtask of item.subtasks) {
          await createIssue(subtask, null, issue.id);
        }
      }
    }
  }
}

/**
 * Create CTAS7 Agent Coordination Epic
 */
async function createAgentCoordinationEpic() {
  console.log('\n🤖 Creating Agent Coordination Epic...');

  const epic = await createEpic({
    title: 'CTAS7 Agent Coordination - Post-Discovery',
    description: `
# Agent Coordination for Discovery Script Execution

This epic tracks agent coordination after discovery scripts run.

## Agents Involved:
- **Natasha (EA-THR-01)**: AI/ML Architecture Lead
- **Cove (EA-REP-01)**: Repository Operations
- **Marcus Chen (EA-NEU-01)**: Neural Mux Architect
- **Elena Rodriguez (EA-DOC-01)**: Documentation & QA
- **Sarah Kim**: Linear Integration Specialist

## PM2 Services:
- repoagent-gateway (Port 15180)
- agent-mesh (Ports 50051-50057)
- linear-integration (Port 15182)
- linear-agent (Port 18180)

## Workflow:
1. Discovery scripts analyze codebase
2. Manifests generated (components, tasks, primitives)
3. Framework builder creates CTAS TTL
4. Agents coordinate via Linear for deployment
5. Container orchestration via PM2

## Success Criteria:
- All discovery scripts executed
- Manifests validated
- Framework generated
- Agents coordinated via Linear
- Deployment plan confirmed
    `,
    source: 'ctas7-linear-plan-loader.js',
    type: 'epic'
  });

  if (!epic) return;

  // Create coordination tasks
  const coordinationTasks = [
    {
      title: 'Execute Discovery Scripts (Caldera, ATT&CK, PTCC, Monte Carlo, TETH, ExploitDB)',
      description: 'Run 01_multi_source_discovery.py to extract existing operational knowledge',
      priority: 1,
      source: 'Agent Coordination',
      type: 'task'
    },
    {
      title: 'Generate Knowledge Integration Manifest',
      description: 'Run 02_knowledge_integration.py to create unified operational knowledge base',
      priority: 1,
      source: 'Agent Coordination',
      type: 'task'
    },
    {
      title: 'Build Emulator/Operator Foundation',
      description: 'Run 03_emulator_operator_builder.py to generate executable scenarios and tool chains',
      priority: 1,
      source: 'Agent Coordination',
      type: 'task'
    },
    {
      title: 'Generate CTAS TTL Framework',
      description: 'Use framework generator to create CTAS version of TTL from manifests',
      priority: 2,
      source: 'Agent Coordination',
      type: 'task'
    },
    {
      title: 'Coordinate Agent Assignments via Linear',
      description: 'Assign agents to specific tasks based on expertise and PTCC profiles',
      priority: 2,
      source: 'Agent Coordination',
      type: 'task'
    },
    {
      title: 'Deploy Plasma+Kali Container',
      description: 'Build and deploy Analysis Container and Plasma+Kali Build Target',
      priority: 3,
      source: 'Agent Coordination',
      type: 'task'
    }
  ];

  for (const task of coordinationTasks) {
    await createIssue(task, epic.id);
  }
}

/**
 * Main loader
 */
async function main() {
  console.log('🚀 CTAS7 Linear Plan Loader Starting...');
  console.log(`📡 Team: CognetixALPHA (${TEAM_KEY})`);
  console.log(`🔑 API Key: ${LINEAR_API_KEY.substring(0, 15)}...`);

  // Verify Linear connection
  try {
    const me = await client.viewer;
    console.log(`✅ Connected as: ${me.name || me.email}`);
  } catch (error) {
    console.error('❌ Failed to connect to Linear:', error.message);
    process.exit(1);
  }

  // Load all priority plans
  for (const plan of PRIORITY_PLANS) {
    await loadPlan(plan);
    // Rate limit: 1 second between plans
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Create agent coordination epic
  await createAgentCoordinationEpic();

  console.log('\n✅ All plans loaded into Linear!');
  console.log('🤖 Agents ready for post-discovery coordination');

  // If running as PM2 service, keep alive
  if (process.env.PM2_HOME) {
    console.log('\n⏳ PM2 service mode - keeping alive for monitoring...');
    setInterval(() => {
      console.log(`💓 Plan loader heartbeat: ${new Date().toISOString()}`);
    }, 60000); // Every minute
  } else {
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { loadPlan, createAgentCoordinationEpic };
