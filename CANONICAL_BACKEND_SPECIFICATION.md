# CTAS-7 CANONICAL BACKEND SPECIFICATION

**Date**: November 3, 2025  
**Status**: AUTHORITATIVE - DO NOT MODIFY  
**Purpose**: Preserve the working backend architecture

---

## 🧠 CANONICAL BACKEND STACK

This is the **authoritative backend** that MUST be preserved. All frontends (6.6, 7.0, 7.1) should connect to these ports.

**IMPORTANT**: "Main ops" refers to **CTAS (Convergent Threat Analysis System)** - the primary operational world this backend serves.

### **🚀 Core Infrastructure Services (Reserved)**

- **🛡️ Real Port Manager** - Port **18103** (Source of truth for all ports)
- **📊 Statistical Analysis** - Port **18108** (Reserved)
- **🎯 Tactical Operations** - Port **18111** (Reserved)

### **🛰️ Orbital Services Block (18120-18139)**

- **🌍 Groundstations HFT** - Port **18120**
- **🚀 Orbital Mechanics** - Port **18121**
- **📍 Enhanced Geolocation** - Port **18122**
- **📡 Orbital Ingest** - Port **18123**
- **🔴 Laserlight Constellation** - Port **18124**
- **💫 MCP Laser Light** - Port **18125**
- **🌉 Space World Foundation Bridge** - Port **18126**

### **🗄️ Database Layer (CRITICAL - DO NOT BREAK)**

- **💾 SurrealDB** - Port **8000** (Document + SVM Storage)
- **🌉 Database Bridge** - Port **8005** (Supabase/Sled/SurrealDB coordinator)
- **🗄️ Sledis Cache** - Port **19014** (Redis protocol + Memory Mesh v2.0 RC1)
- **🏥 Sledis gRPC Health** - Port **20014** (Health monitoring)
- **📊 Supabase Integration** - Via Database Bridge (8005)
- **🔧 Sled Embedded DB** - Via Database Bridge (8005)

### **🎮 Orchestration Layer**

- **🎮 Legion ECS** - Port **8006** (60Hz Multi-World Entity System)
- **📡 SlotGraph** - Port **8007** (259 Ground Stations Task Orchestration)

### **🧠 Neural Mux Layer (gRPC + Atomic Clipboard)**

- **🧠 Neural Mux Core** - Port **50051** (Updated gRPC + Atomic Clipboard Intelligence)
- **🌐 gRPC Web Bridge** - Port **15001**
- **SDIO Discovery** - Ports **50051-50055**

### **⚡ Synaptix Core Integration (Updated)**

- **🔧 Synaptix Core API Gateway** - Port **8080** (Main API orchestration)
- **🧠 Foundation Crates Integration Hub** - Port **8081** (Smart Crates coordination)
- **📋 Memory Mesh v2.0 RC1** - Port **19014** (via Sledis)
- **🔗 Context Mesh** - Port **19011** (Neural context coordination)
- **📎 Atomic Clipboard** - Port **19012** (Cross-system data coordination)
- **🎤 Voice Gateway** - Port **19015** (Voice-driven orchestration)

**Foundation Crates Bridge Points:**

- **Real Port Manager** (18103) ← Authoritative source for all port allocations
- **Enhanced Geolocation** (18122) ← Spatial intelligence coordination
- **Layer2 Mathematical Intelligence** (TBD) ← Advanced computation layer
- **Network World Bridge** (TBD) ← Cyber intelligence integration
- **Space World Bridge** (18126) ← Orbital mechanics coordination

---

## 🔧 STARTUP SEQUENCE

1. **Start Real Port Manager** (18103) - Source of truth
2. **Start Synaptix Core** (Docker containers 8000-8080)
3. **Start Neural Mux** (50051) with Atomic Clipboard
4. **Start Memory Mesh v2.0 RC1** (19011-19016)
5. **Start Orbital Services** (18120-18139)
6. **Frontend connects to these ports** - NO MORE 5173/5174 confusion

---

## ⚠️ CRITICAL PRESERVATION NOTES

- **Port Manager (18103)** is the authoritative source for all port allocations
- **Database Bridge (8005)** coordinates ALL database access
- **Neural Mux (50051)** includes updated gRPC + Atomic Clipboard
- **Sledis (19014)** is part of Memory Mesh v2.0 RC1
- **This backend CANNOT be corrupted** - it's the canonical foundation

---

## 🎯 FRONTEND INTEGRATION

Any frontend (6.6, 7.0, 7.1) should:

1. Connect to **Neural Mux (50051)** for AI services
2. Use **Database Bridge (8005)** for all data operations
3. Query **Port Manager (18103)** for service discovery
4. Access **Synaptix Core (8080)** for foundation services

**NO MORE DEV PORTS 5173/5174** - Use this canonical backend!
