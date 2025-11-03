-- CTAS-7 Comprehensive Ground Station Database Schema
-- Normalized ACID structure for Supabase
-- Includes all scoring criteria + Monte Carlo + Weather overlay integration

-- Main ground stations table
CREATE TABLE IF NOT EXISTS ground_stations_comprehensive (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'ABU_DHABI_001'
    name VARCHAR(255) NOT NULL,

    -- Geographic data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude_m INTEGER DEFAULT 0,
    region VARCHAR(100) NOT NULL,
    country_code CHAR(3) NOT NULL,
    timezone VARCHAR(50),

    -- Comprehensive scoring (0-100 scale)
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    starlink_score INTEGER CHECK (starlink_score >= 0 AND starlink_score <= 15),
    cable_score INTEGER CHECK (cable_score >= 0 AND cable_score <= 15),
    atmospheric_score INTEGER CHECK (atmospheric_score >= 0 AND atmospheric_score <= 20),
    political_score INTEGER CHECK (political_score >= 0 AND political_score <= 20),
    infrastructure_score INTEGER CHECK (infrastructure_score >= 0 AND infrastructure_score <= 15),
    strategic_score INTEGER CHECK (strategic_score >= 0 AND strategic_score <= 15),

    -- Risk assessment
    unrest_risk_level VARCHAR(10) CHECK (unrest_risk_level IN ('MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100), -- Numbeo safety index
    crime_level VARCHAR(10) CHECK (crime_level IN ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH')),

    -- Infrastructure details
    cable_landing_count INTEGER DEFAULT 0,
    total_bandwidth_tbps DECIMAL(10, 3) DEFAULT 0,
    fiber_access_quality VARCHAR(10) CHECK (fiber_access_quality IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')),
    power_grid_stability DECIMAL(3, 2) DEFAULT 0.0, -- 0.0 to 1.0

    -- Atmospheric conditions
    annual_sunny_hours INTEGER DEFAULT 0,
    avg_cloud_cover_percent INTEGER CHECK (avg_cloud_cover_percent >= 0 AND avg_cloud_cover_percent <= 100),
    atmospheric_turbulence VARCHAR(10) CHECK (atmospheric_turbulence IN ('EXCELLENT', 'GOOD', 'MODERATE', 'POOR')),
    seeing_conditions_arcsec DECIMAL(4, 2), -- astronomical seeing in arcseconds
    wind_stability VARCHAR(10) CHECK (wind_stability IN ('EXCELLENT', 'GOOD', 'MODERATE', 'POOR')),

    -- Starlink integration
    starlink_gateway_proximity BOOLEAN DEFAULT FALSE,
    nearest_gateway_distance_km INTEGER,
    gateway_count_50km INTEGER DEFAULT 0,
    starlink_bandwidth_access_gbps INTEGER DEFAULT 0,

    -- Operational status
    tier INTEGER CHECK (tier IN (1, 2, 3)), -- 1=Primary, 2=Secondary, 3=Backup
    operational_status VARCHAR(20) CHECK (operational_status IN ('ACTIVE', 'DEGRADED', 'MAINTENANCE', 'OFFLINE', 'PLANNED')),
    capacity_gbps INTEGER DEFAULT 0,
    current_load_percent INTEGER CHECK (current_load_percent >= 0 AND current_load_percent <= 100),

    -- Today state tracking
    today_date DATE DEFAULT CURRENT_DATE,
    current_weather_status VARCHAR(20),
    current_visibility_km DECIMAL(5, 2),
    current_wind_speed_ms DECIMAL(5, 2),
    current_temperature_c DECIMAL(5, 2),
    last_health_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Monte Carlo integration
    monte_carlo_readiness BOOLEAN DEFAULT FALSE,
    stress_test_score INTEGER CHECK (stress_test_score >= 0 AND stress_test_score <= 100),
    scenario_capability JSONB, -- Flexible JSON for different scenario types
    max_concurrent_users INTEGER DEFAULT 0,
    chaos_tolerance DECIMAL(3, 2) DEFAULT 0.0, -- 0.0 to 1.0

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(100), -- e.g., 'STARLINK_DB', 'LASER_RANKINGS', 'MANUAL'
    validation_status VARCHAR(20) DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'VALIDATED', 'DISPUTED', 'DEPRECATED'))
);

-- Weather overlay integration table
CREATE TABLE IF NOT EXISTS ground_station_weather (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES ground_stations_comprehensive(id) ON DELETE CASCADE,

    -- Current conditions
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    temperature_c DECIMAL(5, 2),
    humidity_percent INTEGER CHECK (humidity_percent >= 0 AND humidity_percent <= 100),
    pressure_hpa DECIMAL(7, 2),
    wind_speed_ms DECIMAL(5, 2),
    wind_direction_deg INTEGER CHECK (wind_direction_deg >= 0 AND wind_direction_deg <= 360),
    visibility_km DECIMAL(5, 2),
    cloud_cover_percent INTEGER CHECK (cloud_cover_percent >= 0 AND cloud_cover_percent <= 100),

    -- Weather conditions
    condition VARCHAR(50), -- 'CLEAR', 'CLOUDY', 'RAIN', 'SNOW', 'FOG', etc.
    precipitation_mm DECIMAL(5, 2) DEFAULT 0.0,
    uv_index INTEGER CHECK (uv_index >= 0 AND uv_index <= 12),

    -- Operational impact
    laser_quality_impact DECIMAL(3, 2) DEFAULT 1.0, -- 0.0 = blocked, 1.0 = perfect
    communication_quality DECIMAL(3, 2) DEFAULT 1.0,

    -- Data source
    weather_source VARCHAR(50) DEFAULT 'OPENWEATHER',

    UNIQUE(station_id, timestamp)
);

-- Satellite pass predictions table
CREATE TABLE IF NOT EXISTS satellite_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES ground_stations_comprehensive(id) ON DELETE CASCADE,

    -- Satellite info
    satellite_name VARCHAR(100) NOT NULL,
    norad_id INTEGER,

    -- Pass details
    pass_start TIMESTAMP WITH TIME ZONE NOT NULL,
    pass_end TIMESTAMP WITH TIME ZONE NOT NULL,
    max_elevation_deg DECIMAL(5, 2),
    max_elevation_time TIMESTAMP WITH TIME ZONE,

    -- Tracking data
    azimuth_start_deg DECIMAL(6, 2),
    azimuth_end_deg DECIMAL(6, 2),
    visible_duration_seconds INTEGER,

    -- Quality metrics
    pass_quality_score INTEGER CHECK (pass_quality_score >= 0 AND pass_quality_score <= 100),
    weather_impact_factor DECIMAL(3, 2) DEFAULT 1.0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monte Carlo scenario results table
CREATE TABLE IF NOT EXISTS monte_carlo_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES ground_stations_comprehensive(id) ON DELETE CASCADE,

    -- Scenario details
    scenario_id VARCHAR(100) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Performance metrics
    max_throughput_gbps DECIMAL(10, 3),
    avg_latency_ms DECIMAL(8, 3),
    error_rate_percent DECIMAL(5, 3),
    uptime_percent DECIMAL(5, 2),

    -- Stress test results
    concurrent_users_max INTEGER,
    breaking_point_load_percent INTEGER,
    recovery_time_seconds INTEGER,

    -- Results JSON
    detailed_results JSONB,

    -- Status
    test_status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (test_status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ground_stations_score ON ground_stations_comprehensive(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_ground_stations_tier ON ground_stations_comprehensive(tier);
CREATE INDEX IF NOT EXISTS idx_ground_stations_region ON ground_stations_comprehensive(region);
CREATE INDEX IF NOT EXISTS idx_ground_stations_status ON ground_stations_comprehensive(operational_status);
CREATE INDEX IF NOT EXISTS idx_ground_stations_today ON ground_stations_comprehensive(today_date);
CREATE INDEX IF NOT EXISTS idx_weather_station_time ON ground_station_weather(station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_passes_station_time ON satellite_passes(station_id, pass_start);
CREATE INDEX IF NOT EXISTS idx_monte_carlo_station ON monte_carlo_results(station_id, test_date DESC);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ground_stations_updated_at
    BEFORE UPDATE ON ground_stations_comprehensive
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW elite_stations AS
SELECT
    station_code, name, total_score, tier, operational_status,
    starlink_gateway_proximity, cable_landing_count, unrest_risk_level
FROM ground_stations_comprehensive
WHERE total_score >= 95 AND operational_status = 'ACTIVE'
ORDER BY total_score DESC;

CREATE OR REPLACE VIEW weather_ready_stations AS
SELECT
    gs.station_code, gs.name, gs.total_score,
    w.condition, w.laser_quality_impact, w.communication_quality
FROM ground_stations_comprehensive gs
LEFT JOIN ground_station_weather w ON gs.id = w.station_id
WHERE w.timestamp = (
    SELECT MAX(timestamp) FROM ground_station_weather w2 WHERE w2.station_id = gs.id
)
AND w.laser_quality_impact > 0.8
ORDER BY gs.total_score DESC;

-- Sample data population will follow this schema