#!/usr/bin/env node

/**
 * Load CTAS Tasks from CSV with Dual Trivariate Hash Architecture
 *
 * DUAL HASH SYSTEM (CTAS 7.3.1 Architecture):
 * ALL HASHES USE MurmurHash3 with SCH-CUID-UUID trivariate structure (48-char Base96)
 *
 * 1. OPERATIONAL HASHES (op_*): MurmurHash3 trivariate for routing/caching
 *    - op_content_hash: SCH-CUID-UUID from task content
 *    - op_primitive_hash: SCH-CUID-UUID from primitive type
 *    - op_chain_hash: SCH-CUID-UUID from relationships
 *    - op_pth_hash: SCH-CUID-UUID from risk metrics
 *    - op_composite_hash: SCH-CUID-UUID from all operational data
 *
 * 2. SEMANTIC HASHES (sem_*): MurmurHash3 trivariate for content/meaning
 *    - sem_content_hash: SCH-CUID-UUID from semantic content
 *    - sem_category_hash: SCH-CUID-UUID from semantic classification
 *    - sem_relationship_hash: SCH-CUID-UUID from contextual relationships
 *    - sem_composite_hash: SCH-CUID-UUID from all semantic data
 *
 * SCH-CUID-UUID Structure (48 chars Base96):
 * - Characters 1-16: SCH (Short-Hand Concept) - MurmurHash3 with seed 0
 * - Characters 17-32: CUID (Contextual Unique ID) - MurmurHash3 with seed + timestamp
 * - Characters 33-48: UUID (Universal Unique ID) - MurmurHash3 with random seed
 *
 * This naming convention (op_* / sem_*) makes it easy to:
 * - Distinguish operational routing from semantic analysis
 * - Retrofit existing systems to support dual hash architecture
 * - Query/filter by hash type in database operations
 * - Maintain clarity as the specification evolves
 *
 * Converts CSV to proper Supabase-ready task format
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://kxabqezjpglbbrjdpdmv.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error("❌ VITE_SUPABASE_ANON_KEY not found in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read and parse CSV
const csvPath =
  "/Users/cp5337/Developer/ctas7-command-center/ctas_tasks_with_primitive_type.csv";
console.log("📄 Reading CSV file...");

const csvContent = readFileSync(csvPath, "utf-8");
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`✅ Parsed ${records.length} tasks from CSV`);

// Transform CSV records to Supabase format with hash field placeholders
const tasks = records.map((record) => {
  // Parse predecessors and successors (semicolon-separated)
  const predecessors = record.predecessors
    ? record.predecessors.split(";").filter(Boolean)
    : [];
  const successors = record.successors
    ? record.successors.split(";").filter(Boolean)
    : [];

  // Convert string numbers to actual numbers
  const p = parseFloat(record.p) || 0;
  const t = parseFloat(record.t) || 0;
  const h = parseFloat(record.h) || 0;
  const task_seq = parseInt(record.task_seq) || 0;

  return {
    // Core identification
    hash_id: record.hash_id,
    task_name: record.task_name,
    description: record.description,

    // Classification
    category: record.category,
    hd4_phase: record.hd4_phase,
    primitive_type: record.primitive_type,

    // Graph relationships
    predecessors: predecessors,
    successors: successors,

    // PTH metrics (Probability, Time, Hazard)
    p_probability: p,
    t_time: t,
    h_hazard: h,

    // Sequencing
    task_seq: task_seq,

    // OPERATIONAL HASH FIELDS (MurmurHash3 - SCH-CUID-UUID Trivariate, 48-char Base96)
    // Naming convention: op_* for operational routing/caching hashes
    op_content_hash: null, // SCH-CUID-UUID from (name + description + category)
    op_primitive_hash: null, // SCH-CUID-UUID from primitive_type
    op_chain_hash: null, // SCH-CUID-UUID from (predecessors + successors)
    op_pth_hash: null, // SCH-CUID-UUID from (p + t + h metrics)
    op_composite_hash: null, // SCH-CUID-UUID from all operational hashes combined

    // SEMANTIC HASH FIELDS (MurmurHash3 - SCH-CUID-UUID Trivariate, 48-char Base96)
    // Naming convention: sem_* for semantic understanding/analysis hashes
    sem_content_hash: null, // SCH-CUID-UUID from semantic content analysis
    sem_category_hash: null, // SCH-CUID-UUID from semantic classification
    sem_relationship_hash: null, // SCH-CUID-UUID from semantic context/relationships
    sem_composite_hash: null, // SCH-CUID-UUID from all semantic hashes combined

    // Metadata
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
});

console.log("\n📊 Sample task structure:");
console.log(JSON.stringify(tasks[0], null, 2));

// Function to load tasks into Supabase
async function loadTasks(clearExisting = false) {
  console.log("\n🔄 Loading tasks into Supabase...");

  try {
    // Check if table exists and get current count
    const { count: currentCount, error: countError } = await supabase
      .from("ctas_tasks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log(
        "⚠️  Table may not exist or error checking:",
        countError.message
      );
    } else {
      console.log(`📋 Current task count: ${currentCount}`);
    }

    // Clear existing tasks if requested
    if (clearExisting) {
      console.log("🗑️  Clearing existing tasks...");
      const { error: clearError } = await supabase
        .from("ctas_tasks")
        .delete()
        .neq("hash_id", "impossible-hash-id"); // Delete all

      if (clearError) {
        console.error("❌ Error clearing tasks:", clearError.message);
        return;
      }
      console.log("✅ Existing tasks cleared");
    }

    // Insert tasks in batches (Supabase has limits)
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("ctas_tasks")
        .insert(batch)
        .select();

      if (error) {
        console.error(
          `❌ Error inserting batch ${i / batchSize + 1}:`,
          error.message
        );
        console.error("Details:", error);
        continue;
      }

      inserted += data?.length || 0;
      console.log(
        `✅ Inserted batch ${i / batchSize + 1}: ${
          data?.length
        } tasks (total: ${inserted}/${tasks.length})`
      );
    }

    console.log(
      `\n✅ Successfully loaded ${inserted} tasks into ctas_tasks table`
    );

    // Verify final count
    const { count: finalCount } = await supabase
      .from("ctas_tasks")
      .select("*", { count: "exact", head: true });

    console.log(`📊 Final task count: ${finalCount}`);

    // Show sample tasks
    const { data: sampleTasks } = await supabase
      .from("ctas_tasks")
      .select("hash_id, task_name, primitive_type, hd4_phase")
      .limit(5);

    console.log("\n📋 Sample loaded tasks:");
    sampleTasks?.forEach((task) => {
      console.log(
        `  - ${task.hash_id}: ${task.task_name} [${task.primitive_type}] (${task.hd4_phase})`
      );
    });
  } catch (error) {
    console.error("❌ Fatal error loading tasks:", error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const clearExisting = args.includes("--clear") || args.includes("-c");

if (clearExisting) {
  console.log("⚠️  CLEAR MODE: Existing tasks will be deleted");
}

// Execute
loadTasks(clearExisting);
