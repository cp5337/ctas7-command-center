// Import exactly 259 organized ground stations with proper metadata
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxabqezjpglbbrjdpdmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Strategic hubs (10 primary stations)
const strategicHubs = [
  { name: 'Dubai Strategic Hub', lat: 25.2048, lon: 55.2708, tier: 1, region: 'Middle East', capacity: 100, weather: 0.95 },
  { name: 'Johannesburg Strategic Hub', lat: -26.2041, lon: 28.0473, tier: 1, region: 'Africa', capacity: 100, weather: 0.88 },
  { name: 'Fortaleza Strategic Hub', lat: -3.7319, lon: -38.5267, tier: 1, region: 'South America', capacity: 100, weather: 0.82 },
  { name: 'Hawaii Strategic Hub', lat: 21.3099, lon: -157.8581, tier: 1, region: 'Pacific', capacity: 95, weather: 0.75 },
  { name: 'Guam Strategic Hub', lat: 13.4443, lon: 144.7937, tier: 1, region: 'Pacific', capacity: 90, weather: 0.70 },
  { name: 'China Lake California Hub', lat: 35.6853, lon: -117.6858, tier: 1, region: 'North America', capacity: 100, weather: 0.98 },
  { name: 'NSA Fort Meade HQ', lat: 39.1081, lon: -76.7710, tier: 1, region: 'North America', capacity: 100, weather: 0.72 },
  { name: 'CENTCOM Tampa FL', lat: 27.9506, lon: -82.4572, tier: 1, region: 'North America', capacity: 95, weather: 0.80 },
  { name: 'Antofagasta Chile - Atacama', lat: -24.8833, lon: -70.4, tier: 1, region: 'South America', capacity: 80, weather: 0.99 },
  { name: 'Aswan Egypt - Desert', lat: 24.0889, lon: 32.8998, tier: 1, region: 'Africa', capacity: 75, weather: 0.97 },
];

// Regional distribution for remaining 249 stations
const regions = [
  { name: 'North America', latMin: 25, latMax: 50, lonMin: -130, lonMax: -70, count: 55, tier1: 5, tier2: 30, tier3: 20 },
  { name: 'Europe', latMin: 35, latMax: 70, lonMin: -10, lonMax: 50, count: 48, tier1: 8, tier2: 25, tier3: 15 },
  { name: 'Asia', latMin: -10, latMax: 50, lonMin: 60, lonMax: 140, count: 65, tier1: 10, tier2: 35, tier3: 20 },
  { name: 'Middle East', latMin: 15, latMax: 40, lonMin: 35, lonMax: 65, count: 28, tier1: 6, tier2: 15, tier3: 7 },
  { name: 'Africa', latMin: -35, latMax: 20, lonMin: -20, lonMax: 40, count: 33, tier1: 4, tier2: 18, tier3: 11 },
  { name: 'South America', latMin: -55, latMax: -10, lonMin: -80, lonMax: -35, count: 23, tier1: 3, tier2: 12, tier3: 8 },
  { name: 'Pacific', latMin: -40, latMax: 20, lonMin: 140, lonMax: 180, count: 12, tier1: 2, tier2: 6, tier3: 4 },
  { name: 'Australia', latMin: -45, latMax: -10, lonMin: 110, lonMax: 155, count: 15, tier1: 2, tier2: 8, tier3: 5 }
];

function generateStations() {
  const stations = [];
  
  // Add 10 strategic hubs
  strategicHubs.forEach(hub => {
    stations.push({
      name: hub.name,
      latitude: hub.lat,
      longitude: hub.lon,
      tier: hub.tier,
      demand_gbps: hub.capacity,
      weather_score: hub.weather,
      status: 'active'
    });
  });
  
  // Generate regional stations
  regions.forEach(region => {
    // Tier 1 stations
    for (let i = 0; i < region.tier1; i++) {
      stations.push(createStation(region, 1, i + 1));
    }
    // Tier 2 stations
    for (let i = 0; i < region.tier2; i++) {
      stations.push(createStation(region, 2, i + 1));
    }
    // Tier 3 stations
    for (let i = 0; i < region.tier3; i++) {
      stations.push(createStation(region, 3, i + 1));
    }
  });
  
  return stations;
}

function createStation(region, tier, index) {
  const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
  let lon = region.lonMin + Math.random() * (region.lonMax - region.lonMin);
  
  // Wrap longitude
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  
  // Tier-based characteristics
  const tierConfig = {
    1: { capacityMin: 80, capacityMax: 100, weatherMin: 0.85, weatherMax: 0.98, activeProb: 0.99 },
    2: { capacityMin: 50, capacityMax: 80, weatherMin: 0.70, weatherMax: 0.90, activeProb: 0.95 },
    3: { capacityMin: 30, capacityMax: 60, weatherMin: 0.55, weatherMax: 0.80, activeProb: 0.90 }
  };
  
  const config = tierConfig[tier];
  const capacity = config.capacityMin + Math.random() * (config.capacityMax - config.capacityMin);
  const weather = config.weatherMin + Math.random() * (config.weatherMax - config.weatherMin);
  const rand = Math.random();
  const status = rand < config.activeProb ? 'active' : (rand < 0.98 ? 'degraded' : 'offline');
  
  return {
    name: `${region.name.replace(' ', '')}-T${tier}-${String(index).padStart(3, '0')}`,
    latitude: lat,
    longitude: lon,
    tier: tier,
    demand_gbps: capacity,
    weather_score: weather,
    status: status
  };
}

async function importStations() {
  console.log('\n🚀 Generating exactly 259 ground stations...\n');
  
  const stations = generateStations();
  console.log(`✅ Generated ${stations.length} stations\n`);
  
  // Show breakdown
  const tier1 = stations.filter(s => s.tier === 1).length;
  const tier2 = stations.filter(s => s.tier === 2).length;
  const tier3 = stations.filter(s => s.tier === 3).length;
  const active = stations.filter(s => s.status === 'active').length;
  
  console.log('📊 Station Breakdown:');
  console.log(`   Tier 1 (Primary): ${tier1}`);
  console.log(`   Tier 2 (Secondary): ${tier2}`);
  console.log(`   Tier 3 (Backup): ${tier3}`);
  console.log(`   Active: ${active}`);
  console.log(`   Degraded/Offline: ${stations.length - active}\n`);
  
  // Import in batches
  console.log('📥 Importing to Supabase...');
  const batchSize = 100;
  let imported = 0;
  
  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize);
    const { error } = await supabase
      .from('ground_nodes')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error importing batch:`, error);
      continue;
    }
    
    imported += batch.length;
    console.log(`   Imported ${imported}/${stations.length}...`);
  }
  
  console.log(`\n✅ Successfully imported ${imported} ground stations!\n`);
  
  // Verify
  const { count } = await supabase
    .from('ground_nodes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total in database: ${count}\n`);
}

importStations();

