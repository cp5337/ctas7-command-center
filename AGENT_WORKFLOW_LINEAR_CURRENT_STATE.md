# CTAS-7 Agent System + Workflow + Linear - Current State & Action Plan

**Date:** November 5, 2025
**Purpose:** Examine current agent system, identify what works, what's missing, and establish Linear workflow
**Goal:** Get agents and workflow operational so CP can step away from keyboard

---

## 📊 **CURRENT STATE ANALYSIS**

### **✅ What's Built and Working:**

#### **1. RepoAgent (ctas7-repoagent) - Port 15180**
**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/`

**Status:** ✅ Architecture Complete, Needs Deployment

**Components:**
- `gateway.rs` - HTTP/gRPC gateway on port 15180
- `workflow_orchestrator.rs` - 20KB of workflow automation logic
- `claude_meta_agent.rs` - Claude as meta-coordinator
- `ontology_router.rs` - Layer 2 universal adapter
- `zen_coder_integration.rs` - AI code generation
- `agent_server.rs` - Multi-agent server
- `slack_integration.rs` - Team notifications

**Capabilities:**
- ✅ Route tasks through Claude meta-agent
- ✅ Multi-LLM failover (Claude → GPT-4 → Gemini → Ollama)
- ✅ gRPC mesh for agent communication (port 50055)
- ✅ HTTP REST API (port 15180)
- ✅ Voice integration hooks
- ✅ Ontology routing to ANY external system

**What's Missing:**
- ⚠️ Not currently running/deployed
- ⚠️ Linear integration partially implemented
- ⚠️ Workflow orchestrator needs Linear API connection
- ⚠️ Git automation needs testing

---

#### **2. Synaptix Core Enterprise Architecture**
**Documentation:** `SYNAPTIX_CORE_ENTERPRISE.md`

**Status:** ✅ Design Complete

**Vision:**
- Universal integration hub for all CTAS systems
- Gateway for apps, integrations, and CTAS ontology
- Plugin system for code standards, testing, IaC
- Elastic/resilient with API key failover
- Memory Fabric integration
- Synaptix Mesh connectivity

**Current Reality:**
- Architecture documented ✅
- Some components implemented (RepoAgent gateway)
- Full integration pending ⏳

---

#### **3. Workflow Automation System**
**Documentation:** `WORKFLOW_AUTOMATION_GUIDE.md`

**Status:** ✅ Design Complete, Not Implemented

**Designed Flow:**
```
Linear Issue → Git Branch → Code → PR → Review → Merge → Deploy → Linear Update
```

**Automation Planned:**
1. Linear issue → Auto-create git branch
2. Agent completes code → Auto-create PR
3. Agent Cove reviews → Auto-merge or request changes
4. PR merged → Auto-deploy + Update Linear
5. Full handoff system between agents

**Current Reality:**
- Workflow orchestrator code exists (20KB)
- No active Linear webhook integration
- Manual git operations still required
- Agent handoffs not automated

---

#### **4. Agent Roster**

| Agent | Purpose | Port | Status | Location |
|-------|---------|------|--------|----------|
| **Claude Meta** | Master coordinator, routing | 50055 (gRPC) | ✅ Code exists | `src/claude_meta_agent.rs` |
| **Natasha** | Voice, AI/ML, red team | - | ✅ Persona defined | `agents/natasha/` |
| **Cove** | DevOps, QA, XSD | - | ✅ Persona defined | `agents/cove/` |
| **Grok** | Space, aerospace | - | ✅ Persona defined | `agents/grok/` |
| **Altair** | Backend engineer | - | 📝 Defined | `agents/altair/` |
| **GPT/Gemini** | Fallback LLMs | - | ✅ Integrated | Multi-LLM orchestrator |

---

#### **5. Linear Integration**
**Documentation:** `CTAS7_LINEAR_AGENT_DEPLOYMENT_PLAN.md`

**Status:** ⏳ Partial

**What Exists:**
- Linear CLI in shipyard-staging (`ctas7-linear-cli`)
- API key available
- Team: CognetixALPHA (COG)
- Integration design documented

**What's Missing:**
- Webhook handlers not deployed
- Auto-issue creation not active
- Agent assignment not automated
- PR ↔ Linear sync not working

---

### **❌ What's NOT Working:**

1. **RepoAgent Gateway Not Running**
   - Gateway code exists but not deployed
   - Port 15180 not listening
   - No active service

2. **Linear Workflow Not Automated**
   - No webhooks configured
   - Manual issue creation
   - No auto-PR creation
   - No agent handoffs

3. **Git Automation Missing**
   - Manual branching
   - Manual commits
   - Manual PR creation
   - No auto-merge

4. **Agent Communication Not Active**
   - gRPC mesh not running
   - No inter-agent messages
   - Manual task delegation

---

## 🎯 **ACTION PLAN TO GET OPERATIONAL**

### **Phase 1: Get RepoAgent Gateway Running (1-2 hours)**

#### **Step 1.1: Build and Start Gateway**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent

# Build
cargo build --release --bin gateway

# Configure environment
cp .env.example .env
# Edit .env with API keys

# Start gateway
./target/release/gateway &

# Verify
curl http://localhost:15180/health
```

