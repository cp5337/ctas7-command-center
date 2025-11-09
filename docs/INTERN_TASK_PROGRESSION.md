# Intern Task Progression Curriculum
## 12-Week Cybersecurity Engineering Path

**Intern**: Mackenzie  
**Mentor**: Elena Rodriguez (AI Agent - High Autonomy)  
**Leadership Review**: Weekly (Fridays, 30-60 minutes)  
**Goal**: Build portfolio + contribute real value + learn CTAS system  

---

## Overview

This curriculum follows a **progressive learning model** where each task:
- Takes 1-3 days (small, focused PRs)
- Builds on previous knowledge
- Creates a portfolio deliverable
- Maps to specific codebase components
- Includes Elena's Socratic questions

**Success = Skills + Portfolio + System Understanding + Research Contribution**

---

## Phase 1: Foundation (Weeks 1-2)

### **Week 1: Setup & CTAS Understanding**

#### **Task 1.1: Development Environment Setup** (Day 1-2)
**Objective**: Professional development environment ready

**Steps**:
1. Install Kali Linux (WSL2 on Windows laptop)
2. Setup VS Code with CTAS extensions
3. Configure Git with GPG signing
4. Install Docker Desktop
5. Python 3.11+ with virtual environments
6. Clone `ctas7-command-center` repo (read-only initially)

**Elena's Socratic Questions**:
- Q: "Why do we use GPG signing for commits? What problem does it solve?"
- Q: "What's the benefit of WSL2 over a full Kali VM? When would you choose VM?"
- Q: "Look at the CTAS repo structure - what patterns do you notice?"

**Deliverable**: Screenshot of working environment + notes in your learning log

**Portfolio**: Blog post "Setting up a Professional Cybersecurity Dev Environment"

---

#### **Task 1.2: CTAS Architecture Study** (Day 2-3)
**Objective**: Understand what CTAS is and how it works

**Steps**:
1. Read: `CTAS_SYSTEM_OVERVIEW.md` (the document you just received)
2. Read: `CTAS7_V7.3_GROUND_TRUTH_SPECIFICATION.md` (if available)
3. Read: Archaeological studies in ctas-7-shipyard-staging
4. Create mind map of CTAS components
5. Write summary: "What is CTAS in my own words"

**Elena's Socratic Questions**:
- Q: "What makes BNE different from standard DevSecOps?"
- Q: "Why did they choose Rust for the backend?"
- Q: "What's a trivariate hash and why is it important?"
- Q: "In the archaeological studies, what failure patterns do you see repeating?"

**Deliverable**: Written summary (500 words) + mind map diagram

**Portfolio**: Blog post "Understanding CTAS: A Cognitive Computing Platform"

**Codebase Learning**: Overall architecture, not specific code yet

---

#### **Task 1.3: First Contribution - TEAM.md** (Day 3)
**Objective**: Make your first PR to CTAS codebase

**Steps**:
1. Create branch: `intern/mackenzie-onboarding`
2. Add yourself to `TEAM.md`:
   ```markdown
   ### Mackenzie [Last Name]
   **Role**: Cybersecurity Engineering Intern
   **Focus**: Kali Integration, Synaptix Plasma, Training Range
   **Start Date**: [Date]
   **Mentor**: Elena Rodriguez (AI Agent)
   **Location**: Atlanta, GA (Remote)
   **GitHub**: [@mackenzie-username]
   ```
3. Commit with GPG signature: `feat(team): add Mackenzie to team roster`
4. Push and create PR
5. Elena reviews (teaches you PR etiquette)
6. Merge after Elena approval

**Elena's Socratic Questions**:
- Q: "Why do we use the format 'feat(team):' in commit messages?"
- Q: "What makes a good PR description?"
- Q: "How would you respond to a reviewer's feedback?"

**Deliverable**: Merged PR #1

**Portfolio**: GitHub contribution (first of 50+)

**Codebase Learning**: Git workflow, PR process, commit conventions

---

#### **Task 1.4: Kali Linux Proficiency Test** (Day 4-5)
**Objective**: Demonstrate basic Kali tool usage

**Steps**:
1. Setup Kali VM (in addition to WSL, for full range)
2. Use Nmap to scan a safe target (your own Docker containers)
3. Use Metasploit against DVWA (local install)
4. Capture with Wireshark
5. Document: command used, output, what you learned
6. Create "Kali Basics Cheat Sheet"

