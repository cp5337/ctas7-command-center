# CTAS-7 Frontend Promotion: 6.6 → 7.1 Migration Plan

## Executive Summary

Promote a proven **6.6 frontend** to **7.1** by integrating key components from the 7.0 Main Ops platform while maintaining stability and connecting to the canonical backend.

## 🎯 **Key Components to Extract from 7.0**

### **1. High Frequency Trading (HFT) Engine**

```typescript
// Location: ctas-7.0-main-ops-platform/src/services/
// Port: 18120 (Groundstations HFT)

interface HFTEngine {
  // Ground station HFT routing
  groundstations_hft: GroundstationHFT;

  // SurrealDB HFT network
  hft_network_db: "hft_network";

  // Slot graph integration
  slot_graph_query: SlotGraphQueryEngine;

  // Layer 2 microkernel routing
  hft_router: Layer2HFTRouter;
}

// Key files to extract:
// - src/services/SlotGraphQueryEngine.ts (HFT network queries)
// - src/services/LegionSlotGraphSchema.ts (HFT schema)
// - src/services/networkWorldData.ts (HFT routing calculations)
// - src/services/SledKVStore.ts (High-performance HFT transactions)
```

### **2. Synaptix Integration (Not Synaptix19, but Synaptix Core)**

```typescript
// Canonical Backend Integration
// Port: 8080 (Synaptix Core API Gateway)

interface SynaptixCoreIntegration {
  api_gateway: "http://localhost:8080";
  foundation_crates_hub: "http://localhost:8081";

  // Foundation crates coordination
  real_port_manager: "http://localhost:18103";
  neural_mux: "http://localhost:50051";
  memory_mesh: "http://localhost:19014";
}
```

### **3. Pub/Sub Messaging System**

```typescript
// Location: ctas-7.0-main-ops-platform/REPO_PROMPT.md mentions PubSub
// Integration with ABE Terraform (Google PubSub)

interface PubSubIntegration {
  // Real-time communication
  pubsub_core: "ctas-pubsub-core";
  port: 18202; // From CTASCrateManagement

  // ABE Terraform integration
  google_pubsub: {
    publisher: "roles/pubsub.publisher";
    subscriber: "roles/pubsub.subscriber";
  };

  // Real-time database events
  database_pubsub: "database_pubsub.rs";
}
```

### **4. Working Mapbox Integration**

```typescript
// Location: ctas-7.0-main-ops-platform/src/pages/Map.tsx
// Proven working Mapbox + Deck.GL integration

interface MapboxIntegration {
  // Enhanced map with Smart Crates
  enhanced_map: EnhancedMap;

  // Cesium 3D integration
  cesium_beams: CesiumBeamVisualization;

  // Smart Crates v7.2 integration
  smart_crates_version: "7.2";

  // Port integration
  mapbox_service: 18406;
  mapbox_mirror: 28406;
}
```

## 🏗️ **6.6 → 7.1 Promotion Architecture**

### **Phase 1: Base 6.6 Container Setup**

```dockerfile
# Dockerfile.frontend-6.6-base
FROM node:18-alpine

WORKDIR /app

# Copy 6.6 stable frontend
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 6.6 proven configuration
COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000
CMD ["npm", "start"]
```

### **Phase 2: 7.1 Enhancement Layer**

```typescript
// frontend-7.1-enhancements/
├── src/
│   ├── services/
│   │   ├── HFTEngine.ts              // From 7.0 Main Ops
│   │   ├── SynaptixCoreClient.ts     // Canonical backend integration
│   │   ├── PubSubMessaging.ts        // Real-time messaging
│   │   └── CanonicalBackendClient.ts // Port manager integration
│   ├── components/
│   │   ├── EnhancedMapbox.tsx        // From 7.0 Main Ops
│   │   ├── HFTDashboard.tsx          // HFT visualization
│   │   ├── SmartCratesControl.tsx    // Smart crates integration
│   │   └── PlaybookAgentDesigner.tsx // Agent development tools
│   └── config/
│       └── canonical-backend.ts      // All correct ports (18103, 8080, etc.)
```

### **Phase 3: Container Orchestration**

```yaml
# docker-compose.frontend-7.1.yml
version: "3.8"

services:
  # 6.6 base frontend container
  ctas7-frontend-6.6-base:
    build:
      context: ./frontend-6.6-base
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_BASE=http://localhost:8080

  # 7.1 enhanced frontend with 7.0 components
  ctas7-frontend-7.1-enhanced:
    build:
      context: ./frontend-7.1-enhanced
      dockerfile: Dockerfile
    ports:
      - "3001:3000" # Alternative port
    environment:
      - NODE_ENV=production
      # Canonical backend integration
      - REACT_APP_PORT_MANAGER=http://localhost:18103
      - REACT_APP_SYNAPTIX_CORE=http://localhost:8080
      - REACT_APP_NEURAL_MUX=http://localhost:50051
      - REACT_APP_HFT_ENGINE=http://localhost:18120
      - REACT_APP_PUBSUB_CORE=http://localhost:18202
      - REACT_APP_MAPBOX_SERVICE=http://localhost:18406
    depends_on:
      - ctas7-canonical-backend
```

## 🚀 **Implementation Steps**

### **Step 1: Extract 7.0 Components**

1. **Copy HFT Engine files** from 7.0 Main Ops
2. **Extract Mapbox integration** (EnhancedMap, CesiumBeamVisualization)
3. **Copy Smart Crates integration** (v7.2 components)
4. **Extract PubSub messaging** system

### **Step 2: Create 6.6 Base Container**

1. **Find working 6.6 frontend** in workspace
2. **Containerize 6.6** as stable base
3. **Test 6.6 container** independently
4. **Verify port connections** to canonical backend

### **Step 3: Build 7.1 Enhancement Layer**

1. **Integrate extracted 7.0 components**
2. **Connect to canonical backend ports**:
   - Real Port Manager (18103)
   - Synaptix Core (8080)
   - Neural Mux (50051)
   - HFT Engine (18120)
   - PubSub Core (18202)
3. **Test component integration**
4. **Verify Mapbox functionality**

### **Step 4: Playbook & Agent Development**

1. **Agent Design Studio integration**
2. **Playbook development interface**
3. **Smart Crates on-demand deployment**
4. **ABE IAC integration points**

## 🎯 **Expected Outcomes**

### **Stable Foundation**

- ✅ **6.6 proven base** - no "lost frontend" issues
- ✅ **Container isolation** - frontend protected from backend changes
- ✅ **Working Mapbox** - proven GIS visualization

### **Enhanced Capabilities**

- ✅ **HFT Engine** - high-frequency trading and routing
- ✅ **Synaptix Core** - foundation crates integration
- ✅ **PubSub Messaging** - real-time communication
- ✅ **Smart Crates v7.2** - on-demand deployment

### **Development Ready**

- ✅ **Playbook development** - tactical operations design
- ✅ **Agent development** - intelligent automation
- ✅ **ABE IAC integration** - infrastructure as code
- ✅ **Ground station simulation** - 257 station testing

## 🔧 **Should I Start Implementation?**

1. **Find and containerize 6.6 base** - locate working 6.6 frontend
2. **Extract 7.0 components** - HFT, Mapbox, PubSub, Smart Crates
3. **Create 7.1 container** - enhanced frontend with canonical backend
4. **Test integration** - verify all components work together

This approach gives you a **proven stable base (6.6)** plus the **best components from 7.0** connected to your **preserved canonical backend** - perfect for developing playbooks and agents!

Ready to start? Where should I look for the 6.6 frontend to use as the base?
