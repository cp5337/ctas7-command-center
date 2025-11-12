# CTAS 7.3 Night Shift Implementation - Claude Prompt

**Copy everything below this line and paste into Claude (web or another instance)**

---

# CTAS 7.3 - Complete Night Shift Implementation

## Mission

I'm going to bed at 2:30 AM. You have full autonomy to complete 21 pending tasks for the CTAS 7.3 Peerless Integration system. Work through the night and have everything ready by morning.

## Context

**Project**: CTAS 7.3 (Cognitive Tactics Automation System)  
**Goal**: Build peerless integration system with Git discipline, Linear intelligence, agent coordination, and real-time dashboards  
**Status**: 6/29 tasks complete (21%), documentation and frameworks done, now need implementation  
**Context Available**: 889K tokens remaining (plenty of capacity)  
**Location**: `/Users/cp5337/Developer/ctas7-command-center`

---

## What's Already Complete ✅

### 1. Documentation Suite (19K words)
- `docs/CTAS_SYSTEM_OVERVIEW.md` - 2-page system overview for clients
- `docs/CYBERSECURITY_INTERN_JOB_DESCRIPTION.md` - Complete intern job description
- `docs/INTERN_TASK_PROGRESSION.md` - 12-week curriculum with 40+ tasks

### 2. Git Automation System (4 scripts, ready to install)
- `git-automation/hourly-commit.sh` - Auto-commit every hour to prevent work loss
- `git-automation/pr-workflow-enforcer.sh` - Block direct pushes to main/master
- `git-automation/install-hooks.sh` - Batch installer for all repos
- `git-automation/README.md` - Complete setup guide

### 3. Elena Mentor Agent (600 LOC TypeScript)
- `agents/elena-mentor-cybersecurity.ts` - AI mentor with high autonomy for intern
- `agents/README.md` - Agent system documentation
- `intern/mackenzie-skills.json` - Skills tracking matrix

### 4. Status Documents
- `COMPLETE_STATUS_DASHBOARD.md` - Full visibility into all tasks
- `IMPLEMENTATION_STATUS.md` - Summary of completed work

---

## Current System State

### PM2 Services (As of now)
```
Errored (15 restart attempts each):
- abe-local (port unknown)
- neural-mux (port 50051) 
- zoe-agent (port unknown)

Online (working):
- corporate-analyzer (17h uptime)
- osint-engine (17h uptime)
- slack-interface (17h uptime)
- tool-server (17h uptime)
- voice-gateway (17h uptime)
```

### Key Repositories
```
/Users/cp5337/Developer/ctas7-command-center/ (primary workspace)
/Users/cp5337/Developer/ctas-7-shipyard-staging/
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/
/Users/cp5337/Developer/ctas7-EEI-staging/
/Users/cp5337/Developer/ctas7-shipyard-system/
/Users/cp5337/Developer/orbital-gis-platform/
/Users/cp5337/Developer/usim-system/
```