**Elena's Socratic Questions**:
- Q: "What's the difference between -sS (SYN scan) and -sT (Connect scan)?"
- Q: "When would you use Metasploit vs manual exploitation?"
- Q: "What are the legal and ethical boundaries of penetration testing?"
- Q: "How would you explain Wireshark captures to a non-technical person?"

**Deliverable**: Kali Basics Cheat Sheet (Markdown) + screenshot evidence

**Portfolio**: Technical documentation, demonstrates hands-on skills

**Codebase Learning**: Not CTAS code yet, but foundational Kali skills

---

#### **Task 1.5: Custom GPT Planning** (Day 5)
**Objective**: Design your "Kali Tool Selector" Custom GPT

**Steps**:
1. Research: How do Custom GPTs work?
2. List: What Kali tools should it know? (50+ tools)
3. Design: What questions should it ask users?
4. Outline: ATT&CK framework integration approach
5. Draft: OpenAPI spec skeleton
6. Write: Design document

**Elena's Socratic Questions**:
- Q: "What makes a good AI assistant for security professionals?"
- Q: "How would you structure the tool selection logic?"
- Q: "What information does the user need to provide for good recommendations?"
- Q: "How do you prevent the GPT from suggesting dangerous actions?"

**Deliverable**: Custom GPT Design Document (PDF)

**Portfolio**: AI/ML design experience

**Codebase Learning**: Understanding how AI agents work in CTAS ecosystem

---

### **Week 2: Integration & First Real Contributions**

#### **Task 2.1: PhD QA System Documentation** (Day 6-8)
**Objective**: Document an existing CTAS component to learn how it works

**Steps**:
1. Find PhD QA system: `ctas-7-shipyard-staging/ctas7-qa-analyzer/`
2. Read the code (Rust + Python)
3. Run PhD QA on a sample crate
4. Understand: What does it analyze? What are primitives?
5. Document: How to use it, what the output means, why 656.8% is "Tesla-grade"
6. Create: README.md for the PhD QA system

**Elena's Socratic Questions**:
- Q: "What is 'primitive density' and why does it matter?"
- Q: "How is PhD QA different from standard linters like Clippy?"
- Q: "Why is 656.8% the target? Where does that number come from?"
- Q: "Could you explain PhD QA to a new team member in 2 minutes?"

**Deliverable**: PR with README.md for PhD QA system

**Portfolio**: Technical documentation of complex system

**Codebase Learning**: PhD QA system, primitive-based architecture, Rust code reading

---

#### **Task 2.2: Synaptix Plasma Architecture Study** (Day 8-9)
**Objective**: Understand the threat detection system you'll integrate with

**Steps**:
1. Find Synaptix Plasma code/docs
2. Understand: Wazuh + AXON + Legion architecture
3. Read: How does it detect threats? What data sources?
4. Map: ATT&CK framework to Plasma detection rules
5. Identify: Where would Kali tool integration fit?
6. Document: "Synaptix Plasma for Beginners"

**Elena's Socratic Questions**:
- Q: "What's the difference between Wazuh (open source) and Synaptix Plasma?"
- Q: "How does AXON enhance traditional SIEM capabilities?"
- Q: "Where in the detection pipeline would port scan alerts be generated?"
- Q: "What would you need to add to detect a new attack type?"

**Deliverable**: "Synaptix Plasma Architecture" document

**Portfolio**: System analysis and documentation

**Codebase Learning**: Synaptix Plasma, security operations, threat detection

---

#### **Task 2.3: First Kali Tool Integration** (Day 9-11)
**Objective**: Integrate a simple Kali tool into Plasma monitoring

**Steps**:
1. Choose simple tool: Nmap
2. Create script: Run Nmap in Docker container
3. Generate: Plasma detection signature for port scans
4. Test: Verify Plasma detects your Nmap scan
5. Document: Tool usage + detection validation
6. PR: Add Nmap to training range toolkit

**Elena's Socratic Questions**:
- Q: "Why run Nmap in a container vs directly on host?"
- Q: "What network traffic patterns indicate a port scan?"
- Q: "How would you detect a 'stealthy' scan vs a fast scan?"
- Q: "What false positives might this detection rule create?"

**Deliverable**: PR with Nmap integration + detection rule

**Portfolio**: Security tool integration, threat detection engineering

**Codebase Learning**: Docker, Plasma integration points, detection rules

---

#### **Task 2.4: Create "Kali Tool Selector" Custom GPT** (Day 11-12)
**Objective**: Build your first AI agent/assistant

