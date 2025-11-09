# CTAS-7 RepoAgent + Linear Integration - Complete Architecture
## Multi-Agent Workflow Automation System

**Date:** November 5, 2025
**Version:** 7.1.1
**Status:** ✅ ARCHITECTURE COMPLETE - READY TO DEPLOY

---

## 🎯 **EXECUTIVE SUMMARY**

Complete multi-agent system with:
- **RepoAgent Gateway** (Port 15180) - HTTP/gRPC entry point
- **Linear Integration Server** (Port 15182) - GraphQL wrapper for Linear API
- **Linear Agent** (Port 18180) - Full Linear workflow orchestration
- **Claude Meta-Agent** (Port 50055) - Intelligent task routing
- **Specialized Agents** (Ports 50051-50057) - Domain experts
- **Workflow Orchestration** - Git ↔ Linear ↔ Agents automation

**NO EXTERNAL BRANDS** - Pure CTAS systems with YOUR naming

---

## 🏗️ **COMPLETE SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTERFACES                               │
├─────────────────────────────────────────────────────────────────────┤
│  Custom GPT    │    Voice (Natasha)    │    Mobile Apps    │  CI/CD │
└────────┬────────────────┬─────────────────────┬──────────────────┬───┘
         │                │                     │                  │
         └────────────────┴─────────────────────┴──────────────────┘
                                    ▼
         ┌────────────────────────────────────────────────────────┐
         │       REPOAGENT GATEWAY (Port 15180)                   │
         │       HTTP REST API + gRPC Bridge                      │
         │       • Task routing                                   │
         │       • API key auth                                   │
         │       • Health monitoring                              │
         └────────────────────────┬───────────────────────────────┘
                                  ▼
         ┌────────────────────────────────────────────────────────┐
         │    CLAUDE META-AGENT (Port 50055 gRPC)                 │
         │    Intelligent Task Router & Synthesizer               │
         │    • Analyzes task context                             │
         │    • Selects optimal agent(s)                          │
         │    • Synthesizes multi-agent responses                 │
         └───┬────────────┬──────────┬─────────────┬──────────────┘
             │            │          │             │
    ┌────────┴───┐  ┌────┴────┐ ┌──┴──────┐  ┌───┴────────┐
    │ Natasha    │  │  Grok   │ │  Cove   │  │  Altair    │
    │ 50052      │  │  50051  │ │  50053  │  │  50054     │
    │ Voice/AI   │  │  Space  │ │ DevOps  │  │ Analysis   │
    └────────────┘  └─────────┘ └─────────┘  └────────────┘
             │            │          │             │
             └────────────┴──────────┴─────────────┘
                                  ▼
         ┌────────────────────────────────────────────────────────┐
         │    LINEAR INTEGRATION SERVER (Port 15182)              │
         │    GraphQL Wrapper for Linear API                      │
         │    • Issue management                                  │
         │    • Webhook handling                                  │
         │    • Team/Project routing                              │
         └────────────────────────┬───────────────────────────────┘
                                  ▼
         ┌────────────────────────────────────────────────────────┐
         │    LINEAR AGENT (Port 18180)                           │
         │    Full Linear Workflow Orchestration                  │
         │    • Multi-LLM coordination                            │
         │    • Workflow automation                               │
         │    • Git ↔ Linear sync                                 │
         │    • Agent handoffs                                    │
         └────────────────────────┬───────────────────────────────┘
                                  ▼
         ┌────────────────────────────────────────────────────────┐
         │              WORKFLOW AUTOMATION                        │
         │    • Linear Issue → Git Branch                         │
         │    • Code Complete → PR Creation                       │
         │    • Agent Review → Auto-Merge                         │
         │    • Merge → Deploy → Update Linear                    │
         └─────────────────────────────────────────────────────────┘
