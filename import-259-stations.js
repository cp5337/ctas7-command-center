// Import 259 ground stations from networkWorldData into Supabase
import { createClient } from '@supabase/supabase-js';
import { GROUND_STATIONS } from './src/services/networkWorldData.ts';

const supabaseUrl = 'https://kxabqezjpglbbrjdpdmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate 259 stations based on the 10 strategic hubs
function generate259Stations() {
  const stations = [];
  
  // Add the 10 existing strategic hubs
  GROUND_STATIONS.forEach(gs => {
    stations.push({
      name: gs.name,
      latitude: gs.lat,
      longitude: gs.lon,
      tier: gs.type === 'primary' ? 1 : 2,
      demand_gbps: gs.capacity_gbps,
      weather_score: gs.uptime_sla,
      status: gs.status
    });
  });
  
  // Generate remaining 249 stations distributed globally
  const regions = [
    { name: 'North America', latMin: 25, latMax: 50, lonMin: -130, lonMax: -70, count: 60 },
    { name: 'Europe', latMin: 35, latMax: 70, lonMin: -10, lonMax: 50, count: 50 },
    { name: 'Asia', latMin: -10, latMax: 50, lonMin: 60, lonMax: 140, count: 70 },
    { name: 'Middle East', latMin: 15, latMax: 40, lonMin: 35, lonMax: 65, count: 30 },
    { name: 'Africa', latMin: -35, latMax: 20, lonMin: -20, lonMax: 40, count: 35 },
    { name: 'South America', latMin: -55, latMax: -10, lonMin: -80, lonMax: -35, count: 25 },
    { name: 'Pacific', latMin: -40, latMax: 20, lonMin: 140, lonMax: 240, count: 14 },
    { name: 'Australia', latMin: -45, latMax: -10, lonMin: 110, lonMax: 155, count: 15 }
  ];
  
  regions.forEach(region => {
    for (let i = 0; i < region.count; i++) {
      const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
      let lon = region.lonMin + Math.random() * (region.lonMax - region.lonMin);
      
      // Wrap longitude to -180 to 180
      while (lon > 180) lon -= 360;
      while (lon < -180) lon += 360;
      
      const tier = Math.random() < 0.3 ? 1 : (Math.random() < 0.7 ? 2 : 3);
      const demand = 40 + Math.random() * 60; // 40-100 Gbps
      const weather = 0.55 + Math.random() * 0.40; // 0.55-0.95
      const status = Math.random() < 0.95 ? 'active' : (Math.random() < 0.98 ? 'degraded' : 'offline');
      
      stations.push({
        name: `GS-${region.name.replace(' ', '')}-${String(i + 1).padStart(3, '0')}`,
        latitude: lat,
        longitude: lon,
        tier: tier,
        demand_gbps: demand,
        weather_score: weather,
        status: status
      });
    }
  });
  
  return stations;
}

async function importStations() {
  console.log('\n🚀 Generating 259 ground stations...\n');
  
  const stations = generate259Stations();
  console.log(`✅ Generated ${stations.length} stations\n`);
  
  // Clear existing stations
  console.log('🗑️  Clearing existing stations...');
  const { error: deleteError } = await supabase
    .from('ground_nodes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (deleteError) {
    console.error('❌ Error clearing stations:', deleteError);
    return;
  }
  
  console.log('✅ Cleared existing stations\n');
  
  // Insert in batches of 100
  console.log('📥 Importing stations to Supabase...');
  const batchSize = 100;
  let imported = 0;
  
  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize);
    const { error } = await supabase
      .from('ground_nodes')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error importing batch ${i / batchSize + 1}:`, error);
      continue;
    }
    
    imported += batch.length;
    console.log(`   Imported ${imported}/${stations.length} stations...`);
  }
  
  console.log(`\n✅ Successfully imported ${imported} ground stations!\n`);
  
  // Verify
  const { count } = await supabase
    .from('ground_nodes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total stations in database: ${count}\n`);
}

importStations();