**Steps**:
1. Use design doc from Task 1.5
2. Create Custom GPT in OpenAI interface
3. Configure: Instructions, knowledge files, capabilities
4. Test: Ask it to recommend tools for various scenarios
5. Iterate: Improve based on testing
6. Document: How to use it + example conversations
7. Share: OpenAPI spec + GPT link in repo

**Elena's Socratic Questions**:
- Q: "How does your GPT handle ambiguous scenarios?"
- Q: "What did you learn about prompt engineering?"
- Q: "How would you improve it with more data?"
- Q: "Could this GPT be misused? How would you prevent that?"

**Deliverable**: Working Custom GPT + documentation

**Portfolio**: AI/ML project, prompt engineering

**Codebase Learning**: How CTAS agents work, AI orchestration

---

#### **Task 2.5: Week 2 Presentation** (Day 12)
**Objective**: Present your learning to leadership

**Steps**:
1. Prepare: 10-minute presentation
2. Content: What you learned, what you built, challenges faced
3. Demo: Show Custom GPT, Nmap integration, PhD QA docs
4. Discuss: Questions, feedback, Week 3-4 planning
5. Reflect: Update skills matrix with Elena

**Elena's Socratic Questions**:
- Q: "What was the hardest part of Week 2?"
- Q: "What surprised you most about CTAS architecture?"
- Q: "How has your understanding of cybersecurity evolved?"
- Q: "What do you want to learn next?"

**Deliverable**: Presentation slides + demo

**Portfolio**: Communication skills, presentation experience

**Codebase Learning**: Holistic view of Weeks 1-2 contributions

---

## Phase 2: Training Range Development - Infrastructure (Weeks 3-6)

### **Week 3: Network Architecture & Docker Foundation**

#### **Task 3.1: Training Range Design Document** (Day 13-14)
**Objective**: Plan the entire training range architecture

**Steps**:
1. Define: What is the training range for? (Client demos, team training, validation)
2. Design: Network topology with isolated segments
3. List: Components needed (attack box, targets, monitoring, control)
4. Choose: Technologies (Docker Compose, FastAPI, React)
5. Draw: Architecture diagrams (Figma or draw.io)
6. Write: Design document with requirements and milestones

**Elena's Socratic Questions**:
- Q: "Why use Docker Compose instead of Kubernetes?"
- Q: "How do you ensure attack traffic doesn't escape the range?"
- Q: "What makes a good training scenario from a learning perspective?"
- Q: "How will you measure if Plasma detection is working correctly?"

**Deliverable**: Training Range Design Document (PDF with diagrams)

**Portfolio**: System design, architecture documentation

**Repository**: Start `mackenzie-ctas-learning/ctas-training-range` repo

---

#### **Task 3.2: Docker Network Isolation** (Day 14-15)
**Objective**: Create isolated network for safe attack scenarios

**Steps**:
1. Learn: Docker networking modes (bridge, host, none, custom)
2. Create: `docker-compose.yml` with custom network
3. Test: Containers can talk to each other but not host network
4. Implement: Network segmentation (attacker, targets, monitoring)
5. Document: Network architecture in README
6. PR #1: Network foundation

**Elena's Socratic Questions**:
- Q: "What's the difference between bridge and macvlan networks?"
- Q: "How would you test that the network is properly isolated?"
- Q: "What happens if an attacker escapes the container?"
- Q: "How does Docker network isolation compare to VLANs?"

**Deliverable**: PR #1 with Docker Compose network setup

**Portfolio**: Docker networking, security architecture

**Codebase Learning**: Docker internals, network security

---

#### **Task 3.3: Kali Attack Box Container** (Day 15-17)
**Objective**: Build the attacker container with essential tools

**Steps**:
1. Start with: Official Kali Linux Docker image
2. Add tools: Nmap, Metasploit, Burp Suite, Wireshark, sqlmap, nikto
3. Create: Dockerfile with tool installation
4. Configure: Non-root user for safety
5. Test: All tools work in containerized environment
6. Document: Tool list + usage examples
7. PR #2: Kali attack box

**Elena's Socratic Questions**:
- Q: "Why install tools in Dockerfile vs running apt-get manually?"
- Q: "What are the security implications of running as root in a container?"
- Q: "How would you keep the tools updated?"
- Q: "Which tools require special configuration in Docker?"

**Deliverable**: PR #2 with Kali container Dockerfile