```

---

## 📊 **PORT ORGANIZATION**

### **Foundation Layer (15180-15199)**
```
15180  RepoAgent Gateway        HTTP/gRPC    Entry point for all requests
15181  Synaptix Core Hub        HTTP         Universal integration hub
15182  Linear Integration       HTTP/REST    GraphQL wrapper for Linear
15183  [Reserved]               -            Future expansion
15185  Local Email Server       HTTP         AI employee communication
```

### **Agent gRPC Mesh (50051-50057)**
```
50051  Grok Agent               gRPC         Space engineering
50052  Natasha Agent            gRPC         Voice/AI/ML/RedTeam
50053  Cove Agent               gRPC         DevOps/QA
50054  Altair Agent             gRPC         Space analysis
50055  Claude Meta-Agent        gRPC         Task routing & synthesis
50056  GPT Agent                gRPC         Tactical operations
50057  Gemini Agent             gRPC         Enterprise architecture
```

### **Service Layer (18100-18399)**
```
18100  Neural Mux CDN           HTTP         Smart routing & stats
18103  Real Port Manager        HTTP         Port registry
18180  Linear Agent             HTTP/REST    Linear workflow orchestration
18200  OSINT Engine             HTTP         Intelligence gathering
18201  Corporate Analyzer       HTTP         Entity analysis
18210  OSINT Gateway            HTTP         Unified OSINT API
```

---

## 🔌 **COMPONENT DETAILS**

### **1. RepoAgent Gateway (Port 15180)**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/`

**Purpose:** HTTP → gRPC bridge for agent mesh

**Key Files:**
- `src/gateway.rs` - Main HTTP server
- `src/gateway_routes.rs` - Route definitions
- `src/ontology_router.rs` - Universal adapter

**Endpoints:**
```
POST /meta_agent/route_task          # Route through Claude
POST /agents/:name/dispatch          # Direct agent dispatch
GET  /agents/status                  # Agent health check
GET  /health                         # Gateway health
```

**Start Command:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
./start-gateway.sh
# Or manually:
cargo run --release --bin gateway
```

---

### **2. Linear Integration Server (Port 15182)** ⚠️ NEEDS CREATION
**Purpose:** GraphQL wrapper for Linear API with ASCII splash

**What It Should Do:**
- ✅ Wrap Linear GraphQL API in REST
- ✅ Handle webhook events from Linear
- ✅ Route issues to appropriate agents
- ✅ Manage API key rotation
- ✅ Team/Project filtering
- ✅ **ASCII banner on startup**

**Proposed Stack:**
- Node.js/TypeScript
- Express + Apollo GraphQL Client
- Linear SDK (@linear/sdk)
- Webhook handling

**Proposed Structure:**
```typescript
// server.ts
import express from 'express';
import { LinearClient } from '@linear/sdk';

const app = express();
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

// ASCII Splash
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     CTAS-7 Linear Integration Server v7.1.1              ║
║     GraphQL Wrapper for Linear API                       ║
║                                                           ║
║     Port: 15182                                          ║
║     Status: ONLINE                                       ║
║     Connected to: Linear (CognetixALPHA/COG)            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// REST API Endpoints
app.post('/issues/create', async (req, res) => {
  const issue = await linear.issueCreate({
    teamId: 'COG-TEAM-ID',
    title: req.body.title,
    description: req.body.description
  });
  res.json({ issue });
});

app.post('/webhooks/linear', async (req, res) => {
  // Handle Linear webhook events
  const event = req.body;
  // Route to appropriate agent via RepoAgent Gateway
  res.json({ status: 'processed' });
});

app.listen(15182, () => {
  console.log('✅ Linear Integration Server listening on port 15182');
});
```

**Create Command:**
```bash
cd /Users/cp5337/Developer/ctas7-command-center
mkdir -p linear-integration-server
cd linear-integration-server
npm init -y
npm install express @linear/sdk dotenv
# Create server.ts with above code
npx ts-node server.ts
```

---

### **3. Linear Agent (Port 18180)**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust/`

**Purpose:** Full Linear workflow orchestration with Multi-LLM coordination

**Key Files:**
- `src/rust_workflow_orchestrator.rs` - Workflow engine
- `src/linear_integration.rs` - Linear API client
- `src/linear_bridge.rs` - CTAS ↔ Linear bridge
- `src/agent_mux.rs` - Multi-agent multiplexer
- `src/agentic_workflow.rs` - Agent workflow logic

**Capabilities:**
- ✅ Issue → Git branch creation
- ✅ Code complete → PR creation
- ✅ Agent review → Auto-merge
- ✅ Multi-LLM failover (Claude → GPT → Gemini)
- ✅ Agent handoff coordination

