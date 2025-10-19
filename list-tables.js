// List all tables in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxabqezjpglbbrjdpdmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('\n🔍 Checking what tables exist in Supabase...\n');

  // Try to query the information schema
  const { data, error } = await supabase
    .rpc('get_tables');

  if (error) {
    console.log('ℹ️  Cannot query table list (this is normal with anon key)');
    console.log('   Error:', error.message);
  } else {
    console.log('📋 Tables found:', data);
  }

  console.log('\n');
}

listTables();

