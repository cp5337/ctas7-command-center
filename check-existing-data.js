// Check what data already exists in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxabqezjpglbbrjdpdmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('\n🔍 Checking existing Supabase data...\n');

  // Check orbital_elements (the data you just showed me)
  const { data: orbitalElements, error: oeError } = await supabase
    .from('orbital_elements')
    .select('*')
    .limit(3);
  
  console.log('🛰️  orbital_elements:', oeError ? `ERROR: ${oeError.message}` : `${orbitalElements?.length || 0} rows found`);
  if (orbitalElements && orbitalElements.length > 0) {
    console.log('   Sample:', JSON.stringify(orbitalElements[0], null, 2));
  }

  // Check ground_nodes
  const { data: groundNodes, error: gnError, count: gnCount } = await supabase
    .from('ground_nodes')
    .select('*', { count: 'exact' })
    .limit(3);
  
  console.log('\n📍 ground_nodes:', gnError ? `ERROR: ${gnError.message}` : `${gnCount || 0} total rows`);
  if (groundNodes && groundNodes.length > 0) {
    console.log('   Sample:', JSON.stringify(groundNodes[0], null, 2));
  }

  // Check satellites
  const { data: satellites, error: satError, count: satCount } = await supabase
    .from('satellites')
    .select('*', { count: 'exact' })
    .limit(3);
  
  console.log('\n🛰️  satellites:', satError ? `ERROR: ${satError.message}` : `${satCount || 0} total rows`);
  if (satellites && satellites.length > 0) {
    console.log('   Sample:', JSON.stringify(satellites[0], null, 2));
  }

  // Check beams
  const { data: beams, error: beamError, count: beamCount } = await supabase
    .from('beams')
    .select('*', { count: 'exact' })
    .limit(3);
  
  console.log('\n📡 beams:', beamError ? `ERROR: ${beamError.message}` : `${beamCount || 0} total rows`);
  if (beams && beams.length > 0) {
    console.log('   Sample:', JSON.stringify(beams[0], null, 2));
  }

  console.log('\n');
}

checkData();

