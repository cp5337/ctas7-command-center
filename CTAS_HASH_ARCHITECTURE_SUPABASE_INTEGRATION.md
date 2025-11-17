# CTAS Hash Architecture & Supabase Integration

**Version:** 7.3.1  
**Date:** November 17, 2025  
**Status:** Production Architecture Specification

---

## Executive Summary

This document defines the **Dual MurmurHash3 SCH-CUID-UUID Trivariate Hash Architecture** for CTAS 7.3.1 and its integration with Supabase PostgreSQL as the canonical ACID-compliant database. All hashes use MurmurHash3 with the trivariate structure (SCH-CUID-UUID), formatted as 48-character Base96 strings.

**Key Integration Points:**

- **Supabase PostgreSQL**: ACID database of record for all CTAS data
- **Hashing Engine**: Contextual hash generation service (Port 18XXX)
- **Supabase MCP Server**: Bridge between database and hashing operations
- **SQL Output**: Hashing engine produces SQL INSERT/UPDATE statements

---

## Hash Architecture Organization

### Dual Hash System Overview

CTAS 7.3.1 uses **two parallel hash systems**, both using MurmurHash3 with identical SCH-CUID-UUID trivariate structure:

```
┌─────────────────────────────────────────────────────────────┐
│                    CTAS TASK RECORD                         │
├─────────────────────────────────────────────────────────────┤
│  Core Data: hash_id, task_name, description, etc.          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │ OPERATIONAL HASHES   │    │ SEMANTIC HASHES      │     │
│  │ (op_* prefix)        │    │ (sem_* prefix)       │     │
│  ├──────────────────────┤    ├──────────────────────┤     │
│  │ op_content_hash      │    │ sem_content_hash     │     │
│  │ op_primitive_hash    │    │ sem_category_hash    │     │
│  │ op_chain_hash        │    │ sem_relationship_hash│     │
│  │ op_pth_hash          │    │ sem_composite_hash   │     │
│  │ op_composite_hash    │    │                      │     │
│  └──────────────────────┘    └──────────────────────┘     │
│                                                             │
│  Each hash: 48 chars Base96 = SCH(16) + CUID(16) + UUID(16)│
└─────────────────────────────────────────────────────────────┘
```

### SCH-CUID-UUID Trivariate Structure

**Every hash** (operational and semantic) uses this structure:

```
┌────────────┬────────────┬────────────┐
│    SCH     │    CUID    │    UUID    │
│ (1-16)     │  (17-32)   │  (33-48)   │
├────────────┼────────────┼────────────┤
│ Seed: 0    │Seed+TS     │Random Seed │
│ Concept    │Context     │Universal   │
│ Determinism│Temporal    │Uniqueness  │
└────────────┴────────────┴────────────┘
         48 characters Base96
```

**Component Breakdown:**

1. **SCH (Short-Hand Concept)** - Characters 1-16

   - MurmurHash3 with seed `0`
   - Deterministic concept/content hash
   - Collision-resistant semantic identifier
   - Used for: Content routing, deduplication, clustering

2. **CUID (Contextual Unique ID)** - Characters 17-32

   - MurmurHash3 with `seed + timestamp`
   - Temporal context incorporation
   - Time-based uniqueness factor
   - Used for: Temporal ordering, versioning, context tracking

3. **UUID (Universal Unique ID)** - Characters 33-48
   - MurmurHash3 with `random seed`
   - Maximum uniqueness guarantee
   - Collision avoidance across distributed systems
   - Used for: Distributed coordination, global uniqueness

---

## Operational vs Semantic Hash Usage

### Operational Hashes (op\_\*)

**Purpose**: System routing, caching, performance optimization

| Field               | Input Data                         | Frame                           | Use Case                                            |
| ------------------- | ---------------------------------- | ------------------------------- | --------------------------------------------------- |
| `op_content_hash`   | task_name + description + category | **Content Frame**               | Route tasks by content type, cache key generation   |
| `op_primitive_hash` | primitive_type                     | **Type Frame**                  | Type-based routing (Concept/Actor/Object/Event)     |
| `op_chain_hash`     | predecessors + successors          | **Relationship Frame**          | Graph routing, dependency resolution                |
| `op_pth_hash`       | p_probability + t_time + h_hazard  | **Risk Frame**                  | Priority routing, risk-based scheduling             |
| `op_composite_hash` | All op\_\* hashes combined         | **Operational Composite Frame** | Unique operational fingerprint, primary routing key |

