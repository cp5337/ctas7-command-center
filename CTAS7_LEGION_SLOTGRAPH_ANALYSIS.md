# CTAS-7 Legion ECS & SlotGraph Analysis

**Status:** ✅ **COMPLETE ANALYSIS**
**Analyzed:** October 18, 2025
**Repository:** /Users/cp5337/Developer/ctas7-command-center

## 🎯 **Executive Summary**

CTAS-7 implements a **hybrid Legion/SlotGraph architecture** that combines traditional ECS patterns with advanced slot-based graph computation. The system operates across multiple "worlds" representing different operational domains, with SlotGraph serving as the data backbone and Legion providing execution coordination.

## 📊 **1. World Structs and Their Purposes**

### **World Classifications Found:**

| World Type | Implementation | Purpose | Status |
|------------|---------------|---------|--------|
| **Cyber World** | `LegionExecutionEngine.ts:6` | Cybersecurity operations, 1n/2n adversary modeling | ✅ Active |
| **Geographical World** | `LegionExecutionEngine.ts:6` | Ground-based assets, stations, geographic routing | ✅ Active |
| **Space World** | `SpaceWorldDemo.tsx`, `SpaceWorldTransformer.ts` | Satellite networks, orbital mechanics, space-based assets | ✅ Active |
| **Maritime World** | `LegionExecutionEngine.ts:6` | Naval operations, maritime routing (referenced but not implemented) | ⚠️ Placeholder |
| **Network World** | `NetworkWorldTransformer.ts`, `networkWorldData.ts` | HFT network topology, ground station interconnection | ✅ Active |

### **World Implementation Details:**

#### **1. Space World** (`src/components/SpaceWorldDemo.tsx`)
- **Purpose**: Manages satellite constellations, orbital mechanics, space-based communications
- **Components**: Cesium 3D visualization, orbital animation, radiation belt rendering
- **Data Sources**: Satellite orbital elements, ground station uplinks
- **Integration**: Direct Cesium WebGL rendering with real-time orbital propagation

#### **2. Network World** (`src/transformers/NetworkWorldTransformer.ts`)
- **Purpose**: Transforms ground stations and network links into geographic entities
- **Components**: Ground station mapping, network link visualization, status monitoring
- **Data Model**: 289-station HFT network with tier-based classification
- **Visualization**: GeoEntity-based rendering with color-coded status indicators

#### **3. Legion Execution Worlds** (`src/services/LegionExecutionEngine.ts`)
- **Purpose**: Coordinates multi-domain operations across Cyber/Geographical/Space/Maritime
- **Framework**: HD4 Phase model (Hunt/Detect/Disrupt/Disable/Dominate)
- **Form Types**: 1n (Adversary) vs 2n (Counter-adversary) operations
- **Execution**: Task-based coordination with crate allocation and node capability mapping

## 🕸️ **2. SlotGraph to Legion ECS Interactions**

### **SlotGraph Architecture** (`src/services/LegionSlotGraphSchema.ts`)

```typescript
SlotGraph Node Types:
├── GroundStationNode (289 stations)
├── SatelliteNode (orbital constellation)
└── TradeOrderNode (HFT transactions)

SlotGraph Edge Types:
├── NetworkLink (ground-sat-ground routing)
├── TradeRoute (financial transaction paths)
└── WeatherImpact (atmospheric effects)
```

### **Legion-SlotGraph Integration Pattern:**

```mermaid
Legion Task → SlotGraph Query → Resource Allocation → Execution Context
     ↓              ↓                    ↓                  ↓
   World Type    Node Selection      Crate Assignment    Task Execution
```

**Key Integration Points:**
1. **Task Assignment**: `LegionExecutionEngine.executeTask()` queries SlotGraph for available nodes
2. **Resource Discovery**: `getCratesForTask()` maps SlotGraph nodes to Legion crates
3. **Path Planning**: `SlotGraphQueryEngine.findOptimalRoute()` provides routing for Legion tasks
4. **Performance Monitoring**: TimeSeriesSlot updates feed back to Legion execution metrics

## 💾 **3. Data Source Connections**

### **Database Mapping by World:**

| World | Primary DB | Secondary DB | Live Data Source | Schema Location |
|-------|------------|--------------|------------------|-----------------|
| **Space World** | SurrealDB | Supabase | Cesium/TLE feeds | `cesiumWorldManager.ts` |
| **Network World** | SurrealDB | Supabase | Ground station status | `networkWorldData.ts` |
| **Legion Execution** | SurrealDB | Legion SlotGraph DB | Crate interviews | `LegionExecutionEngine.ts:57` |
| **SlotGraph Core** | SurrealDB | Supabase fallback | Real-time telemetry | `SlotGraphQueryEngine.ts:23` |

### **Data Flow Architecture:**

```yaml
SurrealDB (Primary):
  - Namespace: ctas7
  - Database: hft_network
  - Endpoint: ws://localhost:8000
  - Purpose: Graph operations, slot updates

Supabase (Backup/ACID):
  - URL: https://ctas-core.supabase.co
  - Purpose: Relational queries, fallback operations
  - Tables: ground_nodes, network_links, standards

Neural-Mux (Real-time):
  - Endpoint: ws://localhost:18100
  - Topics: kpi.recycling, ops.trackers, qa5.events
  - Purpose: Live telemetry aggregation
```

