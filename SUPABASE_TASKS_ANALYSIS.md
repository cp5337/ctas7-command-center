# Supabase CTAS Tasks Analysis

## 🔍 Current State

### **Supabase Connection**
```
URL: https://kxabqezjpglbbrjdpdmv.supabase.co
Database: PostgreSQL (Cloud)
Project ID: kxabqezjpglbbrjdpdmv
```

### **Task Table References**

Based on the codebase analysis, I found **THREE different task schemas** being used:

---

## 📊 Task Schema #1: `ctas_tasks` (Supabase - DatabaseConnectionService)

**Location:** `/ctas-7.0-main-ops-platform/src/services/database/DatabaseConnectionService.ts`

**Query:**
```typescript
const { data, error } = await supabase
  .from('ctas_tasks')
  .select('*')
  .order('created_at', { ascending: false });
```

**Expected Schema:**
```typescript
interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  hd4_phase?: 'hunt' | 'detect' | 'disrupt' | 'disable';
  created_at: string;
  updated_at: string;
}
```

**SQL Schema (Missing - Needs to be created):**
```sql
CREATE TABLE IF NOT EXISTS ctas_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  hd4_phase TEXT
    CHECK (hd4_phase IN ('hunt', 'detect', 'disrupt', 'disable', 'dominate')),

  -- Trivariate Hash System
  sch_hash VARCHAR(16),
  cuid_hash VARCHAR(16),
  uuid_hash VARCHAR(16),
  trivariate_hash_full VARCHAR(48) UNIQUE,

  -- Forge Integration (TAPS Pub-Sub)
  forge_subscription_id TEXT,
  forge_status TEXT DEFAULT 'ready' CHECK (forge_status IN ('ready', 'subscribed', 'processing', 'completed', 'failed')),

  -- PTCC Integration
  ptcc_persona TEXT,
  ptcc_tool_chain JSONB DEFAULT '[]'::jsonb,
  ptcc_context JSONB DEFAULT '{}'::jsonb,
  ptcc_primitives JSONB DEFAULT '[]'::jsonb,

  -- World Graph Integration
  world_graph_entity_id TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  cog_analysis JSONB DEFAULT '{}'::jsonb,

  -- Agent Assignment
  agent_assignments JSONB DEFAULT '[]'::jsonb,
  current_agent TEXT,
  agent_handoff_history JSONB DEFAULT '[]'::jsonb,

  -- Linear Integration
  linear_issue_id TEXT,
  linear_issue_key TEXT, -- e.g., COG-42
  linear_url TEXT,

  -- Smart Crate Integration
  smart_crate_id TEXT,
  smart_crate_deployed BOOLEAN DEFAULT FALSE,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_status ON ctas_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_priority ON ctas_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_assigned_to ON ctas_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_hd4_phase ON ctas_tasks(hd4_phase);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_trivariate ON ctas_tasks(trivariate_hash_full);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_linear ON ctas_tasks(linear_issue_key);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_forge ON ctas_tasks(forge_subscription_id);

-- Trigger for updated_at
CREATE TRIGGER update_ctas_tasks_updated_at
    BEFORE UPDATE ON ctas_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE ctas_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ctas_tasks"
  ON ctas_tasks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tasks"
  ON ctas_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tasks"
  ON ctas_tasks FOR UPDATE
  TO authenticated
  USING (true);
```

---

## 📊 Task Schema #2: `tasks` (Generic - API endpoint check)

**Location:** `/ctas7-command-center/src/pages/api/database/supabase/status.ts`

**Query:**
```typescript
const { count: tasksCount } = await supabase
  .from('tasks')
  .select('*', { count: 'exact', head: true });
```

**Schema:** Simple `tasks` table (if it exists)

---

## 📊 Task Schema #3: `slotgraph_tasks` (SurrealDB - not Supabase)

**Location:** `/ctas-7-shipyard-staging/SLOTGRAPH_TASKS_INTEGRATION_PLAN.md`

**Database:** SurrealDB on `http://localhost:11451`

**Schema:**
```sql
DEFINE TABLE slotgraph_tasks SCHEMAFULL;

DEFINE FIELD task_id ON slotgraph_tasks TYPE string;
DEFINE FIELD task_name ON slotgraph_tasks TYPE string;
DEFINE FIELD description ON slotgraph_tasks TYPE string;
DEFINE FIELD category ON slotgraph_tasks TYPE string;
DEFINE FIELD priority ON slotgraph_tasks TYPE string;
DEFINE FIELD status ON slotgraph_tasks TYPE string;
DEFINE FIELD hd4_phase ON slotgraph_tasks TYPE string;
DEFINE FIELD dependencies ON slotgraph_tasks TYPE array;
DEFINE FIELD tools_required ON slotgraph_tasks TYPE array;
DEFINE FIELD estimated_duration ON slotgraph_tasks TYPE int;
DEFINE FIELD created_at ON slotgraph_tasks TYPE datetime;
```

---

## 📊 Task Schema #4: `tool_tasks` (Kali Tools - Supabase)

**Location:** `/ctas-7-shipyard-staging/kali-tools-unicode-base96-schema.sql`