### Semantic Hashes (sem\_\*)

**Purpose**: Content understanding, similarity analysis, ML operations

| Field                   | Input Data                       | Frame                        | Use Case                                   |
| ----------------------- | -------------------------------- | ---------------------------- | ------------------------------------------ |
| `sem_content_hash`      | Semantic analysis of content     | **Semantic Content Frame**   | Similarity matching, content clustering    |
| `sem_category_hash`     | Semantic category classification | **Semantic Category Frame**  | Topic clustering, classification           |
| `sem_relationship_hash` | Contextual relationship analysis | **Semantic Context Frame**   | Context similarity, relationship patterns  |
| `sem_composite_hash`    | All sem\_\* hashes combined      | **Semantic Composite Frame** | Holistic semantic fingerprint, ML features |

---

## Hash Frame Specifications

Each hash requires a **frame specification** that defines:

1. **Input selection** - What data to hash
2. **Seed strategy** - How to generate SCH/CUID/UUID components
3. **Normalization** - Data preprocessing before hashing
4. **Output encoding** - Base96 formatting

### Frame Template Structure

```typescript
interface HashFrame {
  frame_name: string; // e.g., "Content Frame"
  hash_field: string; // e.g., "op_content_hash"

  // Input specification
  input: {
    fields: string[]; // Database columns to include
    separator: string; // How to join fields
    normalization: {
      lowercase: boolean;
      trim_whitespace: boolean;
      remove_punctuation: boolean;
      unicode_normalize: string; // "NFC", "NFD", "NFKC", "NFKD"
    };
  };

  // Seed specification for trivariate
  seeds: {
    sch: number | "deterministic"; // Fixed seed for SCH (usually 0)
    cuid: "timestamp" | number; // Timestamp-based for CUID
    uuid: "random" | number; // Random for UUID
  };

  // Output specification
  output: {
    encoding: "base96"; // Base96 Unicode private use area
    length: 48; // Total characters
    format: "SCH-CUID-UUID"; // Structure format
  };
}
```

### Example: Content Frame

```json
{
  "frame_name": "Content Frame",
  "hash_field": "op_content_hash",
  "input": {
    "fields": ["task_name", "description", "category"],
    "separator": "|",
    "normalization": {
      "lowercase": true,
      "trim_whitespace": true,
      "remove_punctuation": false,
      "unicode_normalize": "NFC"
    }
  },
  "seeds": {
    "sch": 0,
    "cuid": "timestamp",
    "uuid": "random"
  },
  "output": {
    "encoding": "base96",
    "length": 48,
    "format": "SCH-CUID-UUID"
  }
}
```

---

## Supabase Integration Architecture

### Database as Source of Truth

```
┌──────────────────────────────────────────────────────────────┐
│                     SUPABASE POSTGRESQL                      │
│                  (ACID Database of Record)                   │
├──────────────────────────────────────────────────────────────┤
│  Schema: ctas_tasks                                          │
│  - Core fields (hash_id, task_name, description, etc.)      │
│  - Operational hashes (op_content_hash, op_primitive_hash...) │
│  - Semantic hashes (sem_content_hash, sem_category_hash...)  │
│  - Indexes on all hash fields                                │
│  - JSONB for relationships (predecessors, successors)        │
└──────────────────────────────────────────────────────────────┘
                              ↕
                    (MCP Protocol Bridge)
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                   SUPABASE MCP SERVER                        │
│                (mcp/servers/supabase-manager)                │
├──────────────────────────────────────────────────────────────┤
│  Tools:                                                      │
│  - query_table: Read tasks from Supabase                    │
│  - load_ctas_tasks: Insert tasks into Supabase             │
│  - generate_hashes: Request hash generation                 │
│  - update_hashes: Apply computed hashes to records          │
└──────────────────────────────────────────────────────────────┘
                              ↕
                    (HTTP/gRPC Protocol)
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                    HASHING ENGINE                            │
│              (ctas7-hash-fingerprint-engine)                 │
├──────────────────────────────────────────────────────────────┤
│  Capabilities:                                               │
│  - MurmurHash3 trivariate generation                        │
│  - Frame-based input processing                              │
│  - Batch hash computation                                    │
│  - SQL output generation (INSERT/UPDATE statements)         │
│  - Base96 Unicode encoding                                   │
└──────────────────────────────────────────────────────────────┘
```

