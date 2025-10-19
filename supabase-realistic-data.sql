-- ============================================================================
-- CTAS7 Supabase Realistic Mock Data
-- Based on actual 259-station network and 12-satellite HALO constellation
-- ============================================================================

-- First, run the schema migrations (run-this-in-supabase.sql) before this file

-- ============================================================================
-- GROUND STATIONS (259-station network)
-- ============================================================================

-- Clear existing data
TRUNCATE ground_nodes CASCADE;

-- Insert 10 strategic primary hubs (from actual network specs)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status) VALUES
  ('Dubai Strategic Hub', 25.2048, 55.2708, 1, 100.0, 0.95, 'active'),
  ('Johannesburg Strategic Hub', -26.2041, 28.0473, 1, 100.0, 0.88, 'active'),
  ('Fortaleza Strategic Hub', -3.7319, -38.5267, 1, 100.0, 0.82, 'active'),
  ('Hawaii Strategic Hub', 21.3099, -157.8581, 1, 95.0, 0.75, 'active'),
  ('Guam Strategic Hub', 13.4443, 144.7937, 1, 90.0, 0.70, 'active'),
  ('China Lake California Hub', 35.6853, -117.6858, 1, 100.0, 0.98, 'active'),
  ('NSA Fort Meade HQ', 39.1081, -76.7710, 1, 100.0, 0.72, 'active'),
  ('CENTCOM Tampa FL', 27.9506, -82.4572, 1, 95.0, 0.80, 'active'),
  ('Antofagasta Chile - Atacama', -24.8833, -70.4, 2, 80.0, 0.99, 'active'),
  ('Aswan Egypt - Desert', 24.0889, 32.8998, 2, 75.0, 0.97, 'active');

-- Generate additional 249 stations (realistic global distribution)
-- North America (60 stations)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-NA-' || LPAD(generate_series::text, 3, '0'),
  25.0 + (random() * 25.0),  -- 25°N to 50°N
  -130.0 + (random() * 60.0), -- -130°W to -70°W
  CASE WHEN random() < 0.3 THEN 1 WHEN random() < 0.7 THEN 2 ELSE 3 END,
  50.0 + (random() * 50.0),
  0.60 + (random() * 0.35),
  CASE WHEN random() < 0.95 THEN 'active' WHEN random() < 0.98 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 60);

-- Europe (50 stations)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-EU-' || LPAD(generate_series::text, 3, '0'),
  35.0 + (random() * 35.0),  -- 35°N to 70°N
  -10.0 + (random() * 50.0), -- -10°W to 40°E
  CASE WHEN random() < 0.25 THEN 1 WHEN random() < 0.65 THEN 2 ELSE 3 END,
  40.0 + (random() * 60.0),
  0.55 + (random() * 0.35),
  CASE WHEN random() < 0.93 THEN 'active' WHEN random() < 0.97 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 50);

-- Asia (70 stations)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-AS-' || LPAD(generate_series::text, 3, '0'),
  -10.0 + (random() * 60.0),  -- -10°S to 50°N
  60.0 + (random() * 80.0),   -- 60°E to 140°E
  CASE WHEN random() < 0.35 THEN 1 WHEN random() < 0.70 THEN 2 ELSE 3 END,
  45.0 + (random() * 55.0),
  0.50 + (random() * 0.45),
  CASE WHEN random() < 0.94 THEN 'active' WHEN random() < 0.98 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 70);

-- Middle East (30 stations)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-ME-' || LPAD(generate_series::text, 3, '0'),
  15.0 + (random() * 25.0),  -- 15°N to 40°N
  35.0 + (random() * 30.0),  -- 35°E to 65°E
  CASE WHEN random() < 0.40 THEN 1 WHEN random() < 0.75 THEN 2 ELSE 3 END,
  55.0 + (random() * 45.0),
  0.75 + (random() * 0.23),  -- High weather scores (desert regions)
  CASE WHEN random() < 0.96 THEN 'active' WHEN random() < 0.99 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 30);

-- Africa (35 stations)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-AF-' || LPAD(generate_series::text, 3, '0'),
  -35.0 + (random() * 55.0),  -- -35°S to 20°N
  -20.0 + (random() * 60.0),  -- -20°W to 40°E
  CASE WHEN random() < 0.20 THEN 1 WHEN random() < 0.60 THEN 2 ELSE 3 END,
  35.0 + (random() * 45.0),
  0.60 + (random() * 0.35),
  CASE WHEN random() < 0.90 THEN 'active' WHEN random() < 0.96 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 35);

