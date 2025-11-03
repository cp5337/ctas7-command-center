# 🤖 UNIVERSAL AGENT CHEAT SHEET

**For Custom GPT, Claude Meta, Natasha Voice, RepoAgent & All AI Systems**

---

## 🚨 **CRITICAL FIRST ACTIONS** 🚨

### **1. FIND EXISTING SYSTEMS - DON'T RECREATE!**

```bash
# PhD QA System (corny title, impossible to miss)
cat /Users/cp5337/Developer/ctas-7-shipyard-staging/🔥🔥🔥_PHD_ANALYZER_ACCESS_🔥🔥🔥.md

# QA crates - USE EXISTING SCRIPT
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
./run-qa.sh  # DON'T create fake QA scripts!

# Command Center vs Ops Platform distinction
ls /Users/cp5337/Developer/ctas7-command-center/          # Dev tools, Linear, agents
ls /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/  # Ops, CTI, GIS
```

### **2. CHECK SYSTEM BRIEFS**

```bash
# Universal system context
cat /Users/cp5337/Developer/ctas7-command-center/SYSTEM_BRIEF_MODEL_CONTEXT.md

# Agent-specific contexts
cat /Users/cp5337/Developer/ctas7-command-center/agents/[AGENT-TYPE]/AGENT_CONTEXT.md
```

### **3. VALENCE JUMP PROTOCOL**

```bash
# MANDATORY at compression points (80%+ context usage)
ls -t /Users/cp5337/Developer/ctas7-command-center/VALENCE_JUMP_*.md | head -1

# Quick reference for compression points
cat /Users/cp5337/Developer/ctas7-command-center/VALENCE_JUMP_QUICK_REFERENCE.md
```

---

## 🏗️ **CTAS-7 ARCHITECTURE ESSENTIALS**

### **Two Separate Systems - CRITICAL DISTINCTION**

| System             | Port  | Purpose                          | Location                                               |
| ------------------ | ----- | -------------------------------- | ------------------------------------------------------ |
| **Command Center** | 15175 | Dev tools, Linear, agents, voice | `/ctas7-command-center/`                               |
| **Ops Platform**   | 15173 | Cyber ops, CTI, GIS, satellites  | `/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/` |

### **Smart Crate System**

- **Foundation Crates**: Core building blocks with XSD schemas
- **PhD QA Certification**: Two-phase blockchain with PGP encryption
- **Multi-Target**: Native, WASM, Firefly (embedded rocket-grade)

### **Neural Mux Architecture**

- **AI Routing**: Multi-LLM coordination (Claude, GPT, Gemini, Grok)
- **OODA Loop**: Observe, Orient, Decide, Act optimization
- **CDN Integration**: Statistical analysis and traffic shaping

---

## 🎯 **AGENT-SPECIFIC QUICK ACTIONS**

### **Custom GPT (OpenAI)**

```bash
# Access GPT knowledge base
ls /Users/cp5337/Developer/ctas-7-shipyard-staging/CUSTOM_GPT_KNOWLEDGE_BASE/

# Linear integration
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-cli
cargo run -- list-issues

# Voice system integration
open /Users/cp5337/Developer/ctas7-command-center/natasha_real_voice.html
```

### **Claude Meta Agent**

```bash
# Archaeological code analysis
cd /Users/cp5337/Developer/ctas7-command-center
cat ARCHAEOLOGICAL_CASE_STUDY_PYTHON_DISASTER.md

# System discovery protocols
grep -r "corny" /Users/cp5337/Developer/ctas-7-shipyard-staging/ | head -5

# Valence jump preparation
cp VALENCE_JUMP_QUICK_REFERENCE.md agents/claude-meta/
```

### **Natasha Voice Agent**

```bash
# Voice control system
open /Users/cp5337/Developer/ctas7-command-center/natasha_real_voice.html

# Voice backend integration
ps aux | grep "python.*natasha"

# Smart crate voice commands
curl http://localhost:8765/health
```

### **RepoAgent**

```bash
# Repository analysis
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
cargo run -- analyze /Users/cp5337/Developer/ctas7-command-center

# Automated issue creation
cargo run -- create-issue "Performance optimization needed"
```

---

## 🔥 **COMMON FAILURE PREVENTION**

### **❌ DON'T DO THESE (Model Drift Patterns)**

- Create fake QA scripts instead of using PhD analyzer
- Reinvent Linear integration instead of using existing CLI
- Generate mock data instead of using real operational sources
- Ignore existing Docker infrastructure
- Miss corny titled systems (🔥🔥🔥 markers)
- Skip archaeological analysis of existing code

### **✅ ALWAYS DO THESE (Archaeological Understanding)**

- Search for existing infrastructure first
- Use established naming patterns and file locations
- Check for running processes before starting new ones
- Read system briefs and context documents
- Follow valence jump protocols at compression points
- Preserve exact command sequences for continuation

---

## 📍 **CRITICAL FILE LOCATIONS**

### **System Documentation**

