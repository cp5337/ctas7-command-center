# CTAS-7 Complete PM2 Service Map v7.3
## Full Integration: Memory Mesh + Custom GPTs + ABE + Intelligence

---

## 🎯 Service Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Your Voice Command Layer                          │
│                  (Custom GPT → Natasha & Zoe)                           │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    RepoAgent Gateway (15180)                            │
│                    X-API-Key Authentication                             │
└──────┬──────────────────────────────────────────────────┬───────────────┘
       │                                                   │
       ↓                                                   ↓
┌──────────────────┐                            ┌──────────────────────┐
│  Agent Mesh      │                            │  Custom GPT Services │
│  (50051-50058)   │                            │  Zoe (58474)         │
└──────────────────┘                            └──────────────────────┘
```

---

## 📊 TIER 0: Document Intelligence (ABE)

### **abe-local** - Port **18190**
**Local Document Orchestrator**
- Document classification & metadata extraction
- MARC 21 cataloging standards
- Research paper adjudication
- .md file organization
- Drive sync coordination

**Capabilities:**
- Classify documents into stratified buckets
- Extract metadata for Memory Fabric
- Generate trivariate hashes for documents
- Coordinate with ABE cloud services

### **abe-firefly** - Port **18191**
**Firefly Microkernel for Documents**
- Lightweight WASM document processing
- Hash-addressed document retrieval
- Memory Fabric integration
- Neural Mux CDN connection

**Capabilities:**
- Parse documents in WASM nodes
- Fast hash-based document lookup
- Real-time document indexing
- Sub-microsecond retrieval

### **abe-drive-sync** - Port **18192**
**Google Drive Synchronization**
- Bidirectional workspace ↔ Drive sync
- Microsoft Office export (DOCX, XLSX, PPTX)
- Service account authentication
- Automatic sync every 30 minutes

**Endpoints:**
- `GET /status` - Sync status
- `POST /sync/trigger` - Manual sync
- `GET /documents` - List synced documents
- `POST /export` - Export to Microsoft format

---

## 📊 TIER 1: Core Agent Infrastructure

### **repoagent-gateway** - Port **15180**
**HTTP/REST Entry Point**
- External API access
- X-API-Key: `ctas7-gateway-2025-secure-key-natasha-zoe-orbital`
- Routes to internal agent mesh
- Handles ABE document requests

**Endpoints:**
- `POST /agents/dispatch` - Route task to appropriate agent
- `GET /agents/status` - Health check for all agents
- `POST /agents/chat` - Interactive agent communication
- `GET /health` - Gateway health

### **agent-mesh** - Ports **50051-50058** (gRPC)
**Multi-Agent Communication System**

| Agent | Port | Specialization |
|-------|------|----------------|
| **Claude Meta-Agent** | 50055 | Primary coordinator & router |
| **Natasha** | 50052 | Voice, AI/ML, Red Team |
| **Grok** | 50051 | Space engineering, Neural Mux ops |
| **Cove** | 50053 | DevOps, QA, Repository ops |
| **Altair** | 50054 | Space analysis, orbital mechanics |
| **GPT** | 50056 | Tactical operations |
| **Gemini** | 50057 | Enterprise architecture |
| **ABE Agent** | 50058 | Document intelligence |

**Communication:**
- gRPC mesh for agent-to-agent communication
- Slack integration via `@agent_name`
- Email via `agent@ctas.local`
- Linear integration for task tracking

---

## 📊 TIER 2: Linear Integration

### **linear-integration** - Port **15182**
**Node.js GraphQL Wrapper**
- ASCII splash screen on startup
- Team: CognetixALPHA (COG)
- Bridges Linear API ↔ Agent Mesh
- Task documentation and handoffs

**Capabilities:**
- Create/update Linear issues
- Assign tasks to agents
- Track issue lifecycle
- Document generation for tasks

### **linear-agent** - Port **18180**
**Rust Smart Crate Orchestrator**
- Trivariate hash generation (Murmur3)
- Neural Mux routing
- XSD playbook automation
- Smart Crate coordination

**Capabilities:**
- Generate CTAS-7 trivariate hashes for issues
- Route tasks via Neural Mux
- Auto-create Smart Crates for complex tasks
- Integrate with Foundation Core

---

## 📊 TIER 3: Intelligence Services

### **osint-engine** - Port **18200**
**Python-based OSINT Collection**
- 20+ tool integrations
- Social media analysis
- Email/phone investigation
- Location tracking
- NYX-TRACE platform backend

**Tools Integrated:**
- Instaloader, theHarvester, h8mail, Recon-NG
- Sherlock, Maigret, gOSINT, Social Analyzer
- Spiderfoot, OSRF Framework, Truffle Hog
- PimEyes, FaceCheck, FindClone, Truecaller
- FlightRadar24, MarineTraffic, VesselFinder

**Endpoints:**
- `POST /osint/person` - Person investigation
- `POST /osint/email` - Email analysis
- `POST /osint/phone` - Phone number lookup
- `POST /osint/location` - Location tracking
- `GET /osint/report` - Generate report

### **corporate-analyzer** - Port **18201**
**Corporate Entity Intelligence**
- 50 US states + DC databases
- OpenCorporates API integration
- SEC EDGAR filings
- Ownership network mapping
- Shell company detection

**Capabilities:**
- Entity ownership graph analysis
- Officer network discovery
- Risk scoring and compliance checking
- Financial analysis from SEC data

**Endpoints:**
- `POST /corporate/analyze` - Analyze entity
- `GET /corporate/network` - Ownership network
- `POST /corporate/officers` - Officer search
- `GET /corporate/risk-score` - Risk assessment

---

## 📊 TIER 4: Memory Mesh v2.0 RC1

### **sledis-cache** - Port **19014** (Redis protocol) + Port **20014** (gRPC health)
**Persistent Memory Cache**
- Sled backend with Redis protocol
- Memory Mesh v2.0 RC1 foundation
- Cross-system data persistence
- Agent memory synchronization

**Capabilities:**
- Redis-compatible commands
- Persistent storage via Sled
- gRPC health checks
- Memory Fabric integration

### **neural-mux** - Port **50051** (gRPC) + Port **15001** (gRPC-Web bridge)
**AI-Driven Multiplexer with Memory Mesh**

**Integrated Services:**
- **context-mesh** - Port 19011 - Neural context coordination
- **atomic-clipboard** - Port 19012 - Cross-system clipboard
- **thalmic-filter** - Port 19013 - Data filtering
- **voice-gateway** - Port 19015 - Voice interface
- **shuttle-sync** - Port 19016 - Data synchronization

**Capabilities:**
- Autonomous crate orchestration
- Deterministic hash-based routing
- Smart CDN gateway
- Atomic clipboard operations
- Context preservation across agents
- Voice command processing

---

## 📊 TIER 5: Custom GPT Endpoints

### **zoe-agent** - Port **58474**
**Aerospace Systems Architect & Orbital R&D Engineer**
- NRO-compatible clearance level
- Wolfram Alpha computational engine
- Satellite design & engineering
- FSO communication systems
- Quantum encryption protocols

**Complete API Endpoints:**

#### **System Status & Capabilities**
- `GET /zoe` - Main interface and capabilities overview
- `GET /health` - Health check
- `GET /zoe/capabilities` - Full technical specifications
- `GET /zoe/profile` - Agent profile and credentials

#### **Orbital Analysis & Operations**
- `GET /zoe/orbital-analysis` - Constellation assessment
- `GET /zoe/mission-planning` - Orbital mechanics & routing
- `GET /zoe/security-assessment` - Quantum encryption status
- `POST /sgp4/propagate` - SGP4/SDP4 orbital propagation
- `GET /sgp4/tle` - TLE data for tracked objects
- `GET /constellation/status` - LaserLight constellation status

#### **Mission Briefings**
- `GET /zoe/briefing/command` - Command-level mission briefing
- `GET /zoe/briefing/technical` - Ground crew technical runbook
- `GET /zoe/briefing/cto` - Executive system review

#### **Cesium Integration**
- `POST /cesium/camera` - Control Cesium camera position
- `POST /cesium/track` - Track satellite in Cesium viewer

#### **Neural Mux & Routing**
- `POST /routing/optimize` - Optimize Neural Mux routing
- `POST /laserlight/link` - Analyze FSO link budget
- `POST /simulation/whatif` - Run what-if simulations

#### **Satellite Design Engineering**
- `GET /zoe/satellite-design` - Design system status
- `GET /zoe/satellite-design/templates` - Available templates
- `POST /zoe/satellite-design/create` - Create new satellite design

**Design Templates:**
- CubeSat 1U, 3U, 6U
- Smallsat microsatellite platforms
- FSO communication satellites
- Custom mission designs

#### **AI & Aeronautical Research**
- `GET /zoe/research/crawl` - Research crawling status
- `GET /zoe/research/ai-aerospace` - AI aerospace technology trends

**Research Sources:**
- IEEE Aerospace journals
- NASA Technical Reports
- SpaceX/Blue Origin/ESA publications
- USPTO space technology patents

#### **Wolfram Alpha Computational Engine**
- `GET /zoe/wolfram/templates` - Available calculations
- `GET /zoe/wolfram/orbital-mechanics` - Orbital mechanics calculator
- `POST /zoe/wolfram/calculate` - Advanced aerospace calculations

**Calculation Types:**
- Orbital periods and velocities
- Hohmann transfers and delta-v
- Atmospheric density modeling
- Solar panel power budgets
- Propellant mass calculations
- Gravitational force analysis
- Radiation dose in Van Allen belts
- Communication range calculations

#### **Filesystem & Atomic Clipboard**
- `POST /zoe/filesystem/mkdir` - Create directories
- `GET /zoe/filesystem/ls` - List directory contents
- `POST /zoe/clipboard/store` - Store data in atomic clipboard
- `POST /zoe/clipboard/retrieve` - Retrieve clipboard data

**Zoe's Specialization:**
- MEO/LEO constellation architecture
- FSO (Free Space Optical) communication engineering
- Walker Δ(12/3/1) pattern optimization
- Quantum encryption deployment
- Van Allen belt radiation hardening
- Photonic reservoir computing

### **natasha-agent** (Accessible via RepoAgent Gateway)
**Voice/AI/ML/Red Team Specialist**
- Accessible via port **15180** (HTTP gateway)
- Also via agent mesh port **50052** (gRPC)
- Custom GPT via ngrok: `https://123456a5c866e82224.ngrok-free.app`