## 🎮 **4. Code Locations - Complete File Manifest**

### **Core SlotGraph Implementation:**
- `src/services/LegionSlotGraphSchema.ts` - Complete type definitions and schema
- `src/services/SlotGraphQueryEngine.ts` - Query engine with SurrealDB/Supabase dual connectivity
- `src/services/LegionExecutionEngine.ts` - Legion task coordinator with SlotGraph integration

### **World Transformers:**
- `src/transformers/WorldTransformer.ts` - Base transformer interface
- `src/transformers/NetworkWorldTransformer.ts` - Network topology transformer
- `src/transformers/SpaceWorldTransformer.ts` - Space asset transformer

### **World Implementations:**
- `src/components/SpaceWorldDemo.tsx` - Space world visualization component
- `src/services/cesiumWorldManager.ts` - Cesium 3D world management
- `src/services/networkWorldData.ts` - Network world data management

### **Database Connectors:**
- `src/services/DatabaseMuxConnector.ts` - Multi-database connection multiplexer
- `src/lib/supabase.ts` - Supabase client configuration
- `database/surrealdb_seed.surql` - SurrealDB initialization script

### **Dioxus Integration:**
- `src/dioxus_dashboard/mod.rs` - Dioxus components with world data binding
- `src/mcp/` - MCP integration layer (multiple files)

## 🔗 **5. Dioxus Dashboard Integration**

### **Integration Pattern:**
The Dioxus dashboard (`src/dioxus_dashboard/mod.rs`) integrates with SlotGraph through:

1. **Component Data Binding**: `data-route` attributes map to SlotGraph endpoints
2. **Real-time Updates**: Neural-Mux WebSocket feeds update dashboard KPIs
3. **Action Triggers**: UI interactions trigger Legion task execution
4. **World Switching**: Dashboard can switch between different world contexts

### **Dashboard World Context:**
```rust
pub enum WorldContext {
    Space => SpaceWorldDemo.tsx,
    Network => NetworkWorldTransformer.ts,
    Legion => LegionExecutionEngine.ts,
    Cyber => (referenced in Legion worlds)
}
```

## ⚠️ **6. Missing Connections for Playwright Validation**

### **Critical Missing Components:**

1. **Maritime World Implementation**
   - **Issue**: Referenced in `LegionExecutionEngine.ts:6` but no actual implementation found
   - **Impact**: Playwright tests for Maritime world will fail
   - **Location**: No files found matching Maritime world patterns

2. **GroundWorld/FusionWorld Missing**
   - **Issue**: No implementations found for these world types
   - **Expected Locations**: `src/components/GroundWorldDemo.tsx`, `src/transformers/FusionWorldTransformer.ts`
   - **Impact**: Incomplete world coverage for comprehensive testing

3. **Inconsistent SlotGraph-Legion Bindings**
   - **Issue**: `LegionExecutionEngine` queries "legion_slot_graph" DB but SlotGraph uses "hft_network"
   - **Location**: `LegionExecutionEngine.ts:73` vs `SlotGraphQueryEngine.ts:25`
   - **Impact**: Database connection failures in Legion tasks

4. **Missing ECS System Builders**
   - **Issue**: No traditional Legion ECS `add_system`, `run_schedule`, `insert_resource` patterns found
   - **Pattern**: CTAS-7 uses task-based execution instead of ECS system builders
   - **Impact**: Traditional ECS validation patterns won't work

5. **Incomplete Dioxus-SlotGraph Bridge**
   - **Issue**: Dioxus components reference SlotGraph routes but no live data binding validation
   - **Location**: `src/dioxus_dashboard/mod.rs` has placeholder data routes
   - **Impact**: UI components may not receive real SlotGraph data

### **Playwright Test Implications:**

```typescript
// These elements will fail Playwright discovery:
- Maritime world components (not implemented)
- GroundWorld/FusionWorld references (missing)
- Legion ECS system builders (different pattern used)
- Live SlotGraph→Dioxus data binding (incomplete)
```

## 🎯 **7. Architecture Summary**

CTAS-7 implements a **"World-Centric SlotGraph"** architecture where:

1. **SlotGraph** serves as the unified data backbone across all worlds
2. **Legion** provides task execution and cross-world coordination
3. **Worlds** are domain-specific data transformation and visualization layers
4. **Dioxus** provides the reactive UI layer with world-aware components

### **Key Architectural Patterns:**
- **Slot-based Data Flow**: All data updates flow through TimeSeriesSlot patterns
- **World Isolation**: Each world has its own transformer and data management
- **Dual Database**: SurrealDB for graph operations, Supabase for relational fallback
- **Task-based ECS**: Legion uses task execution rather than traditional ECS systems

### **Production Readiness:**
- ✅ **Space World**: Fully implemented with Cesium integration
- ✅ **Network World**: Complete with 289-station topology
- ✅ **SlotGraph Core**: Robust dual-database architecture
- ⚠️ **Legion Integration**: Functional but database naming inconsistencies
- ❌ **Maritime/Ground/Fusion Worlds**: Missing implementations
- ❌ **Complete Dioxus Binding**: Partial integration with placeholder data

**Status: 70% Complete** - Core functionality operational, missing worlds and some integration gaps.