**Portfolio**: Dockerfile creation, Kali tool management

**Codebase Learning**: Container security, tool deployment

---

### **Week 4: Vulnerable Targets & Monitoring**

#### **Task 4.1: First Vulnerable Target - DVWA** (Day 18-19)
**Objective**: Deploy a web application target with known vulnerabilities

**Steps**:
1. Research: Damn Vulnerable Web Application (DVWA)
2. Deploy: DVWA in Docker container
3. Connect: To training range network
4. Test: Access from Kali attack box
5. Exploit: Try SQL injection, XSS (document results)
6. PR #3: DVWA target deployment

**Elena's Socratic Questions**:
- Q: "What OWASP Top 10 vulnerabilities does DVWA contain?"
- Q: "How would you explain SQL injection to a non-technical person?"
- Q: "Why is DVWA safe to attack (what makes it 'deliberately vulnerable')?"
- Q: "How does DVWA compare to real-world web apps?"

**Deliverable**: PR #3 with DVWA deployment + exploitation notes

**Portfolio**: Web application security, OWASP Top 10

**Codebase Learning**: Docker services, multi-container apps

---

#### **Task 4.2: Additional Targets** (Day 19-21)
**Objective**: Add 2-3 more vulnerable targets for variety

**Steps**:
1. Deploy: Metasploitable3 (OS-level vulnerabilities)
2. Deploy: WebGoat (another web app for different attack types)
3. Deploy: Custom vulnerable service (simple Python Flask app with known bug)
4. Test: Attacks work from Kali box
5. Document: Target descriptions + attack paths
6. PR #4: Multi-target environment

**Elena's Socratic Questions**:
- Q: "How do Metasploitable's vulnerabilities differ from DVWA's?"
- Q: "Why have multiple targets instead of just one?"
- Q: "What types of attacks does each target let you practice?"
- Q: "How would you design a custom vulnerable service?"

**Deliverable**: PR #4 with 3+ vulnerable targets

**Portfolio**: Multi-service architecture, diverse attack vectors

**Codebase Learning**: Service orchestration, Docker Compose dependencies

---

#### **Task 4.3: Plasma Integration - Basic Monitoring** (Day 21-22)
**Objective**: Add Synaptix Plasma to monitor training range

**Steps**:
1. Add: Plasma container to docker-compose.yml
2. Configure: Plasma to monitor attack box + targets
3. Generate: Test traffic (Nmap scan)
4. Verify: Plasma detects and logs the scan
5. Test: Review Plasma dashboard/logs
6. PR #5: Plasma monitoring integration

**Elena's Socratic Questions**:
- Q: "What log sources does Plasma need access to?"
- Q: "How does Plasma differentiate between normal and malicious traffic?"
- Q: "What would happen if Plasma itself was attacked?"
- Q: "How do you validate that Plasma is working correctly?"

**Deliverable**: PR #5 with working Plasma monitoring

**Portfolio**: SIEM integration, threat detection validation

**Codebase Learning**: Synaptix Plasma deployment, log aggregation

---

### **Week 5-6: Control Panel & User Interface**

#### **Task 5.1: Control Panel Backend - FastAPI** (Day 23-25)
**Objective**: Build API to control training range scenarios

**Steps**:
1. Create: Python FastAPI application
2. Endpoints:
   - `GET /scenarios` - List available scenarios
   - `POST /scenarios/{id}/start` - Start a scenario
   - `POST /scenarios/{id}/stop` - Stop a scenario
   - `GET /status` - Overall range status
3. Implement: Docker SDK integration to control containers
4. Test: API with Postman/curl
5. PR #6: Control panel backend

**Elena's Socratic Questions**:
- Q: "Why FastAPI instead of Flask or Django?"
- Q: "How do you handle concurrent scenario requests?"
- Q: "What happens if a scenario fails to start?"
- Q: "How would you secure these APIs?"

**Deliverable**: PR #6 with working FastAPI backend

**Portfolio**: API development, Python backend

**Codebase Learning**: FastAPI patterns, Docker SDK

---

#### **Task 5.2: Control Panel Frontend - React** (Day 25-28)
**Objective**: Build web UI to manage training range

**Steps**:
1. Create: React app with TypeScript
2. Components:
   - Scenario selector
   - Start/stop buttons
   - Status indicators
   - Log viewer (Plasma alerts)
