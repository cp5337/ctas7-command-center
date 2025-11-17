# CTAS-7 Graph Algorithms Quick Reference

## At a Glance

**Total Verified Implementations**: 12  
**Documented Algorithms**: 10 production + 2 stubs  
**Languages Used**: TypeScript, SQL, Rust  
**Core Domains**: HFT Routing, Geolocation Navigation, GNN Analysis  

---

## Implementation Locations

### HFT Network Routing (TypeScript)
**File**: `src/services/SlotGraphQueryEngine.ts`
- **Dijkstra's Algorithm** (Lines 191-332) - Multi-criteria shortest path
- **BFS** (Lines 125-188) - All-paths finding up to hop limit
- **Articulation Points** (Lines 582-589) - STUB (Tarjan's algorithm planned)

### Geolocation Routing (PostgreSQL/PostGIS)
**File**: `ctas-7-shipyard-staging/ctas7-enhanced-geolocation/schema/enhanced_routing.sql`
- **A* Pathfinding** (Lines 137-186) - Terrain + Risk + Intelligence aware
- **Dijkstra's** (Lines 217-266) - Three variants (FASTEST/SAFEST/BALANCED)
- **Cost Recomputation** (Lines 101-135) - Dynamic parameter tuning
- **Slope Penalty** (Lines 32-43) - Terrain cost transformation

### Graph Neural Network (Rust)
**File**: `ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`
- **Dijkstra's** (Lines 179-196) - All-pairs shortest path
- **Connected Components** (Lines 150-151) - Network connectivity analysis
- **Degree Centrality** (Lines 162-177) - Critical node identification
- **Clustering Coefficient** (Lines 256-274) - Network cliquiness (simplified)
- **Community Detection** (Lines 230-254) - Cluster grouping (simulated)

### GNN Integration (Python)
**File**: `HOLD DURING REORG/nyx-trace-6-6-ACTIVE-MAIN/gnn_integration.py`
- Integration framework (not algorithm implementations)

---

## Quick Algorithm Reference

| Algorithm | Implementation | Complexity | Best For |
|-----------|-----------------|-----------|----------|
| **Dijkstra** | 3 places | O(V²) to O(E log V) | Single-source shortest path |
| **BFS** | TypeScript | O(V + E) | Multi-path exploration |
| **A*** | SQL | O((E + V log V)) | Geographic pathfinding |
| **Connected Components** | Rust | O(V + E) | Network fragmentation analysis |
| **Degree Centrality** | Rust | O(V) | Identify hub nodes |
| **Cost Recomputation** | SQL | O(E) | Dynamic re-weighting |

---

## Constraints & Optimizations

### HFT Routing Constraints
- **Latency**: max_latency_ms
- **Reliability**: minReliability (0-1)
- **Bandwidth**: minBandwidth (Gbps)
- **Encryption**: QKD capability required
- **Weather**: Impact factor multiplier

### Geolocation Constraints
- **Terrain**: Slope-based penalties (0.0 to 6.0x)
- **Risk**: Checkpoint + POI intelligence
- **Darkness**: Night mode penalty (2.0x default)
- **Parameters**: Tunable alpha/beta/gamma weights

---

## Critical Implementation Details

### Dijkstra's (TypeScript/HFT)
```
Cost = latency_ms + (1000/bandwidth) + ((1-reliability)*100) + ((1-weather_impact)*50)
```

### A* (SQL/Geolocation)
```
cost = time_cost + risk_cost + slope_cost
with Euclidean distance heuristic
```

### Degree Centrality (Rust/GNN)
```
Critical threshold: centrality > 0.3 (30% of possible connections)
```

### Cost Recomputation (SQL)
```
composite_cost = time_cost + alpha*risk + beta*slope + gamma*darkness
```

---

## Known Gaps

| Missing | Expected Location | Status |
|---------|------------------|--------|
| Betweenness Centrality | Python/MODULARIZATION_STRATEGY.md | Design only |
| Articulation Points | TypeScript/SlotGraphQueryEngine | Stub only |
| Modularity Calculation | Rust/GNN | Not found |
| Topological Sort | Not found | Unimplemented |
| Minimum Spanning Tree | Not found | Unimplemented |
| Maximum Flow | Not found | Unimplemented |

---

## Files for Deep Dive

1. **SlotGraphQueryEngine.ts** - Start here for HFT routing logic
2. **enhanced_routing.sql** - Geographic pathfinding with terrain
3. **gnn_integration.rs** - Network analysis metrics
4. **MODULARIZATION_STRATEGY.md** - Architectural plans and refactoring roadmap

---

**Last Updated**: 2025-11-12
**Status**: Verified implementations only (no speculation)
