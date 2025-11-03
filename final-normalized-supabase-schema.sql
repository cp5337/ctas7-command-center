/*
  CTAS-7 Final Normalized ACID Database Schema

  Combines:
  - Existing space world schema (ground_nodes, weather_data, satellites)
  - Comprehensive scoring criteria (starlink, cable, atmospheric, political, etc.)
  - Trivariate hash integration (16+16+16=48 character Base96)
  - Weather overlay structure maintained
  - Monte Carlo stress testing integration
  - Foundation Bridge compatibility

  Target: Supabase PostgreSQL with full ACID compliance
*/

-- =====================================================================
-- CORE ENTITIES TABLES
-- =====================================================================

-- Enhanced ground nodes table with comprehensive scoring
CREATE TABLE IF NOT EXISTS ground_nodes (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  station_code VARCHAR(20) UNIQUE, -- e.g., 'ABU_DHABI_001'

  -- Geographic data
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  altitude_m INTEGER DEFAULT 0,
  region TEXT NOT NULL,
  country_code CHAR(3),
  timezone TEXT,

  -- Original space world fields
  tier SMALLINT NOT NULL CHECK (tier IN (1, 2, 3)),
  demand_gbps DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (demand_gbps >= 0),
  weather_score DOUBLE PRECISION NOT NULL DEFAULT 1.0 CHECK (weather_score >= 0 AND weather_score <= 1.0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'offline', 'maintenance', 'planned')),

  -- ===================================================================
  -- TRIVARIATE HASH FIELDS (Foundation Bridge Integration)
  -- ===================================================================
  sch_hash VARCHAR(16), -- Semantic Convergent Hash (positions 1-16)
  cuid_hash VARCHAR(16), -- Contextual Unique ID (positions 17-32)
  uuid_hash VARCHAR(16), -- Universal Unique ID (positions 33-48)
  trivariate_hash_full VARCHAR(48) UNIQUE, -- Complete 48-character Base96 hash
  hash_generated_at TIMESTAMPTZ,
  hash_method VARCHAR(20) DEFAULT 'MURMUR3_BASE96',

  -- ===================================================================
  -- COMPREHENSIVE SCORING SYSTEM (0-100 scale)
  -- ===================================================================
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),

  -- Detailed scoring breakdown
  starlink_score INTEGER CHECK (starlink_score >= 0 AND starlink_score <= 15),
  cable_score INTEGER CHECK (cable_score >= 0 AND cable_score <= 15),
  atmospheric_score INTEGER CHECK (atmospheric_score >= 0 AND atmospheric_score <= 20),
  political_score INTEGER CHECK (political_score >= 0 AND political_score <= 20),
  infrastructure_score INTEGER CHECK (infrastructure_score >= 0 AND infrastructure_score <= 15),
  strategic_score INTEGER CHECK (strategic_score >= 0 AND strategic_score <= 15),

  -- ===================================================================
  -- RISK ASSESSMENT
  -- ===================================================================
  unrest_risk_level VARCHAR(10) CHECK (unrest_risk_level IN ('MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100), -- Numbeo safety index
  crime_level VARCHAR(10) CHECK (crime_level IN ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH')),
  political_stability DECIMAL(3, 2) CHECK (political_stability >= 0 AND political_stability <= 1),

  -- ===================================================================
  -- INFRASTRUCTURE DETAILS
  -- ===================================================================
  cable_landing_count INTEGER DEFAULT 0,
  total_bandwidth_tbps DECIMAL(10, 3) DEFAULT 0,
  fiber_access_quality VARCHAR(10) CHECK (fiber_access_quality IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')),
  power_grid_stability DECIMAL(3, 2) DEFAULT 0.0 CHECK (power_grid_stability >= 0 AND power_grid_stability <= 1),

  -- ===================================================================
  -- ATMOSPHERIC CONDITIONS
  -- ===================================================================
  annual_sunny_hours INTEGER DEFAULT 0,
  avg_cloud_cover_percent INTEGER CHECK (avg_cloud_cover_percent >= 0 AND avg_cloud_cover_percent <= 100),
  atmospheric_turbulence VARCHAR(10) CHECK (atmospheric_turbulence IN ('EXCELLENT', 'GOOD', 'MODERATE', 'POOR')),
  seeing_conditions_arcsec DECIMAL(4, 2),
  wind_stability VARCHAR(10) CHECK (wind_stability IN ('EXCELLENT', 'GOOD', 'MODERATE', 'POOR')),

  -- ===================================================================
  -- STARLINK INTEGRATION
  -- ===================================================================
  starlink_gateway_proximity BOOLEAN DEFAULT FALSE,
  nearest_gateway_distance_km INTEGER,
  gateway_count_50km INTEGER DEFAULT 0,
  starlink_bandwidth_access_gbps INTEGER DEFAULT 0,

  -- ===================================================================
  -- OPERATIONAL STATUS
  -- ===================================================================
  capacity_gbps INTEGER DEFAULT 0,
  current_load_percent INTEGER CHECK (current_load_percent >= 0 AND current_load_percent <= 100),
  last_health_check TIMESTAMPTZ DEFAULT NOW(),
  maintenance_window TEXT, -- JSON string for maintenance schedules

  -- ===================================================================
  -- MONTE CARLO INTEGRATION
  -- ===================================================================
  monte_carlo_readiness BOOLEAN DEFAULT FALSE,
  stress_test_score INTEGER CHECK (stress_test_score >= 0 AND stress_test_score <= 100),
  max_concurrent_users INTEGER DEFAULT 0,
  chaos_tolerance DECIMAL(3, 2) DEFAULT 0.0 CHECK (chaos_tolerance >= 0 AND chaos_tolerance <= 1),
  scenario_capabilities JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now(),
  data_source VARCHAR(100) DEFAULT 'SPACE_WORLD',
  validation_status VARCHAR(20) DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'VALIDATED', 'DISPUTED', 'DEPRECATED'))
);

-- Satellites table (enhanced from space world)
CREATE TABLE IF NOT EXISTS satellites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  norad_id INTEGER UNIQUE,

  -- Orbital parameters
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  altitude_km DOUBLE PRECISION NOT NULL CHECK (altitude_km > 0),

  -- Orbital elements
  semi_major_axis_km DOUBLE PRECISION,
  eccentricity DOUBLE PRECISION CHECK (eccentricity >= 0 AND eccentricity < 1),
  inclination_deg DOUBLE PRECISION CHECK (inclination_deg >= 0 AND inclination_deg <= 180),
  raan_deg DOUBLE PRECISION CHECK (raan_deg >= 0 AND raan_deg < 360),
  arg_perigee_deg DOUBLE PRECISION CHECK (arg_perigee_deg >= 0 AND arg_perigee_deg < 360),
  mean_anomaly_deg DOUBLE PRECISION CHECK (mean_anomaly_deg >= 0 AND mean_anomaly_deg < 360),

  -- Operational status
  jammed BOOLEAN NOT NULL DEFAULT false,
  qber DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (qber >= 0 AND qber <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'offline', 'deorbited')),

  -- Trivariate hash for satellites
  sch_hash VARCHAR(16),
  cuid_hash VARCHAR(16),
  uuid_hash VARCHAR(16),
  trivariate_hash_full VARCHAR(48) UNIQUE,
  hash_generated_at TIMESTAMPTZ,

  -- Metadata
  satellite_type VARCHAR(20) DEFAULT 'MEO' CHECK (satellite_type IN ('LEO', 'MEO', 'GEO', 'HEO')),
  constellation_name VARCHAR(50),
  mission_type VARCHAR(50),
  launch_date DATE,
  design_life_years INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- OVERLAY DATA TABLES