#### **Step 1.2: Test Basic Routing**
```bash
# Test meta-agent routing
curl -X POST http://localhost:15180/meta_agent/route_task \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "query": "Test task",
    "context": "general",
    "priority": "normal"
  }'
```

---

### **Phase 2: Connect Linear (2-3 hours)**

#### **Step 2.1: Configure Linear API**
```bash
# Add to .env
LINEAR_API_KEY=your-linear-api-key
LINEAR_TEAM_ID=979acadf-8301-459e-9e51-bf3c1f60e496  # COG team
LINEAR_WORKSPACE_ID=your-workspace-id
```

#### **Step 2.2: Set Up Webhooks**
```bash
# In Linear Settings:
# 1. Go to Settings → API → Webhooks
# 2. Add webhook URL: http://your-server:15180/webhooks/linear
# 3. Select events:
#    - Issue created
#    - Issue updated
#    - Issue status changed
#    - Issue assigned

# If local development, use ngrok:
ngrok http 15180
# Use ngrok URL: https://abc123.ngrok.io/webhooks/linear
```

#### **Step 2.3: Test Webhook Handler**
```rust
// Should already exist in workflow_orchestrator.rs
// Verify webhook endpoint is registered in gateway.rs
```

---

### **Phase 3: Implement Core Workflow (3-4 hours)**

#### **Step 3.1: Linear Issue → Git Branch**
```rust
// In workflow_orchestrator.rs
async fn handle_issue_in_progress(issue: LinearIssue) {
    // 1. Create git branch
    let branch_name = format!("feature/{}-{}",
        issue.identifier,
        issue.title.to_kebab_case()
    );

    git_create_branch(&branch_name).await?;

    // 2. Update Linear issue
    linear_update_issue(issue.id, {
        description: format!("{}\n\n## Git Branch\n{}", issue.description, branch_name),
        comment: format!("🤖 Created branch: {}", branch_name)
    }).await?;

    // 3. Notify agent
    notify_agent(issue.assignee_id, {
        type: "branch_created",
        branch: branch_name,
        issue: issue.identifier
    }).await?;
}
```

#### **Step 3.2: Code Complete → Auto-PR**
```rust
async fn handle_code_complete(branch: &str, issue: LinearIssue) {
    // 1. Commit changes
    git_commit(&format!(
        "feat: {}\n\nResolves {}\n\nGenerated by: {}",
        issue.title,
        issue.identifier,
        agent_name
    )).await?;

    // 2. Push branch
    git_push(branch).await?;

    // 3. Create PR
    let pr = github_create_pr({
        title: issue.title,
        body: generate_pr_template(&issue),
        head: branch,
        base: "main"
    }).await?;

    // 4. Update Linear
    linear_update_issue(issue.id, {
        status: "In Review",
        comment: format!("🤖 PR #{} created: {}", pr.number, pr.url)
    }).await?;

    // 5. Hand off to Cove for review
    linear_assign(issue.id, AGENT_COVE_ID).await?;
}
```

#### **Step 3.3: Agent Review → Auto-Merge**
```rust
async fn handle_pr_review(pr: PullRequest, issue: LinearIssue) {
    // 1. Run checks
    let qa_result = run_phd_analyzer(&pr.diff).await?;
    let tests_passed = run_test_suite().await?;
    let stig_compliant = check_stig_compliance().await?;

    if qa_result.passed && tests_passed && stig_compliant {
        // 2. Approve and merge
        github_approve_pr(pr.number).await?;
        github_merge_pr(pr.number).await?;

        // 3. Update Linear
        linear_update_issue(issue.id, {
            status: "Done",
            comment: "🎉 PR merged! Deployment triggered."
        }).await?;

        // 4. Trigger deployment
        trigger_ci_cd_pipeline(pr.merged_commit).await?;
    } else {
        // Request changes
        github_request_changes(pr.number, generate_feedback(qa_result)).await?;
        linear_assign(issue.id, issue.creator_id).await?; // Back to creator
    }
}
```

---

### **Phase 4: Deploy as Service (1 hour)**

#### **Option A: Systemd Service (Linux/Mac)**
```bash
# Create service file
cat > /etc/systemd/system/ctas7-repoagent.service << 'EOF'
[Unit]
Description=CTAS-7 RepoAgent Gateway
After=network.target

[Service]
Type=simple
User=ctas7
WorkingDirectory=/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
Environment="PATH=/usr/local/bin:/usr/bin"
EnvironmentFile=/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/.env
ExecStart=/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/target/release/gateway
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable ctas7-repoagent
sudo systemctl start ctas7-repoagent
sudo systemctl status ctas7-repoagent
```

