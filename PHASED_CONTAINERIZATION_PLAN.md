# CTAS-7 Phased Containerization & Voice Integration Plan

**Date:** November 3, 2025  
**Priority:** DevSecOps → Main Ops → Archive Integration  
**Status:** 🚀 **DEPLOYMENT READY**

---

## 📋 **PHASE 1: CORE BACKEND CONTAINERIZATION (IMMEDIATE)**

### **Canonical Backend Services**

✅ **Already Documented:**

- `docker-compose.canonical-backend.yml` (ports 15170-15179)
- `start-canonical-backend-docker.sh`
- Real Port Manager, Synaptix Core, Neural Mux, Sledis

### **Action Items:**

1. **Start Canonical Backend:**

   ```bash
   cd /Users/cp5337/Developer/ctas7-command-center
   ./start-canonical-backend-docker.sh
   ```

2. **Verify Services:**
   ```bash
   # Check all services are running
   docker ps
   curl http://localhost:15173/health  # Real Port Manager
   curl http://localhost:15174/health  # Synaptix Core
   ```

---

## 📋 **PHASE 2: MAIN OPS PLATFORM CONTAINERIZATION**

### **Main Ops Frontend (7.0 → 7.1)**

**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/`

**Create Main Ops Docker Setup:**

```dockerfile
# ctas-7.0-main-ops-platform/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 15173
CMD ["npm", "start"]
```

**Main Ops Compose Integration:**

```yaml
# docker-compose.main-ops.yml
version: "3.8"

services:
  main-ops-frontend:
    build: ../ctas-7-shipyard-staging/ctas-7.0-main-ops-platform
    ports:
      - "15173:15173"
    environment:
      - VITE_BACKEND_URL=http://localhost:15174
      - VITE_NEURAL_MUX_URL=http://localhost:15175
    depends_on:
      - canonical-backend
    networks:
      - ctas-network

networks:
  ctas-network:
    external: true
```

---

## 📋 **PHASE 3: COMMAND CENTER CONTAINERIZATION**

### **Command Center Frontend (Development)**

**Location:** `/Users/cp5337/Developer/ctas7-command-center/`

**Command Center Docker Setup:**

```dockerfile
# ctas7-command-center/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 15180
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "15180"]
```

**Command Center Compose Integration:**

```yaml
# docker-compose.command-center.yml
version: "3.8"

services:
  command-center-frontend:
    build: .
    ports:
      - "15180:15180"
    environment:
      - VITE_BACKEND_URL=http://localhost:15174
      - VITE_NEURAL_MUX_URL=http://localhost:15175
      - VITE_VOICE_ENABLED=true
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    depends_on:
      - canonical-backend
    networks:
      - ctas-network

networks:
  ctas-network:
    external: true
```

---

## 📋 **PHASE 4: AGENT CONTAINERIZATION**

### **24-Agent Orchestration**

**Agents to Containerize:**

- Natasha (Red Team)
- Linear Agent
- OSINT Processors
- Workflow Orchestrators

**Agent Container Template:**

```dockerfile
# agents/Dockerfile.template
FROM rust:1.75-alpine

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

EXPOSE 15190
CMD ["./target/release/agent"]
```

**Agent Compose Services:**

```yaml
# docker-compose.agents.yml
version: "3.8"

services:
  agent-natasha:
    build:
      context: ./agents/natasha
      dockerfile: Dockerfile
    ports:
      - "15190:15190"
    environment:
      - AGENT_ID=natasha
      - BACKEND_URL=http://canonical-backend:15174
    networks:
      - ctas-network

  agent-linear:
    build:
      context: ./agents/linear
      dockerfile: Dockerfile
    ports:
      - "15191:15191"
    environment:
      - AGENT_ID=linear
      - LINEAR_API_KEY=${LINEAR_API_KEY}
    networks:
      - ctas-network
```

---

## 📋 **PHASE 5: VOICE INTEGRATION (COMMAND CENTER FIRST)**

### **Voice Service Container**

```dockerfile
# voice-service/Dockerfile
FROM node:18-alpine

