# 🚀 VALENCE JUMP QUICK REFERENCE

**MANDATORY at compression points to prevent context loss and system continuity failures**

---

## ⚡ **IMMEDIATE COMPRESSION TRIGGERS**

### **🔴 MANDATORY JUMP POINTS**

- **90% token usage** → IMMEDIATE valence jump required
- **80% token usage** → Begin jump preparation
- **Major QA execution** → Before/after `./run-qa.sh`
- **Smart crate deployment** → Before/after crate changes
- **Architecture discovery** → When finding PhD analyzer or infrastructure
- **Background processes** → Before starting long-running builds/deployments

### **🟡 PREPARATION POINTS**

- **60% token usage** → Start documenting current state
- **Complex task completion** → After major milestones
- **Context switching** → Before changing work streams

---

## 📋 **VALENCE JUMP CHECKLIST**

### **☑️ Required Documentation**

- [ ] **Session Summary** - What was accomplished (✅ checkmarks)
- [ ] **Current Architecture State** - System status and discoveries
- [ ] **Work Stream Status** - Detailed progress on primary objectives
- [ ] **Next Steps** - Immediate (5min) / Short-term (today) / Medium-term (week)
- [ ] **Critical File Paths** - Key documents and code locations
- [ ] **Technical Context** - System concepts for next agent
- [ ] **Immediate Commands** - Ready-to-run bash block
- [ ] **Background Processes** - Running builds, deployments, services
- [ ] **Open Questions** - What needs verification/completion

### **☑️ Command Preservation**

- [ ] **Exact commands** to resume work
- [ ] **File paths** to all modified/created files
- [ ] **Process IDs** of background tasks
- [ ] **Port numbers** of running services
- [ ] **Environment state** (directories, variables)

---

## 🚀 **QUICK JUMP TEMPLATE**

````bash
# Create valence jump document
cat > VALENCE_JUMP_$(date +%Y%m%d_%H%M%S).md << 'EOF'
# 🚀 VALENCE JUMP HANDOFF - [SYSTEM NAME]
**Date:** $(date -Iseconds)
**Context Usage:** [X]%
**Focus:** [Primary work stream]
**Trigger:** [Compression reason]

## 📊 SESSION SUMMARY
### What Was Accomplished
- ✅ [Major accomplishment 1]
- ✅ [Major accomplishment 2]

## 🔧 IMMEDIATE COMMANDS FOR NEXT SESSION
```bash
# Check background processes
ps aux | grep -E "(cargo|docker|npm)"

# Resume primary work
cd /Users/cp5337/Developer/[working-directory]
[exact commands to continue]
````

## 📁 CRITICAL FILES

- [File path 1] - [Purpose]
- [File path 2] - [Purpose]

## 🎯 NEXT PRIORITIES

1. [Immediate action 1]
2. [Immediate action 2]

## 🔚 HANDOFF COMPLETE

Next agent: [specific instructions]
EOF

````

---

## 🧠 **CONTEXT PRESERVATION PATTERNS**

### **PhD QA System Jumps**
```bash
# BEFORE QA execution
echo "🚀 PRE-QA JUMP: About to analyze [N] crates with PhD system"
echo "Expected outputs: qa-results/ directory with [specific files]"

# AFTER QA results
echo "🚀 POST-QA JUMP: Analysis complete, found [X violations, Y warnings]"
echo "Next: Address critical findings in [specific crates]"
````

### **Smart Crate Deployment Jumps**

```bash
# BEFORE deployment
echo "🚀 PRE-DEPLOY JUMP: Ready to deploy [crate] to [environment]"
echo "Infrastructure: [Docker containers, ports, dependencies]"

# AFTER deployment
echo "🚀 POST-DEPLOY JUMP: [Crate] deployed successfully"
echo "Endpoints: [health checks, APIs, monitoring]"
```

### **Architecture Discovery Jumps**

```bash
# WHEN finding major systems
echo "🚀 DISCOVERY JUMP: Found [system name] with [key capabilities]"
echo "Integration points: [how it connects to current work]"
echo "Impact: [what this changes about the approach]"
```

---

## 🔄 **SESSION CONTINUITY PROTOCOL**

### **New Session Startup (3 minutes)**

1. **Find latest jump**: `ls -t VALENCE_JUMP_*.md | head -1`
2. **Read handoff document**: Full context
3. **Check processes**: Verify background tasks status
4. **Execute immediate**: Run provided commands
5. **Validate state**: Confirm assumptions
6. **Continue work**: Seamless resumption

### **Mandatory Commands in Every Jump**

```bash
# Always include these in handoff documents:
pwd                                    # Current directory
ps aux | grep -E "(cargo|docker|npm)" # Background processes
docker ps                             # Running containers
lsof -i :18000-18200                  # Active ports
git status                            # Repository state
ls -la *.md | head -5                 # Recent documentation
```

---

## ⚠️ **ANTI-PATTERNS TO AVOID**

### **🚫 NEVER DO**

- Start QA analysis without jump preparation
- Deploy crates without documenting state
- Discover infrastructure without preservation
- Run background builds without process tracking
- Switch work streams without context handoff

### **✅ ALWAYS DO**

- Document **exact current directory**
- Record **all background process IDs**
- List **specific files created/modified**
- Provide **ready-to-run commands**
- Include **verification steps**

---

## 📍 **STORAGE LOCATIONS**

### **Predictable Paths**

```bash
# Main staging area
/Users/cp5337/Developer/ctas-7-shipyard-staging/VALENCE_JUMP_[DATE].md

# Command center
/Users/cp5337/Developer/ctas7-command-center/VALENCE_JUMP_[DATE].md

# Current session (always)
./VALENCE_JUMP_CURRENT.md
```

### **Linking Protocol**

```bash
# Add to README.md
echo "- [Session $(date +%Y-%m-%d)](./VALENCE_JUMP_$(date +%Y%m%d).md)" >> README.md

# Create symlink for latest
ln -sf VALENCE_JUMP_$(date +%Y%m%d_%H%M%S).md VALENCE_JUMP_LATEST.md
```

---

## 🎯 **SUCCESS CRITERIA**

### **Effective Valence Jump**

- [ ] Next agent can resume work in **< 2 minutes**
- [ ] **Zero context loss** on system architecture
- [ ] **All background processes** tracked and recoverable
- [ ] **Exact commands** provided for continuation
- [ ] **Critical discoveries** fully preserved
- [ ] **File modifications** completely documented

### **Valence Jump Quality Score**

- **A+**: Next agent executes immediate commands successfully
- **A**: Next agent understands context without questions
- **B**: Minor clarification needed on 1-2 points
- **C**: Significant context reconstruction required
- **F**: Context loss, must restart discovery process

---

**🚀 Remember: Valence jumps are COMPRESSION INSURANCE against context catastrophes!**

_Use this reference every time you hit a compression point._
