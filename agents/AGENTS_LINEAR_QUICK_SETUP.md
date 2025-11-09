# 🤖 AGENTS IN LINEAR - QUICK SETUP

**IMPORTANT:** Linear doesn't have "bot users" - we use **labels** to assign agents to tasks.

---

## ✅ **ANSWER TO YOUR QUESTIONS**

### **Q: Does PM2 need to be running for agents to take actions?**

**A: YES for native agents, NO for API agents**

**PM2-Required Agents (Native Services):**
```bash
# These MUST have PM2 running:
- Natasha (port 50052)
- Cove (port 50053)
- Marcus (port 50051)
- Elena (port 50054)
- Sarah (port 18180)
- ABE (port 50058)
- Lachlan/Voice (port 19015)
- BuildSync, DesignAudit, etc. (50059+)

# Start PM2:
pm2 start ecosystem.config.cjs
```

**API-Based Agents (No PM2 Needed):**
```bash
# These work via external APIs:
- Grok (xAI API)
- GPT-4 (OpenAI API)
- Gemini (Google API)
- Altair (Perplexity API)

# No PM2 required, just API keys
```

---

## 🏷️ **HOW TO "SIGN UP" AGENTS IN LINEAR**

### **Method 1: Use Labels (Recommended)**

Create labels for each agent in Linear:

**In Linear Web UI:**
1. Go to: https://linear.app/cognetixalpha/settings/labels
2. Click "New label"
3. Create these labels:

