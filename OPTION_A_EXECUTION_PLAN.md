# OPTION A: 6.6 → 7.1 Main Ops Rehabilitation - Execution Plan

**Status:** 🚀 READY FOR EXECUTION
**Date:** November 6, 2025
**Strategy:** Use proven CTAS v6.6 as foundation, extract working 7.0 components, build enhanced 7.1

---

## 🎯 **EXECUTIVE SUMMARY**

Based on the **SERVICE_AUDIT_REPORT.md**, we have:

**✅ What Works:**
- **CTAS v6.6** (`ctas6-reference/`) - Complete, stable, working system
- **RepoAgent** - Running with voice integration (port 15180)
- **SurrealDB** - Running in Docker (port 8000)

**❌ What's Broken:**
- **CTAS 7.0 Main Ops** - TypeScript errors, won't start
- **Docker Backend** - All services failing (missing Dockerfiles)
- **Voice Gateway** - Port 19015 down (Neural Mux not running)

**🎯 Solution:**
Start with **stable 6.6 base** → Extract **best 7.0 components** → Create **enhanced 7.1**

---

## 📋 **PHASE 1: AUDIT & INVENTORY** (Complete ✅)

### What We Found:

**CTAS v6.6 Location:**
```
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas6-reference/
```

**Key Features:**
- ✅ React 18 + TypeScript + Vite
- ✅ Mapbox GL (working integration)
- ✅ Supabase, SurrealDB, Sled, SlotGraph
- ✅ HD4 Framework implementation
- ✅ OpenCTI integration
- ✅ All 5 databases connected
- ✅ Neural Mux client (SynaptixCoreClient.ts)
- ✅ Ports 15174 (main), 25174 (alternate)

**CTAS 7.0 Location:**
```
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/
```

**Components to Extract:**
- HFT Engine (`src/services/SlotGraphQueryEngine.ts`, `LegionSlotGraphSchema.ts`)
- Enhanced Mapbox (`src/components/EnhancedMap.tsx`)
- Agent Command Center (`src/components/AgentCommandCenter.tsx`)
- Voice Interface (`src/components/VoiceInterface.tsx`)
- Smart Crates v7.2 integration

---

## 📦 **PHASE 2: EXTRACT 7.0 COMPONENTS** (Next Step)

### Component Extraction Plan:

#### **1. HFT Engine** (High-Frequency Trading/Routing)
```bash
SOURCE: ctas-7.0-main-ops-platform/src/services/
TARGET: ctas7-main-ops-7.1/src/services/hft/

FILES:
- SlotGraphQueryEngine.ts
- LegionSlotGraphSchema.ts
- networkWorldData.ts
- SledKVStore.ts
- GroundstationHFT.ts (if exists)
```

**Port:** 18120 (Groundstations HFT)

#### **2. Enhanced Mapbox Integration**
```bash
SOURCE: ctas-7.0-main-ops-platform/src/components/
TARGET: ctas7-main-ops-7.1/src/components/map/

FILES:
- EnhancedMap.tsx
- CesiumBeamVisualization.tsx (if exists)
- MapControls.tsx
- LayerManager.tsx
```

**Ports:** 18406 (Mapbox service), 28406 (mirror)

#### **3. Agent Command Center**
```bash
SOURCE: ctas-7.0-main-ops-platform/src/components/
TARGET: ctas7-main-ops-7.1/src/components/agents/

FILES:
- AgentCommandCenter.tsx (665 lines - already audited)
- AIAgentInterface.tsx
- VoiceInterface.tsx (9590 bytes)
```

**Ports:** 15180 (RepoAgent), 19015 (Voice Gateway)

#### **4. PubSub Messaging System**
```bash
SOURCE: ctas-7.0-main-ops-platform/src/services/
TARGET: ctas7-main-ops-7.1/src/services/pubsub/

FILES:
- pubsub-core.ts
- database_pubsub.ts (Rust bridge)
```

**Port:** 18202 (PubSub Core)

#### **5. Smart Crates v7.2 Integration**
```bash
SOURCE: ctas-7.0-main-ops-platform/src/components/
TARGET: ctas7-main-ops-7.1/src/components/smartcrates/

FILES:
- SmartCrateControl.tsx
- SmartCrateDeployment.tsx
- CTASCrateManagement.tsx
```

