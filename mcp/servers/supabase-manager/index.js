#!/usr/bin/env node

/**
 * CTAS Supabase Manager MCP Server
 * Fixes the database mess and manages CTAS tasks properly
 */

import { createClient } from "@supabase/supabase-js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://kxabqezjpglbbrjdpdmv.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error("❌ VITE_SUPABASE_ANON_KEY not found in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// MCP Server setup
const server = new Server(
  {
    name: "ctas-supabase-manager",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool schemas
const ClearTableSchema = z.object({
  table_name: z.string().describe("Name of table to clear"),
  confirm: z
    .boolean()
    .describe("Confirmation that you want to delete all data"),
});

const QueryTableSchema = z.object({
  table_name: z.string().describe("Name of table to query"),
  limit: z.number().optional().describe("Limit number of results"),
  columns: z
    .string()
    .optional()
    .describe("Comma-separated column names to select"),
});

const LoadCTASTasksSchema = z.object({
  source: z
    .enum(["framework", "operational", "sample"])
    .describe("Source of CTAS tasks to load"),
  clear_existing: z.boolean().describe("Whether to clear existing tasks first"),
});

const ListTablesSchema = z.object({});

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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "clear_table",
        description: "Clear all data from a specific table (DANGEROUS)",
        inputSchema: ClearTableSchema,
      },
      {
        name: "query_table",
        description: "Query data from any table",
        inputSchema: QueryTableSchema,
      },
      {
        name: "load_ctas_tasks",
        description: "Load proper CTAS tasks (not terrorism/TTL data)",
        inputSchema: LoadCTASTasksSchema,
      },
      {
        name: "list_tables",
        description: "List all available tables in database",
        inputSchema: ListTablesSchema,
      },
      {
        name: "fix_database_mess",
        description:
          "Fix the entire database mess - clear bad data and load correct CTAS tasks",
        inputSchema: z.object({
          confirm: z.boolean().describe("Confirmation to proceed with fixing"),
        }),
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "clear_table": {
        const { table_name, confirm } = ClearTableSchema.parse(args);

        if (!confirm) {
          return {
            content: [
              { type: "text", text: "❌ Confirmation required to clear table" },
            ],
          };
        }

        const { error } = await supabase
          .from(table_name)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

        if (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Error clearing ${table_name}: ${error.message}`,
              },
            ],
          };
        }

        return {
          content: [
            { type: "text", text: `✅ Cleared all data from ${table_name}` },
          ],
        };
      }

      case "query_table": {
        const {
          table_name,
          limit = 10,
          columns = "*",
        } = QueryTableSchema.parse(args);

        let query = supabase.from(table_name).select(columns);
        if (limit) query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Error querying ${table_name}: ${error.message}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `📊 ${table_name} (${
                data?.length || 0
              } rows):\n\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case "load_ctas_tasks": {
        const { source, clear_existing } = LoadCTASTasksSchema.parse(args);

        let tasks_to_load = [];

        if (source === "framework") {
          tasks_to_load = PROPER_CTAS_TASKS;
        } else if (source === "operational") {
          // Load from operational data
          tasks_to_load = PROPER_CTAS_TASKS.map((task) => ({
            ...task,
            status: "in_progress",
          }));
        } else {
          tasks_to_load = PROPER_CTAS_TASKS.slice(0, 2); // Sample
        }

        if (clear_existing) {
          const { error: clearError } = await supabase
            .from("ctas_tasks")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

          if (clearError) {
            return {
              content: [
                {
                  type: "text",
                  text: `❌ Error clearing existing tasks: ${clearError.message}`,
                },
              ],
            };
          }
        }

        const { data, error } = await supabase
          .from("ctas_tasks")
          .insert(tasks_to_load)
          .select();

        if (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Error loading CTAS tasks: ${error.message}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `✅ Loaded ${
                data?.length || 0
              } proper CTAS tasks from ${source} source`,
            },
          ],
        };
      }

      case "list_tables": {
        // Try to discover tables by attempting common names
        const table_attempts = [
          "ctas_tasks",
          "ground_nodes",
          "satellites",
          "beams",
          "nodes",
          "interviews",
          "agents",
          "linear_issues",
          "reports",
        ];

        const existing_tables = [];

        for (const table of table_attempts) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select("*")
              .limit(1);

            if (!error) {
              existing_tables.push({
                name: table,
                has_data: data && data.length > 0,
              });
            }
          } catch (e) {
            // Table doesn't exist
          }
        }

        return {
          content: [
            {
              type: "text",
              text: `📋 Available tables:\n\n${existing_tables
                .map((t) => `${t.has_data ? "✅" : "⚪"} ${t.name}`)
                .join("\n")}\n\nTotal: ${existing_tables.length} tables`,
            },
          ],
        };
      }

      case "fix_database_mess": {
        const { confirm } = z.object({ confirm: z.boolean() }).parse(args);

        if (!confirm) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Confirmation required to fix database mess",
              },
            ],
          };
        }

        let results = [];

        // Step 1: Clear corrupted ctas_tasks
        const { error: clearError } = await supabase
          .from("ctas_tasks")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (clearError) {
          results.push(
            `❌ Error clearing corrupted tasks: ${clearError.message}`
          );
        } else {
          results.push("✅ Cleared corrupted terrorism/TTL tasks");
        }

        // Step 2: Load proper CTAS tasks
        const { data, error: insertError } = await supabase
          .from("ctas_tasks")
          .insert(PROPER_CTAS_TASKS)
          .select();

        if (insertError) {
          results.push(`❌ Error loading proper tasks: ${insertError.message}`);
        } else {
          results.push(
            `✅ Loaded ${data?.length || 0} proper CTAS framework tasks`
          );
        }

        // Step 3: Verify first task
        const { data: firstTask, error: queryError } = await supabase
          .from("ctas_tasks")
          .select("title, description, hd4_phase")
          .order("created_at")
          .limit(1);

        if (!queryError && firstTask && firstTask.length > 0) {
          results.push(`\n🎯 First CTAS Task: "${firstTask[0].title}"`);
          results.push(`   Description: ${firstTask[0].description}`);
          results.push(`   HD4 Phase: ${firstTask[0].hd4_phase}`);
        }

        return {
          content: [
            {
              type: "text",
              text: `🔧 Database Repair Results:\n\n${results.join("\n")}`,
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `❌ Unknown tool: ${name}` }],
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Error: ${error.message}` }],
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("🚀 CTAS Supabase Manager MCP Server running");
