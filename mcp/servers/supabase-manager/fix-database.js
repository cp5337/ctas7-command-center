#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../../../.env" });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Define proper CTAS tasks (not terrorism/TTL)
// NOTE: These tasks will be updated with murmur3 hash fields (content_hash, primitive_hash, chain_hash)
const PROPER_CTAS_TASKS = [
  {
    title: "Network Asset Discovery",
    description:
      "Discover and catalog all network assets using automated scanning tools",
    status: "pending",
    priority: "high",
    hd4_phase: "hunt",
    operation_type: "network_security",
    category: "asset_management",
    ptcc_primitives: ["DISCOVER", "CATALOG", "VERIFY"],
    ptcc_tool_chain: ["nmap", "masscan", "zmap"],
    mitre_attack_techniques: ["T1592.002"],
    assigned_to: "natasha",
  },
  {
    title: "Vulnerability Assessment",
    description:
      "Perform comprehensive vulnerability assessment of discovered assets",
    status: "pending",
    priority: "high",
    hd4_phase: "detect",
    operation_type: "vulnerability_management",
    category: "security_assessment",
    ptcc_primitives: ["ASSESS", "ANALYZE", "PRIORITIZE"],
    ptcc_tool_chain: ["openvas", "nessus", "nuclei"],
    mitre_attack_techniques: ["T1595.002"],
    assigned_to: "elena",
  },
  {
    title: "Security Configuration Review",
    description:
      "Review and validate security configurations across infrastructure",
    status: "pending",
    priority: "medium",
    hd4_phase: "detect",
    operation_type: "configuration_management",
    category: "compliance",
    ptcc_primitives: ["REVIEW", "VALIDATE", "REMEDIATE"],
    ptcc_tool_chain: ["lynis", "ciscat", "scap"],
    mitre_attack_techniques: ["T1082"],
    assigned_to: "cove",
  },
  {
    title: "Threat Intelligence Collection",
    description:
      "Collect and analyze threat intelligence from multiple sources",
    status: "pending",
    priority: "high",
    hd4_phase: "hunt",
    operation_type: "threat_intelligence",
    category: "intelligence",
    ptcc_primitives: ["COLLECT", "CORRELATE", "ENRICH"],
    ptcc_tool_chain: ["misp", "opencti", "yara"],
    mitre_attack_techniques: ["T1589"],
    assigned_to: "marcus",
  },
  {
    title: "Incident Response Preparation",
    description: "Prepare incident response procedures and playbooks",
    status: "pending",
    priority: "medium",
    hd4_phase: "disrupt",
    operation_type: "incident_response",
    category: "preparedness",
    ptcc_primitives: ["PREPARE", "DOCUMENT", "TEST"],
    ptcc_tool_chain: ["volatility", "autopsy", "sleuthkit"],
    mitre_attack_techniques: ["T1059"],
    assigned_to: "elena",
  },
];

async function fixDatabaseMess() {
  console.log("🔧 FIXING DATABASE MESS");
  console.log("=".repeat(50));

  try {
    // Step 1: Clear corrupted tasks
    console.log("\n1. Clearing corrupted terrorism/TTL tasks...");
    const { error: clearError } = await supabase
      .from("ctas_tasks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (clearError) {
      console.log("❌ Error clearing:", clearError.message);
      return;
    }
    console.log("✅ Cleared all corrupted data");

    // Step 2: Load proper CTAS tasks
    console.log("\n2. Loading proper CTAS framework tasks...");

    const { data, error: insertError } = await supabase
      .from("ctas_tasks")
      .insert(PROPER_CTAS_TASKS)
      .select();

    if (insertError) {
      console.log("❌ Error loading tasks:", insertError.message);
      return;
    }
    console.log(`✅ Loaded ${data?.length || 0} proper CTAS tasks`);

    // Step 3: Verify first task
    console.log("\n3. Verifying first CTAS task...");
    const { data: firstTask, error: queryError } = await supabase
      .from("ctas_tasks")
      .select("title, description, hd4_phase, operation_type, priority")
      .order("created_at")
      .limit(1);

    if (!queryError && firstTask && firstTask.length > 0) {
      console.log("\n🎯 FIRST CTAS TASK (CORRECTED):");
      console.log("━".repeat(50));
      console.log(`📋 Title: "${firstTask[0].title}"`);
      console.log(`📝 Description: ${firstTask[0].description}`);
      console.log(`⚡ HD4 Phase: ${firstTask[0].hd4_phase}`);
      console.log(`🔧 Operation Type: ${firstTask[0].operation_type}`);
      console.log(`📊 Priority: ${firstTask[0].priority}`);
    }

    console.log("\n✅ DATABASE REPAIR COMPLETE!");
    console.log(
      "The terrorism/TTL tasks have been replaced with proper CTAS framework tasks."
    );
  } catch (error) {
    console.log("❌ Fatal error:", error.message);
  }
}

fixDatabaseMess();