-- =====================================================================

-- Weather data table (maintained from space world schema)
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES ground_nodes(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Current conditions
  conditions TEXT NOT NULL DEFAULT 'unknown',
  cloud_cover DOUBLE PRECISION CHECK (cloud_cover >= 0 AND cloud_cover <= 100),
  visibility DOUBLE PRECISION CHECK (visibility >= 0),
  wind_speed DOUBLE PRECISION CHECK (wind_speed >= 0),
  wind_direction_deg INTEGER CHECK (wind_direction_deg >= 0 AND wind_direction_deg <= 360),
  precipitation DOUBLE PRECISION CHECK (precipitation >= 0),
  temperature DOUBLE PRECISION,
  humidity_percent INTEGER CHECK (humidity_percent >= 0 AND humidity_percent <= 100),
  pressure_hpa DOUBLE PRECISION,

  -- Operational impact
  laser_quality_impact DECIMAL(3, 2) DEFAULT 1.0 CHECK (laser_quality_impact >= 0 AND laser_quality_impact <= 1),
  communication_quality DECIMAL(3, 2) DEFAULT 1.0 CHECK (communication_quality >= 0 AND communication_quality <= 1),

  -- Weather hash overlay (for temporal trivariate hashing)
  weather_sch_hash VARCHAR(16), -- Weather-specific semantic hash
  weather_impact_score INTEGER CHECK (weather_impact_score >= 0 AND weather_impact_score <= 100),

  raw_data JSONB DEFAULT '{}'::jsonb,
  weather_source VARCHAR(50) DEFAULT 'OPENWEATHER',
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(location_id, timestamp)
);