# Install system dependencies for voice processing
RUN apk add --no-cache python3 py3-pip portaudio-dev

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 15185
CMD ["npm", "start"]
```

**Voice Integration in Command Center:**

```yaml
# Add to docker-compose.command-center.yml
voice-service:
  build: ./voice-service
  ports:
    - "15185:15185"
  environment:
    - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
    - AZURE_SPEECH_KEY=${AZURE_SPEECH_KEY}
    - PIPECAT_ENABLED=true
  volumes:
    - ./voice-service/audio:/app/audio
  networks:
    - ctas-network
```

---

## 📋 **PHASE 6: ARCHIVE MANAGER INTEGRATION**

### **CTAS Archive Manager Container**

```dockerfile
# archive-manager/Dockerfile
FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git zip unzip

# Copy archive manager from Desktop
COPY ctas_archive_manager.zip ./
RUN unzip ctas_archive_manager.zip

# Install Python dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

EXPOSE 15195
CMD ["python", "archive_manager.py"]
```

**Archive Integration:**

```yaml
# docker-compose.archive.yml
version: "3.8"

services:
  archive-manager:
    build: ./archive-manager
    ports:
      - "15195:15195"
    environment:
      - ARCHIVE_PATH=/data/archives
      - USIM_ENABLED=true
      - BACKEND_URL=http://canonical-backend:15174
    volumes:
      - /Users/cp5337/Desktop/Organization and archive:/data/archives:ro
      - ./archive-data:/app/data
    networks:
      - ctas-network
```

---

## 🚀 **DEPLOYMENT SEQUENCE**

### **Step 1: Start Backend (Immediate)**

```bash
cd /Users/cp5337/Developer/ctas7-command-center
./start-canonical-backend-docker.sh
```

### **Step 2: Launch Main Ops**

```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform
docker-compose -f docker-compose.main-ops.yml up -d
```

### **Step 3: Launch Command Center**

```bash
cd /Users/cp5337/Developer/ctas7-command-center
docker-compose -f docker-compose.command-center.yml up -d
```

### **Step 4: Deploy Agents**

```bash
docker-compose -f docker-compose.agents.yml up -d
```

### **Step 5: Add Voice (Command Center)**

```bash
# Add voice service to command center
docker-compose -f docker-compose.command-center.yml -f docker-compose.voice.yml up -d
```

### **Step 6: Integrate Archive Manager**

```bash
# Extract and containerize archive manager
cp /Users/cp5337/Desktop/Organization\ and\ archive/ctas_archive_manager.zip ./archive-manager/
docker-compose -f docker-compose.archive.yml up -d
```

---

## 🔌 **PORT ALLOCATION**

| Service           | Port  | Purpose              |
| ----------------- | ----- | -------------------- |
| Real Port Manager | 15173 | Main Ops Frontend    |
| Synaptix Core     | 15174 | Backend API          |
| Neural Mux        | 15175 | Agent Communication  |
| Command Center    | 15180 | Development Frontend |
| Voice Service     | 15185 | Voice Commands       |
| Agent Natasha     | 15190 | Red Team Operations  |
| Agent Linear      | 15191 | Task Management      |
| Archive Manager   | 15195 | Archive Processing   |

---

## 📝 **VERIFICATION CHECKLIST**

### **Backend Health:**

- [ ] Real Port Manager responding on 15173
- [ ] Synaptix Core API on 15174
- [ ] Neural Mux gRPC on 15175
- [ ] All containers in `ctas-network`

### **Frontend Access:**

- [ ] Main Ops accessible at http://localhost:15173
- [ ] Command Center at http://localhost:15180
- [ ] Voice service at http://localhost:15185

### **Agent Communication:**

- [ ] Agents connecting to Neural Mux
- [ ] USIM metadata flowing between services
- [ ] Linear integration working

### **Archive Integration:**

- [ ] Archive manager processing files
- [ ] USIM lifecycle applied to archives
- [ ] Storage tier assignment working

---

## 🎯 **SUCCESS CRITERIA**

1. **Backend Stability:** All canonical services running without restart
2. **Frontend Isolation:** Main Ops and Command Center independent
3. **Agent Orchestration:** 24-agent system operational
4. **Voice DevSecOps:** Command center voice commands working
5. **Archive Processing:** CTAS archive manager integrated with USIM

**Next Phase:** After containerization is stable, move voice integration to Main Ops platform for operational use.
