# 🤖 LINEAR AGENT SETUP GUIDE

**Date:** November 7, 2025  
**Purpose:** Register all agents in Linear for task assignment  
**Architecture:** Multi-model agent mesh with PM2 coordination  

---

## 🎯 **AGENT ROSTER**

### **Core Agents (gRPC + PM2)**

| Agent | Linear Handle | Port | Status | PM2? | Type |
|-------|--------------|------|--------|------|------|
| **Claude Meta** | @claude-meta | 50050 | ⏳ Setup | Yes | Orchestrator |
| **Natasha** | @natasha | 50052 | ⏳ Setup | Yes | AI/ML Lead |
| **Cove** | @cove | 50053 | ⏳ Setup | Yes | Repo Ops |
| **Marcus** | @marcus | 50051 | ⏳ Setup | Yes | Neural Mux |
| **Elena** | @elena | 50054 | ⏳ Setup | Yes | Documentation |
| **Sarah** | @sarah | 18180 | ⏳ Setup | Yes | Linear |
| **ABE** | @abe | 50058 | ⏳ Setup | Yes | Documents |

### **Model Agents (API-based, No PM2)**

| Agent | Linear Handle | API | PM2? | Type |
|-------|--------------|-----|------|------|
| **Grok** | @grok | xAI API | No | LLM |
| **Altair** | @altair | Perplexity | No | Search |
| **GPT-4** | @gpt4 | OpenAI | No | LLM |
| **Gemini** | @gemini | Google | No | LLM |
| **Lachlan** | @lachlan | ElevenLabs | No | Voice |

### **Design System Agents (Build Pipeline)**

| Agent | Linear Handle | Port | PM2? | Type |
|-------|--------------|------|------|------|
| **BuildSync** | @buildsync | 50059 | Yes | Sync |
| **DesignAudit** | @designaudit | 50060 | Yes | Validator |
| **iOSValidator** | @iosvalidator | 50061 | Yes | iOS Check |
| **LLMTrainer** | @llmtrainer | 50062 | No | Training |
| **BoltRegistrar** | @boltregistrar | 50063 | Yes | Logging |
| **DocumentGenerator** | @docgen | 50064 | Yes | Docs |
| **ThemeValidator** | @themevalidator | 50066 | Yes | Design |

---

## 🔄 **PM2 vs NON-PM2 AGENTS**

### **PM2-Managed Agents (Need PM2 Running)**

These are **native services** that run as processes:

```javascript
// PM2 manages these as Node.js/Rust processes
pm2 start ecosystem.config.cjs

// These agents require PM2:
- claude-meta (port 50050) - Meta-agent coordinator
- natasha (port 50052) - AI/ML agent
- cove (port 50053) - Repository operations
- marcus (port 50051) - Neural Mux architect
- elena (port 50054) - Documentation agent
- sarah (port 18180) - Linear integration
- abe (port 50058) - Document intelligence
- buildsync (port 50059) - Build synchronization
- designaudit (port 50060) - Design validation
- iosvalidator (port 50061) - iOS compliance
- boltregistrar (port 50063) - Event logging
- docgen (port 50064) - Document generation
- themevalidator (port 50066) - Theme validation
```

**Answer: YES, PM2 must be running for these agents to take actions.**

### **API-Based Agents (No PM2 Required)**

These use **external APIs** via HTTP/gRPC:

```javascript
// These work without PM2:
- grok - xAI API calls
- altair - Perplexity API
- gpt4 - OpenAI API
- gemini - Google AI API
- lachlan - ElevenLabs API
- llmtrainer - Training pipeline (batch jobs)
```

**Answer: NO, these don't need PM2. They use external services.**

---

## 🏗️ **AGENT EXECUTION MODELS**

### **Model 1: PM2 Native Service**

```
User creates Linear task → 
  PM2 service receives via webhook/API → 
  Agent executes → 
  Updates Linear
```

**Requirements:**
- PM2 running
- gRPC or HTTP server active
- Port accessible

**Example:**
```bash
# Agent must be running
pm2 list | grep natasha
# natasha │ online

# Then can receive tasks
curl http://localhost:50052/task/assign -d '{"task_id":"COG-123"}'
```

### **Model 2: Custom GPT Actions**

```
User voice command → 
  Custom GPT (Natasha/Zoe) → 
  OpenAPI endpoint → 
  Linear API → 
  Task created
```

**Requirements:**
- ngrok tunnel (or public endpoint)
- OpenAPI spec configured
- Custom GPT actions enabled

**Example:**
```bash
# Expose local services
ngrok http 50052

# Custom GPT calls
https://abc123.ngrok.io/task/assign
```

### **Model 3: Linear Webhooks**

```
Task created in Linear → 
  Webhook fires → 
  Agent service receives → 
  Agent executes → 
  Updates Linear
```