**Start Command:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust
cargo run --release
```

---

### **4. Claude Meta-Agent (Port 50055)**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/src/claude_meta_agent.rs`

**Purpose:** Intelligent task routing and response synthesis

**Routing Logic:**
```rust
match task.context {
    "space_ops" | "satellite" | "orbital" => vec!["grok", "altair"],
    "red_team" | "pentest" | "security" => vec!["natasha"],
    "devops" | "qa" | "xsd" => vec!["cove"],
    "linear" | "workflow" | "git" => route_to_linear_agent(),
    "voice_command" => vec!["natasha"],
    "enterprise" | "architecture" => vec!["gemini"],
    _ => vec!["claude"], // Self-handle or delegate
}
```

**Start Command:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
cargo run --release --bin ctas-agent-mesh claude
```

---

### **5. Specialized Agents (Ports 50051-50057)**

#### **Natasha (50052) - Voice/AI/ML/RedTeam**
- Primary voice interface
- Red team operations
- Security analysis
- Kali Linux integration

#### **Grok (50051) - Space Engineering**
- Starlink operations
- Orbital mechanics (SGP4)
- Ground station management
- LaserLight FSO

#### **Cove (50053) - DevOps/QA**
- PhD QA system
- XSD compliance
- Smart Crate validation
- CI/CD orchestration

#### **Altair (50054) - Space Analysis**
- Orbital analysis
- Space Domain Awareness (SDA)
- Threat assessment
- Conjunction analysis

**Start All Agents:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
./target/release/ctas-agent-mesh all
```

---

## 🔄 **COMPLETE WORKFLOW EXAMPLE**

### **Scenario: User Creates Linear Issue via Voice**

```
1. USER (via Custom GPT/Voice):
   "Natasha, create a Linear issue for fixing the Cesium ground station dots"

2. CUSTOM GPT → RepoAgent Gateway (15180):
   POST /meta_agent/route_task
   {
     "context": "voice_command",
     "query": "create Linear issue for Cesium ground station fix"
   }

3. REPOAGENT GATEWAY → Claude Meta-Agent (50055):
   gRPC dispatch to Claude for routing decision

4. CLAUDE META-AGENT:
   Analyzes: "Linear issue creation" → route to Natasha + Linear

5. NATASHA AGENT (50052):
   Processes voice command, extracts issue details

6. LINEAR INTEGRATION SERVER (15182):
   POST /issues/create
   {
     "title": "Fix Cesium Ground Station Visualization",
     "team": "COG",
     "priority": "high"
   }

7. LINEAR API:
   Creates issue COG-123

8. LINEAR WEBHOOK → Linear Integration Server (15182):
   {
     "action": "Issue.create",
     "data": { "identifier": "COG-123", "status": "Todo" }
   }

9. LINEAR AGENT (18180):
   Receives webhook, initiates workflow:
   - Creates git branch: feature/COG-123-cesium-ground-stations
   - Updates Linear issue with branch name
   - Assigns to Cove for implementation

10. WORKFLOW ORCHESTRATOR:
    Monitors COG-123 for status changes

11. COVE AGENT (50053):
    Implements fix, commits code

12. LINEAR AGENT (18180):
    Detects code completion:
    - Creates PR #45 on GitHub
    - Updates Linear: "In Review"
    - Hands off to Cove for review

13. COVE AGENT (50053):
    Reviews PR:
    - Runs PhD QA
    - Checks STIG compliance
    - Runs tests
    - Approves + merges

14. LINEAR AGENT (18180):
    PR merged:
    - Updates Linear: "Done"
    - Triggers deployment
    - Notifies Natasha (voice confirmation)

15. NATASHA (Voice Response):
    "Issue COG-123 complete. Cesium ground stations are now visible."
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Phase 1: Core Services**
```bash
# 1. Start RepoAgent Gateway
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
./start-gateway.sh

# 2. Start Agent Mesh
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
./target/release/ctas-agent-mesh all

