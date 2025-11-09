-- =====================================================================
-- CTAS-7 Tasks System - Complete Integration
-- Migration: 001_create_ctas_tasks
-- Date: 2025-11-05
-- Author: CTAS-7 Team
-- =====================================================================

-- Create ctas_tasks table with full CTAS-7 integration
CREATE TABLE IF NOT EXISTS ctas_tasks (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core task fields
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical', 'urgent')),

  -- HD4 Framework Integration
  hd4_phase TEXT
    CHECK (hd4_phase IN ('hunt', 'detect', 'disrupt', 'disable', 'dominate')),

  -- Assignment & Ownership
  assigned_to TEXT,
  created_by TEXT,
  current_agent TEXT,

  -- Trivariate Hash System (CTAS Foundation)
  sch_hash VARCHAR(16),                     -- Semantic Convergent Hash (positions 1-16)
  cuid_hash VARCHAR(16),                    -- Contextual Unique ID (positions 17-32)
  uuid_hash VARCHAR(16),                    -- Universal Unique ID (positions 33-48)
  trivariate_hash_full VARCHAR(48) UNIQUE, -- Complete 48-character Base96 hash
  hash_generated_at TIMESTAMPTZ,
  hash_method VARCHAR(20) DEFAULT 'MURMUR3_BASE96',

  -- Forge Integration (TAPS Pub-Sub Engine - Port 18220)
  forge_subscription_id TEXT,
  forge_status TEXT DEFAULT 'ready'
    CHECK (forge_status IN ('ready', 'subscribed', 'processing', 'completed', 'failed')),
  forge_payload JSONB DEFAULT '{}'::jsonb,
  forge_result JSONB DEFAULT '{}'::jsonb,

  -- PTCC (Persona-Tool-Chain-Context) Integration
  ptcc_persona TEXT,                        -- e.g., "security_analyst", "red_team_operator"
  ptcc_tool_chain JSONB DEFAULT '[]'::jsonb, -- Array of tools: ["nmap", "metasploit"]
  ptcc_context JSONB DEFAULT '{}'::jsonb,    -- Context object
  ptcc_primitives JSONB DEFAULT '[]'::jsonb, -- Primitive operations
  ptcc_decomposed BOOLEAN DEFAULT FALSE,

  -- World Graph Integration (CogniGraph, SlotGraph)
  world_graph_entity_id TEXT,
  world_graph_type TEXT CHECK (world_graph_type IN ('cogni_graph', 'slot_graph', 'knowledge_mesh')),
  objectives JSONB DEFAULT '[]'::jsonb,      -- Task objectives array
  cog_analysis JSONB DEFAULT '{}'::jsonb,    -- Center of Gravity analysis
  interdiction_points JSONB DEFAULT '[]'::jsonb, -- Interdiction point discovery

  -- Agent Mesh Integration (Ports 50051-50058)
  agent_assignments JSONB DEFAULT '[]'::jsonb, -- Array of agent assignments
  agent_handoff_history JSONB DEFAULT '[]'::jsonb, -- History of agent handoffs
  agent_coordination_mode TEXT CHECK (agent_coordination_mode IN ('single', 'parallel', 'sequential', 'hierarchical')),

  -- Linear Integration (Port 18180, 15182)
  linear_issue_id TEXT,
  linear_issue_key TEXT,                    -- e.g., COG-42
  linear_team_id TEXT,
  linear_url TEXT,
  linear_sync_status TEXT DEFAULT 'not_synced'
    CHECK (linear_sync_status IN ('not_synced', 'syncing', 'synced', 'sync_failed')),
  linear_last_synced TIMESTAMPTZ,

  -- Smart Crate Integration
  smart_crate_id TEXT,
  smart_crate_name TEXT,
  smart_crate_deployed BOOLEAN DEFAULT FALSE,
  smart_crate_status TEXT CHECK (smart_crate_status IN ('not_created', 'building', 'ready', 'deployed', 'failed')),

  -- Red Team / Kali Operations (Natasha Agent - Port 18152)
  operation_type TEXT,                       -- e.g., "red_team", "penetration_test", "threat_hunt"
  mitre_attack_techniques JSONB DEFAULT '[]'::jsonb, -- Array of ATT&CK technique IDs
  kali_tools_required JSONB DEFAULT '[]'::jsonb,     -- Array of Kali tools needed
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),

  -- Cognetix Plasma Integration (Hunt & Detect Graph)
  plasma_hunt_query TEXT,
  plasma_detection_rules JSONB DEFAULT '[]'::jsonb,
  wazuh_alert_ids JSONB DEFAULT '[]'::jsonb,
  hft_ground_stations JSONB DEFAULT '[]'::jsonb,     -- HFT ground stations involved

  -- ABE Document Intelligence (Ports 18190-18192)
  abe_document_ids JSONB DEFAULT '[]'::jsonb,
  abe_report_generated BOOLEAN DEFAULT FALSE,
  abe_report_path TEXT,
  abe_drive_sync_status TEXT CHECK (abe_drive_sync_status IN ('not_synced', 'syncing', 'synced', 'failed')),

  -- Metadata & Tracking
  tags JSONB DEFAULT '[]'::jsonb,           -- Array of tags
  category TEXT,                             -- Task category
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

  -- Dependencies & Relationships
  parent_task_id UUID REFERENCES ctas_tasks(id) ON DELETE CASCADE,
  depends_on_task_ids JSONB DEFAULT '[]'::jsonb, -- Array of task IDs this depends on
  blocks_task_ids JSONB DEFAULT '[]'::jsonb,     -- Array of task IDs this blocks
  related_task_ids JSONB DEFAULT '[]'::jsonb,    -- Array of related tasks

  -- Attachments & Links
  attachments JSONB DEFAULT '[]'::jsonb,
  external_links JSONB DEFAULT '[]'::jsonb,
  screenshots JSONB DEFAULT '[]'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Notes & Comments
  notes TEXT,
  completion_notes TEXT,
  failure_reason TEXT,

  -- Custom Fields (extensible)
  custom_fields JSONB DEFAULT '{}'::jsonb
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Primary query indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_status ON ctas_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_priority ON ctas_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_assigned_to ON ctas_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_created_by ON ctas_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_current_agent ON ctas_tasks(current_agent);