**Capabilities:**
- Voice command processing
- AI/ML code generation
- Red Team security analysis
- Smart Crate orchestration
- Zen Coder integration

---

## 📊 TIER 6: Tool Orchestration

### **tool-server** - Port **18295**
**Kali Tool Integration & Orchestration**
- Layer 2 fabric coordination
- Security operations execution
- PTCC primitive orchestration
- iTunes-style tool chain composition

**Capabilities:**
- Execute Kali tools in sandboxed environment
- Compose security operations as "playlists"
- MITRE ATT&CK technique execution
- Atomic Red Team integration

---

## 🔄 Data Flow Example: Voice Command → Multi-System Execution

```
User (via Custom GPT): "Analyze satellite COG-12's orbital decay and create Linear issue"

1. Custom GPT → Natasha (via RepoAgent Gateway 15180)
   ↓
2. RepoAgent Gateway → Claude Meta-Agent (50055)
   ↓
3. Claude routes to Zoe (58474) for orbital analysis
   ↓
4. Zoe uses:
   • SGP4 propagation (/sgp4/propagate)
   • Wolfram Alpha calculations (/wolfram/calculate)
   • Constellation status (/constellation/status)
   ↓
5. Results stored in Atomic Clipboard (19012)
   ↓
6. Claude routes to Linear Agent (18180)
   ↓
7. Linear Agent creates issue COG-12 via Linear Integration (15182)
   ↓
8. ABE Agent (50058) generates report document
   ↓
9. ABE Local (18190) classifies as "Intelligence Report"
   ↓
10. ABE Drive Sync (18192) uploads to Google Drive
    ↓
11. All data persisted in Sledis Cache (19014)
    ↓
12. Response returned to user via Natasha voice interface
```