**Requirements:**
- PM2 service running
- Webhook configured in Linear
- Endpoint accessible

### **Model 4: Polling (Backup)**

```
Agent polls Linear API every N seconds → 
  Checks for assigned tasks → 
  Executes → 
  Updates status
```

**Requirements:**
- PM2 running
- LINEAR_API_KEY set
- Polling interval configured

---

## 📋 **LINEAR SETUP STEPS**

### **Step 1: Create Agent "Users" in Linear**

Linear doesn't have separate "bot" accounts, so we use:

**Option A: Create Team Members**
```bash
# Invite agents as team members
# Linear Settings → Members → Invite

Email format:
- natasha@ctas.local
- cove@ctas.local
- marcus@ctas.local
- etc.
```

**Option B: Use Labels/Tags**
```bash
# Create labels for agents
Labels:
- agent:natasha
- agent:cove
- agent:marcus
```

**Option C: Use Projects**
```bash
# Each agent has a project
Projects:
- Natasha's Tasks
- Cove's Tasks
- Marcus's Tasks
```

### **Step 2: Configure Linear Webhooks**

```bash
# Linear Settings → API → Webhooks → Create webhook

URL: https://your-domain.com/linear/webhook
# Or with ngrok: https://abc123.ngrok.io/linear/webhook

Events:
- Issue created
- Issue updated
- Issue assigned
- Comment created
```

### **Step 3: Map Agents to Linear**

```javascript
// In ecosystem.config.cjs
const AGENT_LINEAR_MAPPING = {
  'natasha': {
    linearUserId: 'user_123',
    email: 'natasha@ctas.local',
    port: 50052,
    skills: ['ai', 'ml', 'architecture']
  },
  'cove': {
    linearUserId: 'user_124',
    email: 'cove@ctas.local',
    port: 50053,
    skills: ['git', 'repository', 'ops']
  },
  // ... more agents
};
```

### **Step 4: Start PM2 Services**

```bash
cd /Users/cp5337/Developer/ctas7-command-center

# Start all PM2-managed agents
pm2 start ecosystem.config.cjs

# Verify
pm2 list

# Should see:
# natasha, cove, marcus, elena, sarah, abe, etc.
```

### **Step 5: Test Agent Assignment**

```bash
# Create test task in Linear
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { issueCreate(input: { teamId: \"979acadf-8301-459e-9e51-bf3c1f60e496\", title: \"Test task for Natasha\", description: \"@natasha please analyze this\" }) { issue { id identifier } } }"
  }'

# Agent should receive and process
pm2 logs natasha
```

---

## 🔧 **CONFIGURATION FILES**

### **agents/linear-integration.json**

```json
{
  "linearTeamId": "979acadf-8301-459e-9e51-bf3c1f60e496",
  "agents": [
    {
      "id": "natasha",
      "name": "Natasha Volkov",
      "email": "natasha@ctas.local",
      "port": 50052,
      "pm2": true,
      "skills": ["ai", "ml", "discovery", "architecture"],
      "slack": "@natasha",
      "triggerKeywords": ["@natasha", "AI", "machine learning", "discovery"]
    },
    {
      "id": "cove",
      "name": "Cove Harris",
      "email": "cove@ctas.local",
      "port": 50053,
      "pm2": true,
      "skills": ["git", "repository", "devops", "operations"],
      "slack": "@cove",
      "triggerKeywords": ["@cove", "git", "repository", "deploy"]
    },
    {
      "id": "marcus",
      "name": "Marcus Chen",
      "email": "marcus@ctas.local",
      "port": 50051,
      "pm2": true,
      "skills": ["neural-mux", "routing", "architecture"],
      "slack": "@marcus",
      "triggerKeywords": ["@marcus", "neural mux", "routing"]
    },
    {
      "id": "elena",
      "name": "Elena Rodriguez",
      "email": "elena@ctas.local",
      "port": 50054,
      "pm2": true,
      "skills": ["documentation", "qa", "testing"],
      "slack": "@elena",
      "triggerKeywords": ["@elena", "documentation", "QA", "test"]
    },
    {
      "id": "sarah",
      "name": "Sarah Kim",
      "email": "sarah@ctas.local",
      "port": 18180,
      "pm2": true,
      "skills": ["linear", "project-management", "coordination"],
      "slack": "@sarah",
      "triggerKeywords": ["@sarah", "linear", "project", "task"]
    },
    {
      "id": "abe",
      "name": "ABE",
      "email": "abe@ctas.local",
      "port": 50058,
      "pm2": true,
      "skills": ["documents", "google-workspace", "organization"],
      "slack": "@abe",
      "triggerKeywords": ["@abe", "document", "organize", "google"]
    }
  ],
  "webhookUrl": "https://your-domain.com/linear/webhook",
  "pollInterval": 30000,
  "autoAssign": true
}
```