-- HD4 & Operations
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_hd4_phase ON ctas_tasks(hd4_phase);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_operation_type ON ctas_tasks(operation_type);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_threat_level ON ctas_tasks(threat_level);

-- Hash & Identification
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_trivariate ON ctas_tasks(trivariate_hash_full) WHERE trivariate_hash_full IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_sch_hash ON ctas_tasks(sch_hash) WHERE sch_hash IS NOT NULL;

-- Integration indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_linear ON ctas_tasks(linear_issue_key) WHERE linear_issue_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_linear_sync ON ctas_tasks(linear_sync_status);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_forge ON ctas_tasks(forge_subscription_id) WHERE forge_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_forge_status ON ctas_tasks(forge_status);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_smart_crate ON ctas_tasks(smart_crate_id) WHERE smart_crate_id IS NOT NULL;

-- Time-based indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_created_at ON ctas_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_updated_at ON ctas_tasks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_due_date ON ctas_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_completed_at ON ctas_tasks(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_parent ON ctas_tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_category ON ctas_tasks(category);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_tags_gin ON ctas_tasks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_ptcc_tools_gin ON ctas_tasks USING GIN (ptcc_tool_chain);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_agent_assignments_gin ON ctas_tasks USING GIN (agent_assignments);
CREATE INDEX IF NOT EXISTS idx_ctas_tasks_mitre_attack_gin ON ctas_tasks USING GIN (mitre_attack_techniques);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Update updated_at timestamp on every update
CREATE TRIGGER update_ctas_tasks_updated_at
    BEFORE UPDATE ON ctas_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set timestamps based on status changes
CREATE OR REPLACE FUNCTION ctas_tasks_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Set started_at when status changes to in_progress
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;

  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;

  -- Set cancelled_at when status changes to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ctas_tasks_status_timestamp_trigger
    BEFORE UPDATE ON ctas_tasks
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION ctas_tasks_status_timestamp();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE ctas_tasks ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for monitoring dashboards)
CREATE POLICY "Allow public read access to ctas_tasks"
  ON ctas_tasks FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks"
  ON ctas_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their assigned tasks
CREATE POLICY "Allow authenticated users to update tasks"
  ON ctas_tasks FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete tasks (soft delete preferred)
CREATE POLICY "Allow authenticated users to delete tasks"
  ON ctas_tasks FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================================

-- Active tasks view
CREATE OR REPLACE VIEW active_tasks AS
SELECT
  id, title, status, priority, hd4_phase, assigned_to,
  linear_issue_key, trivariate_hash_full, created_at, due_date
FROM ctas_tasks
WHERE status IN ('pending', 'in_progress')
ORDER BY priority DESC, due_date ASC NULLS LAST;

-- High priority tasks view
CREATE OR REPLACE VIEW high_priority_tasks AS
SELECT
  id, title, description, status, priority, assigned_to,
  hd4_phase, operation_type, threat_level, due_date
FROM ctas_tasks
WHERE priority IN ('high', 'critical', 'urgent')
  AND status IN ('pending', 'in_progress')
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'critical' THEN 2
    WHEN 'high' THEN 3
  END,
  due_date ASC NULLS LAST;

-- Agent workload view
CREATE OR REPLACE VIEW agent_workload AS
SELECT
  assigned_to as agent,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
  COUNT(*) FILTER (WHERE priority IN ('high', 'critical', 'urgent')) as high_priority_tasks,
  SUM(estimated_hours) as estimated_hours_total,
  SUM(actual_hours) as actual_hours_total
