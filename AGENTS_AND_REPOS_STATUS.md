# 🔒🤖 AGENTS & REPOSITORIES STATUS

**Date:** November 7, 2025  
**Priority:** 🚨 URGENT - Security & Agent Setup  

---

## 🔒 **REPOSITORY SECURITY (URGENT)**

### **Status:** ⚠️ REPOS CURRENTLY PUBLIC - NEED TO MAKE PRIVATE

**Files Created:**
- ✅ `security/make-repos-private.sh` - Automated script
- ✅ `security/MAKE_REPOS_PRIVATE_NOW.md` - Quick guide
- ✅ `security/REPOSITORY_SECURITY_AUDIT.md` - Complete audit

### **What You Need to Do:**

```bash
# Fix GitHub CLI auth
gh auth switch

# Then either:
# Option 1: Run automated script
./security/make-repos-private.sh

# Option 2: Run commands from quick guide
open security/MAKE_REPOS_PRIVATE_NOW.md
# Copy/paste all gh repo edit commands

# Option 3: Use web interface
# Click links in MAKE_REPOS_PRIVATE_NOW.md
```

### **Why This is Urgent:**

- ✅ Design system repo is currently public (proprietary)
- ✅ React Native framework is public (competitive advantage)
- ✅ Agent systems are public (strategic IP)
- ✅ May contain API keys in history
- ✅ Government/DoD contracts require private repos

### **Quick Verification:**

```bash
# After making private, check:
gh repo list cp5337 --json name,visibility \
  | jq '.[] | select(.visibility == "PUBLIC")'

# Should return empty (no public repos)
```

---

## 🤖 **AGENT SETUP IN LINEAR**

### **Status:** 📋 READY TO CONFIGURE - AGENTS DEFINED

**Files Created:**
- ✅ `agents/LINEAR_AGENT_SETUP.md` - Complete guide
- ✅ `agents/AGENTS_LINEAR_QUICK_SETUP.md` - Quick reference
- ✅ `agents/register-agents-in-linear.cjs` - Auto-registration script
- ✅ `agents/check-agent-status.sh` - Status dashboard

### **Answer to Your Questions:**

#### **Q1: Does PM2 need to be running for agents to take actions?**

**YES for native agents, NO for API agents**

**PM2-Required Agents:**
```
These MUST have PM2 running:
- Natasha (AI/ML) - port 50052
- Cove (Repo Ops) - port 50053
- Marcus (Neural Mux) - port 50051
- Elena (Docs/QA) - port 50054
- Sarah (Linear) - port 18180
- ABE (Documents) - port 50058
- Lachlan (Voice) - port 19015
- Design agents (50059-50066)

Start with: pm2 start ecosystem.config.cjs
```

**API-Based Agents (No PM2):**
```
These use external APIs:
- Grok (xAI API)
- GPT-4 (OpenAI)
- Gemini (Google)
- Altair (Perplexity)

Just need API keys, no PM2
```

#### **Q2: How to sign up agents in Linear?**