-- Telemetry archive (enhanced from space world)
CREATE TABLE IF NOT EXISTS telemetry_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  node_id UUID NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('ground_node', 'satellite')),

  -- Telemetry data
  metric_type TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20),

  -- Quality metrics
  data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  confidence_level DECIMAL(3, 2) CHECK (confidence_level >= 0 AND confidence_level <= 1),

  -- Trivariate hash for telemetry integrity
  telemetry_hash VARCHAR(48), -- Full trivariate hash for data integrity

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QKD metrics (enhanced from space world)
CREATE TABLE IF NOT EXISTS qkd_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  ground_station_id UUID REFERENCES ground_nodes(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- QKD measurements
  qber DOUBLE PRECISION NOT NULL CHECK (qber >= 0 AND qber <= 100),
  key_rate_kbps DOUBLE PRECISION NOT NULL CHECK (key_rate_kbps >= 0),
  sifted_bits INTEGER NOT NULL DEFAULT 0 CHECK (sifted_bits >= 0),
  pa_ratio DOUBLE PRECISION NOT NULL DEFAULT 0.5 CHECK (pa_ratio >= 0 AND pa_ratio <= 1),
  link_quality DOUBLE PRECISION NOT NULL DEFAULT 1.0 CHECK (link_quality >= 0 AND link_quality <= 1),

  -- Security metrics
  entropy_score DECIMAL(5, 4) CHECK (entropy_score >= 0 AND entropy_score <= 1),
  authentication_success BOOLEAN DEFAULT TRUE,

  -- Link hash for security verification
  qkd_link_hash VARCHAR(48), -- Trivariate hash for link integrity

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- MONTE CARLO TESTING TABLES
-- =====================================================================

-- Monte Carlo scenario results
CREATE TABLE IF NOT EXISTS monte_carlo_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES ground_nodes(id) ON DELETE CASCADE,

  -- Scenario details
  scenario_id VARCHAR(100) NOT NULL,
  scenario_type VARCHAR(50) NOT NULL,
  test_date TIMESTAMPTZ DEFAULT NOW(),

  -- Performance metrics
  max_throughput_gbps DECIMAL(10, 3),
  avg_latency_ms DECIMAL(8, 3),
  error_rate_percent DECIMAL(5, 3),
  uptime_percent DECIMAL(5, 2),

  -- Stress test results
  concurrent_users_max INTEGER,
  breaking_point_load_percent INTEGER,
  recovery_time_seconds INTEGER,

  -- Results hash for integrity
  results_hash VARCHAR(48), -- Trivariate hash for test result integrity

  detailed_results JSONB,
  test_status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (test_status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Primary performance indexes
CREATE INDEX IF NOT EXISTS idx_ground_nodes_score ON ground_nodes(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_ground_nodes_tier ON ground_nodes(tier);
CREATE INDEX IF NOT EXISTS idx_ground_nodes_region ON ground_nodes(region);
CREATE INDEX IF NOT EXISTS idx_ground_nodes_status ON ground_nodes(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ground_nodes_trivariate ON ground_nodes(trivariate_hash_full) WHERE trivariate_hash_full IS NOT NULL;

-- Satellite indexes
CREATE INDEX IF NOT EXISTS idx_satellites_status ON satellites(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_satellites_altitude ON satellites(altitude_km);
CREATE INDEX IF NOT EXISTS idx_satellites_trivariate ON satellites(trivariate_hash_full) WHERE trivariate_hash_full IS NOT NULL;

-- Time-series indexes
CREATE INDEX IF NOT EXISTS idx_weather_location_time ON weather_data(location_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_node_time ON telemetry_archive(node_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_archive(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_qkd_satellite_time ON qkd_metrics(satellite_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_qkd_timestamp ON qkd_metrics(timestamp DESC);

-- Hash integrity indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_hash ON telemetry_archive(telemetry_hash) WHERE telemetry_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qkd_hash ON qkd_metrics(qkd_link_hash) WHERE qkd_link_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_monte_carlo_hash ON monte_carlo_results(results_hash) WHERE results_hash IS NOT NULL;

-- =====================================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_ground_nodes_updated_at
    BEFORE UPDATE ON ground_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_satellites_updated_at
    BEFORE UPDATE ON satellites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE ground_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE qkd_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monte_carlo_results ENABLE ROW LEVEL SECURITY;

-- Public read policies for monitoring
CREATE POLICY "Allow public read access to ground_nodes"
  ON ground_nodes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to satellites"
  ON satellites FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to weather_data"
  ON weather_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to telemetry_archive"
  ON telemetry_archive FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to qkd_metrics"
  ON qkd_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to monte_carlo_results"
  ON monte_carlo_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================================

-- Elite stations view
CREATE OR REPLACE VIEW elite_stations AS
SELECT
    station_code, name, total_score, tier, status,
    starlink_gateway_proximity, cable_landing_count, unrest_risk_level,
    trivariate_hash_full, sch_hash, cuid_hash, uuid_hash
FROM ground_nodes
WHERE total_score >= 95 AND status = 'active'
ORDER BY total_score DESC;

-- Weather ready stations view
CREATE OR REPLACE VIEW weather_ready_stations AS
SELECT
    gs.station_code, gs.name, gs.total_score,
    w.conditions, w.laser_quality_impact, w.communication_quality,
    w.weather_sch_hash
FROM ground_nodes gs
LEFT JOIN weather_data w ON gs.id = w.location_id
WHERE w.timestamp = (
    SELECT MAX(timestamp) FROM weather_data w2 WHERE w2.location_id = gs.id
)
AND w.laser_quality_impact > 0.8
ORDER BY gs.total_score DESC;

-- Monte Carlo ready stations view
CREATE OR REPLACE VIEW monte_carlo_ready_stations AS
SELECT
    station_code, name, total_score, monte_carlo_readiness,
    stress_test_score, max_concurrent_users, chaos_tolerance,
    trivariate_hash_full
FROM ground_nodes
WHERE monte_carlo_readiness = TRUE AND status = 'active'
ORDER BY stress_test_score DESC;

-- Trivariate hash status view
CREATE OR REPLACE VIEW trivariate_hash_status AS
SELECT
    'ground_nodes' as table_name,
    COUNT(*) as total_records,
    COUNT(trivariate_hash_full) as hashed_records,
    ROUND(COUNT(trivariate_hash_full) * 100.0 / COUNT(*), 2) as hash_coverage_percent
FROM ground_nodes
UNION ALL
SELECT
    'satellites' as table_name,
    COUNT(*) as total_records,
    COUNT(trivariate_hash_full) as hashed_records,
    ROUND(COUNT(trivariate_hash_full) * 100.0 / COUNT(*), 2) as hash_coverage_percent
FROM satellites;

-- =====================================================================
-- SAMPLE DATA (FOR TESTING)
-- =====================================================================

-- Note: Sample data will be populated via the Foundation Bridge
-- This schema is ready for production use with the Space World Foundation Bridge