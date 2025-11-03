# 🎯 CUSTOM GPT AGENT CONTEXT

**OpenAI GPT Integration with CTAS-7 Command Center**

---

## 🧠 **GPT-SPECIFIC CAPABILITIES**

### **Knowledge Base Access**

```bash
# Custom GPT knowledge base (structured documents)
ls /Users/cp5337/Developer/ctas-7-shipyard-staging/CUSTOM_GPT_KNOWLEDGE_BASE/

# Key knowledge documents
cat /Users/cp5337/Developer/ctas-7-shipyard-staging/🔥🔥🔥_PHD_ANALYZER_ACCESS_🔥🔥🔥.md
cat /Users/cp5337/Developer/ctas-7-shipyard-staging/CTAS7_SOFTWARE_ENGINEERING_MANUAL.md
```

### **Structured Analysis Strengths**

- **Documentation Generation**: Engineering specs, not narratives
- **System Architecture**: Complex system mapping and relationships
- **Knowledge Retrieval**: Structured information extraction
- **Code Analysis**: Pattern recognition and optimization suggestions

### **GPT Integration Points**

- **Linear API**: Direct integration with project management
- **Voice Commands**: Text processing for Natasha voice system
- **Smart Crates**: Automated documentation generation
- **QA Analysis**: Structured reporting of PhD analyzer results

---

## 🚀 **IMMEDIATE GPT ACTIONS**

### **System Discovery Protocol**

1. **Check Universal Cheat Sheet**: `cat ../UNIVERSAL_AGENT_CHEAT_SHEET.md`
2. **Find Latest Session**: `ls -t ../../VALENCE_JUMP_*.md | head -1`
3. **System Health**: Run diagnostic commands from universal sheet
4. **Knowledge Base Sync**: Review latest documents in knowledge base

### **GPT-Optimized Commands**

```bash
# Generate structured documentation
cd /Users/cp5337/Developer/ctas7-command-center
find . -name "*.md" -mtime -1 | xargs grep -l "TODO\|FIXME\|XXX"

# Analyze Smart Crate metadata
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
find . -name "Cargo.toml" -exec grep -l "smart_crate" {} \;

# Review QA results for structured analysis
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
if [ -d "qa-results" ]; then ls -la qa-results/; fi
```

---

## 🎯 **GPT COORDINATION WITH OTHER AGENTS**

### **With Claude Meta Agent**

- **GPT**: Structured documentation and knowledge extraction
- **Claude**: Deep architectural analysis and reasoning
- **Handoff**: Via valence jumps and shared context files

### **With Natasha Voice**

- **GPT**: Process voice transcriptions into structured commands
- **Natasha**: Execute real-time voice workflows
- **Integration**: Text-to-command parsing and response generation

### **With RepoAgent**

- **GPT**: Generate issue descriptions and documentation
- **RepoAgent**: Automated code analysis and repository management
- **Workflow**: Structured analysis → automated actions

---

## 📋 **GPT WORKING SESSIONS**

### **Documentation Generation Session**

```bash
# 1. Analyze current system state
cd /Users/cp5337/Developer/ctas7-command-center
ls -la *.md | head -10

# 2. Generate missing documentation
# [GPT analyzes gaps and creates structured docs]

# 3. Update knowledge base
cp generated_docs/*.md /Users/cp5337/Developer/ctas-7-shipyard-staging/CUSTOM_GPT_KNOWLEDGE_BASE/
```

### **System Analysis Session**

```bash
# 1. Run QA analysis
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
./run-qa.sh

# 2. Structure results for GPT analysis
ls qa-results/*.json qa-results/*.txt

# 3. Generate recommendations
# [GPT processes QA data into actionable insights]
```

### **Integration Review Session**

```bash
# 1. Check all integration points
curl -s http://localhost:15175/health || echo "Command Center down"
curl -s http://localhost:15173/health || echo "Ops Platform down"
curl -s http://localhost:8765/health || echo "Voice system down"

# 2. Review agent coordination
ls /Users/cp5337/Developer/ctas7-command-center/agents/*/

# 3. Update integration documentation
# [GPT maps current state and integration status]
```

---

## 🔧 **GPT FAILURE PREVENTION**

### **❌ GPT-Specific Anti-Patterns**

- Generating verbose narratives instead of engineering docs
- Creating redundant documentation when structured docs exist
- Missing the PhD analyzer system and creating fake QA tools
- Ignoring existing Smart Crate metadata patterns
- Over-analyzing without executing concrete actions

### **✅ GPT Best Practices**

- Generate structured, scannable documentation
- Use existing system patterns and conventions
- Cross-reference with knowledge base before creating new docs
- Coordinate with other agents through shared context
- Focus on actionable engineering information

---

## 📍 **GPT-SPECIFIC FILE LOCATIONS**

### **Knowledge Base**

```bash
/Users/cp5337/Developer/ctas-7-shipyard-staging/CUSTOM_GPT_KNOWLEDGE_BASE/
├── 🔥🔥🔥_PHD_ANALYZER_ACCESS_🔥🔥🔥.md
├── CTAS7_SOFTWARE_ENGINEERING_MANUAL.md
├── CTAS7_STREAMING_INTEGRATION_ARCHITECTURE.md
└── [other structured knowledge docs]
```

### **Generated Documentation Target**

```bash
/Users/cp5337/Developer/ctas7-command-center/docs/gpt-generated/
├── system-analysis/
├── integration-maps/
├── qa-reports/
└── agent-coordination/
```

### **Templates and Patterns**

```bash
/Users/cp5337/Developer/ctas7-command-center/agents/custom-gpt/
├── AGENT_CONTEXT.md (this file)
├── doc-templates/
├── analysis-patterns/
└── integration-specs/
```

---

## ⚡ **GPT SESSION CHECKLIST**

### **Pre-Session**

- [ ] Read universal agent cheat sheet
- [ ] Check latest valence jump document
- [ ] Verify system health with diagnostic commands
- [ ] Review knowledge base for recent updates

### **During Session**

- [ ] Use structured, engineering-focused approach
- [ ] Cross-reference existing documentation
- [ ] Coordinate with other agents through shared files
- [ ] Generate actionable, scannable outputs

### **Post-Session**

- [ ] Update knowledge base with new insights
- [ ] Create valence jump if approaching context limits
- [ ] Coordinate handoff with other agents if needed
- [ ] Preserve exact command sequences for continuation

---

**🎯 GPT Mission: Structured knowledge processing and engineering documentation for the CTAS-7 multi-agent ecosystem.**