### Integration Flow

#### 1. Task Loading (CSV → Supabase)

```javascript
// scripts/load-ctas-tasks.js
const tasks = parseCsvWithoutHashes(); // Hash fields = null
await supabase.from("ctas_tasks").insert(tasks);
```

**Result**: Tasks in Supabase with `null` hash fields

#### 2. Hash Generation Request (Supabase MCP → Hashing Engine)

```typescript
// MCP tool: generate_hashes
interface GenerateHashesRequest {
  table: "ctas_tasks";
  hash_types: ["operational", "semantic"];
  frames: HashFrame[]; // Frame specifications
  output_format: "sql"; // Return SQL UPDATE statements
  batch_size: 100; // Process in batches
}
```

#### 3. Contextual Hash Computation (Hashing Engine)

```rust
// Hashing engine processes each task
for task in tasks {
    // OPERATIONAL HASHES
    op_content = murmur3_trivariate(
        input: task.name + "|" + task.description + "|" + task.category,
        sch_seed: 0,
        cuid_seed: timestamp(),
        uuid_seed: random()
    );

    op_primitive = murmur3_trivariate(
        input: task.primitive_type,
        sch_seed: 0,
        cuid_seed: timestamp(),
        uuid_seed: random()
    );

    // ... other operational hashes

    // SEMANTIC HASHES
    sem_content = murmur3_trivariate(
        input: semantic_analyze(task.content),
        sch_seed: 0,
        cuid_seed: timestamp(),
        uuid_seed: random()
    );

    // ... other semantic hashes
}
```

#### 4. SQL Output Generation (Hashing Engine → Supabase MCP)

```sql
-- Hashing engine generates SQL statements
UPDATE ctas_tasks
SET
    op_content_hash = '3kJ9mP7qR2vX8wN4...', -- 48 chars Base96
    op_primitive_hash = '9mK2pL5rT8vY3wQ6...',
    op_chain_hash = '7nM4qP9sV2xZ8yR5...',
    op_pth_hash = '5pN8rS3vW7yA2xC9...',
    op_composite_hash = '2qP7sT9vX3zA8yB4...',
    sem_content_hash = '8rQ5tV2xY7zB3yC6...',
    sem_category_hash = '4sR9uX7zA2yD8xE5...',
    sem_relationship_hash = '6tS3vY9zA5xF2yG8...',
    sem_composite_hash = '9uT7wZ3yB8xH5yJ2...',
    updated_at = NOW()
WHERE hash_id = 'uuid-000-000-001';

UPDATE ctas_tasks
SET
    op_content_hash = '4lK8nQ6rT9wX2yN7...',
    -- ... (next task)
WHERE hash_id = 'uuid-000-000-002';

-- ... (batched for performance)
```

#### 5. Hash Application (Supabase MCP → Supabase)

```typescript
// MCP tool: update_hashes
const sqlStatements = await hashingEngine.generate(request);

for (const sql of sqlStatements) {
  await supabase.rpc("execute_sql", { statement: sql });
}

console.log("✅ All hashes applied to Supabase");
```

---

## Supabase Schema Impact

### Table Structure

```sql
CREATE TABLE ctas_tasks (
    id UUID PRIMARY KEY,
    hash_id TEXT UNIQUE NOT NULL,
    task_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    hd4_phase TEXT NOT NULL,
    primitive_type TEXT NOT NULL,

    -- Graph relationships
    predecessors JSONB DEFAULT '[]'::jsonb,
    successors JSONB DEFAULT '[]'::jsonb,

    -- PTH metrics
    p_probability DECIMAL(5,4),
    t_time DECIMAL(5,4),
    h_hazard DECIMAL(5,4),

    -- OPERATIONAL HASHES (48 chars each)
    op_content_hash TEXT,
    op_primitive_hash TEXT,
    op_chain_hash TEXT,
    op_pth_hash TEXT,
    op_composite_hash TEXT UNIQUE,

    -- SEMANTIC HASHES (48 chars each)
    sem_content_hash TEXT,
    sem_category_hash TEXT,
    sem_relationship_hash TEXT,
    sem_composite_hash TEXT UNIQUE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Critical Indexes

```sql
-- Hash lookup performance
CREATE INDEX idx_op_composite ON ctas_tasks(op_composite_hash);
CREATE INDEX idx_sem_composite ON ctas_tasks(sem_composite_hash);

