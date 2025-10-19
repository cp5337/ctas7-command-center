// Quick script to check what's in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxabqezjpglbbrjdpdmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n🔍 Checking Supabase tables...\n');

  // Check ground_nodes
  const { data: groundNodes, error: gnError } = await supabase
    .from('ground_nodes')
    .select('*')
    .limit(5);
  
  console.log('📍 ground_nodes:', gnError ? `ERROR: ${gnError.message}` : `${groundNodes?.length || 0} rows`);
  if (groundNodes && groundNodes.length > 0) {
    console.log('   Sample:', groundNodes[0]);
  }

  // Check satellites
  const { data: satellites, error: satError } = await supabase
    .from('satellites')
    .select('*')
    .limit(5);
  
  console.log('🛰️  satellites:', satError ? `ERROR: ${satError.message}` : `${satellites?.length || 0} rows`);
  if (satellites && satellites.length > 0) {
    console.log('   Sample:', satellites[0]);
  }

  // Check beams
  const { data: beams, error: beamError } = await supabase
    .from('beams')
    .select('*')
    .limit(5);
  
  console.log('📡 beams:', beamError ? `ERROR: ${beamError.message}` : `${beams?.length || 0} rows`);
  if (beams && beams.length > 0) {
    console.log('   Sample:', beams[0]);
  }

  console.log('\n');
}

checkTables();