---

## 🏗️ **PHASE 3: BUILD 7.1 ENHANCED FRONTEND**

### Directory Structure:

```
ctas7-main-ops-7.1/
├── src/
│   ├── components/
│   │   ├── agents/                    # From 7.0
│   │   │   ├── AgentCommandCenter.tsx
│   │   │   ├── VoiceInterface.tsx
│   │   │   └── AIAgentInterface.tsx
│   │   ├── map/                       # From 7.0 (Enhanced)
│   │   │   ├── EnhancedMap.tsx
│   │   │   ├── CesiumBeamVisualization.tsx
│   │   │   └── MapControls.tsx
│   │   ├── smartcrates/               # From 7.0
│   │   │   ├── SmartCrateControl.tsx
│   │   │   └── SmartCrateDeployment.tsx
│   │   └── [6.6 base components]/     # From v6.6
│   │       ├── Dashboard.tsx
│   │       ├── HD4Framework.tsx
│   │       └── Navigation.tsx
│   ├── services/
│   │   ├── hft/                       # From 7.0 (NEW)
│   │   │   ├── SlotGraphQueryEngine.ts
│   │   │   ├── LegionSlotGraphSchema.ts
│   │   │   └── GroundstationHFT.ts
│   │   ├── pubsub/                    # From 7.0 (NEW)
│   │   │   └── pubsub-core.ts
│   │   ├── canonical/                 # NEW - Backend integration
│   │   │   ├── CanonicalBackendClient.ts
│   │   │   ├── SynaptixCoreClient.ts
│   │   │   └── PortManagerClient.ts
│   │   └── [6.6 base services]/       # From v6.6
│   │       ├── dataLoader.ts
│   │       ├── mongoClient.ts
│   │       └── neo4jClient.ts
│   ├── config/
│   │   └── canonical-backend.ts       # NEW - All correct ports
│   └── [6.6 base structure]/          # From v6.6
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── public/                             # From v6.6
├── Dockerfile                          # NEW
├── docker-compose.yml                  # NEW
├── package.json                        # Merged 6.6 + 7.0 deps
├── vite.config.ts                      # From v6.6
├── tailwind.config.js                  # From v6.6
└── tsconfig.json                       # From v6.6
```

---

## 🔌 **PHASE 4: CANONICAL BACKEND INTEGRATION**

### Create Backend Client Configuration:

**File:** `src/config/canonical-backend.ts`

```typescript
// Canonical Backend Configuration for CTAS 7.1
// Based on docker-compose.canonical-backend.yml

export const CanonicalBackendConfig = {
  // Real Port Manager (Service Discovery)
  portManager: {
    url: 'http://localhost:18103',
    healthEndpoint: '/health',
    registryEndpoint: '/registry',
  },

  // Synaptix Core (Main API Gateway)
  synaptixCore: {
    apiGateway: 'http://localhost:8080',
    foundationCrates: 'http://localhost:8081',
    healthEndpoint: '/health',
  },

  // Neural Mux (AI Multiplexer + Voice Gateway)
  neuralMux: {
    grpcPort: 50051,
    grpcWebPort: 15001,
    voiceGateway: 'http://localhost:19015',
    healthEndpoint: '/health',
  },

  // Memory Mesh v2.0 RC1
  memoryMesh: {
    sledis: {
      redis: 'redis://localhost:19014',  // Redis protocol
      grpc: 'http://localhost:20014',    // gRPC health check
    },
    contextMesh: 'http://localhost:19011',
    atomicClipboard: 'http://localhost:19012',
    thalamicFilter: 'http://localhost:19013',
  },

  // Databases
  databases: {
    surrealdb: 'http://localhost:8000',
    databaseBridge: 'http://localhost:8005',
  },

  // RepoAgent (Currently Running)
  repoAgent: {
    gateway: 'http://localhost:15180',
    agentMesh: {
      cove: 50052,
      natasha: 50053,
      hayes: 50055,
    },
    voiceEnabled: true,
  },

  // HFT Engine (From 7.0)
  hftEngine: {
    groundstations: 'http://localhost:18120',
    hftNetwork: 'hft_network', // SurrealDB table
  },

  // PubSub Core (From 7.0)
  pubsub: {
    core: 'http://localhost:18202',
  },

  // Mapbox Service (From 7.0)
  mapbox: {
    service: 'http://localhost:18406',
    mirror: 'http://localhost:28406',
  },
};

// Health Check System
export const checkCanonicalBackendHealth = async () => {
  const services = [
    { name: 'Real Port Manager', url: CanonicalBackendConfig.portManager.url },
    { name: 'Synaptix Core', url: CanonicalBackendConfig.synaptixCore.apiGateway },
    { name: 'SurrealDB', url: CanonicalBackendConfig.databases.surrealdb },
    { name: 'RepoAgent', url: CanonicalBackendConfig.repoAgent.gateway },
  ];

  const results = await Promise.allSettled(
    services.map(async (service) => {
      const response = await fetch(`${service.url}/health`);
      return { ...service, status: response.ok ? 'healthy' : 'unhealthy' };
    })
  );

  return results;
};
```