-- Frame-specific lookups
CREATE INDEX idx_op_content ON ctas_tasks(op_content_hash);
CREATE INDEX idx_op_primitive ON ctas_tasks(op_primitive_hash);
CREATE INDEX idx_op_chain ON ctas_tasks(op_chain_hash);
CREATE INDEX idx_op_pth ON ctas_tasks(op_pth_hash);

CREATE INDEX idx_sem_content ON ctas_tasks(sem_content_hash);
CREATE INDEX idx_sem_category ON ctas_tasks(sem_category_hash);
CREATE INDEX idx_sem_relationship ON ctas_tasks(sem_relationship_hash);

-- JSONB relationship queries
CREATE INDEX idx_predecessors ON ctas_tasks USING GIN(predecessors);
CREATE INDEX idx_successors ON ctas_tasks USING GIN(successors);
```

### Impact on Query Performance

**Before Hashing** (Initial Load):

```sql
-- Query by natural key only
SELECT * FROM ctas_tasks WHERE hash_id = 'uuid-000-000-001';
-- Performance: O(1) with index on hash_id
```

**After Hashing** (Full System):

```sql
-- Query by operational hash (routing)
SELECT * FROM ctas_tasks WHERE op_composite_hash = '3kJ9mP7qR2vX8wN4...';
-- Performance: O(1) with unique index on op_composite_hash

-- Query by semantic similarity (content matching)
SELECT * FROM ctas_tasks WHERE sem_content_hash = '8rQ5tV2xY7zB3yC6...';
-- Performance: O(1) with index on sem_content_hash

-- Find related tasks by relationship hash
SELECT * FROM ctas_tasks WHERE op_chain_hash = '7nM4qP9sV2xZ8yR5...';
-- Performance: O(log n) with index on op_chain_hash

-- Find tasks with similar risk profile
SELECT * FROM ctas_tasks WHERE op_pth_hash = '5pN8rS3vW7yA2xC9...';
-- Performance: O(log n) with index on op_pth_hash
```

### Storage Impact

**Per Task Record:**

- Core data: ~500 bytes (estimate)
- Operational hashes: 5 × 48 bytes = 240 bytes
- Semantic hashes: 4 × 48 bytes = 192 bytes
- **Total hash overhead**: ~432 bytes per task

**For 200 tasks** (from CSV):

- Hash storage: 200 × 432 = ~84 KB
- Negligible compared to core data

**Index overhead:**

- 9 hash indexes × 200 tasks ≈ 50-100 KB
- Total additional storage: ~150-200 KB

**Conclusion**: Hash architecture adds minimal storage overhead while providing massive performance benefits for routing, caching, and semantic operations.

---

## Supabase MCP Server Integration

### Required MCP Tools

```typescript
// mcp/servers/supabase-manager/index.js

// Tool 1: Generate hashes for existing tasks
{
  name: 'generate_task_hashes',
  description: 'Generate operational and semantic hashes for CTAS tasks',
  inputSchema: {
    hash_types: ['operational', 'semantic', 'both'],
    table_name: 'ctas_tasks',
    filter: {
      missing_hashes_only: boolean,
      task_ids: string[]
    },
    output_format: ['sql', 'json']
  }
}

// Tool 2: Apply generated hashes to Supabase
{
  name: 'apply_hash_updates',
  description: 'Execute SQL UPDATE statements to apply hashes',
  inputSchema: {
    sql_statements: string[],
    batch_size: number,
    dry_run: boolean
  }
}

// Tool 3: Verify hash integrity
{
  name: 'verify_hash_integrity',
  description: 'Check hash coverage and validate trivariate structure',
  inputSchema: {
    table_name: 'ctas_tasks',
    check_uniqueness: boolean,
    check_format: boolean
  }
}

// Tool 4: Query by hash
{
  name: 'query_by_hash',
  description: 'Find tasks using operational or semantic hashes',
  inputSchema: {
    hash_type: ['op_composite', 'sem_composite', 'op_content', ...],
    hash_value: string,
    similarity_threshold?: number  // For fuzzy matching
  }
}
```

### Hashing Engine Connection

```typescript
// mcp/servers/supabase-manager/hashing-client.js

