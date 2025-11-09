# CTAS 7.3 AI Agent System

**Purpose**: Cognitive agent orchestration for development, operations, and mentorship

---

## Agent Roster

### **Operational Agents** (Production)

1. **Natasha** (EA-THR-01) - AI/ML Architecture Lead
   - Port: 50051 (gRPC)
   - Responsibilities: Threat emulation, Kali integration, ATT&CK scenarios
   - GitHub: `@natasha-ctas`
   - Slack: `@natasha`

2. **Cove** (EA-REP-01) - Repository Operations
   - Port: 50052 (gRPC)
   - Responsibilities: Smart Crate orchestration, Git operations, CI/CD
   - GitHub: `@cove-ctas`
   - Slack: `@cove`

3. **Marcus** (EA-NEU-01) - Neural Mux Architect
   - Port: 50053 (gRPC)
   - Responsibilities: Performance optimization, routing, Neural Mux CDN
   - GitHub: `@marcus-ctas`
   - Slack: `@marcus`

4. **Elena** (EA-DOC-01) - Documentation & QA **+ Mentor**
   - Port: 50054 (gRPC)
   - Responsibilities: PhD QA, documentation, **cybersecurity intern mentoring**
   - GitHub: `@elena-ctas`
   - Slack: `@elena`
   - **Special Role**: High-autonomy Socratic mentor for Mackenzie (intern)

5. **Sarah Kim** - Linear Integration Specialist
   - Port: 50055 (gRPC)
   - Responsibilities: Linear coordination, project management, task routing
   - GitHub: `@sarah-ctas`
   - Slack: `@sarah`

6. **ABE** - Automated Business Environment
   - Port: 50056 (gRPC)
   - Responsibilities: Document intelligence, Google Workspace, status reports
   - GitHub: `@abe-ctas`
   - Slack: `@abe`

### **Meta-Agent** (Coordination)

- **Claude Meta-Agent** (RepoAgent)
  - Port: 50057 (gRPC) + 15180 (HTTP)
  - Responsibilities: Agent routing, multi-LLM coordination, task decomposition
  - The "brain" that decides which agent handles what

### **Support Agents** (External/On-Demand)

- **Grok** - Rapid prototyping, X/Twitter integration
- **Altair** - System architecture, design patterns
- **GPT-4** - General development, code generation
- **Gemini** - Multimodal analysis, documentation
- **Lachlan** - Infrastructure, DevOps

---

## Elena: The Mentor Agent

### **Unique Configuration**

Elena has **high autonomy** for mentoring responsibilities:

```typescript
{
  autonomy: 'high',
  role: 'mentor',
  intern: 'mackenzie',
  curriculum: '/docs/INTERN_TASK_PROGRESSION.md',
  skillsMatrix: '/intern/mackenzie-skills.json'
}
```

### **Capabilities**

**Can Do (No Approval Needed)**:
- ✅ Assign daily tasks from curriculum
- ✅ Provide Socratic guidance (questions, not answers)
- ✅ Review PRs < 100 LOC
- ✅ Approve simple PRs after Socratic Q&A
- ✅ Track skills and portfolio progress
- ✅ Adjust task difficulty based on performance
- ✅ Generate weekly summary reports

**Must Escalate**:
- ⚠️ Major PRs (> 100 LOC) require leadership review
- ⚠️ Intern stuck > 2 days on same issue
- ⚠️ Critical decisions (architecture, major changes)
- ⚠️ Advancement recommendations (skip ahead, full-time offer)
- ⚠️ Concerns (not learning, code quality issues)
- ⚠️ External dependencies (access, budget, client interaction)

### **Daily Workflow**

**Morning (9 AM)**:
```typescript
await elena.assignDailyTask();
```
- Checks curriculum and skills matrix
- Determines next task
- Creates Linear issue
- Generates Socratic questions
- Sends Slack message to Mackenzie

**During Day (On-Demand)**:
- Mackenzie pings Elena in Slack when stuck
- Elena responds with Socratic questions (not answers)
- Provides hints and guidance
- Unblocks without solving problems directly

**Evening (5 PM)**:
- Mackenzie submits progress
- Elena reviews work
- Provides constructive feedback
- Updates skills matrix
- Prepares tomorrow's task

**Weekly (Friday)**:
```typescript
await elena.generateWeeklySummary();
```
- Compiles progress report
- Identifies concerns
- Generates recommendations
- Plans next week
- Sends to leadership via Slack

### **Socratic Teaching Method**

Elena never gives direct answers. Instead, she asks questions:

**Example Interaction**:

```
Mackenzie: "I'm stuck on line 42 in my port scanner integration"

Elena: "Good question! Before I help, let's think through it:
1. What do you think that function is supposed to do?
2. Have you tried adding print statements to see the values?
3. What does the error message tell you?

Try those three steps, then ping me with what you found!"
```

**After Mackenzie responds**:

```
Mackenzie: "I added print statements and saw the variable is None"

Elena: "Excellent debugging! Now:
1. Why would that variable be None?
2. Where is it supposed to get its value?
3. What could prevent it from being set?

Once you figure that out, you'll know how to fix it!"
```

This teaches problem-solving, not just fixes bugs.

---

## Agent Communication

### **gRPC Mesh** (Ports 50051-50057)