---

## 🐳 **PHASE 5: CONTAINERIZATION**

### Dockerfile for 7.1 Frontend:

**File:** `ctas7-main-ops-7.1/Dockerfile`

```dockerfile
# CTAS 7.1 Enhanced Frontend - Multi-stage Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.ts tsconfig.json tailwind.config.js postcss.config.js ./

# Build production bundle
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 15174 25174

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose for Full Stack:

**File:** `ctas7-main-ops-7.1/docker-compose.yml`

```yaml
version: '3.8'

services:
  # ===== CTAS 7.1 Frontend =====
  ctas7-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ctas7-main-ops-7.1
    ports:
      - "15174:80"     # Primary port
      - "25174:80"     # Mirror port
    environment:
      - NODE_ENV=production
      # Backend integration
      - VITE_PORT_MANAGER_URL=http://ctas7-real-port-manager:18103
      - VITE_SYNAPTIX_CORE_URL=http://ctas7-synaptix-core:8080
      - VITE_NEURAL_MUX_URL=http://ctas7-neural-mux:50051
      - VITE_REPOAGENT_URL=http://host.docker.internal:15180
      - VITE_SURREALDB_URL=http://ctas7-surrealdb:8000
      # Feature flags
      - VITE_ENABLE_HFT=true
      - VITE_ENABLE_VOICE=true
      - VITE_ENABLE_SMART_CRATES=true
    networks:
      - ctas7-network
    depends_on:
      - ctas7-surrealdb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # ===== SurrealDB (Already Working) =====
  ctas7-surrealdb:
    image: surrealdb/surrealdb:latest
    container_name: ctas7-surrealdb
    command: start --log info --user root --pass root
    ports:
      - "8000:8000"
    volumes:
      - surrealdb-data:/data
    networks:
      - ctas7-network
    restart: unless-stopped

networks:
  ctas7-network:
    driver: bridge

volumes:
  surrealdb-data:
```

---

## 🚀 **PHASE 6: EXECUTION STEPS**

### Step 1: Create 7.1 Directory Structure

```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging

# Create new 7.1 directory
mkdir ctas7-main-ops-7.1
cd ctas7-main-ops-7.1

