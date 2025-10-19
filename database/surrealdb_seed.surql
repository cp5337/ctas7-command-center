-- CTAS-7 SurrealDB Seed Script
-- Database: ctas
-- Namespaces: ov, sv, bne_cases

-- Initialize database and namespaces
DEFINE NAMESPACE ov;
DEFINE NAMESPACE sv;
DEFINE NAMESPACE bne_cases;

-- Switch to OV namespace for Operational Views
USE NS ov;

-- OV-1: High Level Operational Concept Graphic
CREATE ov_1:enterprise_ops SET
  id = "ov_1:enterprise_ops",
  title = "CTAS-7 Enterprise Operations",
  description = "High-level operational concept for CTAS-7 EA framework",
  status = "active",
  qa5_source = "A", -- Completely reliable
  qa5_info = 1,     -- Confirmed
  activities = [
    { name: "BNE Methodology", status: "operational", performance: 86.0 },
    { name: "DoD EA Compliance", status: "validated", performance: 98.2 },
    { name: "Archaeological Recycling", status: "active", performance: 96.6 }
  ],
  created_at = time::now(),
  updated_at = time::now();

-- OV-2: Operational Resource Flow Description
CREATE ov_2:resource_flows SET
  id = "ov_2:resource_flows",
  title = "Resource Flow Matrix",
  description = "Flow of resources through CTAS-7 EA operations",
  flows = [
    { from: "neural-mux", to: "smartcrate-fabric", resource: "telemetry", rate: "1000/sec" },
    { from: "archaeological-recycler", to: "bne-validator", resource: "code-artifacts", rate: "50/min" },
    { from: "qa5-engine", to: "dod-compliance", resource: "validation-reports", rate: "10/hour" }
  ],
  qa5_source = "A",
  qa5_info = 1,
  created_at = time::now();

-- Switch to SV namespace for Systems Views
USE NS sv;

-- SV-1: Systems Interface Description
CREATE sv_1:interfaces SET
  id = "sv_1:interfaces",
  title = "CTAS-7 System Interfaces",
  description = "Interface specifications for EA components",
  interfaces = [
    {
      id: "neural_mux_api",
      protocol: "WebSocket",
      endpoint: "ws://localhost:18100",
      qos: "high",
      topics: ["kpi.recycling", "ops.trackers", "qa5.events"]
    },
    {
      id: "surrealdb_docgraph",
      protocol: "HTTP/WS",
      endpoint: "ws://localhost:8000/rpc",
      auth: "token_based",
      namespaces: ["ov", "sv", "bne_cases"]
    },
    {
      id: "supabase_core",
      protocol: "REST/GraphQL",
      endpoint: "https://ctas-core.supabase.co",
      auth: "jwt_bearer",
      tables: ["standards", "qa5_sources", "users"]
    }
  ],
  qa5_source = "A",
  qa5_info = 1,
  created_at = time::now();

-- SV-4: Systems Functionality Description
CREATE sv_4:functionality SET
  id = "sv_4:functionality",
  title = "System Function Matrix",
  description = "Functional capabilities of CTAS-7 components",
  functions = [
    {
      component: "BNE Engine",
      capabilities: ["archaeological_recycling", "code_validation", "performance_metrics"],
      performance: { success_rate: 86.0, acceleration: 26.9, reliability: "A" }
    },
    {
      component: "DoD EA Generator",
      capabilities: ["dodaf_compliance", "qa5_validation", "xsd_schema_validation"],
      performance: { compliance_rate: 98.2, generation_time: "15min", reliability: "A" }
    },
    {
      component: "Neural Mux",
      capabilities: ["real_time_telemetry", "event_routing", "qos_management"],
      performance: { throughput: "1000msg/sec", latency: "< 5ms", reliability: "A" }
    }
  ],
  qa5_source = "A",
  qa5_info = 1,
  created_at = time::now();

-- Switch to BNE Cases namespace
USE NS bne_cases;

-- BNE Archaeological Case Studies
CREATE case:python_disaster SET
  id = "case:python_disaster",
  title = "Python Repository Disaster Recovery",
  description = "AI model drift destroyed production system - $50,000+ impact",
  case_type = "archaeological_failure",
  impact_cost = 50000,
  timeline = {
    incident_date: "2024-03-15T09:00:00Z",
    discovery_date: "2024-03-15T14:30:00Z",
    resolution_date: "2024-03-22T16:00:00Z"
  },
  bne_methodology = {
    archaeological_success: false,
    traditional_ai_approach: "failed",
    recovery_method: "manual_restoration",
    lessons_learned: "AI model drift requires archaeological preservation"
  },
  qa5_assessment = {
    source: "A", -- Primary incident reports
    info: 1      -- Confirmed through forensic analysis
  },
  created_at = time::now();

CREATE case:successful_recycling SET
  id = "case:successful_recycling",
  title = "Legacy Codebase Revival - 258 Functions",
  description = "Successful archaeological recycling of orphaned repository",
  case_type = "archaeological_success",
  metrics = {
    files_analyzed: 50,
    functions_tested: 258,
    success_rate: 86.0,
    acceleration_factor: 26.9,
    time_saved_hours: 120
  },
  bne_methodology = {
    archaeological_success: true,
    preservation_method: "atomic_snapshots",
    validation_approach: "qa5_double_blind",
    integration_success: true
  },
  primitives_used = [
    "voice_to_code", "archaeological_scanner", "qa5_validator",
    "integration_tester", "performance_profiler"
  ],
  qa5_assessment = {
    source: "A",
    info: 1
  },
  created_at = time::now();

-- Validation metrics for real-time KPI display
CREATE metrics:current SET
  id = "metrics:current",
  timestamp = time::now(),
  kpis = {
    recycling_success_rate: 86.0,
    primitives_ready: 32,
    primitives_total: 32,
    dod_compliance: 98.2,
    active_cases: 2,
    total_cases: 15,
    neural_mux_throughput: 1000,
    archaeological_artifacts: 258
  },
  status = "operational";

-- Create indexes for performance
DEFINE INDEX idx_case_type ON bne_cases:* FIELDS case_type;
DEFINE INDEX idx_qa5_source ON ov:* FIELDS qa5_source;
DEFINE INDEX idx_timestamp ON metrics:* FIELDS timestamp;

-- Success message
SELECT "CTAS-7 SurrealDB seed data created successfully" AS message;