---

## 🚀 **STARTUP SEQUENCE**

### **Complete Startup:**

```bash
# 1. Start PM2 services
cd /Users/cp5337/Developer/ctas7-command-center
pm2 start ecosystem.config.cjs

# 2. Verify all running
pm2 list

# 3. Check logs
pm2 logs --lines 20

# 4. Test Linear connection
curl http://localhost:18180/linear/health

# 5. Create test task in Linear
# Go to: https://linear.app/cognetixalpha/team/COG
# Create issue: "@natasha check system status"

# 6. Watch agent respond
pm2 logs natasha --lines 50
```

---

## 🔍 **TROUBLESHOOTING**

### **Agent Not Responding to Tasks:**

```bash
# Check if PM2 is running
pm2 list

# Check if agent is online
pm2 describe natasha

# Check agent logs
pm2 logs natasha --lines 100

# Check port is listening
lsof -i :50052

# Test direct API call
curl http://localhost:50052/health
```

### **Linear Integration Not Working:**

```bash
# Check LINEAR_API_KEY is set
echo $LINEAR_API_KEY

# Test Linear API directly
curl -H "Authorization: $LINEAR_API_KEY" \
  https://api.linear.app/graphql \
  -d '{"query":"{ viewer { id name } }"}'

# Check webhook endpoint
curl http://localhost:18180/linear/webhook
```

### **PM2 Not Starting:**

```bash
# Check PM2 status
pm2 status

# Restart PM2
pm2 restart all

# Clear PM2 logs
pm2 flush

# Reinstall PM2
npm install -g pm2
```

---

## 📊 **AGENT STATUS DASHBOARD**

```bash
#!/bin/bash
# agents/check-agent-status.sh

echo "🤖 AGENT STATUS DASHBOARD"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Check PM2
echo "PM2 Services:"
pm2 jlist | jq -r '.[] | "  \(.name): \(.pm2_env.status)"'
echo ""

# Check ports
echo "Port Status:"
for port in 50050 50051 50052 50053 50054 50058 18180; do
  if lsof -i :$port > /dev/null 2>&1; then
    echo "  ✅ Port $port: LISTENING"
  else
    echo "  ❌ Port $port: CLOSED"
  fi
done
echo ""

# Check Linear connection
echo "Linear Integration:"
if curl -s http://localhost:18180/health > /dev/null 2>&1; then
  echo "  ✅ Sarah (Linear agent) online"
else
  echo "  ❌ Sarah (Linear agent) offline"
fi
echo ""

echo "Use: pm2 logs <agent-name> to view logs"
```

---

## ✅ **QUICK ANSWERS**

### **Q: Does PM2 need to be running for agents to take actions?**

**A: It depends on the agent type:**

- **PM2 Agents (YES):** Natasha, Cove, Marcus, Elena, Sarah, ABE, BuildSync, DesignAudit, etc.
  - These are native services
  - PM2 must be running
  - Accessible via gRPC/HTTP ports

- **API Agents (NO):** Grok, GPT-4, Gemini, Altair, Lachlan
  - These use external APIs
  - Work without PM2
  - Called via HTTP/REST

- **Hybrid (BOTH):** Can work without PM2 via Custom GPT actions, but PM2 enables more features

### **Q: How do agents get assigned tasks in Linear?**

**A: Multiple methods:**

1. **Webhook** - Linear fires webhook when task created → Agent receives
2. **Polling** - Agent checks Linear API every 30s for new tasks
3. **Manual** - User assigns in Linear UI
4. **Auto-assign** - Keyword detection (@natasha) auto-assigns
5. **Voice** - Custom GPT → Linear API → Agent

### **Q: Can agents work without PM2?**

**A: Limited functionality:**

- ✅ Can create tasks via Custom GPT
- ✅ Can use external API agents (GPT-4, etc.)
- ❌ Can't run native services (Natasha, Cove, etc.)
- ❌ Can't receive webhooks
- ❌ Can't do real-time processing

**Recommendation: Use PM2 for full agent capabilities.**

---

## 🎯 **NEXT STEPS**

1. **Start PM2:**
   ```bash
   pm2 start ecosystem.config.cjs
   ```

2. **Create agents in Linear:**
   - Go to Linear Settings
   - Add team members or labels
   - Configure assignments

3. **Test agent:**
   ```bash
   # Create task: "@natasha check status"
   # Watch logs: pm2 logs natasha
   ```

4. **Setup webhooks** (optional but recommended)

5. **Configure Custom GPT actions** for voice interface

---

**PM2 = Native Agent Execution**  
**API = External Model Access**  
**Linear = Task Coordination**  

🤖 **Agents ready for duty!**

