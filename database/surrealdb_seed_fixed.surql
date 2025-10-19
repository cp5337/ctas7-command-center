-- CTAS-7 SurrealDB Seed Script (Fixed for SurrealDB 2.3.7)
-- Database: hft_network
-- Namespace: ctas7

-- OV-1: High Level Operational Concept Graphic
CREATE ov_1:enterprise_ops SET
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

-- SV-1: Systems Interface Description
CREATE sv_1:interfaces SET
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

-- BNE Archaeological Case Studies
CREATE case:python_disaster SET
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

-- Satellite telemetry for space domain testing
CREATE satellite:ctas_sat_001 SET
  name = "CTAS-SAT-001",
  orbital_altitude = 425.7,
  velocity = 7.66,
  signal_strength = -85.2,
  battery_level = 0.87,
  status = "operational",
  world_domain = "space",
  last_contact = time::now(),
  created_at = time::now();

CREATE satellite:ctas_sat_002 SET
  name = "CTAS-SAT-002",
  orbital_altitude = 387.2,
  velocity = 7.68,
  signal_strength = -78.5,
  battery_level = 0.92,
  status = "operational",
  world_domain = "space",
  last_contact = time::now(),
  created_at = time::now();

-- Cyber security events for cyber domain testing
CREATE cyber_event:threat_001 SET
  event_type = "intrusion_attempt",
  source_ip = "203.112.45.67",
  target_system = "neural_mux_api",
  threat_level = "high",
  status = "blocked",
  world_domain = "cyber",
  detection_method = "anomaly_detection",
  qa5_source = "B", -- Usually reliable
  qa5_info = 2,     -- Probably true
  timestamp = time::now(),
  created_at = time::now();

CREATE cyber_event:threat_002 SET
  event_type = "malware_detection",
  source_ip = "192.168.1.100",
  target_system = "archaeological_recycler",
  threat_level = "medium",
  status = "quarantined",
  world_domain = "cyber",
  detection_method = "signature_match",
  qa5_source = "A", -- Completely reliable
  qa5_info = 1,     -- Confirmed
  timestamp = time::now(),
  created_at = time::now();

-- Maritime vessel tracking for maritime domain testing
CREATE vessel:mv_ctas_001 SET
  name = "MV CTAS-001",
  vessel_type = "research",
  latitude = 37.7749,
  longitude = -122.4194,
  heading = 045,
  speed = 12.5,
  status = "active",
  world_domain = "maritime",
  last_position_update = time::now(),
  created_at = time::now();

CREATE vessel:mv_ctas_002 SET
  name = "MV CTAS-002",
  vessel_type = "cargo",
  latitude = 40.7128,
  longitude = -74.0060,
  heading = 180,
  speed = 8.3,
  status = "active",
  world_domain = "maritime",
  last_position_update = time::now(),
  created_at = time::now();

-- Network topology data for network domain testing
CREATE network_node:node_001 SET
  name = "Neural-Mux-Primary",
  node_type = "message_broker",
  ip_address = "10.0.1.100",
  port = 18100,
  status = "online",
  world_domain = "network",
  connections = ["node_002", "node_003"],
  throughput_mbps = 1000,
  latency_ms = 2.5,
  last_heartbeat = time::now(),
  created_at = time::now();

CREATE network_node:node_002 SET
  name = "SurrealDB-DocGraph",
  node_type = "database",
  ip_address = "10.0.1.200",
  port = 8000,
  status = "online",
  world_domain = "network",
  connections = ["node_001", "node_003"],
  throughput_mbps = 500,
  latency_ms = 5.2,
  last_heartbeat = time::now(),
  created_at = time::now();

-- Geographical monitoring data for geographical domain testing
CREATE geo_point:point_001 SET
  name = "San Francisco Operations Center",
  location_type = "operations_center",
  latitude = 37.7749,
  longitude = -122.4194,
  elevation = 16.0,
  world_domain = "geographical",
  temperature_c = 18.5,
  humidity_percent = 65,
  wind_speed_kmh = 12.3,
  status = "operational",
  last_reading = time::now(),
  created_at = time::now();

CREATE geo_point:point_002 SET
  name = "New York Field Station",
  location_type = "field_station",
  latitude = 40.7128,
  longitude = -74.0060,
  elevation = 10.0,
  world_domain = "geographical",
  temperature_c = 15.2,
  humidity_percent = 72,
  wind_speed_kmh = 8.7,
  status = "operational",
  last_reading = time::now(),
  created_at = time::now();

-- Validation metrics for real-time KPI display
CREATE metrics:current SET
  timestamp = time::now(),
  kpis = {
    recycling_success_rate: 86.0,
    primitives_ready: 32,
    primitives_total: 32,
    dod_compliance: 98.2,
    active_cases: 2,
    total_cases: 15,
    neural_mux_throughput: 1000,
    archaeological_artifacts: 258,
    satellites_active: 2,
    cyber_threats_blocked: 2,
    vessels_tracked: 2,
    network_nodes_online: 2,
    geo_stations_operational: 2
  },
  world_status = {
    space: "operational",
    cyber: "alert",
    maritime: "operational",
    network: "operational",
    geographical: "operational"
  },
  status = "operational";

-- Create indexes for performance
DEFINE INDEX idx_case_type ON case FIELDS case_type;
DEFINE INDEX idx_qa5_source ON ov_1 FIELDS qa5_source;
DEFINE INDEX idx_qa5_source_ov2 ON ov_2 FIELDS qa5_source;
DEFINE INDEX idx_qa5_source_sv1 ON sv_1 FIELDS qa5_source;
DEFINE INDEX idx_qa5_source_sv4 ON sv_4 FIELDS qa5_source;
DEFINE INDEX idx_timestamp ON metrics FIELDS timestamp;
DEFINE INDEX idx_world_domain ON satellite FIELDS world_domain;
DEFINE INDEX idx_world_domain_cyber ON cyber_event FIELDS world_domain;
DEFINE INDEX idx_world_domain_vessel ON vessel FIELDS world_domain;
DEFINE INDEX idx_world_domain_network ON network_node FIELDS world_domain;
DEFINE INDEX idx_world_domain_geo ON geo_point FIELDS world_domain;
DEFINE INDEX idx_threat_level ON cyber_event FIELDS threat_level;
DEFINE INDEX idx_vessel_status ON vessel FIELDS status;
DEFINE INDEX idx_network_status ON network_node FIELDS status;

-- Success message
SELECT "CTAS-7 SurrealDB seed data created successfully with all world domains" AS message FROM metrics:current;