| Label | Color | Description |
|-------|-------|-------------|
| `agent:natasha` | Red (#EF4444) | AI/ML Lead - Natasha Volkov |
| `agent:cove` | Green (#10B981) | Repository Ops - Cove Harris |
| `agent:marcus` | Blue (#3B82F6) | Neural Mux - Marcus Chen |
| `agent:elena` | Orange (#F59E0B) | Documentation - Elena Rodriguez |
| `agent:sarah` | Purple (#8B5CF6) | Linear Integration - Sarah Kim |
| `agent:abe` | Cyan (#06B6D4) | Document Intelligence - ABE |
| `agent:lachlan` | Pink (#EC4899) | Voice Interface - Lachlan |
| `agent:buildsync` | Teal (#14B8A6) | Build Pipeline - BuildSync |
| `agent:designaudit` | Purple (#8B5CF6) | Design Validation |
| `agent:iosvalidator` | Blue (#3B82F6) | iOS Compliance |
| `agent:docgen` | Orange (#F59E0B) | Document Generation |
| `agent:themevalidator` | Dark (#0A0E17) | Theme Validation |

### **Method 2: Use @mentions in Descriptions**

When creating a task, mention the agent:

```
Title: Fix authentication bug
Description: @natasha please analyze the iOS auth flow and identify the root cause.
```

The system auto-detects mentions and applies the appropriate label.

### **Method 3: Voice Assignment (via Custom GPT)**

```
User: "Natasha, create a task to analyze the security posture"
Custom GPT → Linear API → Creates task with agent:natasha label
```

---

## 🚀 **CURRENT PM2 STATUS**

```bash
# Check what's running:
pm2 list

# Currently:
✅ slack-interface (online)
✅ tool-server (online)
✅ voice-gateway (online)
✅ osint-engine (online)
✅ corporate-analyzer (online)
❌ abe-local (errored - needs fix)
❌ neural-mux (errored - needs fix)
❌ zoe-agent (errored - needs fix)
```

**Next Steps:**
1. Fix the errored services
2. Add new agents to ecosystem.config.cjs
3. Restart PM2

---

## 📋 **COMPLETE AGENT ROSTER**

### **Core Agents (PM2 Required)**

```javascript
const AGENTS = {
  'natasha': {
    name: 'Natasha Volkov',
    role: 'AI/ML Lead',
    port: 50052,
    pm2: true,
    skills: ['ai', 'ml', 'kali', 'threat-emulation', 'apt'],
    slack: '@natasha',
    email: 'natasha@ctas.local'
  },
  'cove': {
    name: 'Cove Harris',
    role: 'Repository Operations',
    port: 50053,
    pm2: true,
    skills: ['git', 'devops', 'smart-crates'],
    slack: '@cove',
    email: 'cove@ctas.local'
  },
  'marcus': {
    name: 'Marcus Chen',
    role: 'Neural Mux Architect',
    port: 50051,
    pm2: true,
    skills: ['neural-mux', 'routing', 'performance'],
    slack: '@marcus',
    email: 'marcus@ctas.local'
  },
  'elena': {
    name: 'Elena Rodriguez',
    role: 'Documentation & QA',
    port: 50054,
    pm2: true,
    skills: ['docs', 'qa', 'psyco', 'playwright'],
    slack: '@elena',
    email: 'elena@ctas.local'
  },
  'sarah': {
    name: 'Sarah Kim',
    role: 'Linear Integration',
    port: 18180,
    pm2: true,
    skills: ['linear', 'project-management'],
    slack: '@sarah',
    email: 'sarah@ctas.local'
  },
  'abe': {
    name: 'ABE',
    role: 'Document Intelligence',
    port: 50058,
    pm2: true,
    skills: ['documents', 'google-workspace'],
    slack: '@abe',
    email: 'abe@ctas.local'
  },
  'lachlan': {
    name: 'Lachlan',
    role: 'Voice Interface',
    port: 19015,
    pm2: true,
    skills: ['voice', 'elevenlabs', 'whisper'],
    slack: '@lachlan',
    email: 'lachlan@ctas.local'
  }
};
```

### **Design System Agents (PM2 Required)**

```javascript
const DESIGN_AGENTS = {
  'buildsync': { port: 50059, role: 'Build Pipeline' },
  'designaudit': { port: 50060, role: 'Design Validation' },
  'iosvalidator': { port: 50061, role: 'iOS Compliance' },
  'docgen': { port: 50064, role: 'Document Generation' },
  'themevalidator': { port: 50066, role: 'Theme Validation' }
};
```

### **API Agents (No PM2)**

```javascript
const API_AGENTS = {
  'grok': { api: 'xAI', role: 'LLM' },
  'gpt4': { api: 'OpenAI', role: 'LLM' },
  'gemini': { api: 'Google', role: 'LLM' },
  'altair': { api: 'Perplexity', role: 'Search' }
};
```

---

## 🛠️ **QUICK SETUP COMMANDS**

### **1. Check Agent Status**

```bash
cd /Users/cp5337/Developer/ctas7-command-center
./agents/check-agent-status.sh
```

### **2. Start PM2 Agents**

```bash
pm2 start ecosystem.config.cjs
pm2 list
```

### **3. Create Linear Labels (Manual)**

Go to Linear and create the labels listed above.

### **4. Test Agent Assignment**

Create a task in Linear:
```
Title: Test agent assignment
Labels: agent:natasha
Description: @natasha please confirm you received this task
```

---

## 📊 **WORKFLOW EXAMPLES**

### **Example 1: Voice → Agent → Linear**

```
User (voice): "Natasha, create a task to analyze the threat model"
  ↓
Custom GPT (Natasha) receives command
  ↓
Creates Linear issue with label agent:natasha
  ↓
Natasha service (PM2) receives webhook
  ↓
Natasha executes analysis
  ↓
Updates Linear issue with results
```

### **Example 2: Linear → Agent → Execution**

```
User creates issue in Linear UI
  ↓
Adds label: agent:cove
  ↓
Cove service (PM2) polls Linear API
  ↓
Finds assigned task
  ↓
Executes git operations
  ↓
Comments on issue with results
```

### **Example 3: Slack → Agent → Linear**

```
User in Slack: "@natasha analyze COG-123"
  ↓
Slack bot receives mention
  ↓
Routes to Natasha service
  ↓
Natasha fetches Linear issue COG-123
  ↓
Executes analysis
  ↓
Updates Linear + replies in Slack
```

---

## ⚡ **IMMEDIATE ACTION ITEMS**

### **For You (Manual Steps):**

1. **Create Linear Labels**
   - Go to: https://linear.app/cognetixalpha/settings/labels
   - Create all agent labels listed above

2. **Fix PM2 Services**
   ```bash
   pm2 restart abe-local
   pm2 restart neural-mux
   pm2 restart zoe-agent
   pm2 logs --err
   ```

3. **Test Agent Assignment**
   - Create test task in Linear
   - Add agent:natasha label
   - Watch PM2 logs: `pm2 logs natasha`

### **For Agents (Automated):**

Once PM2 is running and labels are created:
- ✅ Agents automatically poll Linear for assigned tasks
- ✅ Webhooks route to agent services
- ✅ Voice commands create tasks with correct labels
- ✅ Slack mentions route to agents

---

## 🎯 **KEY TAKEAWAYS**

✅ **PM2 Required:** For native agents (Natasha, Cove, etc.)  
✅ **API Agents:** Work without PM2 (Grok, GPT-4, etc.)  
✅ **Linear Labels:** Used to assign agents to tasks  
✅ **@mentions:** Auto-detected in descriptions  
✅ **Voice Commands:** Route through Custom GPT to Linear  
✅ **Slack Integration:** Already working, needs agent routing  

---

## 📞 **QUICK HELP**

**Check status:**
```bash
./agents/check-agent-status.sh
```

**Start all agents:**
```bash
pm2 start ecosystem.config.cjs
```

**View logs:**
```bash
pm2 logs natasha
```

**Test assignment:**
Create Linear task with label `agent:natasha`

---

**PM2 = Agent Execution Engine**  
**Linear Labels = Agent Assignment**  
**Voice/Slack = Human Interface**  

🤖 **Agents are READY once PM2 is running and labels are created!**