# 3. Verify agents
curl http://localhost:15180/agents/status
```

### **Phase 2: Linear Integration**
```bash
# 1. Create Linear Integration Server (if doesn't exist)
cd /Users/cp5337/Developer/ctas7-command-center/linear-integration-server
npm install
npm start

# 2. Configure Linear Webhooks
# - Go to Linear Settings → API → Webhooks
# - Add: http://localhost:15182/webhooks/linear
# - Or use ngrok: https://xyz.ngrok.io/webhooks/linear

# 3. Start Linear Agent
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust
cargo run --release

# 4. Test Linear Integration
curl -X POST http://localhost:15182/issues/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Issue","description":"Testing Linear integration"}'
```

### **Phase 3: Workflow Testing**
```bash
# 1. Create test Linear issue
# 2. Verify git branch creation
# 3. Make code change and commit
# 4. Verify PR creation
# 5. Verify Linear status update
# 6. Verify auto-merge (if approved)
```

---

## ⚙️ **CONFIGURATION**

### **Environment Variables**
```bash
# RepoAgent Gateway
CTAS_API_KEY=your-secure-api-key
CTAS_GATEWAY_PORT=15180

# Linear Integration
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_TEAM_ID=979acadf-8301-459e-9e51-bf3c1f60e496
LINEAR_WORKSPACE_ID=your-workspace

# Claude Meta-Agent
CLAUDE_API_KEY=sk-ant-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Multi-LLM Failover
OPENAI_API_KEY=sk-xxxxx
GEMINI_API_KEY=AIza...
OLLAMA_ENDPOINT=http://localhost:11434

# GitHub Integration
GITHUB_TOKEN=ghp_xxxxx
GITHUB_ORG=your-org
GITHUB_REPO=ctas7-main

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### **Linear Team Configuration**
```yaml
Team: CognetixALPHA
Team ID: 979acadf-8301-459e-9e51-bf3c1f60e496
Team Key: COG
Workflow States:
  - Backlog
  - Todo
  - In Progress
  - In Review
  - Done
  - Cancelled
```

---

## 📋 **SERVICE STATUS**

| Service | Port | Status | Location |
|---------|------|--------|----------|
| RepoAgent Gateway | 15180 | ✅ Built, Not Running | `ctas7-repoagent/` |
| Linear Integration | 15182 | ⚠️ Needs Creation | TBD |
| Linear Agent | 18180 | ✅ Built, Not Running | `ctas7-linear-agent-rust/` |
| Claude Meta | 50055 | ✅ Built, Not Running | `ctas7-repoagent/` |
| Natasha | 50052 | ✅ Built, Not Running | `ctas7-repoagent/` |
| Grok | 50051 | ✅ Built, Not Running | `ctas7-repoagent/` |
| Cove | 50053 | ✅ Built, Not Running | `ctas7-repoagent/` |
| Altair | 50054 | ✅ Built, Not Running | `ctas7-repoagent/` |

---

## 🎯 **IMMEDIATE ACTIONS**

### **Today:**
1. ✅ Review this architecture
2. ⚠️ **Create Linear Integration Server (15182)** with ASCII banner
3. ⚠️ Start RepoAgent Gateway (15180)
4. ⚠️ Start Agent Mesh (50051-50057)
5. ⚠️ Configure Linear webhooks

### **This Week:**
1. Test complete workflow (Issue → Branch → PR → Merge)
2. Agent handoffs working
3. Voice integration confirmed
4. Git automation validated

### **Next Week:**
1. Full automation running 24/7
2. Multiple issues handled in parallel
3. CP only intervenes for final approvals

---

## 📖 **RELATED DOCUMENTS**

- `GATEWAY_README.md` - RepoAgent Gateway details
- `WORKFLOW_AUTOMATION_GUIDE.md` - Workflow orchestration
- `CTAS7_AGENT_SYSTEM_V7_1_1_COMPLETE.md` - Agent system details
- `SYNAPTIX_CORE_ENTERPRISE.md` - Universal integration hub

---

**Classification:** UNCLASSIFIED // CTAS INTERNAL
**Date:** November 5, 2025
**Version:** 7.1.1
**Status:** ✅ READY TO DEPLOY

**NO CYRUS, NO EXTERNAL BRANDS - PURE CTAS SYSTEMS**
