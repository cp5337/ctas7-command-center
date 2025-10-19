-- ============================================================================
-- Fix RLS Policies for Public Read Access
-- Run this in Supabase SQL Editor to allow anon key to read data
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to ground_nodes" ON ground_nodes;
DROP POLICY IF EXISTS "Allow public read access to satellites" ON satellites;
DROP POLICY IF EXISTS "Allow public read access to beams" ON beams;
DROP POLICY IF EXISTS "Allow public read access to orbital_elements" ON orbital_elements;
DROP POLICY IF EXISTS "Allow public read access to radiation_parameters" ON radiation_parameters;
DROP POLICY IF EXISTS "Allow public read access to qkd_metrics" ON qkd_metrics;
DROP POLICY IF EXISTS "Allow public read access to weather_data" ON weather_data;
DROP POLICY IF EXISTS "Allow public read access to telemetry_archive" ON telemetry_archive;

-- Create new policies that allow public read access
CREATE POLICY "Allow public read access to ground_nodes"
  ON ground_nodes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to satellites"
  ON satellites FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to beams"
  ON beams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to orbital_elements"
  ON orbital_elements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to radiation_parameters"
  ON radiation_parameters FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to qkd_metrics"
  ON qkd_metrics FOR SELECT
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

-- Verify RLS is enabled
ALTER TABLE ground_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE beams ENABLE ROW LEVEL SECURITY;
ALTER TABLE orbital_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiation_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE qkd_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_archive ENABLE ROW LEVEL SECURITY;

-- Test query (should return data)
SELECT 'ground_nodes' as table_name, COUNT(*) as row_count FROM ground_nodes
UNION ALL
SELECT 'satellites', COUNT(*) FROM satellites
UNION ALL
SELECT 'beams', COUNT(*) FROM beams
UNION ALL
SELECT 'orbital_elements', COUNT(*) FROM orbital_elements;

