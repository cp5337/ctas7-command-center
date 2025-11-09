import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxabqezjpglbbrjdpdmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWJxZXpqcGdsYmJyamRwZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjgwOTQsImV4cCI6MjA1NjkwNDA5NH0.rkf3pwovRxiYaivtEUoQ4M_Mpm1QpT3uInXMi02hga8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryCTASTasks() {
  console.log('\n🔍 Querying ctas_tasks table...\n');

  const { data: tasks, error } = await supabase
    .from('ctas_tasks')
    .select('*')
    .limit(20);
  
  if (error) {
    console.error('❌ ERROR:', error.message);
    return;
  }

  console.log(`✅ Found ${tasks?.length || 0} tasks\n`);
  
  if (tasks && tasks.length > 0) {
    tasks.forEach((task, idx) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 TASK ${idx + 1}: ${task.title}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${task.id}`);
      console.log(`Linear: ${task.linear_issue_key || 'N/A'}`);
      console.log(`Status: ${task.status}`);
      console.log(`Priority: ${task.priority}`);
      console.log(`HD4 Phase: ${task.hd4_phase || 'N/A'}`);
      console.log(`Operation Type: ${task.operation_type || 'N/A'}`);
      console.log(`Assigned To: ${task.assigned_to || 'N/A'}`);
      console.log(`\nPTCC Primitives: ${JSON.stringify(task.ptcc_primitives, null, 2)}`);
      console.log(`MITRE ATT&CK: ${JSON.stringify(task.mitre_attack_techniques, null, 2)}`);
      console.log(`Kali Tools: ${JSON.stringify(task.kali_tools_required, null, 2)}`);
      console.log(`PTCC Tool Chain: ${JSON.stringify(task.ptcc_tool_chain, null, 2)}`);
      console.log(`\nDescription: ${task.description || 'N/A'}`);
    });
  }

  console.log('\n');
}

queryCTASTasks();
