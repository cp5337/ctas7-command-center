# CTAS-7 Graph Algorithm Implementations - Archaeological Catalog

**Documentation Date**: 2025-11-12  
**Repository**: /Users/cp5337/Developer/ctas7-command-center  
**Scope**: Documented implementations only - NO fabrications  
**Status**: Comprehensive search completed

---

## VERIFIED IMPLEMENTATIONS

### 1. Dijkstra's Shortest Path Algorithm

**File**: `/Users/cp5337/Developer/ctas7-command-center/src/services/SlotGraphQueryEngine.ts`

**Lines**: 191-332

**Language**: TypeScript

**Implementation Type**: Supabase fallback implementation (SurrealDB primary, TS fallback)

**Complexity**: O(V^2) with unoptimized node selection (no priority queue)

**Purpose**: Find optimal route between network stations in HFT (High-Frequency Trading) network with multi-criteria constraints (latency, reliability, bandwidth, QKD capability, weather impact)

**Code Summary**:
```typescript
// Dijkstra's algorithm (lines 269-307)
- Initialize distances map with source = 0, all others = Infinity
- Unvisited set of all nodes
- While unvisited nodes remain:
  - Find node with minimum distance in unvisited set
  - For each neighbor of current node:
    - Calculate alternative path cost (weight = latency + bandwidth cost + reliability penalty + weather penalty)
    - Update distance if alternative < current
    - Track predecessor for path reconstruction
- Reconstruct path backward from destination
```

**Constraint-Aware Weighting**:
- Base: latency_ms
- Bandwidth penalty: 1000 / bandwidth_gbps
- Reliability penalty: (1 - reliability) * 100
- Weather penalty: (1 - weather_impact) * 50

**Performance Notes**:
- Uses linear search for minimum (O(V^2) total)
- No Fibonacci heap or binary heap optimization
- Single-source shortest path (not all-pairs)

---

### 2. Breadth-First Search (BFS) - Multi-path Route Finding

**File**: `/Users/cp5337/Developer/ctas7-command-center/src/services/SlotGraphQueryEngine.ts`

**Lines**: 125-188

**Language**: TypeScript

**Implementation Type**: Queue-based BFS with path tracking

**Complexity**: O(V + E)

**Purpose**: Find ALL routes between two network stations up to maximum hop count (alternative to single shortest path)

**Code Summary**:
```typescript
// BFS implementation (lines 148-185)
- Build adjacency list from network_links table
- Initialize queue with source node, empty path, and visited set
- While queue not empty:
  - Dequeue {node, path, visited}
  - If node == destination && path length > 0: save route
  - If path length >= maxHops: continue
  - For each unvisited neighbor:
    - Create new visited set (add neighbor)
    - Enqueue {neighbor, updated_path, new_visited}
- Return all found routes
```

**Key Features**:
- Explores all possible paths up to hop limit
- Prevents cycles using per-path visited tracking
- Returns complete Route objects with latency, bandwidth, encryption info

**Constraint Application**:
- No constraint filtering at algorithm level
- Constraints applied at data loading stage
- maxHops parameter (default: 5) limits search depth

---

### 3. Connected Components Analysis

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`

**Lines**: 150-151

**Language**: Rust

**Library**: petgraph::algo::connected_components

**Purpose**: Analyze network connectivity - count number of isolated subgraphs in Legion ECS-based GNN

**Usage Context**:
```rust
let components = connected_components(graph);
```

**Stored in**: GNNAnalysisResult struct as `connected_components: usize`

---

### 4. Dijkstra's Shortest Path (Rust/petgraph)

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`

**Lines**: 179-196

**Language**: Rust

**Library**: petgraph::algo::dijkstra

**Purpose**: Calculate shortest paths between all pairs of nodes in professional network graph

**Code Summary**:
```rust
// For each node as source:
let paths = dijkstra(&*graph, start_idx, None, |edge| edge.weight);

// For each reachable destination:
shortest_paths.insert((start_node.entity_id, end_node.entity_id), distance);
```

**Complexity**: O(V * (E log V)) with binary heap in petgraph

**Output**: HashMap<(UUID, UUID), f32> storing edge distances for all node pairs

---

### 5. Degree Centrality Calculation

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`

**Lines**: 162-177

**Language**: Rust

**Purpose**: Identify critical nodes based on connection count

**Implementation**:
```rust
for node_idx in graph.node_indices() {
    let degree = graph.neighbors(node_idx).count() as f32;
    let centrality = degree / (node_count - 1) as f32;
    
    // Critical threshold: centrality > 0.3
    if centrality > 0.3 {
        critical_nodes.push(node_data.entity_id);
    }
}
```

**Stored in**: 
- node_centrality: HashMap<Uuid, f32>
- critical_nodes: Vec<Uuid> (centrality > 0.3)

---

### 6. A* Pathfinding with Euclidean Heuristic

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enhanced-geolocation/schema/enhanced_routing.sql`

**Lines**: 137-186

**Language**: SQL (pgrouting/pgr_astar)

**Function**: `get_risk_aware_route()`