-- South America (25 stations)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-SA-' || LPAD(generate_series::text, 3, '0'),
  -55.0 + (random() * 45.0),  -- -55°S to -10°S
  -80.0 + (random() * 45.0),  -- -80°W to -35°W
  CASE WHEN random() < 0.25 THEN 1 WHEN random() < 0.65 THEN 2 ELSE 3 END,
  40.0 + (random() * 40.0),
  0.55 + (random() * 0.40),
  CASE WHEN random() < 0.92 THEN 'active' WHEN random() < 0.97 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 25);

-- Pacific (14 stations - islands and coastal)
INSERT INTO ground_nodes (name, latitude, longitude, tier, demand_gbps, weather_score, status)
SELECT 
  'GS-PC-' || LPAD(generate_series::text, 3, '0'),
  -40.0 + (random() * 60.0),   -- -40°S to 20°N
  140.0 + (random() * 100.0),  -- 140°E to 240°E (crossing dateline)
  CASE WHEN random() < 0.30 THEN 1 WHEN random() < 0.70 THEN 2 ELSE 3 END,
  45.0 + (random() * 50.0),
  0.50 + (random() * 0.45),
  CASE WHEN random() < 0.93 THEN 'active' WHEN random() < 0.98 THEN 'degraded' ELSE 'offline' END
FROM generate_series(1, 14);

-- ============================================================================
-- SATELLITES (12-satellite HALO MEO Constellation)
-- ============================================================================

TRUNCATE satellites CASCADE;

-- Insert 12 MEO satellites at 8000km altitude, 55° inclination
-- Distributed across 3 orbital planes (4 satellites per plane)
INSERT INTO satellites (name, latitude, longitude, altitude, jammed, qber, status) VALUES
  -- Plane A (0° RAAN)
  ('HALO-Alpha-1', 0.0, 0.0, 8000.0, false, 2.1, 'active'),
  ('HALO-Alpha-2', 0.0, 90.0, 8000.0, false, 2.3, 'active'),
  ('HALO-Alpha-3', 0.0, 180.0, 8000.0, false, 1.9, 'active'),
  ('HALO-Alpha-4', 0.0, 270.0, 8000.0, false, 2.5, 'active'),
  
  -- Plane B (120° RAAN)
  ('HALO-Beta-1', 30.0, 45.0, 8000.0, false, 2.2, 'active'),
  ('HALO-Beta-2', 30.0, 135.0, 8000.0, false, 2.0, 'active'),
  ('HALO-Beta-3', 30.0, 225.0, 8000.0, false, 2.4, 'active'),
  ('HALO-Beta-4', 30.0, 315.0, 8000.0, false, 2.1, 'active'),
  
  -- Plane C (240° RAAN)
  ('HALO-Gamma-1', -30.0, 22.5, 8000.0, false, 2.3, 'active'),
  ('HALO-Gamma-2', -30.0, 112.5, 8000.0, false, 1.8, 'active'),
  ('HALO-Gamma-3', -30.0, 202.5, 8000.0, false, 2.6, 'active'),
  ('HALO-Gamma-4', -30.0, 292.5, 8000.0, false, 2.2, 'active');

-- ============================================================================
-- ORBITAL ELEMENTS (TLE data for satellites)
-- ============================================================================

-- Add orbital elements for each satellite (simplified TLE)
INSERT INTO orbital_elements (satellite_id, epoch, mean_motion, eccentricity, inclination_deg, raan_deg, arg_perigee_deg, mean_anomaly_deg, semimajor_axis_km, orbital_period_min)
SELECT 
  s.id,
  now(),
  5.5,  -- ~5.5 revolutions per day for MEO at 8000km
  0.001,  -- Nearly circular
  55.0,
  CASE 
    WHEN s.name LIKE '%Alpha%' THEN 0.0
    WHEN s.name LIKE '%Beta%' THEN 120.0
    ELSE 240.0
  END,
  0.0,
  (ROW_NUMBER() OVER (PARTITION BY SUBSTRING(s.name FROM '%-(Alpha|Beta|Gamma)-%') ORDER BY s.name) - 1) * 90.0,
  8000.0,
  180.0  -- 3-hour orbital period
FROM satellites s;

-- ============================================================================
-- NETWORK LINKS (Beams connecting satellites to ground stations)
-- ============================================================================

