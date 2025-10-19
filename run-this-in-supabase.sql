/*
  # SpaceWorld Network Infrastructure Schema

  ## Overview
  Creates the complete database schema for SpaceWorld satellite communication network,
  including ground nodes, satellites, telemetry archival, weather data, and QKD metrics.

  ## New Tables

  ### `ground_nodes`
  - `id` (uuid, primary key) - Unique identifier for each ground node
  - `name` (text) - Human-readable name (e.g., "GN-001")
  - `latitude` (double precision) - Geographic latitude (-90 to 90)
  - `longitude` (double precision) - Geographic longitude (-180 to 180)
  - `tier` (smallint) - Node tier level (1, 2, or 3)
  - `demand_gbps` (double precision) - Current bandwidth demand in Gbps
  - `weather_score` (double precision) - Weather quality metric (0.0 = poor, 1.0 = excellent)
  - `status` (text) - Current operational status (active, degraded, offline)
  - `created_at` (timestamptz) - Record creation timestamp
  - `last_updated` (timestamptz) - Last telemetry update timestamp

  ### `satellites`
  - `id` (uuid, primary key) - Unique identifier for each satellite
  - `name` (text) - Satellite identifier (e.g., "SAT-1")
  - `latitude` (double precision) - Current orbital latitude
  - `longitude` (double precision) - Current orbital longitude
  - `altitude` (double precision) - Altitude in kilometers
  - `jammed` (boolean) - Whether satellite is experiencing jamming
  - `qber` (double precision) - Quantum bit error rate percentage
  - `status` (text) - Operational status
  - `created_at` (timestamptz) - Record creation timestamp
  - `last_updated` (timestamptz) - Last telemetry update timestamp

  ### `telemetry_archive`
  - `id` (uuid, primary key) - Unique identifier for telemetry record
  - `timestamp` (timestamptz) - Measurement timestamp
  - `node_id` (uuid) - Reference to ground_nodes or satellites
  - `node_type` (text) - Type of node (ground_node, satellite)
  - `metric_type` (text) - Type of metric (route_eff, latency, qber, entropy)
  - `value` (double precision) - Metric value
  - `metadata` (jsonb) - Additional metadata and context
  - `created_at` (timestamptz) - Record creation timestamp

  ### `weather_data`
  - `id` (uuid, primary key) - Unique identifier
  - `location_id` (uuid) - Reference to ground node
  - `timestamp` (timestamptz) - Weather observation timestamp
  - `conditions` (text) - Weather condition description
  - `cloud_cover` (double precision) - Cloud coverage percentage (0-100)
  - `visibility` (double precision) - Visibility in kilometers
  - `wind_speed` (double precision) - Wind speed in km/h
  - `precipitation` (double precision) - Precipitation in mm/h
  - `temperature` (double precision) - Temperature in Celsius
  - `raw_data` (jsonb) - Raw API response data
  - `created_at` (timestamptz) - Record creation timestamp

  ### `qkd_metrics`
  - `id` (uuid, primary key) - Unique identifier
  - `satellite_id` (uuid) - Reference to satellites table
  - `timestamp` (timestamptz) - Measurement timestamp
  - `qber` (double precision) - Quantum bit error rate percentage
  - `key_rate_kbps` (double precision) - Key generation rate in kbps
  - `sifted_bits` (integer) - Number of sifted bits
  - `pa_ratio` (double precision) - Privacy amplification ratio
  - `link_quality` (double precision) - Overall link quality score (0-1)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for authenticated users (monitoring use case)
  - Insert/Update restricted to service role

  ## Indexes
  - Time-series indexes on timestamp columns for efficient querying
  - Foreign key indexes for join performance
  - Partial indexes for active records

  ## Data Retention
  - Telemetry archive: 7 days raw, 30 days aggregated
  - Weather data: 24 hours detailed, 7 days summary
  - QKD metrics: 24 hours full resolution
*/