**Schema:**
```sql
CREATE TABLE tool_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  unicode_operation TEXT,          -- \u{E001} for observe tasks
  base96_signature CHAR(16),       -- Base96 encoded task signature
  ansi_color TEXT,                 -- Color for this task type
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ooda_phase TEXT CHECK (ooda_phase IN ('observe', 'orient', 'decide', 'act')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CTAS Task Management                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ↓                           ↓
┌───────────────────────────┐    ┌──────────────────────────┐
│  Supabase (PostgreSQL)    │    │  SurrealDB (Graph)       │
│  Port: 5432 (Cloud)       │    │  Port: 11451             │
├───────────────────────────┤    ├──────────────────────────┤
│  • ctas_tasks             │    │  • slotgraph_tasks       │
│    ├─ Core task data      │    │    ├─ Task graph         │
│    ├─ PTCC decomposition  │    │    ├─ Dependencies       │
│    ├─ Agent assignments   │    │    └─ Tool requirements  │
│    ├─ Linear integration  │    │                          │
│    └─ Forge pub/sub       │    └──────────────────────────┘
│                           │
│  • tool_tasks             │
│    ├─ Kali tool tasks     │
│    ├─ Unicode operations  │
│    └─ OODA loop phases    │
│                           │
│  • tasks (generic)        │
│    └─ Legacy task table   │
└───────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────────┐
│                     Task Consumers                            │
├───────────────────────────────────────────────────────────────┤
│  • Forge (Port 18220) - Pub/Sub workflow orchestration       │
│  • Linear Agent (Port 18180) - Issue synchronization         │
│  • Agent Mesh (Ports 50051-50058) - Agent assignments        │
│  • Natasha Agent (Docker 18152) - Task execution             │
│  • GraphZilla WASM Nodes - Hash-addressed execution          │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚨 Current Issues

### **1. Missing `ctas_tasks` Table**
The code expects `ctas_tasks` in Supabase, but the schema was never created.

### **2. Multiple Task Systems**
- `ctas_tasks` (Supabase) - Primary task management
- `slotgraph_tasks` (SurrealDB) - Graph-based dependencies
- `tool_tasks` (Supabase) - Kali tool operations
- `tasks` (Supabase) - Generic/legacy

### **3. No Integration Between Systems**
Tasks in Supabase don't sync with SlotGraph or Forge.

---

## ✅ Solution: Unified CTAS Task Architecture

### **Primary Table: `ctas_tasks` (Supabase)**
Master task table with full CTAS-7 integration.

### **Secondary Systems:**
1. **SlotGraph Tasks (SurrealDB)** - For graph relationships and dependencies
2. **Tool Tasks (Supabase)** - For Kali tool catalog
3. **Forge Pub/Sub** - For workflow orchestration

### **Synchronization:**
```
┌──────────────┐
│ ctas_tasks   │ (Supabase - Master)
└──────┬───────┘
       │
       ├─> Forge (18220) - Subscribe to new tasks
       │   └─> WASM Nodes - Execute via hash
       │
       ├─> Linear Agent (18180) - Create Linear issues
       │   └─> COG-XXX issue keys
       │
       ├─> SlotGraph (SurrealDB) - Build dependency graph
       │   └─> Task relationships
       │
       └─> Agent Mesh - Assign to agents
           └─> PTCC decomposition
```

---

## 🎯 Next Steps

1. **Create `ctas_tasks` table in Supabase**
   - Run the migration SQL
   - Verify table creation
   - Test queries from DatabaseConnectionService

2. **Populate Sample Data**
   - Create test tasks
   - Assign to agents
   - Link to Linear issues

3. **Integrate with Forge**
   - Supabase triggers → Forge pub/sub
   - WASM nodes pick up tasks
   - Update status back to Supabase

4. **Test Full Workflow**
   - Create task in Supabase
   - Forge processes task
   - Agent executes task
   - Linear issue updated
   - Task marked complete

---

## 📝 Sample Tasks to Create

```sql
INSERT INTO ctas_tasks (title, description, status, priority, hd4_phase, assigned_to, linear_issue_key) VALUES
('Deploy Natasha Docker Container', 'Build and deploy Natasha Smart Crate as Docker service', 'in_progress', 'high', 'detect', 'natasha', 'COG-100'),
('Create Supabase Tasks Schema', 'Set up ctas_tasks table with full CTAS-7 integration', 'completed', 'critical', 'hunt', 'cove', 'COG-101'),
('Integrate Forge Pub/Sub', 'Connect Supabase tasks to Forge workflow orchestration', 'pending', 'high', 'disrupt', 'natasha', 'COG-102'),
('PM2 + Docker Hybrid Setup', 'Configure PM2 to manage Docker containers', 'in_progress', 'medium', 'detect', 'cove', 'COG-103'),
('PTCC Task Decomposition System', 'Implement PTCC decomposition for complex tasks', 'pending', 'high', 'hunt', 'claude', 'COG-104');
```

---

**Status:** 🔍 Analysis Complete - Ready for Implementation
**Priority:** Critical
**Next:** Create Supabase migration script