TRUNCATE beams CASCADE;

-- Create active beams from satellites to nearby ground stations
-- Each satellite maintains 3-5 active ground links
INSERT INTO beams (
  beam_type, source_node_id, source_node_type, target_node_id, target_node_type,
  beam_status, link_quality_score, throughput_gbps, latency_ms, qber,
  distance_km, elevation_deg, weather_score
)
SELECT 
  'space_to_ground',
  s.id,
  'satellite',
  g.id,
  'ground_node',
  CASE WHEN random() < 0.85 THEN 'active' WHEN random() < 0.95 THEN 'standby' ELSE 'degraded' END,
  0.70 + (random() * 0.28),  -- Link quality 0.70-0.98
  20.0 + (random() * 80.0),  -- Throughput 20-100 Gbps
  15.0 + (random() * 35.0),  -- Latency 15-50 ms
  1.5 + (random() * 3.0),    -- QBER 1.5-4.5%
  8000.0 + (random() * 1000.0),  -- Distance ~8000-9000 km
  15.0 + (random() * 75.0),  -- Elevation 15-90°
  g.weather_score
FROM satellites s
CROSS JOIN LATERAL (
  SELECT * FROM ground_nodes
  WHERE status = 'active'
  ORDER BY random()
  LIMIT 4  -- Each satellite connects to 4 ground stations
) g;

-- ============================================================================
-- QKD METRICS (Quantum Key Distribution performance)
-- ============================================================================

-- Generate recent QKD metrics for all satellites
INSERT INTO qkd_metrics (satellite_id, timestamp, qber, key_rate_kbps, sifted_bits, pa_ratio, link_quality)
SELECT 
  s.id,
  now() - (random() * interval '1 hour'),
  1.5 + (random() * 3.5),  -- QBER 1.5-5.0%
  50.0 + (random() * 150.0),  -- Key rate 50-200 kbps
  (100000 + (random() * 400000))::integer,  -- Sifted bits
  0.4 + (random() * 0.3),  -- PA ratio 0.4-0.7
  0.75 + (random() * 0.23)  -- Link quality 0.75-0.98
FROM satellites s
CROSS JOIN generate_series(1, 10);  -- 10 measurements per satellite

-- ============================================================================
-- RADIATION PARAMETERS (Van Allen belt data)
-- ============================================================================

-- Add radiation belt data for satellites
INSERT INTO radiation_parameters (
  satellite_id, timestamp, l_shell, b_field_magnitude_nt,
  radiation_flux, in_radiation_belt, in_saa
)
SELECT 
  s.id,
  now() - (random() * interval '30 minutes'),
  1.2 + (random() * 0.3),  -- L-shell 1.2-1.5 (MEO range)
  25000.0 + (random() * 5000.0),  -- B-field ~25-30 µT
  CASE WHEN random() < 0.15 THEN 1e6 + (random() * 5e6) ELSE 1e3 + (random() * 1e4) END,
  random() < 0.15,  -- 15% chance in radiation belt
  random() < 0.05   -- 5% chance in SAA
FROM satellites s
CROSS JOIN generate_series(1, 20);  -- 20 measurements per satellite

-- ============================================================================
-- SUMMARY STATS
-- ============================================================================

-- Display summary
DO $$
DECLARE
  gs_count INTEGER;
  sat_count INTEGER;
  beam_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO gs_count FROM ground_nodes;
  SELECT COUNT(*) INTO sat_count FROM satellites;
  SELECT COUNT(*) INTO beam_count FROM beams WHERE beam_status = 'active';
  
  RAISE NOTICE '✅ Data Population Complete!';
  RAISE NOTICE '   Ground Stations: %', gs_count;
  RAISE NOTICE '   Satellites: %', sat_count;
  RAISE NOTICE '   Active Beams: %', beam_count;
  RAISE NOTICE '';
  RAISE NOTICE '🌐 Network Stats:';
  RAISE NOTICE '   Total Bandwidth: % Gbps', (SELECT SUM(demand_gbps) FROM ground_nodes WHERE status = 'active');
  RAISE NOTICE '   Avg Weather Score: %', (SELECT ROUND(AVG(weather_score)::numeric, 3) FROM ground_nodes);
  RAISE NOTICE '   Network Health: % active', (SELECT ROUND((COUNT(*) FILTER (WHERE status = 'active')::numeric / COUNT(*)::numeric) * 100, 1) FROM ground_nodes);
END $$;