-- Create ground_nodes table
CREATE TABLE IF NOT EXISTS ground_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude double precision NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  tier smallint NOT NULL CHECK (tier IN (1, 2, 3)),
  demand_gbps double precision NOT NULL DEFAULT 0 CHECK (demand_gbps >= 0),
  weather_score double precision NOT NULL DEFAULT 1.0 CHECK (weather_score >= 0 AND weather_score <= 1.0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'offline')),
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Create satellites table
CREATE TABLE IF NOT EXISTS satellites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude double precision NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  altitude double precision NOT NULL CHECK (altitude > 0),
  jammed boolean NOT NULL DEFAULT false,
  qber double precision NOT NULL DEFAULT 0 CHECK (qber >= 0 AND qber <= 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'offline')),
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Create telemetry_archive table
CREATE TABLE IF NOT EXISTS telemetry_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  node_id uuid NOT NULL,
  node_type text NOT NULL CHECK (node_type IN ('ground_node', 'satellite')),
  metric_type text NOT NULL,
  value double precision NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES ground_nodes(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  conditions text NOT NULL DEFAULT 'unknown',
  cloud_cover double precision CHECK (cloud_cover >= 0 AND cloud_cover <= 100),
  visibility double precision CHECK (visibility >= 0),
  wind_speed double precision CHECK (wind_speed >= 0),
  precipitation double precision CHECK (precipitation >= 0),
  temperature double precision,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create qkd_metrics table
CREATE TABLE IF NOT EXISTS qkd_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id uuid NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  qber double precision NOT NULL CHECK (qber >= 0 AND qber <= 100),
  key_rate_kbps double precision NOT NULL CHECK (key_rate_kbps >= 0),
  sifted_bits integer NOT NULL DEFAULT 0 CHECK (sifted_bits >= 0),
  pa_ratio double precision NOT NULL DEFAULT 0.5 CHECK (pa_ratio >= 0 AND pa_ratio <= 1),
  link_quality double precision NOT NULL DEFAULT 1.0 CHECK (link_quality >= 0 AND link_quality <= 1),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ground_nodes_status ON ground_nodes(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_satellites_status ON satellites(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_archive(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_node ON telemetry_archive(node_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_data(location_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_qkd_satellite ON qkd_metrics(satellite_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_qkd_timestamp ON qkd_metrics(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE ground_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE qkd_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for monitoring
CREATE POLICY "Allow public read access to ground_nodes"
  ON ground_nodes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to satellites"
  ON satellites FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to telemetry_archive"
  ON telemetry_archive FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to weather_data"
  ON weather_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to qkd_metrics"
  ON qkd_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample ground nodes
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score)
VALUES
  ('GN-001', 37.7749, -122.4194, 1, 8.5, 0.92),
  ('GN-002', 51.5074, -0.1278, 2, 5.3, 0.78),
  ('GN-003', 35.6762, 139.6503, 1, 9.2, 0.95),
  ('GN-004', -33.8688, 151.2093, 3, 3.7, 0.88),
  ('GN-005', 40.7128, -74.0060, 1, 7.8, 0.85)
ON CONFLICT DO NOTHING;

-- Insert sample satellites
INSERT INTO satellites (name, latitude, longitude, altitude, jammed, qber)
VALUES
  ('SAT-1', 45.2, -120.5, 7500, false, 3.2),
  ('SAT-2', -12.8, 78.3, 7200, false, 2.8),
  ('SAT-3', 62.1, -45.7, 7800, false, 4.1),
  ('SAT-4', -28.5, 145.2, 7350, false, 3.5)
ON CONFLICT DO NOTHING;
/*
  # Beam Management and Orbital Mechanics Schema Extension

  ## Overview
  Extends SpaceWorld schema to support dynamic beam assignment, orbital mechanics,
  radiation belt modeling, and entropy harvesting for quantum key distribution.

  ## New Tables

  ### `orbital_elements`
  - `id` (uuid, primary key) - Unique identifier
  - `satellite_id` (uuid, foreign key) - Reference to satellites table
  - `epoch` (timestamptz) - TLE epoch timestamp
  - `mean_motion` (double precision) - Mean motion in revolutions per day
  - `eccentricity` (double precision) - Orbital eccentricity (0-1)
  - `inclination_deg` (double precision) - Orbital inclination in degrees
  - `raan_deg` (double precision) - Right ascension of ascending node (degrees)
  - `arg_perigee_deg` (double precision) - Argument of perigee (degrees)
  - `mean_anomaly_deg` (double precision) - Mean anomaly at epoch (degrees)
  - `bstar_drag` (double precision) - B* drag term for atmospheric drag
  - `semimajor_axis_km` (double precision) - Calculated semi-major axis
  - `orbital_period_min` (double precision) - Orbital period in minutes
  - `tle_line1` (text) - Full TLE line 1 for SGP4 propagation
  - `tle_line2` (text) - Full TLE line 2 for SGP4 propagation
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `radiation_parameters`
  - `id` (uuid, primary key) - Unique identifier
  - `satellite_id` (uuid, foreign key) - Reference to satellites table
  - `timestamp` (timestamptz) - Measurement timestamp
  - `l_shell` (double precision) - L-shell parameter (Earth radii)
  - `b_field_magnitude_nt` (double precision) - Magnetic field magnitude (nanoTesla)
  - `b_field_x_nt` (double precision) - Magnetic field X component (ECI frame)
  - `b_field_y_nt` (double precision) - Magnetic field Y component
  - `b_field_z_nt` (double precision) - Magnetic field Z component
  - `radiation_flux` (double precision) - Total radiation flux (particles/cm²/s)
  - `proton_flux_gt10mev` (double precision) - Proton flux >10 MeV
  - `electron_flux_gt1mev` (double precision) - Electron flux >1 MeV
  - `in_radiation_belt` (boolean) - Whether currently in Van Allen belts
  - `in_saa` (boolean) - Whether in South Atlantic Anomaly
  - `seu_probability` (double precision) - Single event upset probability (0-1)
  - `total_dose_rad` (double precision) - Cumulative radiation dose (rad)
  - `geomagnetic_latitude_deg` (double precision) - Geomagnetic latitude
  - `geomagnetic_longitude_deg` (double precision) - Geomagnetic longitude
  - `created_at` (timestamptz) - Record creation timestamp

  ### `beams`
  - `id` (uuid, primary key) - Unique identifier for beam
  - `beam_type` (text) - Type: 'space_to_ground' or 'satellite_to_satellite'
  - `source_node_id` (uuid) - Source satellite ID
  - `source_node_type` (text) - Always 'satellite' for current phase
  - `target_node_id` (uuid) - Target ground node or satellite ID
  - `target_node_type` (text) - 'ground_node' or 'satellite'
  - `beam_status` (text) - Status: 'active', 'standby', 'degraded', 'offline'
  - `link_quality_score` (double precision) - Composite quality metric (0-1)
  - `assignment_timestamp` (timestamptz) - When beam was assigned
  - `last_handoff_timestamp` (timestamptz) - Last target change time
  - `throughput_gbps` (double precision) - Current throughput in Gbps
  - `latency_ms` (double precision) - Round-trip latency in milliseconds
  - `jitter_ms` (double precision) - Latency variance in milliseconds
  - `packet_loss_percent` (double precision) - Packet loss percentage
  - `qber` (double precision) - Quantum bit error rate (0-100)
  - `optical_power_dbm` (double precision) - Optical power in dBm
  - `pointing_error_urad` (double precision) - Pointing error in microradians
  - `atmospheric_attenuation_db` (double precision) - Atmospheric loss (ground links)
  - `distance_km` (double precision) - Link distance in kilometers
  - `azimuth_deg` (double precision) - Azimuth angle in degrees
  - `elevation_deg` (double precision) - Elevation angle in degrees
  - `relative_velocity_km_s` (double precision) - Relative velocity (ISL only)
  - `doppler_shift_ghz` (double precision) - Doppler shift in GHz
  - `beam_divergence_urad` (double precision) - Beam divergence in microradians
  - `spot_size_m` (double precision) - Beam spot size at target in meters
  - `weather_score` (double precision) - Ground node weather quality (0-1)
  - `cloud_opacity_percent` (double precision) - Cloud opacity percentage
  - `rain_attenuation_db` (double precision) - Rain attenuation in dB
  - `scintillation_index` (double precision) - Atmospheric scintillation index
  - `radiation_flux_at_source` (double precision) - Radiation at source satellite
  - `in_radiation_belt` (boolean) - Source satellite in Van Allen belts
  - `saa_affected` (boolean) - Affected by South Atlantic Anomaly
  - `entropy_harvest_rate_kbps` (double precision) - Entropy generation rate (Phase 2)
  - `beam_edge_entropy_active` (boolean) - Beam edge entropy harvesting enabled
  - `qkd_key_generation_rate_kbps` (double precision) - QKD key rate
  - `key_buffer_bits` (bigint) - Available key buffer size
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `beam_telemetry_history`
  - `id` (uuid, primary key) - Unique identifier
  - `beam_id` (uuid, foreign key) - Reference to beams table
  - `timestamp` (timestamptz) - Measurement timestamp
  - `link_quality_snapshot` (double precision) - Quality score at time
  - `throughput_snapshot` (double precision) - Throughput at time (Gbps)
  - `qber_snapshot` (double precision) - QBER at time
  - `environmental_conditions` (jsonb) - Weather, radiation, geometry snapshot
  - `created_at` (timestamptz) - Record creation timestamp

  ### `beam_handoff_events`
  - `id` (uuid, primary key) - Unique identifier
  - `beam_id` (uuid, foreign key) - Reference to beams table
  - `old_target_id` (uuid) - Previous target node ID
  - `new_target_id` (uuid) - New target node ID
  - `handoff_reason` (text) - Reason: 'weather_degradation', 'radiation_avoidance', 'optimization', 'node_failure'
  - `handoff_latency_ms` (double precision) - Time to complete handoff
  - `old_quality_score` (double precision) - Quality before handoff
  - `new_quality_score` (double precision) - Quality after handoff
  - `timestamp` (timestamptz) - Handoff completion timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### `beam_routing_decisions`
  - `id` (uuid, primary key) - Unique identifier
  - `timestamp` (timestamptz) - Decision timestamp
  - `satellite_id` (uuid) - Satellite making decision
  - `candidate_targets` (jsonb) - Array of {node_id, score, factors}
  - `selected_target_id` (uuid) - Chosen target node
  - `decision_algorithm` (text) - Algorithm used: 'trading_engine', 'rule_based', 'manual'
  - `execution_time_us` (double precision) - Decision time in microseconds
  - `created_at` (timestamptz) - Record creation timestamp

  ### `belt_transit_events`
  - `id` (uuid, primary key) - Unique identifier
  - `satellite_id` (uuid, foreign key) - Reference to satellites table
  - `entry_timestamp` (timestamptz) - Belt entry time
  - `exit_timestamp` (timestamptz) - Belt exit time (null if still inside)
  - `belt_type` (text) - Type: 'inner_belt', 'outer_belt', 'saa'
  - `peak_flux` (double precision) - Maximum flux encountered
  - `peak_l_shell` (double precision) - L-shell at peak flux
  - `mitigation_applied` (boolean) - Whether automatic mitigation triggered
  - `entropy_harvested_mb` (double precision) - Total entropy collected (Phase 2)
  - `created_at` (timestamptz) - Record creation timestamp

  ### `entropy_signals`
  - `id` (uuid, primary key) - Unique identifier
  - `satellite_id` (uuid, foreign key) - Reference to satellites table
  - `timestamp` (timestamptz) - Measurement timestamp
  - `coil_voltage_mv` (double precision) - Induction voltage in millivolts
  - `magnetic_field_rate_nt_s` (double precision) - dB/dt in nT/s
  - `entropy_rate_kbps` (double precision) - Raw entropy generation rate
  - `shannon_entropy` (double precision) - Shannon entropy estimate (bits)
  - `min_entropy` (double precision) - Min-entropy estimate (conservative)
  - `nist_tests_passed` (integer) - Number of NIST randomness tests passed
  - `quality_score` (double precision) - Entropy quality metric (0-1)
  - `l_shell` (double precision) - L-shell at measurement
  - `created_at` (timestamptz) - Record creation timestamp

  ### `qkd_mapping`
  - `id` (uuid, primary key) - Unique identifier
  - `beam_id` (uuid, foreign key) - Reference to beams table
  - `timestamp` (timestamptz) - Mapping timestamp
  - `entropy_source` (text) - Source: 'beam_edge', 'radiation_belt', 'hybrid'
  - `basis_reconciliation_rate` (double precision) - BB84 basis agreement rate
  - `raw_key_bits` (bigint) - Raw key bits before correction
  - `sifted_key_bits` (bigint) - Bits after basis reconciliation
  - `corrected_key_bits` (bigint) - Bits after error correction
  - `final_secure_bits` (bigint) - Bits after privacy amplification
  - `key_generation_efficiency` (double precision) - Final/raw ratio
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for authenticated users (monitoring)
  - Insert/Update restricted to service role for integrity

  ## Indexes
  - Time-series indexes on all timestamp columns
  - Composite indexes for beam quality sorting
  - Foreign key indexes for join performance
  - Partial indexes for active beams

  ## Important Notes
  1. Radiation modeling uses IGRF-13 magnetic field model
  2. L-shell calculations use McIlwain approximation
  3. Beam quality uses multi-factor composite scoring
  4. Entropy harvesting Phase 2 fields ready but not active
  5. Trading engine integration via beam_routing_decisions table
*/

-- Create orbital_elements table
CREATE TABLE IF NOT EXISTS orbital_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id uuid NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  epoch timestamptz NOT NULL,
  mean_motion double precision NOT NULL CHECK (mean_motion > 0),
  eccentricity double precision NOT NULL CHECK (eccentricity >= 0 AND eccentricity < 1),
  inclination_deg double precision NOT NULL CHECK (inclination_deg >= 0 AND inclination_deg <= 180),
  raan_deg double precision NOT NULL CHECK (raan_deg >= 0 AND raan_deg < 360),
  arg_perigee_deg double precision NOT NULL CHECK (arg_perigee_deg >= 0 AND arg_perigee_deg < 360),
  mean_anomaly_deg double precision NOT NULL CHECK (mean_anomaly_deg >= 0 AND mean_anomaly_deg < 360),
  bstar_drag double precision NOT NULL DEFAULT 0,
  semimajor_axis_km double precision,
  orbital_period_min double precision,
  tle_line1 text,
  tle_line2 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create radiation_parameters table
CREATE TABLE IF NOT EXISTS radiation_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id uuid NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  l_shell double precision CHECK (l_shell > 0),
  b_field_magnitude_nt double precision CHECK (b_field_magnitude_nt >= 0),
  b_field_x_nt double precision,
  b_field_y_nt double precision,
  b_field_z_nt double precision,
  radiation_flux double precision DEFAULT 0 CHECK (radiation_flux >= 0),
  proton_flux_gt10mev double precision DEFAULT 0 CHECK (proton_flux_gt10mev >= 0),
  electron_flux_gt1mev double precision DEFAULT 0 CHECK (electron_flux_gt1mev >= 0),
  in_radiation_belt boolean DEFAULT false,
  in_saa boolean DEFAULT false,
  seu_probability double precision DEFAULT 0 CHECK (seu_probability >= 0 AND seu_probability <= 1),
  total_dose_rad double precision DEFAULT 0 CHECK (total_dose_rad >= 0),
  geomagnetic_latitude_deg double precision,
  geomagnetic_longitude_deg double precision,
  created_at timestamptz DEFAULT now()
);

-- Create beams table
CREATE TABLE IF NOT EXISTS beams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beam_type text NOT NULL CHECK (beam_type IN ('space_to_ground', 'satellite_to_satellite')),
  source_node_id uuid NOT NULL,
  source_node_type text NOT NULL DEFAULT 'satellite' CHECK (source_node_type IN ('satellite', 'ground_node')),
  target_node_id uuid NOT NULL,
  target_node_type text NOT NULL CHECK (target_node_type IN ('satellite', 'ground_node')),
  beam_status text NOT NULL DEFAULT 'standby' CHECK (beam_status IN ('active', 'standby', 'degraded', 'offline')),
  link_quality_score double precision DEFAULT 0 CHECK (link_quality_score >= 0 AND link_quality_score <= 1),
  assignment_timestamp timestamptz,
  last_handoff_timestamp timestamptz,
  throughput_gbps double precision DEFAULT 0 CHECK (throughput_gbps >= 0),
  latency_ms double precision DEFAULT 0 CHECK (latency_ms >= 0),
  jitter_ms double precision DEFAULT 0 CHECK (jitter_ms >= 0),
  packet_loss_percent double precision DEFAULT 0 CHECK (packet_loss_percent >= 0 AND packet_loss_percent <= 100),
  qber double precision DEFAULT 0 CHECK (qber >= 0 AND qber <= 100),
  optical_power_dbm double precision,
  pointing_error_urad double precision DEFAULT 0 CHECK (pointing_error_urad >= 0),
  atmospheric_attenuation_db double precision DEFAULT 0 CHECK (atmospheric_attenuation_db >= 0),
  distance_km double precision CHECK (distance_km > 0),
  azimuth_deg double precision CHECK (azimuth_deg >= 0 AND azimuth_deg < 360),
  elevation_deg double precision CHECK (elevation_deg >= -90 AND elevation_deg <= 90),
  relative_velocity_km_s double precision,
  doppler_shift_ghz double precision,
  beam_divergence_urad double precision CHECK (beam_divergence_urad > 0),
  spot_size_m double precision CHECK (spot_size_m > 0),
  weather_score double precision DEFAULT 1.0 CHECK (weather_score >= 0 AND weather_score <= 1),
  cloud_opacity_percent double precision DEFAULT 0 CHECK (cloud_opacity_percent >= 0 AND cloud_opacity_percent <= 100),
  rain_attenuation_db double precision DEFAULT 0 CHECK (rain_attenuation_db >= 0),
  scintillation_index double precision DEFAULT 0 CHECK (scintillation_index >= 0),
  radiation_flux_at_source double precision DEFAULT 0 CHECK (radiation_flux_at_source >= 0),
  in_radiation_belt boolean DEFAULT false,
  saa_affected boolean DEFAULT false,
  entropy_harvest_rate_kbps double precision DEFAULT 0 CHECK (entropy_harvest_rate_kbps >= 0),
  beam_edge_entropy_active boolean DEFAULT false,
  qkd_key_generation_rate_kbps double precision DEFAULT 0 CHECK (qkd_key_generation_rate_kbps >= 0),
  key_buffer_bits bigint DEFAULT 0 CHECK (key_buffer_bits >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create beam_telemetry_history table
CREATE TABLE IF NOT EXISTS beam_telemetry_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beam_id uuid NOT NULL REFERENCES beams(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  link_quality_snapshot double precision CHECK (link_quality_snapshot >= 0 AND link_quality_snapshot <= 1),
  throughput_snapshot double precision CHECK (throughput_snapshot >= 0),
  qber_snapshot double precision CHECK (qber_snapshot >= 0 AND qber_snapshot <= 100),
  environmental_conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create beam_handoff_events table
CREATE TABLE IF NOT EXISTS beam_handoff_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beam_id uuid NOT NULL REFERENCES beams(id) ON DELETE CASCADE,
  old_target_id uuid NOT NULL,
  new_target_id uuid NOT NULL,
  handoff_reason text NOT NULL CHECK (handoff_reason IN ('weather_degradation', 'radiation_avoidance', 'optimization', 'node_failure')),
  handoff_latency_ms double precision CHECK (handoff_latency_ms >= 0),
  old_quality_score double precision CHECK (old_quality_score >= 0 AND old_quality_score <= 1),
  new_quality_score double precision CHECK (new_quality_score >= 0 AND new_quality_score <= 1),
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create beam_routing_decisions table
CREATE TABLE IF NOT EXISTS beam_routing_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  satellite_id uuid NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  candidate_targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_target_id uuid,
  decision_algorithm text NOT NULL DEFAULT 'rule_based' CHECK (decision_algorithm IN ('trading_engine', 'rule_based', 'manual')),
  execution_time_us double precision CHECK (execution_time_us >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create belt_transit_events table
CREATE TABLE IF NOT EXISTS belt_transit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id uuid NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  entry_timestamp timestamptz NOT NULL,
  exit_timestamp timestamptz,
  belt_type text NOT NULL CHECK (belt_type IN ('inner_belt', 'outer_belt', 'saa')),
  peak_flux double precision CHECK (peak_flux >= 0),
  peak_l_shell double precision CHECK (peak_l_shell > 0),
  mitigation_applied boolean DEFAULT false,
  entropy_harvested_mb double precision DEFAULT 0 CHECK (entropy_harvested_mb >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create entropy_signals table
CREATE TABLE IF NOT EXISTS entropy_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id uuid NOT NULL REFERENCES satellites(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  coil_voltage_mv double precision,
  magnetic_field_rate_nt_s double precision,
  entropy_rate_kbps double precision DEFAULT 0 CHECK (entropy_rate_kbps >= 0),
  shannon_entropy double precision CHECK (shannon_entropy >= 0),
  min_entropy double precision CHECK (min_entropy >= 0),
  nist_tests_passed integer DEFAULT 0 CHECK (nist_tests_passed >= 0 AND nist_tests_passed <= 15),
  quality_score double precision DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 1),
  l_shell double precision CHECK (l_shell > 0),
  created_at timestamptz DEFAULT now()
);

-- Create qkd_mapping table
CREATE TABLE IF NOT EXISTS qkd_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beam_id uuid NOT NULL REFERENCES beams(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  entropy_source text NOT NULL CHECK (entropy_source IN ('beam_edge', 'radiation_belt', 'hybrid')),
  basis_reconciliation_rate double precision CHECK (basis_reconciliation_rate >= 0 AND basis_reconciliation_rate <= 1),
  raw_key_bits bigint DEFAULT 0 CHECK (raw_key_bits >= 0),
  sifted_key_bits bigint DEFAULT 0 CHECK (sifted_key_bits >= 0),
  corrected_key_bits bigint DEFAULT 0 CHECK (corrected_key_bits >= 0),
  final_secure_bits bigint DEFAULT 0 CHECK (final_secure_bits >= 0),
  key_generation_efficiency double precision CHECK (key_generation_efficiency >= 0 AND key_generation_efficiency <= 1),
  created_at timestamptz DEFAULT now()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_orbital_elements_satellite ON orbital_elements(satellite_id);
CREATE INDEX IF NOT EXISTS idx_orbital_elements_epoch ON orbital_elements(epoch DESC);

CREATE INDEX IF NOT EXISTS idx_radiation_parameters_satellite ON radiation_parameters(satellite_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_radiation_parameters_belt ON radiation_parameters(in_radiation_belt) WHERE in_radiation_belt = true;
CREATE INDEX IF NOT EXISTS idx_radiation_parameters_saa ON radiation_parameters(in_saa) WHERE in_saa = true;
CREATE INDEX IF NOT EXISTS idx_radiation_parameters_timestamp ON radiation_parameters(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_beams_status ON beams(beam_status) WHERE beam_status = 'active';
CREATE INDEX IF NOT EXISTS idx_beams_quality ON beams(beam_type, beam_status, link_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_beams_source ON beams(source_node_id);
CREATE INDEX IF NOT EXISTS idx_beams_target ON beams(target_node_id);
CREATE INDEX IF NOT EXISTS idx_beams_radiation ON beams(in_radiation_belt) WHERE in_radiation_belt = true;

CREATE INDEX IF NOT EXISTS idx_beam_telemetry_beam ON beam_telemetry_history(beam_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_beam_telemetry_timestamp ON beam_telemetry_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_beam_handoff_beam ON beam_handoff_events(beam_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_beam_handoff_timestamp ON beam_handoff_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_beam_routing_satellite ON beam_routing_decisions(satellite_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_beam_routing_timestamp ON beam_routing_decisions(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_belt_transit_satellite ON belt_transit_events(satellite_id, entry_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_belt_transit_active ON belt_transit_events(satellite_id) WHERE exit_timestamp IS NULL;

CREATE INDEX IF NOT EXISTS idx_entropy_signals_satellite ON entropy_signals(satellite_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_entropy_signals_timestamp ON entropy_signals(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_qkd_mapping_beam ON qkd_mapping(beam_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_qkd_mapping_timestamp ON qkd_mapping(timestamp DESC);

-- Enable Row Level Security on all tables
ALTER TABLE orbital_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiation_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE beams ENABLE ROW LEVEL SECURITY;
ALTER TABLE beam_telemetry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE beam_handoff_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE beam_routing_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE belt_transit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE entropy_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE qkd_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for monitoring
CREATE POLICY "Allow public read access to orbital_elements"
  ON orbital_elements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to radiation_parameters"
  ON radiation_parameters FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to beams"
  ON beams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to beam_telemetry_history"
  ON beam_telemetry_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to beam_handoff_events"
  ON beam_handoff_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to beam_routing_decisions"
  ON beam_routing_decisions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to belt_transit_events"
  ON belt_transit_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to entropy_signals"
  ON entropy_signals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to qkd_mapping"
  ON qkd_mapping FOR SELECT
  TO anon, authenticated
  USING (true);
/*
  # Ground Station Declination Configuration Schema

  ## New Tables

  ### `ground_station_declination_config`
  - `id` (uuid, primary key)
  - `ground_node_id` (uuid, foreign key) - Reference to ground_nodes
  - `preset_type` (text) - Preset type: basic, operational, precision, custom
  - `angles_deg` (double precision array) - Declination angles in degrees
  - `is_custom` (boolean) - Whether custom angles are used
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `declination_angle_presets`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Preset name
  - `description` (text) - Description
  - `angles_deg` (double precision array) - Preset angle values
  - `use_case` (text) - Use case description
  - `created_at` (timestamptz) - Creation timestamp

  ### `station_link_performance`
  - `id` (uuid, primary key)
  - `ground_node_id` (uuid, foreign key)
  - `elevation_deg` (double precision) - Elevation angle
  - `quality_score` (double precision) - Link quality score (0-1)
  - `atmospheric_transmission` (double precision) - Transmission factor
  - `link_budget_margin_db` (double precision) - Link margin in dB
  - `weather_conditions` (jsonb) - Weather condition snapshot
  - `timestamp` (timestamptz) - Measurement timestamp
  - `created_at` (timestamptz) - Record creation

  ## Security
  - Enable RLS on all tables
  - Public read access for monitoring
*/

-- Ground station declination configuration
CREATE TABLE IF NOT EXISTS ground_station_declination_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_node_id uuid NOT NULL REFERENCES ground_nodes(id) ON DELETE CASCADE,
  preset_type text NOT NULL CHECK (preset_type IN ('basic', 'operational', 'precision', 'custom')),
  angles_deg double precision[] NOT NULL,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ground_node_id)
);

-- Declination angle presets
CREATE TABLE IF NOT EXISTS declination_angle_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  angles_deg double precision[] NOT NULL,
  use_case text,
  created_at timestamptz DEFAULT now()
);

-- Link performance tracking
CREATE TABLE IF NOT EXISTS station_link_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_node_id uuid NOT NULL REFERENCES ground_nodes(id) ON DELETE CASCADE,
  elevation_deg double precision NOT NULL,
  quality_score double precision CHECK (quality_score >= 0 AND quality_score <= 1),
  atmospheric_transmission double precision,
  link_budget_margin_db double precision,
  weather_conditions jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_declination_config_node
  ON ground_station_declination_config(ground_node_id);

CREATE INDEX IF NOT EXISTS idx_link_performance_node_time
  ON station_link_performance(ground_node_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_link_performance_elevation
  ON station_link_performance(elevation_deg);

-- Enable RLS
ALTER TABLE ground_station_declination_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE declination_angle_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_link_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read declination config"
  ON ground_station_declination_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read presets"
  ON declination_angle_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read link performance"
  ON station_link_performance FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert standard presets
INSERT INTO declination_angle_presets (name, description, angles_deg, use_case) VALUES
  ('Basic', 'Minimum viable set for basic operations',
   ARRAY[10.0, 20.0, 45.0, 70.0, 90.0],
   'Basic operations with minimal complexity'),
  ('Operational', 'Standard operational configuration',
   ARRAY[5.0, 10.0, 15.0, 30.0, 45.0, 60.0, 75.0, 90.0],
   'Full operational capability'),
  ('Precision', 'High-resolution tracking and analysis',
   ARRAY[5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 85.0, 90.0],
   'Research or high-precision tracking')
ON CONFLICT (name) DO NOTHING;
/*
  # Ground Station Declination Configuration Schema

  ## New Tables

  ### `ground_station_declination_config`
  - `id` (uuid, primary key)
  - `ground_node_id` (uuid, foreign key) - Reference to ground_nodes
  - `preset_type` (text) - Preset type: basic, operational, precision, custom
  - `angles_deg` (double precision array) - Declination angles in degrees
  - `is_custom` (boolean) - Whether custom angles are used
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `declination_angle_presets`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Preset name
  - `description` (text) - Description
  - `angles_deg` (double precision array) - Preset angle values
  - `use_case` (text) - Use case description
  - `created_at` (timestamptz) - Creation timestamp

  ### `station_link_performance`
  - `id` (uuid, primary key)
  - `ground_node_id` (uuid, foreign key)
  - `elevation_deg` (double precision) - Elevation angle
  - `quality_score` (double precision) - Link quality score (0-1)
  - `atmospheric_transmission` (double precision) - Transmission factor
  - `link_budget_margin_db` (double precision) - Link margin in dB
  - `weather_conditions` (jsonb) - Weather condition snapshot
  - `timestamp` (timestamptz) - Measurement timestamp
  - `created_at` (timestamptz) - Record creation

  ## Security
  - Enable RLS on all tables
  - Public read access for monitoring
*/

-- Ground station declination configuration
CREATE TABLE IF NOT EXISTS ground_station_declination_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_node_id uuid NOT NULL REFERENCES ground_nodes(id) ON DELETE CASCADE,
  preset_type text NOT NULL CHECK (preset_type IN ('basic', 'operational', 'precision', 'custom')),
  angles_deg double precision[] NOT NULL,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ground_node_id)
);

-- Declination angle presets
CREATE TABLE IF NOT EXISTS declination_angle_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  angles_deg double precision[] NOT NULL,
  use_case text,
  created_at timestamptz DEFAULT now()
);

-- Link performance tracking
CREATE TABLE IF NOT EXISTS station_link_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_node_id uuid NOT NULL REFERENCES ground_nodes(id) ON DELETE CASCADE,
  elevation_deg double precision NOT NULL,
  quality_score double precision CHECK (quality_score >= 0 AND quality_score <= 1),
  atmospheric_transmission double precision,
  link_budget_margin_db double precision,
  weather_conditions jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_declination_config_node
  ON ground_station_declination_config(ground_node_id);

CREATE INDEX IF NOT EXISTS idx_link_performance_node_time
  ON station_link_performance(ground_node_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_link_performance_elevation
  ON station_link_performance(elevation_deg);

-- Enable RLS
ALTER TABLE ground_station_declination_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE declination_angle_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_link_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read declination config"
  ON ground_station_declination_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read presets"
  ON declination_angle_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read link performance"
  ON station_link_performance FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert standard presets
INSERT INTO declination_angle_presets (name, description, angles_deg, use_case) VALUES
  ('Basic', 'Minimum viable set for basic operations',
   ARRAY[10.0, 20.0, 45.0, 70.0, 90.0],
   'Basic operations with minimal complexity'),
  ('Operational', 'Standard operational configuration',
   ARRAY[5.0, 10.0, 15.0, 30.0, 45.0, 60.0, 75.0, 90.0],
   'Full operational capability'),
  ('Precision', 'High-resolution tracking and analysis',
   ARRAY[5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 85.0, 90.0],
   'Research or high-precision tracking')
ON CONFLICT (name) DO NOTHING;
/*
  # Add inclination column to satellites table

  1. Changes
    - Add `inclination` column to satellites table (double precision, default 53 degrees for typical LEO constellation)
    - This column is required for orbital mechanics calculations
    - Default value represents a common inclination for LEO satellites

  2. Notes
    - Existing satellites will get the default inclination value
    - Future satellites should specify their actual inclination when inserted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'satellites' AND column_name = 'inclination'
  ) THEN
    ALTER TABLE satellites ADD COLUMN inclination double precision DEFAULT 53.0;
  END IF;
END $$;