3. Integrate: With FastAPI backend
4. Style: Professional dark theme (matching CTAS)
5. PR #7: Control panel frontend

**Elena's Socratic Questions**:
- Q: "Why React + TypeScript instead of plain JavaScript?"
- Q: "How do you handle real-time updates (scenario status)?"
- Q: "What makes a good UX for security operations?"
- Q: "How would you add authentication to this interface?"

**Deliverable**: PR #7 with working React UI

**Portfolio**: Frontend development, React/TypeScript

**Codebase Learning**: CTAS frontend patterns, UI design

---

#### **Task 5.3: Week 5-6 Integration Testing** (Day 28-30)
**Objective**: End-to-end test of training range infrastructure

**Steps**:
1. Test: Can start all containers via UI
2. Test: Can execute attacks from Kali box
3. Test: Plasma detects and alerts
4. Test: Can view results in control panel
5. Fix: Any bugs or issues found
6. Document: User guide for training range
7. Video: 5-minute demo walkthrough

**Elena's Socratic Questions**:
- Q: "What testing strategy ensures the range works reliably?"
- Q: "How would you automate these tests?"
- Q: "What's the most likely failure point in the system?"
- Q: "How would you explain the range to a client?"

**Deliverable**: Updated docs + demo video + bug fixes

**Portfolio**: QA testing, documentation, video demo skills

**Codebase Learning**: Integration testing, system reliability

---

## Phase 3: ATT&CK Scenarios & Automation (Weeks 7-10)

### **Week 7-8: Purple Team Scenarios**

#### **Task 6.1: Reconnaissance Scenario** (Day 31-33)
**Objective**: Implement ATT&CK Reconnaissance tactics

**Steps**:
1. Research: ATT&CK TA0043 Reconnaissance techniques
2. Script: Automated Nmap scan + service enumeration
3. Detection: Plasma rules for reconnaissance
4. Validation: Scoring system (did Plasma catch it?)
5. Documentation: Scenario playbook
6. PR #8: Reconnaissance scenario

**Elena's Socratic Questions**:
- Q: "What ATT&CK techniques are you implementing?"
- Q: "How do defenders typically detect reconnaissance?"
- Q: "What's the difference between passive and active reconnaissance?"
- Q: "How would you make this scenario harder to detect?"

**Deliverable**: PR #8 with working reconnaissance scenario

**Portfolio**: ATT&CK framework application, purple team operations

**Codebase Learning**: Scenario automation, detection engineering

---

#### **Task 6.2: Initial Access Scenario** (Day 33-35)
**Objective**: Implement ATT&CK Initial Access tactics

**Steps**:
1. Research: ATT&CK TA0001 Initial Access techniques
2. Script: SQL injection against DVWA + XSS attack
3. Detection: Plasma rules for web application attacks
4. Validation: Check if Plasma detected both attack types
5. Documentation: Attack techniques + defenses
6. PR #9: Initial Access scenario

**Elena's Socratic Questions**:
- Q: "Why is Initial Access a critical phase for defenders?"
- Q: "How do modern WAFs detect SQL injection?"
- Q: "What other Initial Access techniques exist besides web app exploits?"
- Q: "How would you prevent these attacks at the application level?"

**Deliverable**: PR #9 with Initial Access scenario

**Portfolio**: Web security, attack detection

---

#### **Task 6.3: Persistence Scenario** (Day 35-37)
**Objective**: Implement ATT&CK Persistence tactics

**Steps**:
1. Research: ATT&CK TA0003 Persistence techniques
2. Script: Create backdoor user + cron job + SSH key
3. Detection: Plasma rules for persistence mechanisms
4. Validation: Test detection accuracy
5. Documentation: Persistence techniques + detection
6. PR #10: Persistence scenario

**Elena's Socratic Questions**:
- Q: "Why is persistence important for attackers?"
- Q: "What persistence techniques are hardest to detect?"
- Q: "How would you hunt for unknown persistence mechanisms?"
- Q: "What legitimate activities might trigger these detection rules?"

**Deliverable**: PR #10 with Persistence scenario

**Portfolio**: Host-based security, incident response

---

#### **Task 6.4: Lateral Movement & Exfiltration** (Day 37-40)
**Objective**: Implement remaining ATT&CK phases

**Steps**:
1. Research: TA0008 Lateral Movement + TA0010 Exfiltration
2. Script: SSH lateral movement + data exfiltration via DNS/HTTP
3. Detection: Plasma rules for both scenarios
4. Validation: Test detection end-to-end
5. Documentation: Complete ATT&CK coverage
6. PR #11: Final two scenarios

