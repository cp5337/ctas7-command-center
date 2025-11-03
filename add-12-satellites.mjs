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

async function add12SatelliteConstellation() {
  console.log('🛰️  Adding 12-satellite mega constellation...');

  // Get all existing satellites and delete them
  const { data: existingSats, error: fetchError } = await supabase
    .from('satellites')
    .select('id');

  if (fetchError) {
    console.error('❌ Error fetching existing satellites:', fetchError);
    return;
  }

  if (existingSats && existingSats.length > 0) {
    console.log(`🗑️  Deleting ${existingSats.length} existing satellites...`);
    for (const sat of existingSats) {
      const { error: delError } = await supabase
        .from('satellites')
        .delete()
        .eq('id', sat.id);

      if (delError) {
        console.error(`❌ Error deleting satellite ${sat.id}:`, delError);
      }
    }
    console.log('✅ Cleared all existing satellites');
  }

  // Define 12-satellite MEO constellation in Van Allen Belt region (10,000-20,000 km)
  const satellites = [
    // MEO Ring 1 (15,000km altitude, 4 satellites) - Inner Van Allen Belt
    { name: 'SAT-ALPHA', latitude: 0.0, longitude: 0.0, altitude: 15000, inclination: 55.0 },
    { name: 'SAT-BETA', latitude: 0.0, longitude: 90.0, altitude: 15000, inclination: 55.0 },
    { name: 'SAT-GAMMA', latitude: 0.0, longitude: 180.0, altitude: 15000, inclination: 55.0 },
    { name: 'SAT-DELTA', latitude: 0.0, longitude: -90.0, altitude: 15000, inclination: 55.0 },

    // MEO Ring 2 (18,000km altitude, 4 satellites) - Mid Van Allen Belt
    { name: 'SAT-EPSILON', latitude: 0.0, longitude: 45.0, altitude: 18000, inclination: 63.0 },
    { name: 'SAT-ZETA', latitude: 0.0, longitude: 135.0, altitude: 18000, inclination: 63.0 },
    { name: 'SAT-ETA', latitude: 0.0, longitude: -135.0, altitude: 18000, inclination: 63.0 },
    { name: 'SAT-THETA', latitude: 0.0, longitude: -45.0, altitude: 18000, inclination: 63.0 },

    // MEO Ring 3 (12,000km altitude, 4 satellites) - Lower Van Allen Belt
    { name: 'SAT-IOTA', latitude: 0.0, longitude: 22.5, altitude: 12000, inclination: 50.0 },
    { name: 'SAT-KAPPA', latitude: 0.0, longitude: 112.5, altitude: 12000, inclination: 50.0 },
    { name: 'SAT-LAMBDA', latitude: 0.0, longitude: -157.5, altitude: 12000, inclination: 50.0 },
    { name: 'SAT-MU', latitude: 0.0, longitude: -67.5, altitude: 12000, inclination: 50.0 }
  ];

  // Supabase will auto-generate timestamps

  // Insert all satellites
  const { data, error } = await supabase
    .from('satellites')
    .insert(satellites);

  if (error) {
    console.error('❌ Error inserting satellites:', error);
    return;
  }

  console.log('✅ Successfully added 12-satellite constellation!');

  // Verify the constellation
  const { data: verifyData, error: verifyError } = await supabase
    .from('satellites')
    .select('name, altitude, inclination, longitude, latitude')
    .order('altitude', { ascending: true });

  if (!verifyError && verifyData) {
    console.log('\n🛰️  Constellation Summary:');
    console.log(`💫 Total Satellites: ${verifyData.length}`);
    console.log('\n🌍 LEO Shell 1 (550km):');
    verifyData.filter(s => s.altitude === 550).forEach(s =>
      console.log(`  ${s.name}: ${s.longitude}°E, ${s.latitude}°N, inc=${s.inclination}°`)
    );
    console.log('\n🌍 LEO Shell 2 (1200km):');
    verifyData.filter(s => s.altitude === 1200).forEach(s =>
      console.log(`  ${s.name}: ${s.longitude}°E, ${s.latitude}°N, inc=${s.inclination}°`)
    );
    console.log('\n🌍 MEO Layer (8000km):');
    verifyData.filter(s => s.altitude === 8000).forEach(s =>
      console.log(`  ${s.name}: ${s.longitude}°E, ${s.latitude}°N, inc=${s.inclination}°`)
    );
    console.log('\n🚀 Constellation ready for continuous Earth orbit and solar-optimized routing!');
  }
}

add12SatelliteConstellation().catch(console.error);