#### **Option B: Docker Container**
```bash
# Use existing Dockerfile
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
docker build -t ctas7-repoagent:latest .
docker run -d \
  --name ctas7-repoagent \
  -p 15180:15180 \
  -p 50055:50055 \
  --env-file .env \
  --restart unless-stopped \
  ctas7-repoagent:latest
```

#### **Option C: Docker Compose (Recommended)**
```bash
# Use existing docker-compose.yml
docker-compose up -d ctas7-repoagent
docker-compose logs -f ctas7-repoagent
```

---

## 📋 **IMMEDIATE NEXT STEPS (Priority Order)**

### **1. START HERE (Today)**
```bash
# 1. Build RepoAgent
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
cargo build --release --bin gateway

# 2. Configure .env
cp .env.example .env
# Add API keys: LINEAR_API_KEY, CLAUDE_API_KEY, etc.

# 3. Start gateway
./target/release/gateway &

# 4. Verify it's running
curl http://localhost:15180/health
```

### **2. Connect Linear (This Week)**
- Set up Linear webhooks → RepoAgent endpoint
- Test issue creation → branch creation
- Verify Linear comments from agents

### **3. Test Basic Workflow (This Week)**
- Create test Linear issue
- Verify git branch auto-creation
- Test PR creation from branch
- Test Linear status updates

### **4. Full Automation (Next Week)**
- Agent Cove auto-review
- Auto-merge on approval
- Auto-deployment pipeline
- Agent handoffs

---

## 🔧 **CONFIGURATION CHECKLIST**

### **Environment Variables Needed:**
```bash
# API Keys
LINEAR_API_KEY=lin_api_...
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...

# Linear Configuration
LINEAR_TEAM_ID=979acadf-8301-459e-9e51-bf3c1f60e496
LINEAR_WORKSPACE_ID=your-workspace
LINEAR_PROJECT_ID=your-project

# GitHub Configuration
GITHUB_TOKEN=ghp_...
GITHUB_ORG=your-org
GITHUB_REPO=ctas7-main

# Service Ports
GATEWAY_PORT=15180
GRPC_PORT=50055
NEURAL_MUX_PORT=18100

# Database
SUPABASE_URL=https://...
SUPABASE_KEY=...
SURREALDB_URL=http://localhost:8000
```

### **Linear Team Setup:**
- Team: CognetixALPHA (COG)
- Team ID: `979acadf-8301-459e-9e51-bf3c1f60e496`
- Members: Assign agent IDs
- Labels: Setup (bug, feature, enhancement, etc.)
- Workflows: Configure states (Backlog, In Progress, In Review, Done)

---

## 💡 **KEY INSIGHTS**

### **What's Good:**
1. ✅ **Solid Architecture** - Gateway, workflow orchestrator, agents all designed
2. ✅ **Code Exists** - 20KB+ of workflow automation already written
3. ✅ **Multi-LLM Ready** - Graceful failover between Claude, GPT, Gemini, Ollama
4. ✅ **Linear Integration Designed** - Clear plan for webhooks and automation

### **What's Blocking:**
1. ⚠️ **Not Running** - Gateway needs to be started as a service
2. ⚠️ **Linear Webhooks** - Need to be configured in Linear settings
3. ⚠️ **API Keys** - Need to be added to .env
4. ⚠️ **Testing** - Workflow needs end-to-end testing

### **What's the Quickest Path:**
1. Start gateway (1 command)
2. Add API keys (5 minutes)
3. Configure Linear webhook (10 minutes)
4. Test with one issue (15 minutes)
5. Iterate and refine (ongoing)

---

## 🎯 **SUCCESS METRICS**

### **Week 1 Goals:**
- ✅ RepoAgent gateway running 24/7
- ✅ Linear webhook receiving events
- ✅ Test issue → git branch working
- ✅ Manual agent commands via API

### **Week 2 Goals:**
- ✅ Full workflow: Issue → Branch → Code → PR → Review → Merge
- ✅ Agent handoffs automated
- ✅ Linear always up-to-date with git state
- ✅ One full cycle without manual intervention

### **Week 3+ Goals:**
- ✅ Multiple issues handled in parallel
- ✅ Agent Cove auto-reviews with PhD QA
- ✅ Auto-deployment after merge
- ✅ CP only touches keyboard to approve final deploys

---

**Status:** 🎯 Ready to Deploy
**Blocker:** Need to start gateway and configure webhooks
**Timeline:** Can be operational in < 4 hours
**Impact:** Massive - automates entire dev workflow
