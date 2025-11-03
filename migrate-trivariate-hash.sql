-- CTAS-7 Trivariate Hash Migration for Supabase
-- Run this in Supabase Dashboard -> SQL Editor

-- Add missing trivariate hash columns
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS sch_hash VARCHAR(16);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS cuid_hash VARCHAR(16);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS uuid_hash VARCHAR(16);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS trivariate_hash_full VARCHAR(48);

-- Add missing location columns
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS country_code CHAR(3);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS station_code VARCHAR(20);

-- Add comprehensive scoring columns
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS starlink_score INTEGER CHECK (starlink_score >= 0 AND starlink_score <= 15);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS cable_score INTEGER CHECK (cable_score >= 0 AND cable_score <= 15);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS atmospheric_score INTEGER CHECK (atmospheric_score >= 0 AND atmospheric_score <= 20);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS political_score INTEGER CHECK (political_score >= 0 AND political_score <= 20);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS infrastructure_score INTEGER CHECK (infrastructure_score >= 0 AND infrastructure_score <= 15);
ALTER TABLE ground_nodes ADD COLUMN IF NOT EXISTS strategic_score INTEGER CHECK (strategic_score >= 0 AND strategic_score <= 15);

-- Add index for trivariate hash lookup
CREATE INDEX IF NOT EXISTS idx_ground_nodes_trivariate ON ground_nodes(trivariate_hash_full) WHERE trivariate_hash_full IS NOT NULL;

-- Update existing records with default values
UPDATE ground_nodes SET
  region = 'Unknown',
  country_code = 'UNK',
  station_code = 'GS-' || LPAD(id::text, 3, '0')
WHERE region IS NULL;

-- Generate trivariate hashes for existing records
UPDATE ground_nodes SET
  sch_hash = LEFT(MD5('CTAS7_GROUND_STATION'), 16),
  cuid_hash = LEFT(MD5(station_code || '_' || region), 16),
  uuid_hash = LEFT(MD5(id::text || '_' || name), 16)
WHERE sch_hash IS NULL;

-- Combine into full hash
UPDATE ground_nodes SET
  trivariate_hash_full = sch_hash || cuid_hash || uuid_hash
WHERE trivariate_hash_full IS NULL AND sch_hash IS NOT NULL;

-- Verify migration
SELECT
  COUNT(*) as total_records,
  COUNT(trivariate_hash_full) as records_with_hash,
  COUNT(DISTINCT trivariate_hash_full) as unique_hashes
FROM ground_nodes;

-- Show sample updated record
SELECT id, name, sch_hash, cuid_hash, uuid_hash, trivariate_hash_full
FROM ground_nodes
LIMIT 1;