---

## 🎨 PM2 Dashboard Commands

### **Start Everything**
```bash
cd /Users/cp5337/Developer/ctas7-command-center
./START_ALL_SERVICES.sh
```

### **View Live Dashboard**
```bash
pm2 monit                    # Real-time dashboard
pm2 list                     # Service status table
pm2 status                   # Detailed status
```

### **Control Services by Tier**
```bash
# ABE Services
pm2 restart abe-local abe-firefly abe-drive-sync

# Agent Infrastructure
pm2 restart repoagent-gateway agent-mesh

# Linear Integration
pm2 restart linear-integration linear-agent

# Intelligence Services
pm2 restart osint-engine corporate-analyzer

# Memory Mesh
pm2 restart sledis-cache neural-mux

# Custom GPTs
pm2 restart zoe-agent

# Tools
pm2 restart tool-server
```

### **View Service Logs**
```bash
# All logs
pm2 logs

# Specific service
pm2 logs zoe-agent --lines 100

# Follow errors only
pm2 logs --err

# Flush old logs
pm2 flush
```

### **Service Health Checks**
```bash
# Zoe health
curl http://localhost:58474/health

# RepoAgent health
curl http://localhost:15180/health

# ABE status
curl http://localhost:18190/status

# Sledis cache
redis-cli -p 19014 PING

# Neural Mux
grpcurl -plaintext localhost:50051 list
```