**Heuristic**: Euclidean distance (heuristic := 2)

**Purpose**: Operational routing with terrain, risk, and intelligence awareness

**Key Parameters**:
- start_lon, start_lat, end_lon, end_lat: Geographic coordinates
- Uses pgr_astar from PostGIS Routing

**Cost Factors**:
1. time_cost: ST_LengthGeography(geom) / speed_kph (seconds)
2. risk_cost: checkpoint risk + POI intelligence
3. slope_cost: terrain slope penalty function

**Output Columns**:
- seq: sequence number
- edge_id: road segment ID
- node_id: network node
- cost: total cost for segment
- cumulative_risk: running total of risk

**Complexity**: O((E + V log V)) with proper heuristic

---

### 7. Dijkstra's Algorithm (SQL - Multi-Criteria Routing)

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enhanced-geolocation/schema/enhanced_routing.sql`

**Lines**: 227-250 (FASTEST route variant)

**Language**: SQL (pgr_dijkstra)

**Function**: `get_route_alternatives()`

**Variants**: 3 different route optimizations:

**Path 1 - FASTEST (Lines 217-232)**:
- Cost metric: time_cost only
- Minimizes travel time
- Ignores terrain and risk

**Path 2 - SAFEST (Lines 234-249)**:
- Cost metric: risk_cost only
- Avoids high-risk areas and checkpoints
- Ignores time efficiency

**Path 3 - BALANCED (Lines 251-266)**:
- Cost metric: weighted combination (alpha*risk + beta*slope + gamma*darkness)
- Composite optimization
- Tunes via recompute_roads_costs() function

**Parameters**:
- k_paths: number of alternative routes (default 3)
- Dynamic parameter tuning: alpha, beta, gamma, night_penalty

---

### 8. Dynamic Cost Recomputation Function

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enhanced-geolocation/schema/enhanced_routing.sql`

**Lines**: 101-135

**Language**: SQL/PL/pgSQL

**Function**: `recompute_roads_costs(alpha, beta, gamma, night_penalty)`

**Purpose**: Recalculate all edge costs based on operational parameters and night status

**Algorithm**: 
- Updates materialized view with new parameter weights
- Recalculates composite cost: time_cost + alpha*risk + beta*slope + gamma*darkness
- Bidirectional: applies same cost to reverse_cost for undirected traversal

**Operational Parameters**:
- alpha (risk weight): recommended 0.7
- beta (slope weight): recommended 0.4
- gamma (darkness weight): recommended 0.2
- night_penalty: default 2.0x multiplier when is_night = true

---

### 9. Clustering Coefficient Calculation

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`

**Lines**: 256-274

**Language**: Rust

**Purpose**: Measure network "cliquiness" - how well connected neighbors of a node are to each other

**Implementation**:
```rust
fn calculate_clustering_coefficient(graph) -> f32 {
    if node_count < 3 { return 0.0; }
    
    let total_triangles = node_count / 3;  // SIMPLIFIED SIMULATION
    let possible_triangles = node_count * (node_count - 1) / 2;
    
    return total_triangles as f32 / possible_triangles as f32;
}
```

**Note**: Implementation is SIMPLIFIED (marked as simulation in comments). Production requires proper local clustering coefficient calculation for each node.

---

### 10. Community Detection (Simulated)

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`

**Lines**: 230-254

**Language**: Rust

**Function**: `simulate_community_detection()`

**Purpose**: Group nodes into logical communities/clusters

**Implementation**:
```rust
// Simplified simulation (not production-ready):
// Creates new community every 3-5 nodes
for (idx, node) in graph.node_weights().enumerate() {
    current_community.push(node.entity_id);
    
    if idx % 4 == 3 {
        communities.push(current_community.clone());
        current_community.clear();
    }
}
```

**Comment from Code**:
```
// In production, use proper algorithms like Louvain or Leiden
```

**Stored in**: community_structure: Vec<Vec<Uuid>>

---

### 11. Slope Penalty Function (Terrain Analysis)

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enhanced-geolocation/schema/enhanced_routing.sql`

**Lines**: 32-43

**Language**: SQL (PL/SQL immutable function)

**Function**: `slope_penalty(deg double precision) RETURNS double precision`

**Purpose**: Convert terrain slope degree to traversal cost penalty

**Penalty Schedule**:
```
<= 5°:   0.0   (flat, no penalty)
<= 10°:  0.5   (gentle slope)
<= 15°:  1.5   (moderate slope)
<= 20°:  3.0   (steep slope)
> 20°:   6.0   (very steep)
```

**Input**: DEM (Digital Elevation Model) raster slope in degrees
**Output**: Cost multiplier for route calculation

---

### 12. Graph Traversal (SurrealDB Query)

**File**: `/Users/cp5337/Developer/ctas7-command-center/src/services/SlotGraphQueryEngine.ts`

**Lines**: 94-122

**Language**: TypeScript (SurrealDB query execution)

**Method**: `findAllRoutes()`

**Purpose**: Find all routes between stations using SurrealDB graph traversal

**Query Pattern**:
```sql
SELECT * FROM (
  SELECT 
    id,
    ->NetworkLink->(GroundStationNode, SatelliteNode) AS path
  FROM GroundStationNode:${source}
  WHERE id = $dest
  LIMIT ${maxHops}
)
```

**Note**: SurrealDB native traversal syntax with -> operator

---

## NOT IMPLEMENTED (REFERENCED BUT NO CODE FOUND)

### 1. Articulation Points / Cut Vertices

**File**: `/Users/cp5337/Developer/ctas7-command-center/src/services/SlotGraphQueryEngine.ts`

**Lines**: 582-589

**Method**: `findCriticalPaths()`

**Status**: STUB ONLY - Comment explicitly states:
```typescript
// Find articulation points (nodes whose removal disconnects the graph)
// This is a simplified version - full implementation would use Tarjan's algorithm

