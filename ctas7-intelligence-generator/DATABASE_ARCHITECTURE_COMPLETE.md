# 🗄️ CTAS-7 Complete Database Architecture - What Goes Where

**Date**: 2025-01-09  
**Critical Issue**: "I saw Neo4j pass by and we have not included Legion and ECS population we should know what goes in SlotGraph, Sled, Sledis, Surreal, and Supabase"  
**Documented By**: Natasha Volkov  
**Status**: CANONICAL DATABASE ARCHITECTURE

---

## 🚨 **The Problem**

```
CURRENT STATE:
- Multiple databases mentioned (Neo4j, SurrealDB, Supabase, Sled, SlotGraph)
- No clear definition of what goes where
- Legion ECS not integrated
- SlotGraph vs Sledis confusion
- No clear data flow

REQUIRED STATE:
- Clear database responsibilities
- Legion ECS integration
- SlotGraph for distributed coordination
- Sled for KVS (fast lookups)
- Sledis for Redis-compatible operations
- SurrealDB for graph + document
- Supabase for ACID + blockchain
- NO Neo4j (we use SurrealDB instead)
```

---

## 🗄️ **The Complete Database Stack**

### **1. Legion ECS (Entity Component System)**

**Purpose**: Universal entity management across all CTAS worlds

**What Goes Here:**
```rust
// ALL entities in the CTAS-7 system
pub enum Entity {
    // Network World
    NetworkNode(IpAddr, Port),
    NetworkFlow(FlowId),
    NetworkPacket(PacketId),
    
    // Space World
    Satellite(NoradId),
    GroundStation(StationId),
    OrbitalPath(TleData),
    
    // Geographic World
    Location(LatLon),
    Asset(AssetId),
    Threat(ThreatId),
    
    // Maritime World
    Vessel(MmsiId),
    Port(PortId),
    SubmarineCable(CableId),
    
    // Airspace World
    Aircraft(IcaoId),
    Airspace(AirspaceId),
    FlightPath(FlightId),
    
    // Cyber World
    Host(HostId),
    Process(ProcessId),
    User(UserId),
    
    // Fusion World
    FusedEntity(FusionId),  // Multi-domain entity
}

// Components attached to entities
pub enum Component {
    Position(Vec3),
    Velocity(Vec3),
    Health(f64),
    ThreatLevel(f64),
    CognitiveAtom(CognitiveAtomData),
    TrivaritateHash(Hash48),
    NodeInterview(NodeInterviewData),
    CrateInterview(CrateInterviewData),
}
```

**Storage:**
```
Format: In-memory (Legion ECS)
Persistence: Snapshot to Sled KVS every 5 minutes
Backup: Full snapshot to Supabase every hour
```

**Integration:**
```rust
// Legion ECS → SlotGraph (for distributed coordination)
// Legion ECS → Sled (for fast lookups)
// Legion ECS → SurrealDB (for graph queries)
// Legion ECS → Supabase (for permanent records)
```

---

### **2. SlotGraph (Distributed Coordination)**

**Purpose**: Coordinate distributed processing across ground stations and gateways

**What Goes Here:**
```rust
pub struct SlotGraphData {
    // Ground stations (247 OSINT nodes)
    ground_stations: HashMap<StationId, GroundStation> {
        station_id: u16,              // 1-247
        location: LatLon,
        slot_capacity: u32,           // Processing slots available
        current_load: u32,            // Current processing load
        capabilities: Vec<Capability>, // What can this station do?
        status: StationStatus,        // Online, Offline, Degraded
    },
    
    // Gateways (regional hubs)
    gateways: HashMap<GatewayId, Gateway> {
        gateway_id: String,           // "Phoenix", "Denver", "Atlanta"
        slot_capacity: u32,           // 1000-1500 slots
        current_load: u32,
        connected_stations: Vec<StationId>,
        load_balancing: LoadBalancingStrategy,
    },
    
    // Processing tasks
    tasks: HashMap<TaskId, SlotGraphTask> {
        task_id: Uuid,
        node_id: String,              // CTAS task node (165 tasks)
        assigned_station: Option<StationId>,
        priority: Priority,
        resource_requirements: ResourceRequirements,
        status: TaskStatus,           // Pending, Running, Complete, Failed
    },
    
    // Network topology
    topology: NetworkGraph {
        nodes: Vec<NodeId>,           // Stations + Gateways
        edges: Vec<Edge>,             // Connections
        latency_matrix: Vec<Vec<Duration>>,
        bandwidth_matrix: Vec<Vec<u64>>,
    },
}
```