---

## 🌐 Integration Points

### **Custom GPT → CTAS Services**
```
Custom GPT (Natasha or Zoe)
    ↓ HTTPS
RepoAgent Gateway (15180)
    ↓ gRPC
Claude Meta-Agent (50055)
    ↓ Intelligent Routing
Appropriate Service (Zoe, ABE, Linear, OSINT, etc.)
```

### **Voice Command Flow**
```
User Voice → Custom GPT
    ↓
Deepgram (Speech-to-Text)
    ↓
Natasha Agent (50052 via 15180)
    ↓
Command Processing & Routing
    ↓
Service Execution
    ↓
ElevenLabs (Text-to-Speech)
    ↓
Voice Response to User
```

### **Document Management Flow**
```
Code/Document Created
    ↓
ABE Local (18190) - File Watcher
    ↓
Classification & Metadata Extraction
    ↓
ABE Firefly (18191) - WASM Processing
    ↓
Atomic Clipboard (19012) - Temporary Storage
    ↓
Sledis Cache (19014) - Persistent Storage
    ↓
ABE Drive Sync (18192) - Cloud Upload
    ↓
Memory Fabric - Long-term Retrieval
```

---

## 📡 Service Discovery

All services register with the **Real Port Manager (18103)** - the authoritative source for port allocations.

Query available services:
```bash
curl http://localhost:18103/services
```

---

## 🚀 Startup Sequence

1. **Sledis Cache** (19014) - Memory foundation
2. **Neural Mux** (50051) - AI coordination with Memory Mesh
3. **ABE Services** (18190-18192) - Document intelligence
4. **Agent Mesh** (50051-50058) - Agent communication
5. **RepoAgent Gateway** (15180) - External API
6. **Linear Integration** (15182, 18180) - Task management
7. **Intelligence Services** (18200, 18201) - OSINT & corporate
8. **Zoe Agent** (58474) - Orbital operations
9. **Tool Server** (18295) - Security tools

**Total Services: 13 managed by PM2**

---

## 🎯 Production vs Development

| Aspect | PM2 (Dev/Demo) | Production |
|--------|----------------|------------|
| **Orchestration** | PM2 process manager | Docker/Kubernetes |
| **Dashboard** | `pm2 monit` / `pm2 web` | Grafana/Prometheus |
| **Workflow Engine** | Manual coordination | Forge (18220) |
| **Service Discovery** | Port Manager (18103) | Consul/etcd |
| **Logging** | Local files | Centralized (Loki/ELK) |
| **Scaling** | Single machine | Multi-node cluster |
| **Security** | Local dev keys | Vault/mTLS |

---

## 💡 Key Integration Highlights

1. **Memory Mesh v2.0 RC1** - All agents share context via Sledis and Atomic Clipboard
2. **Custom GPT Integration** - Zoe and Natasha have direct API access
3. **ABE Document Intelligence** - Automatic classification and Google Drive sync
4. **Linear Workflow** - Tasks automatically tracked and documented
5. **OSINT & Corporate Intelligence** - Real-time investigative capabilities
6. **Orbital Operations** - Complete satellite constellation management via Zoe
7. **Wolfram Alpha** - Advanced aerospace calculations on-demand

---

**Last Updated:** November 5, 2025
**Version:** CTAS-7 v7.3 Command Center
**Status:** ✅ Ready for deployment