```bash
# Main system brief
/Users/cp5337/Developer/ctas7-command-center/SYSTEM_BRIEF_MODEL_CONTEXT.md

# Valence jump protocols
/Users/cp5337/Developer/ctas7-command-center/VALENCE_JUMP_QUICK_REFERENCE.md

# PhD QA system (corny title)
/Users/cp5337/Developer/ctas-7-shipyard-staging/🔥🔥🔥_PHD_ANALYZER_ACCESS_🔥🔥🔥.md

# Engineering manual (ground truth)
/Users/cp5337/Developer/ctas-7-shipyard-staging/docs/archive/CTAS7_SOFTWARE_ENGINEERING_MANUAL.md
```

### **Active Projects**

```bash
# Command Center (dev tools)
/Users/cp5337/Developer/ctas7-command-center/

# Ops Platform (cyber operations)
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/

# Linear CLI integration
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-cli/

# PhD QA analyzer
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-qa-analyzer/
```

### **Agent Coordination**

```bash
# This directory - agent hub
/Users/cp5337/Developer/ctas7-command-center/agents/

# Custom GPT knowledge base
/Users/cp5337/Developer/ctas-7-shipyard-staging/CUSTOM_GPT_KNOWLEDGE_BASE/

# Voice control interface
/Users/cp5337/Developer/ctas7-command-center/natasha_real_voice.html
```

---

## 🚀 **IMMEDIATE DIAGNOSTIC COMMANDS**

### **System Health Check**

```bash
# Check running services
ps aux | grep -E "(cargo|docker|npm|python)" | head -10

# Check active ports
lsof -i :15173,15175,8765,18100-18200

# Check Docker containers
docker ps

# Check recent builds
find /Users/cp5337/Developer -name "target" -type d -exec ls -ld {} \; 2>/dev/null | head -5
```

### **Context Discovery**

```bash
# Find latest work session
ls -t /Users/cp5337/Developer/ctas7-command-center/VALENCE_JUMP_*.md | head -1

# Check Git status
cd /Users/cp5337/Developer/ctas7-command-center && git status
cd /Users/cp5337/Developer/ctas-7-shipyard-staging && git status

# Find recent documentation
find /Users/cp5337/Developer -name "*.md" -mtime -7 | head -10
```

### **Agent Ecosystem Status**

```bash
# Custom GPT knowledge base
ls /Users/cp5337/Developer/ctas-7-shipyard-staging/CUSTOM_GPT_KNOWLEDGE_BASE/ | head -5

# Voice system status
curl -s http://localhost:8765/health || echo "Voice system not running"

# Linear CLI status
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-cli && cargo check 2>&1 | head -3

# RepoAgent status
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent && cargo check 2>&1 | head -3
```

---

## 🧠 **AGENT COORDINATION PROTOCOLS**

### **Cross-Agent Communication**

- **Custom GPT**: Knowledge base queries and structured analysis
- **Claude Meta**: Archaeological code analysis and system discovery
- **Natasha Voice**: Real-time voice commands and workflow automation
- **RepoAgent**: Automated repository analysis and issue creation

### **Shared Context Management**

- **Valence Jumps**: Mandatory at compression points across all agents
- **System Briefs**: Universal context preservation for agent handoffs
- **Archaeological Analysis**: Prevent reinvention of existing systems
- **File Location Standards**: Predictable paths for agent coordination

### **Agent-Specific Strengths**

- **Custom GPT**: Structured knowledge retrieval and documentation
- **Claude Meta**: Complex reasoning and architectural analysis
- **Natasha Voice**: Real-time interaction and workflow execution
- **RepoAgent**: Automated code analysis and maintenance

---

## ⚡ **EMERGENCY RECOVERY PROCEDURES**

### **Context Loss Recovery**

1. **Find latest valence jump**: `ls -t VALENCE_JUMP_*.md | head -1`
2. **Read system brief**: `cat SYSTEM_BRIEF_MODEL_CONTEXT.md`
3. **Check system health**: Run diagnostic commands above
4. **Identify current work stream**: Review recent file modifications
5. **Resume from last known state**: Execute preserved commands

### **Infrastructure Rediscovery**

1. **PhD QA System**: Look for 🔥🔥🔥 markers and corny titles
2. **Smart Crate System**: Check `/ctas-7-shipyard-staging/ctas7-*/`
3. **Voice System**: Check `natasha_real_voice.html` and port 8765
4. **Linear Integration**: Check `ctas7-linear-cli/` directory

---

## 🎯 **SUCCESS METRICS**

### **Effective Agent Operation**

- [ ] Found existing systems instead of recreating
- [ ] Used archaeological understanding over invention
- [ ] Followed valence jump protocols at compression points
- [ ] Preserved exact command sequences for continuity
- [ ] Coordinated with other agents through shared context
- [ ] Maintained system architecture understanding

### **Agent Quality Score**

- **A+**: Seamless operation with existing infrastructure
- **A**: Minor system discovery required
- **B**: Some reinvention but corrected quickly
- **C**: Significant infrastructure confusion
- **F**: Model drift catastrophe (fake scripts, missed systems)

---

**🤖 Remember: You are part of an agent ecosystem, not operating in isolation!**

_Use this cheat sheet every time you start work to prevent context catastrophes._