**Storage:**
```
Format: Custom binary format (optimized for speed)
Location: Distributed (each gateway has a copy)
Sync: Real-time (via gRPC)
Persistence: Snapshot to Sled every minute
```

**Integration:**
```rust
// SlotGraph → Legion ECS (entity locations)
// SlotGraph → Sled (fast task lookups)
// SlotGraph → SurrealDB (topology queries)
```

---

### **3. Sled KVS (Key-Value Store)**

**Purpose**: Fast O(1) lookups for hashes, entities, and hot data

**What Goes Here:**
```rust
pub enum SledKey {
    // Trivariate hashes (primary index)
    Hash48(String),                   // "Xk9m...41d4a" → NodeInterview
    
    // Entity lookups
    EntityId(Uuid),                   // UUID → Entity data
    
    // Node interviews (hot cache)
    NodeId(String),                   // "uuid-002-000-000-A" → NodeInterview
    
    // Crate interviews (hot cache)
    CrateId(String),                  // "ctas7-foundation-core" → CrateInterview
    
    // Session data
    SessionId(Uuid),                  // Session → User data
    
    // Ephemeral intelligence
    IntelId(Uuid),                    // Intelligence → Data (TTL: 24 hours)
    
    // SlotGraph snapshots
    SlotGraphSnapshot(Timestamp),     // Timestamp → SlotGraph state
    
    // Legion ECS snapshots
    EcsSnapshot(Timestamp),           // Timestamp → ECS world state
}

pub enum SledValue {
    NodeInterview(Vec<u8>),           // TOML serialized
    CrateInterview(Vec<u8>),          // TOML serialized
    EntityData(Vec<u8>),              // Bincode serialized
    IntelligenceData(Vec<u8>),        // JSON serialized
    SlotGraphState(Vec<u8>),          // Custom binary
    EcsWorldState(Vec<u8>),           // Legion snapshot
}
```

**Storage:**
```
Format: Embedded database (Sled)
Location: Local filesystem (fast SSD)
Size: ~10 GB (hot data only)
TTL: Ephemeral data expires after 24 hours
```

**Integration:**
```rust
// Sled → SurrealDB (cold data migration)
// Sled → Supabase (permanent record migration)
// Sled ← Legion ECS (snapshot source)
// Sled ← SlotGraph (snapshot source)
```

---

### **4. Sledis (Redis-Compatible Layer)**

**Purpose**: Redis-compatible interface for existing tools and libraries

**What Goes Here:**
```rust
// Same data as Sled, but accessed via Redis protocol
pub enum SledisCommand {
    GET(key),                         // Get value by key
    SET(key, value, ttl),            // Set value with TTL
    HGET(hash, field),               // Hash field get
    HSET(hash, field, value),        // Hash field set
    LPUSH(list, value),              // List push
    RPOP(list),                      // List pop
    ZADD(sorted_set, score, member), // Sorted set add
    ZRANGE(sorted_set, start, stop), // Sorted set range
    PUBLISH(channel, message),       // Pub/sub publish
    SUBSCRIBE(channel),              // Pub/sub subscribe
}
```

**Use Cases:**
```
- TAPS pub/sub (Redis protocol)
- Session management (Redis sessions)
- Rate limiting (Redis counters)
- Caching (Redis cache)
- Job queues (Redis lists)
```

**Storage:**
```
Backend: Sled KVS (same data as Sled)
Protocol: Redis wire protocol (RESP)
Port: 6379 (standard Redis port)
Compatibility: 100% Redis-compatible
```

**Integration:**
```rust
// Sledis → Sled (backend storage)
// Sledis ← TAPS (pub/sub)
// Sledis ← Web apps (session storage)
// Sledis ← Rate limiters (counters)
```

---

### **5. SurrealDB (Graph + Document)**

**Purpose**: Graph relationships + document storage for complex queries