# Copy 6.6 base
cp -r ../ctas6-reference/* .

# Remove old build artifacts
rm -rf node_modules dist .next
```

### Step 2: Extract 7.0 Components

```bash
# Create new directories
mkdir -p src/components/agents
mkdir -p src/components/smartcrates
mkdir -p src/services/hft
mkdir -p src/services/pubsub
mkdir -p src/services/canonical
mkdir -p src/config

# Copy from 7.0 Main Ops
cp ../ctas-7.0-main-ops-platform/src/components/AgentCommandCenter.tsx src/components/agents/
cp ../ctas-7.0-main-ops-platform/src/components/VoiceInterface.tsx src/components/agents/
cp ../ctas-7.0-main-ops-platform/src/components/AIAgentInterface.tsx src/components/agents/
cp ../ctas-7.0-main-ops-platform/src/components/EnhancedMap.tsx src/components/map/
cp ../ctas-7.0-main-ops-platform/src/components/SmartCrateControl.tsx src/components/smartcrates/

# Copy HFT services
cp ../ctas-7.0-main-ops-platform/src/services/SlotGraphQueryEngine.ts src/services/hft/
cp ../ctas-7.0-main-ops-platform/src/services/LegionSlotGraphSchema.ts src/services/hft/
cp ../ctas-7.0-main-ops-platform/src/services/networkWorldData.ts src/services/hft/
cp ../ctas-7.0-main-ops-platform/src/services/SledKVStore.ts src/services/hft/
```

### Step 3: Merge Dependencies

```bash
# Review and merge package.json dependencies
# Keep 6.6 base, add 7.0 enhancements:
# - Keep: react@18.2.0, vite, typescript, mapbox-gl
# - Add from 7.0: any new HFT/Voice dependencies
```

### Step 4: Create Backend Integration

```bash
# Create canonical backend client
cat > src/config/canonical-backend.ts << 'EOF'
[Copy the CanonicalBackendConfig code from above]
EOF

# Create backend clients
cat > src/services/canonical/CanonicalBackendClient.ts << 'EOF'
// Client implementation for canonical backend
export class CanonicalBackendClient {
  // Implementation
}
EOF
```

### Step 5: Fix TypeScript Errors

```bash
# Run type checking
npm run type-check

# Fix import paths
# Fix type definitions
# Update component interfaces
```

### Step 6: Test Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Should start on port 5173 (Vite default)
# Test connection to:
# - SurrealDB (8000) ✅ Working
# - RepoAgent (15180) ✅ Working
# - Other services (pending)
```

### Step 7: Containerize

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
[Copy Dockerfile from above]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
[Copy docker-compose.yml from above]
EOF

# Build and test
docker-compose build
docker-compose up -d
docker-compose ps
```

### Step 8: Fix Voice Integration

```bash
# Voice requires Neural Mux on port 19015
# For now, point to RepoAgent's voice endpoint (15180)
# Update src/config/canonical-backend.ts:

neuralMux: {
  voiceGateway: 'http://localhost:15180/voice',  # Use RepoAgent temporarily
}
```

---

## ✅ **SUCCESS CRITERIA**

### Phase 2-3 Complete When:
- ✅ All 7.0 components extracted to new 7.1 directory
- ✅ 6.6 base preserved and working
- ✅ Directory structure organized
- ✅ `package.json` merged successfully

### Phase 4-5 Complete When:
- ✅ Backend client configuration created
- ✅ TypeScript compiles with no errors
- ✅ Dev server starts successfully
- ✅ Connects to SurrealDB and RepoAgent

### Phase 6 Complete When:
- ✅ Frontend containerized and running
- ✅ Accessible on ports 15174 and 25174
- ✅ All 7.0 enhancements integrated
- ✅ Voice working (via RepoAgent)
- ✅ Mapbox rendering correctly
- ✅ Agent Command Center functional

---

## 🎯 **NEXT IMMEDIATE ACTIONS**

1. **Execute Step 1-2:** Create directory and copy 6.6 base
2. **Execute Step 2:** Extract 7.0 components
3. **Execute Step 3:** Merge dependencies
4. **Execute Step 4:** Create backend integration
5. **Execute Step 5:** Fix TypeScript errors
6. **Execute Step 6:** Test locally
7. **Execute Step 7:** Containerize
8. **Execute Step 8:** Test voice integration

---

## 📊 **EXPECTED TIMELINE**

- **Phase 2-3 (Directory Setup & Extraction):** 30 minutes
- **Phase 4 (Backend Integration):** 45 minutes
- **Phase 5 (TypeScript Fixes):** 1 hour
- **Phase 6 (Local Testing):** 30 minutes
- **Phase 7 (Containerization):** 30 minutes
- **Phase 8 (Voice Integration):** 30 minutes

**Total:** ~4 hours to fully operational CTAS 7.1

---

## 🚨 **RISK MITIGATION**

### If TypeScript Errors are Extensive:
- Start with `// @ts-nocheck` on problematic files
- Fix incrementally
- Don't block deployment for non-critical type errors

### If Docker Build Fails:
- Test frontend locally first (works without Docker)
- Deploy as native Node.js app temporarily
- Fix Docker issues incrementally

### If Voice Integration Fails:
- Fall back to RepoAgent voice endpoints (already working)
- Neural Mux voice gateway can be fixed later
- Voice is enhancement, not blocker

---

**Status:** 🟢 READY TO EXECUTE
**Owner:** Claude
**Next Step:** Create `ctas7-main-ops-7.1` directory and begin extraction