**Elena's Socratic Questions**:
- Q: "How do attackers typically move laterally in networks?"
- Q: "What data exfiltration techniques are hardest to detect?"
- Q: "How does Plasma differentiate malicious from legitimate traffic?"
- Q: "What's the value of having all ATT&CK phases covered?"

**Deliverable**: PR #11 with complete 5-scenario coverage

**Portfolio**: Comprehensive ATT&CK knowledge, purple team expertise

---

### **Week 9-10: Automation & Scoring**

#### **Task 7.1: CLI Automation Tool** (Day 41-43)
**Objective**: Build `range.sh` CLI for scenario management

**Steps**:
1. Create: Bash script `range.sh`
2. Commands:
   - `./range.sh list` - Show available scenarios
   - `./range.sh run <scenario>` - Execute scenario
   - `./range.sh status` - Check range health
   - `./range.sh logs <scenario>` - View logs
3. Integrate: With Docker Compose + FastAPI
4. Test: All scenarios run via CLI
5. PR #12: CLI automation

**Elena's Socratic Questions**:
- Q: "Why provide a CLI in addition to the web UI?"
- Q: "How do you make the CLI user-friendly?"
- Q: "What error handling is needed for production use?"
- Q: "How would you extend the CLI with new commands?"

**Deliverable**: PR #12 with working CLI

**Portfolio**: CLI development, automation scripting

---

#### **Task 7.2: Automated Scoring System** (Day 43-45)
**Objective**: Score detection accuracy automatically

**Steps**:
1. Design: Scoring rubric (What does Plasma need to detect?)
2. Implement: Python script that queries Plasma logs
3. Calculate: Detection rate, false positives, response time
4. Generate: Score report (JSON + human-readable)
5. Integrate: Into `range.sh run` output
6. PR #13: Scoring system

**Elena's Socratic Questions**:
- Q: "What makes a good scoring metric for threat detection?"
- Q: "How do you handle partial detections?"
- Q: "What if Plasma detects something you didn't expect?"
- Q: "How would clients use this scoring to evaluate Plasma?"

**Deliverable**: PR #13 with automated scoring

**Portfolio**: Testing/validation, metrics design

---

#### **Task 7.3: PDF Report Generation** (Day 45-47)
**Objective**: Generate professional reports for scenario runs

**Steps**:
1. Choose: Python library (ReportLab or WeasyPrint)
2. Design: Report template (executive summary + technical details)
3. Include: Scenario description, Plasma alerts, scoring, timeline
4. Generate: PDF from scenario run data
5. Style: Professional branding (CTAS/Synaptix theme)
6. PR #14: Report generator

**Elena's Socratic Questions**:
- Q: "What information do executives vs engineers need in reports?"
- Q: "How do you visualize detection timelines effectively?"
- Q: "What makes a report look professional vs amateurish?"
- Q: "How would you automate report distribution?"

**Deliverable**: PR #14 with PDF report generator

**Portfolio**: Report automation, data visualization

---

## Phase 4: Polish, Research & Presentation (Weeks 11-12)

### **Week 11: Documentation & Polish**

#### **Task 8.1: Professional README** (Day 48-49)
**Objective**: Create production-quality documentation

**Steps**:
1. Write: Comprehensive README.md
   - Overview + architecture diagram
   - Installation instructions (step-by-step)
   - Usage guide (CLI + Web UI)
   - Scenario descriptions
   - Troubleshooting
   - Contributing guidelines
2. Add: Screenshots + demo GIFs
3. Include: Architecture diagrams (Figma)
4. PR #15: Documentation complete

**Elena's Socratic Questions**:
- Q: "What makes a README effective for new users?"
- Q: "How do you balance detail vs readability?"
- Q: "What questions would a new user have?"
- Q: "How would you maintain docs as the project evolves?"

**Deliverable**: PR #15 with complete documentation

**Portfolio**: Technical writing, documentation standards

---

#### **Task 8.2: 5-Minute Video Demo** (Day 49-50)
**Objective**: Create portfolio-ready video walkthrough

**Steps**:
1. Script: What to show and say
2. Record: Screen capture + voiceover
3. Demonstrate:
   - Quick setup (docker-compose up)
   - Scenario execution (via CLI or UI)
   - Plasma detection (show alerts)
   - Scoring results
   - Use cases (training, validation, demos)