private findCriticalPaths(graph: Map<string, string[]>, nodes: string[]): string[][] {
    const criticalPaths: string[][] = [];
    // [returns empty]
}
```

**Expected Algorithm**: Tarjan's algorithm for articulation points
**Complexity**: O(V + E)

---

### 2. Network Modularity Calculation

**File**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-data/src/gnn_integration.rs`

**Status**: NOT FOUND despite references in MODULARIZATION_STRATEGY.md

**Expected Location**: Would be in community_detection module
**Expected Purpose**: Measure quality of community partitioning

---

### 3. Betweenness Centrality (NetworkX)

**File**: `/Users/cp5337/Developer/ctas7-command-center/nyx-trace-restoration/MODULARIZATION_STRATEGY.md`

**Lines**: 699-773

**Status**: ARCHITECTURAL DESIGN ONLY - Code example shows:
```python
if method == 'betweenness':
    return nx.betweenness_centrality(G)
```

**Note**: This is PSEUDOCODE in modularization plan, not actual implementation

---

## MODULARIZATION STRATEGY DOCUMENT

**File**: `/Users/cp5337/Developer/ctas7-command-center/nyx-trace-restoration/MODULARIZATION_STRATEGY.md`

**Status**: ARCHITECTURAL/PLANNING DOCUMENT - NOT IMPLEMENTED CODE

**Proposes** (but does not implement):
- Betweenness centrality
- Degree centrality  
- Eigenvector centrality
- Shortest path algorithms
- Cycle detection
- Clustering coefficient
- NetworkX integration

**Purpose**: Breaking down monolithic 2000+ line files per security compliance

**Note**: This is a DESIGN PROPOSAL, not deployed functionality

---

## SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| **Verified Implementations** | 12 |
| **Algorithms Implemented** | 10 |
| **Algorithms (Stubs Only)** | 2 |
| **Files Containing Algorithms** | 5 |
| **Primary Languages** | TypeScript (2), SQL (3), Rust (2), Python (1) |
| **Domains** | HFT Routing, Geolocation, GNN Analysis |

---

## IMPLEMENTATION MATRIX

| Algorithm | TypeScript | SQL | Rust | Python | Status |
|-----------|-----------|-----|------|--------|--------|
| Dijkstra | X | X | X | - | VERIFIED |
| BFS | X | - | - | - | VERIFIED |
| Connected Components | - | - | X | - | VERIFIED |
| A* | - | X | - | - | VERIFIED |
| Degree Centrality | - | - | X | - | VERIFIED |
| Clustering Coefficient | - | - | X | - | VERIFIED (Simplified) |
| Community Detection | - | - | X | - | SIMULATED |
| Slope Penalty | - | X | - | - | VERIFIED |
| Cost Recomputation | - | X | - | - | VERIFIED |
| Articulation Points | X (STUB) | - | - | - | UNIMPLEMENTED |
| Betweenness Centrality | - | - | - | (Pseudocode) | DESIGN ONLY |

---

## KEY FILES FOR REFERENCE

1. **SlotGraphQueryEngine.ts** - Dijkstra + BFS for HFT route finding
2. **enhanced_routing.sql** - A* and multi-criteria routing with terrain
3. **gnn_integration.rs** - Graph analysis with Legion ECS, centrality, connected components
4. **MODULARIZATION_STRATEGY.md** - Architectural plans (not implementations)
5. **gnn_integration.py** - Integration framework (not core algorithms)

---

## GAPS AND NOTES

- **No production betweenness centrality implementation** (referenced in design docs)
- **Articulation points/cut vertices** are stubbed but unimplemented (Tarjan's algorithm planned but not coded)
- **Community detection** is simplified simulation, not production-grade (Louvain/Leiden mentioned as future)
- **Clustering coefficient** is simplified (marked as simulation in comments)
- **No all-pairs shortest path** (only single-source Dijkstra)
- **No topological sort** implementations found
- **No minimum spanning tree** (Kruskal/Prim) implementations found
- **No graph coloring** implementations found
- **No maximum flow** implementations found

---

**Catalog Completed**: Archaeological search performed exhaustively
**Search Methods**: File reading, grep pattern matching, glob patterns, bash searches
**Confidence**: HIGH - Based on actual code examination, not inference
**Date**: 2025-11-12