**Use LABELS (Linear doesn't have bot users)**

**In Linear Web UI:**
1. Go to: https://linear.app/cognetixalpha/settings/labels
2. Create labels for each agent:

| Label | Color | Agent |
|-------|-------|-------|
| `agent:natasha` | #EF4444 (Red) | AI/ML Lead |
| `agent:cove` | #10B981 (Green) | Repository Ops |
| `agent:marcus` | #3B82F6 (Blue) | Neural Mux |
| `agent:elena` | #F59E0B (Orange) | Documentation |
| `agent:sarah` | #8B5CF6 (Purple) | Linear Integration |
| `agent:abe` | #06B6D4 (Cyan) | Documents |
| `agent:lachlan` | #EC4899 (Pink) | Voice |
| `agent:buildsync` | #14B8A6 (Teal) | Build Pipeline |
| `agent:designaudit` | #8B5CF6 (Purple) | Design Validation |
| `agent:iosvalidator` | #3B82F6 (Blue) | iOS Compliance |
| `agent:docgen` | #F59E0B (Orange) | Document Gen |
| `agent:themevalidator` | #0A0E17 (Dark) | Theme Validation |

**Then assign agents by:**
- Adding label to issues in Linear
- @mentioning in descriptions: "@natasha please analyze this"
- Voice commands: "Natasha, create a task to..."

### **Current Agent Status:**

```bash
📊 PM2 SERVICES:
  ✅ voice-gateway (Lachlan) - ONLINE
  ✅ slack-interface - ONLINE
  ✅ tool-server - ONLINE
  ✅ osint-engine - ONLINE
  ✅ corporate-analyzer - ONLINE
  ❌ abe-local - ERRORED (needs fix)
  ❌ neural-mux (Marcus) - ERRORED (needs fix)
  ❌ zoe-agent - ERRORED (needs fix)

🔌 PORT STATUS:
  ✅ Port 19015 (Lachlan/Voice) - LISTENING
  ○  All other agent ports - CLOSED (need to start)

🔗 LINEAR INTEGRATION:
  ❌ Sarah (port 18180) - OFFLINE (needs PM2)

🎤 VOICE GATEWAY:
  ✅ Lachlan (port 19015) - ONLINE
```

### **What You Need to Do:**

**Step 1: Create Linear Labels**
```bash
# Go to Linear and manually create all agent labels
open https://linear.app/cognetixalpha/settings/labels
```

**Step 2: Fix PM2 Services**
```bash
# Check what's wrong with errored services
pm2 logs abe-local --err
pm2 logs neural-mux --err
pm2 logs zoe-agent --err

# Restart all
pm2 restart all

# Or delete errored and re-add
pm2 delete abe-local neural-mux zoe-agent
pm2 start ecosystem.config.cjs --only abe-local,neural-mux,zoe-agent
```

**Step 3: Check Status**
```bash
./agents/check-agent-status.sh
```

**Step 4: Test Agent Assignment**
```bash
# In Linear:
# 1. Create issue: "Test task for Natasha"
# 2. Add label: agent:natasha
# 3. Watch logs: pm2 logs natasha
```

---

## 📋 **COMPLETE AGENT ROSTER**

### **17 Total Agents**

**Core Agents (7):**
- **Claude Meta** - Orchestrator (port 50050)
- **Natasha** - AI/ML Lead (port 50052)
- **Cove** - Repository Ops (port 50053)
- **Marcus** - Neural Mux (port 50051)
- **Elena** - Documentation/QA (port 50054)
- **Sarah** - Linear Integration (port 18180)
- **ABE** - Document Intelligence (port 50058)

**Voice & Interface (1):**
- **Lachlan** - Voice Gateway (port 19015) ✅ ONLINE

**Design System Agents (5):**
- **BuildSync** - Build Pipeline (port 50059)
- **DesignAudit** - Design Validation (port 50060)
- **iOSValidator** - iOS Compliance (port 50061)
- **DocumentGenerator** - Quad Charts/Docs (port 50064)
- **ThemeValidator** - Professional Standards (port 50066)

**API Agents (4):**
- **Grok** - xAI Model
- **GPT-4** - OpenAI Model
- **Gemini** - Google Model
- **Altair** - Perplexity Search

---

## 🚀 **QUICK START GUIDE**

### **For Repository Security:**

```bash
# 1. Fix auth
gh auth switch

# 2. Make repos private
./security/make-repos-private.sh

# 3. Verify
gh repo list cp5337 --json name,visibility
```

### **For Agent Setup:**

```bash
# 1. Check current status
./agents/check-agent-status.sh

# 2. Create Linear labels (manual)
open https://linear.app/cognetixalpha/settings/labels

# 3. Fix PM2 services
pm2 restart all
pm2 logs --err

# 4. Test assignment
# Create Linear task with agent:natasha label
pm2 logs natasha
```

---

## 📊 **WORKFLOW DIAGRAMS**

### **Voice → Agent → Linear:**

```
User voice command
  ↓
Lachlan (Voice Gateway) - port 19015 ✅ ONLINE
  ↓
Custom GPT processes
  ↓
Creates Linear issue with agent label
  ↓
Agent service (PM2) receives webhook
  ↓
Agent executes task
  ↓
Updates Linear with results
```

### **Linear → Agent → Execution:**

```
User creates issue in Linear
  ↓
Adds label: agent:cove
  ↓
Sarah (Linear Integration) polls API
  ↓
Routes to Cove service
  ↓
Cove executes git operations
  ↓
Comments on issue with results
```

---

## ⚡ **IMMEDIATE PRIORITIES**

### **Priority 1: SECURITY (URGENT)**
```bash
✅ Make all repos private
⏱️ Time: 5 minutes
📍 See: security/MAKE_REPOS_PRIVATE_NOW.md
```

### **Priority 2: LINEAR AGENT LABELS**
```bash
✅ Create agent labels in Linear
⏱️ Time: 10 minutes
📍 See: agents/AGENTS_LINEAR_QUICK_SETUP.md
```

### **Priority 3: FIX PM2 SERVICES**
```bash
✅ Fix errored services (abe-local, neural-mux, zoe-agent)
✅ Start missing agents (natasha, cove, etc.)
⏱️ Time: 15 minutes
📍 See: agents/LINEAR_AGENT_SETUP.md
```

---

## 📞 **QUICK COMMANDS**

```bash
# Security
gh auth switch
./security/make-repos-private.sh

# Agent Status
./agents/check-agent-status.sh
pm2 list
pm2 logs --err

# Start Agents
pm2 start ecosystem.config.cjs
pm2 restart all

# Test Assignment
# Create Linear task with agent:natasha label
pm2 logs natasha --lines 50
```

---

## ✅ **SUCCESS CRITERIA**

**Security:**
- ✅ All repos are private
- ✅ No API keys in public history
- ✅ GitHub CLI authenticated

**Agents:**
- ✅ All 17 agents defined in Linear (as labels)
- ✅ PM2 services running for native agents
- ✅ Agent status dashboard working
- ✅ Test task successfully assigned to agent
- ✅ Agent executes and updates Linear

---

## 🎯 **KEY TAKEAWAYS**

### **Repository Security:**
- 🚨 URGENT: Make all repos private NOW
- 📁 15+ repos need protection
- 🔧 Scripts ready to execute
- ⏱️ 5 minutes to complete

### **Agent Setup:**
- 🤖 17 agents defined and ready
- ✅ PM2 required for 13 native agents
- ❌ 4 API agents work without PM2
- 🏷️ Use Linear LABELS for assignment
- 🎤 Voice gateway already ONLINE
- ⚠️ Need to fix 3 errored PM2 services
- 📋 Need to create Linear labels manually

---

**NEXT STEPS:**
1. **Make repos private** (5 min) 🔒
2. **Create Linear agent labels** (10 min) 🏷️
3. **Fix PM2 services** (15 min) 🛠️
4. **Test agent assignment** (5 min) ✅

**Total time to full operational: ~35 minutes** ⏱️

🔒 **SECURITY FIRST, THEN AGENTS!** 🤖