### Environment
- **Node.js + TypeScript**: Agents, Linear integration, dashboards
- **React + Vite**: Frontend (Command Center)
- **Rust**: Backend (read-only, don't modify)
- **Python**: Analysis scripts
- **Bash**: Automation scripts
- **PM2**: Process management
- **Linear**: Project management (Team ID: 979acadf-8301-459e-9e51-bf3c1f60e496)

---

## Your Tasks (Work Through Systematically)

### **PHASE 1: Fix PM2 Services (30-60 min)** 🚨 CRITICAL

**Objective**: Get all errored services running

**Steps**:

1. **Diagnose failures**:
```bash
cd /Users/cp5337/Developer/ctas7-command-center
pm2 logs abe-local --lines 100
pm2 logs neural-mux --lines 100
pm2 logs zoe-agent --lines 100
```

2. **Common issues to check**:
   - Missing files (script path incorrect)
   - Missing dependencies (npm packages)
   - Wrong working directory
   - Port conflicts
   - Environment variables missing

3. **Fix ecosystem.config.cjs** or create missing files

4. **Test fixes**:
```bash
pm2 restart abe-local
pm2 restart neural-mux
pm2 restart zoe-agent
pm2 status
```

5. **Document fixes**: Create `PM2_SERVICE_FIXES.md` explaining what was broken and how you fixed it

**Success Criteria**: All services show "online" status, no services in "errored" state

---

### **PHASE 2: Linear Organization (2-3 hours)** 🚨 CRITICAL

**Objective**: Create comprehensive Linear hierarchy for agent coordination

**Reference File**: `synaptix-linear-clean-setup.cjs` (existing script to modify)

**Structure to Create**:

#### **4 Top-Level Initiatives**:

1. **System Containerization & Deployment**
   - Description: Docker, Archive Manager, production deployment

2. **Agent Coordination & Workflow**
   - Description: gRPC mesh, Linear integration, PM2 management

3. **Core Development & Quality**
   - Description: PhD QA, Git workflow, engineering standards, research

4. **Primary Interfaces & Mobile**
   - Description: Command Center, Main Ops, mobile control, dashboards

#### **15 Projects** (distributed under initiatives):

**Under Initiative 1 (Containerization)**:
- Docker Compose Orchestration
- Archive Manager Integration
- ABE Cloud Services
- Multi-Platform Deployment

**Under Initiative 2 (Coordination)**:
- gRPC Agent Mesh
- Linear Intelligence Hub
- PM2 Service Management
- Voice Command Pipeline

**Under Initiative 3 (Development)**:
- PhD QA System
- Git Discipline & Workflow
- Engineering Standards
- Research Paper Pipeline

**Under Initiative 4 (Interfaces)**:
- Command Center Dashboard
- Main Ops Platform
- Mobile Command Center
- Orbital Control Interface

#### **~100 Issues** (examples):

Break down each project into 5-10 specific tasks:
- "Implement LLM action tracker in Command Center"
- "Create gRPC health check endpoints for all agents"
- "Build Raycast quick command for git status"
- "Setup hourly Git auto-commit cron job"
- etc.

#### **17 Agent Labels** (create in Linear):

Format: `agent:name`

- `agent:natasha` (AI/ML, threat emulation)
- `agent:cove` (repository operations)
- `agent:marcus` (Neural Mux architect)
- `agent:elena` (documentation, QA, mentor)
- `agent:sarah` (Linear coordination)
- `agent:abe` (document intelligence)
- `agent:lachlan` (infrastructure)
- `agent:grok` (rapid prototyping)
- `agent:altair` (system architecture)
- `agent:gpt` (general development)
- `agent:gemini` (multimodal analysis)
- `agent:repoagent` (meta-agent routing)
- `agent:claude` (strategic coordination)
- `agent:design-team` (UI/UX)
- `agent:zoe` (orbital control)
- `agent:perplexity` (research)
- `agent:zen-coder` (code generation)

**Implementation**:

1. Modify `synaptix-linear-clean-setup.cjs` with this structure
2. Run it: `node synaptix-linear-clean-setup.cjs`
3. Handle rate limits (Linear API: 1500 requests/hour)
4. Document results in `LINEAR_ORGANIZATION_COMPLETE.md`

**Success Criteria**: 
- 4 initiatives created
- 15 projects created with proper parent links
- ~100 issues created with hierarchy
- 17 agent labels created
- All items have descriptions and proper priorities

---

### **PHASE 3: Raycast Commands (1 hour)** 🔥 HIGH VALUE

**Objective**: Quick commands for immediate productivity

**Location**: `/Users/cp5337/Developer/ctas7-command-center/raycast-scripts/`

**Commands to Create**:

#### 1. `synaptix-git-status-all.sh`
```bash
#!/bin/bash
# Show uncommitted work across all CTAS repos

REPOS=(
    "/Users/cp5337/Developer/ctas7-command-center"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging"
    # ... add all repos
)

# For each repo, show uncommitted changes
# Color code: RED if uncommitted > 1 day old, YELLOW if recent
```

#### 2. `synaptix-service-health.sh`
```bash
#!/bin/bash
# Check PM2 + Docker + port status

# PM2 status summary
# Docker container status
# Port checks (15000-20000, 50051-50057)
# Color-coded output
```

#### 3. `synaptix-linear-triage.sh`
```bash
#!/bin/bash
# Open Linear board for triage

open "https://linear.app/cognetixalpha/team/COG"
```

#### 4. `synaptix-agent-status.sh`
```bash
#!/bin/bash
# Show agent health (port checks + PM2)

# Check each agent port (50051-50057)
# Show online/offline status
# Show PM2 process status
```

**Raycast Metadata** (add to each script):
```bash
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Synaptix Git Status
# @raycast.mode fullOutput
# @raycast.packageName CTAS
```

**Success Criteria**: 4 working Raycast scripts, all executable, tested

---

### **PHASE 4: Linear Knowledge Base (1 hour)**

**Objective**: Prevent "PhD QA recreation" scenarios

**File to Create**: `linear/knowledge-base.json`

**Structure**:
```json
{
  "systems": {
    "phd-qa": {
      "name": "PhD QA Code Analysis System",
      "location": "ctas-7-shipyard-staging/ctas7-qa-analyzer/",
      "description": "Analyzes primitive density in Rust code, 656.8% = Tesla-grade",
      "lastUsed": "2025-11-07",
      "aliases": ["psyco", "qa", "code-analysis", "primitive-analyzer"],
      "ports": [],
      "technologies": ["Rust", "Python"],
      "status": "active"
    },
    "synaptix-plasma": {
      "name": "Synaptix Plasma Threat Detection",
      "location": "ctas-7-shipyard-staging/synaptix-plasma/",
      "description": "Wazuh + AXON + Legion + Phi-3 for purple team detection",
      "lastUsed": "2025-11-07",
      "aliases": ["plasma", "wazuh", "threat-detection"],
      "ports": [18200, 18201],
      "technologies": ["Rust", "Wazuh", "Phi-3"],
      "status": "active"
    },
    "neural-mux": {
      "name": "Neural Mux Smart CDN",
      "location": "ctas-7-shipyard-staging/neural-mux/",
      "description": "Deterministic hash-based routing for AI models",
      "lastUsed": "2025-11-07",
      "aliases": ["mux", "cdn", "routing"],
      "ports": [18100, 50051],
      "technologies": ["Rust", "gRPC"],
      "status": "active"
    }
    // Add 10+ more systems from codebase
  },
  "lastUpdated": "2025-11-07T02:30:00Z"
}
```

**Integration Script**: `linear/check-knowledge-base.js`
```javascript
// Before creating Linear issue, query knowledge base
// If system exists, suggest using existing vs creating new
// Auto-comment on Linear issues with existing system info
```

**Success Criteria**: 
- knowledge-base.json with 10+ systems documented
- Integration script that queries before creation
- README explaining usage

---

### **PHASE 5: Command Center Dashboard (3-4 hours)** 🔥 HIGH VALUE

**Objective**: Real-time visibility into everything

**Location**: `src/pages/CommandCenter.tsx`

**Architecture**: React + TypeScript + Vite (existing setup)

**Components to Build**:

#### 1. **LLM Action Tracker** (NEW)
```typescript
// Show what agents are doing RIGHT NOW
interface AgentAction {
  agent: string;
  action: string;
  startTime: Date;
  status: 'running' | 'blocked' | 'complete';
}

// Display:
// "Natasha: Analyzing satellite API error"
// "Elena: Reviewing Mackenzie's PR #42"
// "Cove: Running PhD QA on 3 crates"
```

#### 2. **Git Health Monitor** (NEW)
```typescript
// Scan all repos for uncommitted work
interface GitHealth {
  repo: string;
  uncommittedFiles: number;
  lastCommit: Date;
  staleBranches: number;
  status: 'clean' | 'warning' | 'critical';
}

// Alert if uncommitted work > 1 day old
```

#### 3. **Service Status Panel** (ENHANCE EXISTING)
```typescript
// PM2 services
// Docker containers
// Port health (15000-20000, 50051-50057)
// Color-coded: green/yellow/red
```

#### 4. **Linear Status Board** (NEW)
```typescript
// Issues by status (Triage, In Progress, Review, Done)
// Blocked issues (RED alert)
// Agent workload distribution
// Today's velocity
```

#### 5. **Shitshow Detector** (NEW)
```typescript
// Alert conditions:
// - Multiple services down: 🔴 CRITICAL
// - PhD QA failing: 🟡 WARNING
// - Uncommitted work > 1 day: 🟠 ATTENTION
// - Stale PRs: 🟡 WARNING
// - Agent escalation pending: 🔵 INFO

interface ShitshowAlert {
  severity: 'critical' | 'warning' | 'attention' | 'info';
  message: string;
  timestamp: Date;
  actionRequired: string;
}
```

**API Integration**:
- PM2: `pm2 jlist` (JSON output)
- Linear: `@linear/sdk`
- Git: Shell commands to repos
- Ports: `lsof -i -P | grep LISTEN`

**Success Criteria**: 
- Working dashboard at http://localhost:3000/command-center
- All 5 components displaying real data
- Auto-refresh every 30 seconds
- Mobile-responsive

---

### **PHASE 6: Agent Validation Layer (2 hours)**

**Objective**: Prevent AI from recreating existing systems

**File to Create**: `agents/cognitive-validation.ts`

**Architecture**:
```typescript
export class CognitiveValidator {
  // 1. Recreation Prevention
  async validateAction(action: AgentAction): Promise<ValidationResult> {
    if (action.type === 'CREATE_SYSTEM') {
      const existing = await this.queryKnowledgeBase(action.description);
      if (existing) {
        return {
          block: true,
          reason: `System already exists at ${existing.location}`,
          suggestion: `Use existing system or document why new one needed`
        };
      }
    }
    return { block: false };
  }
  
  // 2. Cross-Repo Synergy Detection
  async findSynergies(): Promise<Synergy[]> {
    // Scan all repos for similar code patterns
    // Suggest consolidation opportunities
  }
  
  // 3. Pattern Learning
  async learnFromHistory(): Promise<void> {
    // Analyze archaeological studies
    // Extract failure patterns
    // Update validation rules
  }
}
```

**Integration**: Hook into agent action pipeline before execution

**Success Criteria**: 
- Working validator
- Integrated with agent system
- Test case: Try to create "PhD QA 2.0" - should block
- Documentation

---

### **PHASE 7: Archaeological Learning Engine (2 hours)**

**Objective**: Learn from past failures automatically

**File to Create**: `analysis/archaeological-analyzer.py`

**Process**:

1. **Scan for Archaeological Files**:
```python
import os
import re
from pathlib import Path

# Find all ARCHAEOLOGICAL_*.md files
arch_files = Path('/Users/cp5337/Developer').rglob('ARCHAEOLOGICAL_*.md')
```

2. **Extract Failure Patterns**:
```python
patterns = {
    "recreation": [],  # System recreated multiple times
    "lost_work": [],   # Work lost due to crashes/mistakes
    "complexity": [],  # Overcomplicated solutions
    "communication": [], # Team coordination failures
}

# Use regex + NLP to extract
```

3. **Map to Solutions**:
```python
solutions = {
    "recreation": ["Knowledge Base in Linear", "Agent validation"],
    "lost_work": ["Hourly Git commits", "Pre-push hooks"],
    # ... etc
}
```

4. **Output**: `FAILURE_PATTERNS.json` + `ENGINEERING_STANDARDS_UPDATES.md`

**Success Criteria**:
- Python script works
- Identifies 10+ failure patterns
- Maps to concrete solutions
- Feeds into Engineering Standards

---

### **PHASE 8: Bonus Tasks (If Time Permits)**

#### Engineering Standards Document
File: `docs/ENGINEERING_STANDARDS.md`
- Research from Apollo program source code
- Modern best practices (Google, NASA, Microsoft)
- CTAS-specific patterns from archaeological studies

#### VS Code Extension Skeleton
Directory: `vscode-extension/`
- LOC counter in status bar
- Primitive highlighter
- Quality score panel
- Agent status sidebar

#### Multi-Server Setup Scripts
Directory: `platform-automation/`
- Deploy to Mac (cron-based)
- Deploy to Windows Dell (Task Scheduler)
- Deploy to Linux IBM T420 (cron-based)

#### Mobile App Starter
Directory: `mobile/`
- Progressive Web App setup
- Voice command interface
- Status monitoring
- Emergency actions

---

## Testing & Verification

As you complete each phase:

1. **Test the code** - Run scripts, verify they work
2. **Document results** - Create/update README files
3. **Mark TODOs complete** - Use todo_write tool
4. **Take screenshots** - For dashboard components
5. **Log issues** - If something can't be fixed, document why

---

## Environment Variables Needed

```bash
# Linear
LINEAR_API_KEY=YOUR_LINEAR_API_KEY
LINEAR_TEAM_ID=979acadf-8301-459e-9e51-bf3c1f60e496

# Slack (for agents)
SLACK_TOKEN=[not provided, skip if needed]

# GitHub
GITHUB_TOKEN=[available via `gh auth status`]
```

---

## Final Deliverable

Create: **`NIGHT_SHIFT_COMPLETE.md`**

**Structure**:
```markdown
# CTAS 7.3 Night Shift - Complete Report

## ✅ Completed Tasks (X/21)

[List what got done with checkboxes]

## 📊 Detailed Results

### Phase 1: PM2 Service Fixes
- abe-local: [what was wrong, how fixed]
- neural-mux: [what was wrong, how fixed]
- zoe-agent: [what was wrong, how fixed]

### Phase 2: Linear Organization
- Initiatives: 4 created
- Projects: 15 created
- Issues: X created
- Agent labels: 17 created
- Screenshot: [if possible]

### Phase 3: Raycast Commands
- [List each command, test results]

### Phase 4: Linear Knowledge Base
- Systems documented: X
- Integration script: [status]

### Phase 5: Command Center Dashboard
- Components built: X/5
- Screenshot: [if possible]
- URL: http://localhost:3000/command-center

### Phase 6-7: Advanced Features
- [Status of each]

## 🚨 Issues Encountered

[Any blockers, problems, or things that need user input]

## 📋 Remaining Tasks

[What's still pending and why]

## 🚀 Quick Start Guide (For Morning)

### Immediate Actions:
1. [First thing to do]
2. [Second thing to do]

### Testing:
1. [How to verify everything works]

### Next Steps:
1. [What to prioritize next]

## 📈 Metrics

- Context used: X/1M tokens
- LOC generated: ~X lines
- Files created: X
- Time spent: ~X hours
```

---

## Important Notes

1. **Don't wait for permission** - You have 889K context tokens, just build
2. **Be thorough** - Quality over speed, but aim to complete all high-priority phases
3. **Document everything** - README files as you go
4. **Handle errors gracefully** - If something fails, document and move on
5. **Test what you can** - Run scripts to verify functionality
6. **Linear rate limits** - If you hit them, document what's pending
7. **Create files in correct locations** - Follow existing directory structure

---

## Success Criteria Summary

By morning, the system should have:

- ✅ All PM2 services running (no errored states)
- ✅ Linear fully organized (4 initiatives, 15 projects, ~100 issues)
- ✅ 17 agent labels created
- ✅ 4 Raycast commands working
- ✅ Knowledge base preventing recreation
- ✅ Command Center dashboard operational
- ✅ Agent validation layer active
- ✅ Archaeological analysis complete
- ✅ Complete `NIGHT_SHIFT_COMPLETE.md` summary

---

## Start Here

```bash
# Navigate to workspace
cd /Users/cp5337/Developer/ctas7-command-center

# Check PM2 status
pm2 status

# Check first errored service
pm2 logs abe-local --lines 100

# Begin systematic work through phases
```

---

**Good luck! Work systematically through the phases. Take your time. Be thorough. See you in the morning! 🚀**