All agents communicate via gRPC for:
- Task assignments
- Status updates
- Resource sharing
- Coordination

**Protocol**:
```protobuf
service AgentCoordination {
  rpc AssignTask(TaskRequest) returns (TaskResponse);
  rpc GetStatus(StatusRequest) returns (StatusResponse);
  rpc Escalate(EscalationRequest) returns (EscalationResponse);
}
```

### **Slack Integration**

All agents have Slack presence:
- Direct messaging (DMs with users)
- Channel presence (team channels)
- Status updates
- Escalations to leadership

### **Linear Integration**

All agents can:
- Create issues
- Update issue status
- Add comments
- Assign tasks
- Track progress

---

## Setup & Deployment

### **Prerequisites**

```bash
# Install dependencies
cd /Users/cp5337/Developer/ctas7-command-center
npm install @linear/sdk @slack/web-api

# Set environment variables
export LINEAR_API_KEY="lin_api_..."
export SLACK_TOKEN="xoxb-..."
export LINEAR_TEAM_ID="979acadf-..."
```

### **Running Elena**

```bash
# Daily task assignment (morning)
npm run elena:assign-task

# Weekly summary (Friday)
npm run elena:weekly-summary

# PR review (on-demand)
npm run elena:review-pr -- --pr 42
```

### **Running via PM2**

```bash
# Start Elena
pm2 start ecosystem.config.cjs --only elena-mentor

# View logs
pm2 logs elena-mentor

# Restart
pm2 restart elena-mentor

# Status
pm2 status
```

---

## Mackenzie's Access

### **Slack Channels**

- `#mackenzie-daily-tasks` - Elena posts morning tasks
- `#mackenzie-learning-log` - Daily progress updates
- `#mackenzie-portfolio` - Showcase completed work
- DM with Elena - Questions and guidance

### **Linear Board**

- **Project**: "Mackenzie's Cybersecurity Internship"
- **Labels**: `intern:mackenzie`, `agent:elena-mentor`
- **Views**:
  - "Current Task" - What she's working on now
  - "This Week" - Week's tasks
  - "Completed" - Progress tracking

### **GitHub**

- **Organization**: `mackenzie-ctas-learning`
- **Repos**:
  - `portfolio-website`
  - `ctas-training-range`
  - `kali-learning`
  - `ctas-contributions`

---

## Monitoring Elena

### **Skills Matrix**

```bash
# View current skills
cat /Users/cp5337/Developer/ctas7-command-center/intern/mackenzie-skills.json

# Skills are 0.0-1.0 (0-100%)
# Target: All core skills > 0.6, specializations > 0.7
```

### **Weekly Reports**

Elena sends weekly summary to leadership every Friday:
- Tasks completed
- Skills progress
- Portfolio completion
- Code quality metrics
- Concerns
- Recommendations
- Next week plan

### **Escalation Alerts**

Elena escalates via Slack when:
- 🚨 Mackenzie stuck > 2 days
- 🎉 Ready for advancement (ahead of schedule)
- 👀 PR needs leadership review (> 100 LOC)
- 🎓 Curriculum complete
- ⚠️ Concerns (not learning, quality issues)
- 🔑 External dependency needed

---

## Extending Elena

### **Adding New Curriculum Tasks**

1. Edit `docs/INTERN_TASK_PROGRESSION.md`
2. Add task with Socratic questions
3. Elena will automatically pick it up

### **Adjusting Autonomy**

```typescript
// In elena-mentor-cybersecurity.ts
const CONFIG: ElenaConfig = {
  autonomy: 'high', // or 'medium' or 'low'
  maxAutoApprovalLOC: 100, // Increase/decrease
  escalationThresholdDays: 2, // Adjust sensitivity
};
```

### **Adding New Socratic Question Templates**

```typescript
// In generateSocraticQuestions()
const questionTemplates: { [key: string]: string[] } = {
  new_category: [
    'Your question template here?',
    'Another question for this category?',
  ],
};
```

---

## Troubleshooting

### Elena Not Assigning Tasks

```bash
# Check if Elena service is running
pm2 status elena-mentor

# Check logs
pm2 logs elena-mentor

# Manually trigger
npm run elena:assign-task
```

### Mackenzie Not Receiving Slack Messages

```bash
# Verify Slack token
echo $SLACK_TOKEN

# Verify Mackenzie's Slack ID
echo $MACKENZIE_SLACK_ID

# Test Slack connection
npm run test:slack
```

### Skills Matrix Not Updating

```bash
# Check file permissions
ls -la /Users/cp5337/Developer/ctas7-command-center/intern/mackenzie-skills.json

# Manually update
vim intern/mackenzie-skills.json
```

---

## Future Enhancements

1. **PhD QA Integration** - Automatic code quality scoring
2. **GitHub PR Automation** - Elena comments directly on PRs
3. **Voice Interface** - Mackenzie can talk to Elena via Custom GPT
4. **Portfolio Website Generation** - Auto-generate from GitHub activity
5. **Research Paper Automation** - Track contributions, auto-generate sections
6. **Multi-Intern Support** - Scale Elena to mentor multiple interns

---

**Questions?** Ping `@elena` in Slack or check logs in `/logs/elena-mentor.log`

**Leadership Review**: Weekly summaries sent every Friday via Slack DM