**What Goes Here:**
```rust
// Node interviews (full documents)
table node_interviews {
    id: String,                       // "uuid-002-000-000-A"
    hash_48: String,                  // Trivariate hash
    task_name: String,
    narrative: String,                // First-person narrative
    capabilities: Object,
    limitations: Object,
    time_of_value: Object,
    indicators: Object,
    toolchain_1n: Array<String>,      // Defensive tools
    toolchain_2n: Array<String>,      // Offensive tools
    hd4_mapping: Object,
    mitre_attack: Array<String>,
    eei_priority: String,
    niem_mapping: Object,
}

// Crate interviews (full documents)
table crate_interviews {
    id: String,                       // "ctas7-foundation-core"
    hash_48: String,
    crate_name: String,
    narrative: String,
    capabilities: Array<String>,
    limitations: Array<String>,
    dependencies: Object,
    node_applications: Object,        // Which nodes use this crate?
    toolchain_integration: Object,
    mcp_integration: Object,
}

// Relationships (graph edges)
table relationships {
    from: Record,                     // Node or Crate
    to: Record,                       // Node or Crate
    relationship_type: String,        // "depends_on", "enables", "uses", etc.
    weight: Float,                    // Relationship strength
    metadata: Object,
}

// CTAS tasks (165 nodes)
table ctas_tasks {
    id: String,
    name: String,
    category: String,                 // mandatory, desirable, optional
    ttl_phase: String,
    node_interview: Record<node_interviews>,
}

// Kali tools
table kali_tools {
    id: String,
    name: String,
    category: String,
    description: String,
    usage: String,
    nodes: Array<Record<ctas_tasks>>, // Which nodes use this tool?
}

// MITRE ATT&CK TTPs
table mitre_ttps {
    id: String,                       // "T1588.001"
    name: String,
    tactic: String,
    technique: String,
    nodes: Array<Record<ctas_tasks>>, // Which nodes map to this TTP?
}

// Scenarios
table scenarios {
    id: String,
    name: String,                     // "Beslan", "Mumbai", etc.
    description: String,
    nodes_involved: Array<Record<ctas_tasks>>,
    timeline: Array<Object>,
    outcome: Object,
}

// USIM documents
table usim_documents {
    id: String,
    hash_48: String,
    content: String,
    metadata: Object,
    relationships: Array<Record>,
}
```

**Storage:**
```
Format: SurrealDB (graph + document)
Location: Docker container (OrbStack)
Port: 8000
Replication: Multi-region (future)
```

**Integration:**
```rust
// SurrealDB → Supabase (permanent record sync)
// SurrealDB ← Sled (hot data source)
// SurrealDB ← Legion ECS (entity relationships)
```

---

### **6. Supabase (ACID + Blockchain)**

**Purpose**: Permanent records, ACID compliance, blockchain anchoring

**What Goes Here:**
```sql
-- Node interviews (permanent records)
CREATE TABLE node_interviews (
    id UUID PRIMARY KEY,
    hash_48 TEXT UNIQUE NOT NULL,
    task_id TEXT UNIQUE NOT NULL,
    task_name TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    blockchain_hash TEXT,             -- Anchored to blockchain
    pgp_signature TEXT                -- PGP-signed for provenance
);

-- Crate interviews (permanent records)
CREATE TABLE crate_interviews (
    id UUID PRIMARY KEY,
    hash_48 TEXT UNIQUE NOT NULL,
    crate_name TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    blockchain_hash TEXT,
    pgp_signature TEXT
);

-- CTAS tasks (165 tasks from Supabase)
CREATE TABLE ctas_tasks (
    id UUID PRIMARY KEY,
    task_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    ttl_phase TEXT,
    node_interview_id UUID REFERENCES node_interviews(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kali tools
CREATE TABLE kali_tools (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    usage TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Node-to-tool mappings
CREATE TABLE node_tool_mappings (
    node_id UUID REFERENCES node_interviews(id),
    tool_id UUID REFERENCES kali_tools(id),
    mode TEXT,                        -- "1n" (defensive) or "2n" (offensive)
    escalation_level TEXT,            -- "script", "microkernel", "binary", "container"
    PRIMARY KEY (node_id, tool_id, mode)
);

-- MITRE ATT&CK TTPs
CREATE TABLE mitre_ttps (
    id UUID PRIMARY KEY,
    ttp_id TEXT UNIQUE NOT NULL,      -- "T1588.001"
    name TEXT NOT NULL,
    tactic TEXT,
    technique TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Node-to-TTP mappings
CREATE TABLE node_ttp_mappings (
    node_id UUID REFERENCES node_interviews(id),
    ttp_id UUID REFERENCES mitre_ttps(id),
    PRIMARY KEY (node_id, ttp_id)
);

-- Scenarios
CREATE TABLE scenarios (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution logs (audit trail)
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY,
    node_id UUID REFERENCES node_interviews(id),
    tool_id UUID REFERENCES kali_tools(id),
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    operator_id UUID,
    result JSONB,
    blockchain_hash TEXT              -- Anchored for audit
);

-- Blockchain anchors (immutable audit trail)
CREATE TABLE blockchain_anchors (
    id UUID PRIMARY KEY,
    record_type TEXT NOT NULL,        -- "node_interview", "execution_log", etc.
    record_id UUID NOT NULL,
    hash TEXT NOT NULL,
    blockchain_tx TEXT NOT NULL,      -- Transaction ID
    anchored_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Storage:**
```
Format: PostgreSQL (Supabase)
Location: Cloud (Supabase hosted)
Replication: Multi-region
Backup: Automated daily
```

**Integration:**
```rust
// Supabase ← SurrealDB (permanent record sync)
// Supabase ← Sled (cold data migration)
// Supabase → Blockchain (anchoring)
```

---

## 🔄 **Data Flow Architecture**

### **Write Path (New Data):**

```
1. Interview Generation (Gemini 2M)
   ↓