4. Edit: Professional quality (intro/outro, music)
5. Upload: YouTube (unlisted) + embed in README
6. Add: To portfolio website

**Elena's Socratic Questions**:
- Q: "What's the key message for your target audience?"
- Q: "How do you hook viewers in the first 30 seconds?"
- Q: "What technical details should you include vs omit?"
- Q: "How would you present this in a job interview?"

**Deliverable**: Published video + portfolio integration

**Portfolio**: Video creation, presentation skills

---

#### **Task 8.3: Final Bug Fixes & Testing** (Day 50-51)
**Objective**: Production-ready quality

**Steps**:
1. Test: Every scenario end-to-end
2. Fix: Any remaining bugs or edge cases
3. Optimize: Performance improvements
4. Validate: Works on fresh install
5. Code review: Clean up comments, remove debug code
6. PR #16: Final polish

**Elena's Socratic Questions**:
- Q: "What testing strategy ensures reliability?"
- Q: "How do you prioritize bugs (critical vs nice-to-have)?"
- Q: "What would embarrass you in a demo?"
- Q: "How do you know when code is 'done'?"

**Deliverable**: PR #16 with final polish + v1.0 release tag

**Portfolio**: QA standards, production readiness

---

### **Week 12: Research Paper & Final Presentation**

#### **Task 9.1: Research Paper - Data Collection** (Day 52-53)
**Objective**: Contribute to "Purple Team Automation with AI Detection"

**Steps**:
1. Run: All scenarios 100 times each (collect data)
2. Record: Detection rates, false positives, response times
3. Analyze: Statistical significance (Python + Pandas)
4. Compare: Plasma vs baseline Wazuh (if possible)
5. Document: Methodology + results
6. Prepare: Data for paper

**Elena's Socratic Questions**:
- Q: "What makes research data scientifically valid?"
- Q: "How many test runs are needed for statistical significance?"
- Q: "What variables could affect the results?"
- Q: "How do you present data to support your conclusions?"

**Deliverable**: Research data + analysis scripts

**Portfolio**: Research methodology, data analysis

---

#### **Task 9.2: Research Paper - Writing** (Day 53-55)
**Objective**: Write sections of research paper

**Steps**:
1. Write: "Methodology" section (how training range works)
2. Write: "Results" section (detection rates, performance)
3. Create: Figures and tables (visualization)
4. Write: "Discussion" section (what results mean)
5. Contribute: To leadership's "Introduction" and "Related Work"
6. LaTeX: Format for academic journal submission

**Elena's Socratic Questions**:
- Q: "How do you write objectively about your own work?"
- Q: "What figures best communicate your results?"
- Q: "How do you acknowledge limitations?"
- Q: "What makes a paper publishable vs just a report?"

**Deliverable**: Paper draft sections (LaTeX)

**Portfolio**: Academic writing, research contribution

**Co-Authorship**: You + leadership on published paper

---

#### **Task 9.3: Final Presentation to Leadership** (Day 56)
**Objective**: Present 3-month internship results (simulating client pitch)

**Steps**:
1. Prepare: 20-minute presentation
2. Content:
   - What you built (training range demo)
   - What you learned (technical + personal growth)
   - Results (scenarios, detection rates, portfolio)
   - Future work (how range can be extended)
3. Demo: Live training range execution
4. Q&A: Answer questions about design decisions
5. Feedback: Receive evaluation from leadership

**Elena's Socratic Questions**:
- Q: "What's your proudest accomplishment from the internship?"
- Q: "What would you do differently if starting over?"
- Q: "How would you sell this to a DoD client?"
- Q: "What's next for you (full-time role, job search, etc.)?"

**Deliverable**: Presentation + demo + evaluation discussion

**Portfolio**: Presentation skills, client-facing communication

---

## Skills Matrix Tracking

Elena updates your skills matrix weekly based on task completion:

