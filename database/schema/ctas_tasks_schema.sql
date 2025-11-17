-- CTAS Tasks Table Schema with Dual Trivariate Hash Architecture
-- CTAS 7.3.1 Specification
--
-- DUAL HASH SYSTEM - ALL HASHES USE MurmurHash3 SCH-CUID-UUID Trivariate:
-- 1. OPERATIONAL (op_*): MurmurHash3 SCH-CUID-UUID for routing/caching
-- 2. SEMANTIC (sem_*): MurmurHash3 SCH-CUID-UUID for content/semantic analysis
--
-- SCH-CUID-UUID Structure (48 characters, Base96 encoded):
-- - Characters 1-16: SCH (Short-Hand Concept) - MurmurHash3 seed 0
-- - Characters 17-32: CUID (Contextual Unique ID) - MurmurHash3 seed + timestamp
-- - Characters 33-48: UUID (Universal Unique ID) - MurmurHash3 random seed
--
-- Naming Convention:
-- - op_*  = Operational routing hashes (MurmurHash3 trivariate)
-- - sem_* = Semantic understanding hashes (MurmurHash3 trivariate)

-- Drop existing table if recreating
-- DROP TABLE IF EXISTS ctas_tasks CASCADE;

-- Create main tasks table
CREATE TABLE IF NOT EXISTS ctas_tasks (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Identification
    hash_id TEXT NOT NULL UNIQUE,              -- Original task identifier (e.g., uuid-000-000-001)
    task_name TEXT NOT NULL,                   -- Human-readable task name
    description TEXT NOT NULL,                 -- Detailed task description
    
    -- Classification
    category TEXT NOT NULL,                    -- Task category/domain
    hd4_phase TEXT NOT NULL                    -- HD4 phase: Hunt, Detect, Disrupt, Disable, Dominate
        CHECK (hd4_phase IN ('Hunt', 'Detect', 'Disrupt', 'Disable', 'Dominate', 'All')),
    primitive_type TEXT NOT NULL               -- PTCC primitive type
        CHECK (primitive_type IN ('Concept', 'Actor', 'Object', 'Event', 'Attribute', 'Unclassified')),
    
    -- Graph Relationships (JSON arrays of hash_ids)
    predecessors JSONB DEFAULT '[]'::jsonb,    -- Array of predecessor task hash_ids
    successors JSONB DEFAULT '[]'::jsonb,      -- Array of successor task hash_ids
    
    -- PTH Metrics (Probability, Time, Hazard)
    p_probability DECIMAL(5,4)                 -- Probability factor (0.0000 - 1.0000)
        CHECK (p_probability >= 0 AND p_probability <= 1),
    t_time DECIMAL(5,4)                        -- Time factor (0.0000 - 1.0000)
        CHECK (t_time >= 0 AND t_time <= 1),
    h_hazard DECIMAL(5,4)                      -- Hazard factor (0.0000 - 1.0000)
        CHECK (h_hazard >= 0 AND h_hazard <= 1),
    
    -- Sequencing
    task_seq INTEGER NOT NULL,                 -- Sequential ordering number
    
    -- ========================================================================
    -- OPERATIONAL HASH FIELDS (MurmurHash3 SCH-CUID-UUID Trivariate - Base96)
    -- Each hash is 48 characters: SCH(16) + CUID(16) + UUID(16)
    -- Used for deterministic routing, caching, and system coordination
    -- ========================================================================
    
    op_content_hash TEXT,                      -- MurmurHash3 SCH-CUID-UUID from task content
                                               -- (name + description + category)
    
    op_primitive_hash TEXT,                    -- MurmurHash3 SCH-CUID-UUID from primitive_type
                                               -- Type-based routing for primitive classification
    
    op_chain_hash TEXT,                        -- MurmurHash3 SCH-CUID-UUID from relationships
                                               -- (predecessors + successors)
    
    op_pth_hash TEXT,                          -- MurmurHash3 SCH-CUID-UUID from metrics
                                               -- (p + t + h combined)
    
    op_composite_hash TEXT UNIQUE,             -- MurmurHash3 SCH-CUID-UUID composite
                                               -- All operational hashes combined
    
    -- ========================================================================
    -- SEMANTIC HASH FIELDS (MurmurHash3 SCH-CUID-UUID Trivariate - Base96)
    -- Each hash is 48 characters: SCH(16) + CUID(16) + UUID(16)
    -- Used for content similarity, semantic search, and ML operations
    -- ========================================================================
    
    sem_content_hash TEXT,                     -- MurmurHash3 SCH-CUID-UUID from semantic content
                                               -- For similarity matching and content clustering
    
    sem_category_hash TEXT,                    -- MurmurHash3 SCH-CUID-UUID from semantic category
                                               -- For semantic classification and grouping
    
    sem_relationship_hash TEXT,                -- MurmurHash3 SCH-CUID-UUID from semantic context
                                               -- For contextual similarity analysis
    
    sem_composite_hash TEXT UNIQUE,            -- MurmurHash3 SCH-CUID-UUID semantic composite
                                               -- All semantic hashes combined
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- INDEXES
-- ========================================================================

-- Core identification indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_hash_id ON ctas_tasks(hash_id);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_task_name ON ctas_tasks(task_name);

-- Classification indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_hd4_phase ON ctas_tasks(hd4_phase);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_primitive_type ON ctas_tasks(primitive_type);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_category ON ctas_tasks(category);

-- Combined classification index for common queries
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_classification 
    ON ctas_tasks(hd4_phase, primitive_type, category);

-- PTH metric indexes for range queries
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_p_probability ON ctas_tasks(p_probability);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_t_time ON ctas_tasks(t_time);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_h_hazard ON ctas_tasks(h_hazard);

-- Sequencing index
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_task_seq ON ctas_tasks(task_seq);

-- Operational hash indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_op_content_hash ON ctas_tasks(op_content_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_op_primitive_hash ON ctas_tasks(op_primitive_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_op_chain_hash ON ctas_tasks(op_chain_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_op_pth_hash ON ctas_tasks(op_pth_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_op_composite_hash ON ctas_tasks(op_composite_hash);

-- Semantic hash indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_sem_content_hash ON ctas_tasks(sem_content_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_sem_category_hash ON ctas_tasks(sem_category_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_sem_relationship_hash ON ctas_tasks(sem_relationship_hash);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_sem_composite_hash ON ctas_tasks(sem_composite_hash);

-- JSONB indexes for graph relationships
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_predecessors ON ctas_tasks USING GIN(predecessors);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_successors ON ctas_tasks USING GIN(successors);

-- Timestamp indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_created_at ON ctas_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_updated_at ON ctas_tasks(updated_at);

-- ========================================================================
-- HELPER FUNCTIONS
-- ========================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ctas_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_ctas_tasks_updated_at ON ctas_tasks;
CREATE TRIGGER trigger_update_ctas_tasks_updated_at
    BEFORE UPDATE ON ctas_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_ctas_tasks_updated_at();

-- ========================================================================
-- VIEWS FOR COMMON QUERIES
-- ========================================================================

-- View: Tasks with complete hash coverage
CREATE OR REPLACE VIEW ctas_tasks_complete_hashes AS
SELECT *
FROM ctas_tasks
WHERE op_composite_hash IS NOT NULL 
  AND sem_composite_hash IS NOT NULL;

-- View: Tasks needing hash generation
CREATE OR REPLACE VIEW ctas_tasks_needs_hashing AS
SELECT 
    id,
    hash_id,
    task_name,
    CASE WHEN op_composite_hash IS NULL THEN 'operational' ELSE NULL END as needs_op_hash,
    CASE WHEN sem_composite_hash IS NULL THEN 'semantic' ELSE NULL END as needs_sem_hash
FROM ctas_tasks
WHERE op_composite_hash IS NULL 
   OR sem_composite_hash IS NULL;

-- View: Task statistics by phase
CREATE OR REPLACE VIEW ctas_tasks_stats_by_phase AS
SELECT 
    hd4_phase,
    COUNT(*) as task_count,
    COUNT(CASE WHEN op_composite_hash IS NOT NULL THEN 1 END) as op_hash_count,
    COUNT(CASE WHEN sem_composite_hash IS NOT NULL THEN 1 END) as sem_hash_count,
    AVG(p_probability) as avg_probability,
    AVG(t_time) as avg_time,
    AVG(h_hazard) as avg_hazard
FROM ctas_tasks
GROUP BY hd4_phase
ORDER BY hd4_phase;

-- View: Task statistics by primitive type
CREATE OR REPLACE VIEW ctas_tasks_stats_by_primitive AS
SELECT 
    primitive_type,
    COUNT(*) as task_count,
    COUNT(CASE WHEN op_composite_hash IS NOT NULL THEN 1 END) as op_hash_count,
    COUNT(CASE WHEN sem_composite_hash IS NOT NULL THEN 1 END) as sem_hash_count,
    AVG(p_probability) as avg_probability,
    AVG(t_time) as avg_time,
    AVG(h_hazard) as avg_hazard
FROM ctas_tasks
GROUP BY primitive_type
ORDER BY primitive_type;

-- ========================================================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================================================

COMMENT ON TABLE ctas_tasks IS 
'CTAS 7.3.1 Task Database with Dual Trivariate Hash Architecture. 
Contains operational (MurmurHash3) and semantic (H₃) hashes for routing and analysis.';

COMMENT ON COLUMN ctas_tasks.op_content_hash IS 
'MurmurHash3 SCH-CUID-UUID trivariate (48-char Base96) from task content for operational routing.';

COMMENT ON COLUMN ctas_tasks.op_composite_hash IS 
'MurmurHash3 SCH-CUID-UUID trivariate (48-char Base96) composite of all operational hashes.';

COMMENT ON COLUMN ctas_tasks.sem_content_hash IS 
'MurmurHash3 SCH-CUID-UUID trivariate (48-char Base96) from semantic content analysis.';

COMMENT ON COLUMN ctas_tasks.sem_composite_hash IS 
'MurmurHash3 SCH-CUID-UUID trivariate (48-char Base96) composite of all semantic hashes.';

COMMENT ON COLUMN ctas_tasks.p_probability IS 
'PTH Probability metric (0.0-1.0): likelihood or confidence factor.';

COMMENT ON COLUMN ctas_tasks.t_time IS 
'PTH Time metric (0.0-1.0): temporal urgency or duration factor.';

COMMENT ON COLUMN ctas_tasks.h_hazard IS 
'PTH Hazard metric (0.0-1.0): risk or severity factor.';
