# Linear Integration Servers - Current State

**Date:** November 5, 2025
**Status Check:** What Linear servers do we have?

---

## 🔍 **FOUND: Multiple Linear Integration Systems**

### **1. `ctas7-linear-agent-rust` - Port 18180**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust/`

**Type:** Rust Multi-LLM Agent Server
**Status:** ✅ Built, Not Running

**What It Does:**
- Multi-LLM coordination (Claude, GPT-4, Gemini)
- Linear GraphQL API integration
- Workflow orchestration
- Agent chat and coordination
- Foundation Core integration

**Components:**
```
src/
├── agent_mux.rs                  # Multi-agent multiplexer
├── agent_chat.rs                 # Agent communication
├── agentic_workflow.rs           # Workflow automation
├── linear_integration.rs         # Linear API
├── linear_bridge.rs              # Linear ↔ CTAS bridge
├── linear_coordination.rs        # Team coordination
├── rust_workflow_orchestrator.rs # Workflow engine
├── v7_agent_mux.rs              # v7.3 agent system
└── main.rs                       # Entry point
```

**Start Command:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust
cargo build --release
./target/release/ctas7-linear-agent
```

---

### **2. `ctas7-enterprise-mcp-cyrus` - Node.js**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enterprise-mcp-cyrus/`

**Type:** Node.js/TypeScript MCP Server (Cyrus)
**Status:** ✅ Installed, Port Dynamic (30100-30199)

**What It Does:**
- **Cyrus AI Agent** - AI development agent for Linear powered by Claude Code
- Monitors Linear issues assigned to it
- Creates isolated Git worktrees for each issue
- Runs Claude Code sessions to process issues
- Posts responses back to Linear as comments
- MCP (Model Context Protocol) integration

**Packages:**
```
packages/
├── claude-runner/        # Claude Code execution
├── core/                 # Core agent session
├── edge-worker/          # Edge deployment
├── linear-webhook-client/# Linear webhook handling
├── multi-llm/           # Multi-LLM support (has .rs files!)
└── team-coordination/    # Team coordination
```

**Start Command:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enterprise-mcp-cyrus
npm install
cyrus  # or npx cyrus
```

**Port Assignment:**
- Dynamic: Port = 30100 + (Linear Issue ID % 100)
- Example: PACK-293 → Port 30193

---

### **3. `ctas7-linear-cli` - CLI Tool**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-cli/`

**Type:** Rust Command Line Interface
**Status:** ✅ Built

**What It Does:**
- Create/list/update Linear issues from terminal
- Query Linear API
- Manage team assignments
- Quick Linear operations

**Usage:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-cli
cargo run -- list-issues
cargo run -- create "New task" --priority high
```

---

### **4. `ctas7-linear-integration` - Integration Layer**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-integration/`

**Type:** Integration components
**Status:** ⚠️ Unknown

---

### **5. RepoAgent with Linear Support - Port 15180**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/`

**Type:** Rust HTTP/gRPC Gateway
**Status:** ✅ Built, Not Running

**Linear Features:**
- Routes to Linear Agent (18180)
- Workflow orchestration with Linear
- Agent handoffs via Linear issues
- Git ↔ Linear sync

---

## 🤔 **WHICH ONE WAS THE "ASCII SPLASH" SERVER?**

Based on your memory of a **Node app with ASCII splash when setting up Cyrus and RepoAgent**, you're likely thinking of:

### **Option A: `ctas7-enterprise-mcp-cyrus`** (Most Likely)
- ✅ Node.js/TypeScript
- ✅ Has setup script (`cyrus-setup.sh`)
- ✅ Called "Cyrus"
- ✅ MCP integration
- ✅ Would show splash on `cyrus` command

### **Option B: Custom Linear Integration Server**
There may have been a custom Node.js server with an ASCII banner that we set up previously. Let me check for that:

```bash
# Possible names:
- linear-integration-server
- linear-mcp-server
- ctas7-linear-mcp
- Port 15182 (mentioned in docs)
```

---

## 🔍 **PORT 15182 References**

Found references to **Port 15182** as "Linear Integration Server":

```
From NATASHA_DEPLOYMENT_INSTRUCTIONS.md:
| **Linear Integration** | **15182** | HTTP/REST | GraphQL wrapper |
```

This suggests there WAS a separate Linear Integration Server on port 15182, likely a Node.js GraphQL wrapper for the Linear API!

---

## 🎯 **RECONSTRUCTION NEEDED**

It looks like you had a **Linear Integration Server (Port 15182)** that may have been:
1. A Node.js GraphQL wrapper for Linear API
2. Had an ASCII splash screen on startup
3. Part of the RepoAgent + Cyrus setup
4. May have been lost or not currently running

**Evidence:**
- Port 15182 referenced in agent docs
- Listed alongside other CTAS services
- Would have been the "missing link" between RepoAgent (15180) and Linear Agent Rust (18180)

---

## 🚀 **RECOMMENDATION**

### **For Linear + Workflow Automation:**

**Use This Stack:**
```
┌─────────────────────────────────────┐
│  RepoAgent Gateway (Port 15180)     │  ← HTTP/gRPC entry point
│  - Routes tasks to agents           │
│  - Workflow orchestration           │
└─────────────┬───────────────────────┘
              │
              ├──→ Claude Meta-Agent (gRPC 50055)
              │
              ├──→ Linear Agent Rust (Port 18180)
              │     - Linear API integration
              │     - Multi-LLM coordination
              │     - Workflow engine
              │
              └──→ Cyrus MCP (Port 30100+)
                    - Issue monitoring
                    - Git worktrees
                    - Claude Code execution
```

### **Quick Start:**

```bash
# 1. Start RepoAgent Gateway
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
./start-gateway.sh

# 2. Start Linear Agent (Rust)
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust
cargo run --release

# 3. Start Cyrus (optional, for issue monitoring)
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enterprise-mcp-cyrus
cyrus
```

---

## 💡 **MISSING PIECE: Linear Integration Server (15182)?**

If you remember an ASCII splash Node server specifically for Linear Integration on port 15182, we may need to:

1. **Find it** - Check if it's in another location
2. **Recreate it** - Build a simple Node.js GraphQL wrapper
3. **Use Cyrus Instead** - Cyrus already does Linear integration

**Action:** Let me know if you want me to search for or recreate the port 15182 Linear Integration Server with an ASCII banner!

---

**Summary:**
- **ctas7-linear-agent-rust** (18180) = Rust multi-LLM server ✅
- **ctas7-enterprise-mcp-cyrus** = Node.js Cyrus agent ✅
- **Port 15182 server** = Missing Linear Integration wrapper ❓