```json
{
  "week": 12,
  "skills": {
    "linux": 0.85,           // CLI, system admin, troubleshooting
    "python": 0.80,          // Scripting, automation, FastAPI, data analysis
    "kali": 0.75,            // 10+ tools proficient, scenario design
    "docker": 0.75,          // Compose, networking, security
    "rust": 0.30,            // Reading code, understanding CTAS
    "git": 0.90,             // PRs, code review, GPG signing
    "networking": 0.75,      // Isolation, monitoring, traffic analysis
    "pentesting": 0.70,      // ATT&CK scenarios, exploitation, defenses
    "frontend": 0.60,        // React, TypeScript, UI/UX
    "backend": 0.70,         // FastAPI, APIs, Docker SDK
    "documentation": 0.85,   // Technical writing, diagrams, video
    "research": 0.65,        // Methodology, analysis, academic writing
    "communication": 0.80    // Presentation, teaching, documentation
  },
  "portfolio": 0.95,         // 95% complete
  "codebase_understanding": 0.70,  // CTAS architecture + components
  "career_readiness": 0.85   // Job-ready for cybersecurity roles
}
```

**Target**: All core skills > 0.60, with specializations > 0.70

---

## Portfolio Deliverables (End of 12 Weeks)

### **GitHub Repositories**:
1. `ctas-training-range` - Capstone project (16 PRs, ~5000 LOC)
2. `kali-learning` - Tool documentation + cheat sheets
3. `ctas-contributions` - PRs to parent CTAS repos

### **Technical Writing**:
1. Professional portfolio website
2. 10+ blog posts (learning journey + technical topics)
3. Training range documentation (README, user guides)
4. Research paper co-authorship

### **Media**:
1. 5-minute training range demo video
2. Architecture diagrams (Figma)
3. Screenshots and GIFs
4. Presentation slides

### **Skills Demonstrated**:
1. Kali Linux & penetration testing (10+ tools)
2. Docker & containerization (multi-service orchestration)
3. Python (scripting, FastAPI, automation, data analysis)
4. React/TypeScript (control panel UI)
5. ATT&CK framework (5 scenarios implemented)
6. Synaptix Plasma integration
7. Git professional workflow (50+ commits, 20+ PRs)
8. Technical documentation & presentation
9. Research methodology & academic writing

---

## Success Criteria

### **Technical Competence**:
- ✅ Can independently design and implement security scenarios
- ✅ Understands CTAS architecture and can explain to others
- ✅ Proficient with Kali tools for offensive security
- ✅ Can integrate detection systems and validate effectiveness

### **Portfolio Quality**:
- ✅ Training range is demo-ready for clients
- ✅ GitHub shows consistent contributions (green squares)
- ✅ Documentation is professional and comprehensive
- ✅ Video demo showcases work effectively

### **Professional Readiness**:
- ✅ Can discuss work in job interviews
- ✅ Resume highlights DoD-level experience
- ✅ Research paper adds academic credibility
- ✅ Reference from SDVOB contractor

### **System Knowledge**:
- ✅ Understands BNE process and why it matters
- ✅ Can explain trivariate hashing and Layer 2 intelligence
- ✅ Knows how Synaptix Plasma differs from standard SIEM
- ✅ Familiar with PhD QA and primitive-based architecture

---

## Elena's Role Throughout

**Daily** (Morning):
- Assign task from curriculum
- Provide Socratic questions to guide learning
- Set expectations for the day

**During Work** (On-demand):
- Answer questions via Slack
- Unblock when stuck (with questions, not answers)
- Review code snippets and provide feedback

**Evening** (End of day):
- Review progress
- Provide constructive feedback
- Update skills matrix
- Prepare next day's task

**Weekly** (Friday):
- Summarize week's progress
- Prepare report for leadership review meeting
- Adjust curriculum difficulty if needed
- Celebrate wins and address concerns

---

## Leadership Role

**Weekly** (Friday, 30-60 min):
- Review Elena's progress report
- Discuss challenges and wins with Mackenzie
- Provide strategic guidance and career mentorship
- Approve major decisions and architecture changes
- Adjust curriculum as needed

**Escalations** (As needed):
- When Mackenzie is stuck > 2 days
- Major technical decisions
- Advancement opportunities (ahead of schedule)
- Career discussions and full-time opportunities

---

## After Week 12

**Possible Outcomes**:

1. **Full-Time Offer**: Continue with CTAS, work on advanced projects
2. **Extended Internship**: Another 3 months on different projects
3. **Job Search Support**: Strong portfolio, research paper, reference
4. **Return Later**: Stay in touch, come back after gaining experience elsewhere

**Regardless of outcome**, you'll have:
- ✅ Real DoD-level experience on your resume
- ✅ Training range in your portfolio
- ✅ Published research paper
- ✅ Professional reference from SDVOB contractor
- ✅ Skills to succeed in cybersecurity engineering

---

**Welcome to CTAS 7.3, Mackenzie. Elena is ready when you are!**

