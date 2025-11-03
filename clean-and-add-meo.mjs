#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAndAddMEOSatellites() {
  console.log('🛰️  Cleaning database and adding ONLY 12 MEO satellites...');

  // Use RPC or direct SQL to delete ALL satellites
  try {
    const { error: deleteError } = await supabase.rpc('delete_all_satellites');
    if (deleteError) {
      console.log('RPC failed, trying direct delete...');
      // Fallback: try to delete by fetching all IDs first
      const { data: allSats } = await supabase.from('satellites').select('id');
      if (allSats && allSats.length > 0) {
        console.log(`Deleting ${allSats.length} satellites individually...`);
        for (const sat of allSats) {
          await supabase.from('satellites').delete().eq('id', sat.id);
        }
      }
    }
  } catch (e) {
    console.log('Trying bulk delete...');
    // Last resort: just try to delete everything
    await supabase.from('satellites').delete().neq('id', '');
  }

  // Verify deletion
  const { data: checkData } = await supabase.from('satellites').select('id');
  console.log(`Remaining satellites after cleanup: ${checkData?.length || 0}`);

  // Define ONLY 12 MEO satellites in Van Allen Belt
  const meoSatellites = [
    // MEO Ring 1 (15,000km altitude) - Inner Van Allen Belt
    { name: 'MEO-ALPHA-01', latitude: 0.0, longitude: 0.0, altitude: 15000, inclination: 55.0 },
    { name: 'MEO-BETA-02', latitude: 0.0, longitude: 90.0, altitude: 15000, inclination: 55.0 },
    { name: 'MEO-GAMMA-03', latitude: 0.0, longitude: 180.0, altitude: 15000, inclination: 55.0 },
    { name: 'MEO-DELTA-04', latitude: 0.0, longitude: -90.0, altitude: 15000, inclination: 55.0 },

    // MEO Ring 2 (18,000km altitude) - Mid Van Allen Belt
    { name: 'MEO-EPSILON-05', latitude: 0.0, longitude: 45.0, altitude: 18000, inclination: 63.0 },
    { name: 'MEO-ZETA-06', latitude: 0.0, longitude: 135.0, altitude: 18000, inclination: 63.0 },
    { name: 'MEO-ETA-07', latitude: 0.0, longitude: -135.0, altitude: 18000, inclination: 63.0 },
    { name: 'MEO-THETA-08', latitude: 0.0, longitude: -45.0, altitude: 18000, inclination: 63.0 },

    // MEO Ring 3 (12,000km altitude) - Lower Van Allen Belt
    { name: 'MEO-IOTA-09', latitude: 0.0, longitude: 22.5, altitude: 12000, inclination: 50.0 },
    { name: 'MEO-KAPPA-10', latitude: 0.0, longitude: 112.5, altitude: 12000, inclination: 50.0 },
    { name: 'MEO-LAMBDA-11', latitude: 0.0, longitude: -157.5, altitude: 12000, inclination: 50.0 },
    { name: 'MEO-MU-12', latitude: 0.0, longitude: -67.5, altitude: 12000, inclination: 50.0 }
  ];

  // Insert ONLY these 12 MEO satellites
  const { data, error } = await supabase
    .from('satellites')
    .insert(meoSatellites);

  if (error) {
    console.error('❌ Error inserting MEO satellites:', error);
    return;
  }

  console.log('✅ Successfully added 12 MEO satellites!');

  // Verify final constellation
  const { data: finalData, error: finalError } = await supabase
    .from('satellites')
    .select('name, altitude, inclination, longitude, latitude')
    .order('altitude', { ascending: true });

  if (!finalError && finalData) {
    console.log('\n🛰️  Final MEO Van Allen Belt Constellation:');
    console.log(`💫 Total Satellites: ${finalData.length}`);

    // Group by altitude
    const rings = {};
    finalData.forEach(s => {
      if (!rings[s.altitude]) rings[s.altitude] = [];
      rings[s.altitude].push(s);
    });

    Object.keys(rings).sort((a, b) => parseInt(a) - parseInt(b)).forEach(alt => {
      console.log(`\n🌍 MEO Ring (${alt}km altitude - Van Allen Belt):`);
      rings[alt].forEach(s =>
        console.log(`  ${s.name}: ${s.longitude}°E, ${s.latitude}°N, inc=${s.inclination}°`)
      );
    });

    console.log('\n🚀 ALL satellites are MEO in Van Allen Belt radiation environment!');
  }
}

cleanAndAddMEOSatellites().catch(console.error);