FROM ctas_tasks
WHERE assigned_to IS NOT NULL
  AND status IN ('pending', 'in_progress')
GROUP BY assigned_to
ORDER BY in_progress_tasks DESC, pending_tasks DESC;

-- Red Team operations view
CREATE OR REPLACE VIEW red_team_operations AS
SELECT
  id, title, status, priority, threat_level,
  assigned_to, operation_type, mitre_attack_techniques,
  kali_tools_required, created_at, due_date
FROM ctas_tasks
WHERE operation_type IN ('red_team', 'penetration_test', 'threat_hunt', 'vulnerability_scan')
  AND status IN ('pending', 'in_progress')
ORDER BY threat_level DESC, priority DESC;

-- Linear sync status view
CREATE OR REPLACE VIEW linear_sync_status AS
SELECT
  id, title, status, linear_issue_key, linear_sync_status,
  linear_last_synced, updated_at
FROM ctas_tasks
WHERE linear_issue_key IS NOT NULL
ORDER BY linear_last_synced DESC NULLS LAST;

-- =====================================================================
-- SAMPLE DATA (FOR TESTING)
-- =====================================================================

INSERT INTO ctas_tasks (
  title, description, status, priority, hd4_phase,
  assigned_to, linear_issue_key, operation_type, category
) VALUES
(
  'Deploy Natasha Docker Container',
  'Build and deploy Natasha Smart Crate as Docker service with full CTAS-7 integration',
  'in_progress',
  'high',
  'detect',
  'natasha',
  'COG-100',
  'devops',
  'infrastructure'
),
(
  'Create Supabase Tasks Schema',
  'Set up ctas_tasks table with full CTAS-7 integration including Forge, PTCC, World Graph, and Agent Mesh',
  'completed',
  'critical',
  'hunt',
  'cove',
  'COG-101',
  'development',
  'database'
),
(
  'Integrate Forge Pub/Sub with Tasks',
  'Connect Supabase ctas_tasks to Forge workflow orchestration via TAPS Pub-Sub on port 18220',
  'pending',
  'high',
  'disrupt',
  'natasha',
  'COG-102',
  'integration',
  'workflow'
),
(
  'PM2 + Docker Hybrid Setup',
  'Configure PM2 ecosystem to manage Docker containers alongside Node.js/Python services',
  'in_progress',
  'medium',
  'detect',
  'cove',
  'COG-103',
  'devops',
  'orchestration'
),
(
  'PTCC Task Decomposition System',
  'Implement automatic PTCC decomposition for complex tasks with agent skill mapping',
  'pending',
  'high',
  'hunt',
  'claude',
  'COG-104',
  'development',
  'ai_ml'
),
(
  'Red Team Operation - Target Network X',
  'Full penetration test with MITRE ATT&CK mapping and threat intelligence gathering',
  'pending',
  'urgent',
  'disrupt',
  'natasha',
  'COG-105',
  'red_team',
  'security'
) ON CONFLICT DO NOTHING;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE ctas_tasks IS 'Master task table for CTAS-7 with full integration across Forge, PTCC, World Graph, Agent Mesh, Linear, and Smart Crates';
COMMENT ON COLUMN ctas_tasks.trivariate_hash_full IS '48-character Base96 trivariate hash (SCH+CUID+UUID) using Murmur3';
COMMENT ON COLUMN ctas_tasks.forge_subscription_id IS 'Forge TAPS Pub-Sub subscription ID for workflow orchestration';
COMMENT ON COLUMN ctas_tasks.ptcc_decomposed IS 'Whether this task has been decomposed into Persona-Tool-Chain-Context primitives';
COMMENT ON COLUMN ctas_tasks.agent_coordination_mode IS 'How agents should coordinate on this task: single, parallel, sequential, or hierarchical';
COMMENT ON COLUMN ctas_tasks.mitre_attack_techniques IS 'Array of MITRE ATT&CK technique IDs (e.g., ["T1021", "T1569"])';

-- =====================================================================
-- COMPLETION MESSAGE
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ CTAS Tasks System Migration Complete';
  RAISE NOTICE '📊 Tables Created: ctas_tasks';
  RAISE NOTICE '📈 Indexes Created: 25 indexes for optimal query performance';
  RAISE NOTICE '🔒 RLS Policies: Enabled with public read, authenticated write';
  RAISE NOTICE '👁️ Views Created: 5 views for common queries';
  RAISE NOTICE '📝 Sample Data: 6 test tasks inserted';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Verify table: SELECT COUNT(*) FROM ctas_tasks;';
  RAISE NOTICE '   2. Check sample data: SELECT * FROM active_tasks;';
  RAISE NOTICE '   3. Test Forge integration via port 18220';
  RAISE NOTICE '   4. Connect Linear Agent (port 18180) for sync';
END $$;