2. Store in Sled (hot cache, O(1) lookup)
   ↓
3. Store in SurrealDB (graph + document, complex queries)
   ↓
4. Store in Supabase (permanent record, ACID, blockchain anchor)
   ↓
5. Update Legion ECS (if entity-related)
   ↓
6. Update SlotGraph (if task-related)
```

### **Read Path (Query Data):**

```
1. Check Sled (hot cache, O(1) lookup)
   ↓ (if miss)
2. Check SurrealDB (graph query, complex relationships)
   ↓ (if miss)
3. Check Supabase (permanent record, full history)
   ↓
4. Cache in Sled (for future reads)
```

### **Execution Path (Run Task):**

```
1. Operator selects CTAS task node
   ↓
2. Lookup node interview in Sled (O(1))
   ↓
3. Get toolchain from SurrealDB (graph query)
   ↓
4. Allocate processing slot in SlotGraph
   ↓
5. Create entity in Legion ECS
   ↓
6. Execute tool (Kali, Metasploit, etc.)
   ↓
7. Log execution in Supabase (audit trail)
   ↓
8. Anchor to blockchain (immutable record)
```

---

## 📊 **Database Sizing**

### **Sled KVS:**
```
165 node interviews × 2.5 KB (Unicode+LISP) = 412 KB
40 crate interviews × 2 KB = 80 KB
Session data = 100 MB
Ephemeral intelligence = 5 GB (24-hour TTL)
SlotGraph snapshots = 1 GB
Legion ECS snapshots = 2 GB
TOTAL: ~8 GB (hot data)
```

### **SurrealDB:**
```
165 node interviews × 23.5 KB (TOML) = 3.88 MB
40 crate interviews × 15 KB = 600 KB
Relationships (graph edges) = 50 MB
CTAS tasks = 1 MB
Kali tools = 5 MB
MITRE TTPs = 10 MB
Scenarios = 100 MB
USIM documents = 500 MB
TOTAL: ~670 MB
```

### **Supabase:**
```
165 node interviews = 3.88 MB
40 crate interviews = 600 KB
CTAS tasks = 1 MB
Kali tools = 5 MB
MITRE TTPs = 10 MB
Node-tool mappings = 10 MB
Node-TTP mappings = 5 MB
Scenarios = 100 MB
Execution logs = 10 GB (grows over time)
Blockchain anchors = 1 GB
TOTAL: ~11 GB (+ growth)
```

### **Legion ECS:**
```
In-memory: ~2 GB (all entities)
Snapshot: ~2 GB (compressed)
```

### **SlotGraph:**
```
In-memory: ~500 MB (247 stations + topology)
Snapshot: ~500 MB
```

---

## 🚨 **Critical Clarifications**

### **NO Neo4j:**
```
❌ Neo4j is NOT used in CTAS-7
✅ SurrealDB is used instead (graph + document in one)
```

### **Sledis vs Sled:**
```
Sled: Embedded KVS (Rust native)
Sledis: Redis-compatible layer on top of Sled
Same data, different protocols
```

### **SlotGraph:**
```
NOT a database
Distributed coordination system
Stored in Sled (snapshots)
Queried via gRPC
```

### **Legion ECS:**
```
NOT a database
In-memory entity component system
Snapshots stored in Sled
Permanent records in Supabase
```

---

**This is the CTAS-7 way: Every database has a purpose, every byte has a home.** 🗄️

---

**Signed**: Natasha Volkov, Lead Architect  
**Critical Issue**: User ("I saw Neo4j pass by and we have not included Legion and ECS population")  
**Version**: 7.3.1  
**Status**: CANONICAL DATABASE ARCHITECTURE