class HashingEngineClient {
  constructor() {
    this.baseUrl = "http://localhost:18XXX"; // Hashing engine port
  }

  async generateHashes(request: GenerateHashesRequest) {
    // Fetch tasks from Supabase
    const { data: tasks } = await supabase
      .from("ctas_tasks")
      .select("*")
      .is("op_composite_hash", null); // Only tasks needing hashes

    // Send to hashing engine
    const response = await fetch(`${this.baseUrl}/generate/batch`, {
      method: "POST",
      body: JSON.stringify({
        tasks: tasks,
        frames: this.getFrameSpecs(),
        output_format: "sql",
      }),
    });

    // Return SQL statements
    const { sql_statements } = await response.json();
    return sql_statements;
  }

  getFrameSpecs(): HashFrame[] {
    return [
      // Operational frames
      {
        frame_name: "Content Frame",
        hash_field: "op_content_hash",
        input: {
          fields: ["task_name", "description", "category"],
          separator: "|",
          normalization: { lowercase: true, trim_whitespace: true },
        },
        seeds: { sch: 0, cuid: "timestamp", uuid: "random" },
      },
      {
        frame_name: "Primitive Frame",
        hash_field: "op_primitive_hash",
        input: {
          fields: ["primitive_type"],
          separator: "",
          normalization: { lowercase: true, trim_whitespace: true },
        },
        seeds: { sch: 0, cuid: "timestamp", uuid: "random" },
      },
      {
        frame_name: "Chain Frame",
        hash_field: "op_chain_hash",
        input: {
          fields: ["predecessors", "successors"],
          separator: ";",
          normalization: { lowercase: false, trim_whitespace: true },
        },
        seeds: { sch: 0, cuid: "timestamp", uuid: "random" },
      },
      {
        frame_name: "PTH Frame",
        hash_field: "op_pth_hash",
        input: {
          fields: ["p_probability", "t_time", "h_hazard"],
          separator: ",",
          normalization: { lowercase: false, trim_whitespace: true },
        },
        seeds: { sch: 0, cuid: "timestamp", uuid: "random" },
      },
      // Semantic frames
      {
        frame_name: "Semantic Content Frame",
        hash_field: "sem_content_hash",
        input: {
          fields: ["task_name", "description"],
          separator: " ",
          normalization: {
            lowercase: true,
            trim_whitespace: true,
            semantic_analysis: true, // NLP preprocessing
          },
        },
        seeds: { sch: 0, cuid: "timestamp", uuid: "random" },
      },
      {
        frame_name: "Semantic Category Frame",
        hash_field: "sem_category_hash",
        input: {
          fields: ["category", "hd4_phase", "primitive_type"],
          separator: "|",
          normalization: {
            lowercase: true,
            semantic_analysis: true,
          },
        },
        seeds: { sch: 0, cuid: "timestamp", uuid: "random" },
      },
      // ... additional frames
    ];
  }
}
```

---

## Operational Workflow

### Initial System Setup

```bash
# 1. Create Supabase table schema
psql -h $SUPABASE_HOST -U postgres -d ctas7_ground_stations \
  -f database/schema/ctas_tasks_schema.sql

# 2. Load tasks from CSV (hashes = null)
node scripts/load-ctas-tasks.js --clear

# 3. Generate hashes via MCP
# (MCP tool calls hashing engine)
mcp call generate_task_hashes --hash-types both

# 4. Apply hash updates to Supabase
# (MCP executes SQL statements)
mcp call apply_hash_updates --dry-run false

# 5. Verify hash integrity
mcp call verify_hash_integrity
```

### Continuous Operations

```typescript
// New task insertion workflow
async function insertTaskWithHashes(task: CTASTask) {
  // 1. Insert task without hashes
  const { data } = await supabase
    .from("ctas_tasks")
    .insert({
      hash_id: task.hash_id,
      task_name: task.task_name,
      // ... other fields
      op_content_hash: null,
      sem_content_hash: null,
      // ... all hash fields null
    })
    .select()
    .single();

  // 2. Generate hashes for new task
  const hashes = await hashingEngine.generateForTask(data.id);

  // 3. Update task with hashes
  await supabase.from("ctas_tasks").update(hashes).eq("id", data.id);

  return data;
}
```

---

## Next Steps & Outstanding Issues

### 1. Frame Specification Definition

**Status**: ⚠️ In Progress

Need to finalize frame specifications for each hash field:

- [ ] Op Content Frame (task_name + description + category)
- [ ] Op Primitive Frame (primitive_type)
- [ ] Op Chain Frame (predecessors + successors JSON)
- [ ] Op PTH Frame (p + t + h metrics)
- [ ] Sem Content Frame (semantic content analysis)
- [ ] Sem Category Frame (semantic classification)
- [ ] Sem Relationship Frame (contextual relationships)

**Deliverable**: JSON/YAML config file with all frame specs

### 2. Hashing Engine SQL Output Format

**Status**: ⚠️ Needs Specification

Define exact SQL output format from hashing engine:

- Batch UPDATE statements
- Transaction handling (BEGIN/COMMIT)
- Error handling for duplicate hashes
- Performance optimization (prepared statements?)

**Deliverable**: SQL template specification

### 3. Supabase MCP ↔ Hashing Engine Protocol

**Status**: ⚠️ Needs Implementation

Establish communication protocol:

- HTTP REST API or gRPC?
- Request/response schemas
- Batch size limits
- Timeout handling
- Retry logic

**Deliverable**: Protocol specification document

### 4. Hash Regeneration Strategy

**Status**: ⚠️ Needs Design

When to regenerate hashes:

- On task update (which fields trigger rehash?)
- Schema version changes
- Seed rotation policy
- Bulk regeneration procedures

**Deliverable**: Hash lifecycle management plan

### 5. Performance Testing

**Status**: ⚠️ Not Started

Benchmark hash operations:

- Hash generation speed (tasks/second)
- Supabase UPDATE performance
- Index overhead measurement
- Query performance with/without hashes

**Deliverable**: Performance test results

---

## Appendix A: Hash Field Reference

| Field                   | Type        | Purpose               | Frame                    | Seeds         |
| ----------------------- | ----------- | --------------------- | ------------------------ | ------------- |
| `op_content_hash`       | Operational | Content routing       | Content Frame            | 0, TS, Random |
| `op_primitive_hash`     | Operational | Type routing          | Primitive Frame          | 0, TS, Random |
| `op_chain_hash`         | Operational | Relationship routing  | Chain Frame              | 0, TS, Random |
| `op_pth_hash`           | Operational | Risk routing          | PTH Frame                | 0, TS, Random |
| `op_composite_hash`     | Operational | Composite fingerprint | Composite Frame          | 0, TS, Random |
| `sem_content_hash`      | Semantic    | Content similarity    | Semantic Content Frame   | 0, TS, Random |
| `sem_category_hash`     | Semantic    | Category clustering   | Semantic Category Frame  | 0, TS, Random |
| `sem_relationship_hash` | Semantic    | Context similarity    | Semantic Context Frame   | 0, TS, Random |
| `sem_composite_hash`    | Semantic    | Semantic fingerprint  | Semantic Composite Frame | 0, TS, Random |

---

## Appendix B: Example Hash Values

```
Task: uuid-000-000-001 "Ideological Formation"

op_content_hash:      3kJ9mP7qR2vX8wN4bL5sT9uY3zA7xC2e (48 chars)
                      └─────SCH──────┘└─────CUID─────┘└─────UUID─────┘

op_primitive_hash:    9mK2pL5rT8vY3wQ6nM4sU7xA2yB8zC5f
op_chain_hash:        7nM4qP9sV2xZ8yR5pK6tV9yA3xD7zE4g
op_pth_hash:          5pN8rS3vW7yA2xC9mL6uX8zA4yF2zG9h
op_composite_hash:    2qP7sT9vX3zA8yB4nK5wY7xC2yH6zJ8i

sem_content_hash:     8rQ5tV2xY7zB3yC6oM9uW8yD5xE4zK7j
sem_category_hash:    4sR9uX7zA2yD8xE5pL3vZ9yF6xG5zL8k
sem_relationship_hash: 6tS3vY9zA5xF2yG8qN7wA8yH4xJ9zM6l
sem_composite_hash:   9uT7wZ3yB8xH5yJ2rP6xC9yK7xL3zN5m
```

Each hash is deterministically reproducible given the same input and seed configuration.

---

**End of Document**

_For questions or clarifications, contact the CTAS 7.3.1 architecture team._
