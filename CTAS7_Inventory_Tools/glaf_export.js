#!/usr/bin/env node
// Export a simple GLAF-compatible graph from crate-specs/*.yml
// Non-invasive: reads crate-specs and writes glaf_export.{json,dot} in CTAS7_Inventory_Tools

const fs = require("fs");
const path = require("path");

const SPEC_DIR = path.resolve(__dirname, "..", "crate-specs");
const OUT_DIR = path.resolve(__dirname);
if (!fs.existsSync(SPEC_DIR)) {
  console.error("crate-specs directory not found at", SPEC_DIR);
  process.exit(2);
}

const files = fs
  .readdirSync(SPEC_DIR)
  .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
const nodes = [];
const edges = [];

files.forEach((f) => {
  const content = fs.readFileSync(path.join(SPEC_DIR, f), "utf8");
  const nameMatch = content.match(/^name:\s*"?([\w\-\._]+)"?/im);
  const name = nameMatch ? nameMatch[1] : f.replace(/\.ya?ml$/, "");
  nodes.push({ id: name, label: name });
  const depsMatch = content.match(/^dependencies:\s*(.*)$/im);
  if (depsMatch) {
    const depList = depsMatch[1]
      .split(/,|\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    depList.forEach((d) => {
      edges.push({ from: name, to: d });
    });
  }
});

const graph = { nodes, edges };
fs.writeFileSync(
  path.join(OUT_DIR, "glaf_export.json"),
  JSON.stringify(graph, null, 2)
);

// Create DOT
let dot = "digraph CTAS7 {\n  rankdir=LR;\n";
nodes.forEach((n) => {
  dot += `  "${n.id}";\n`;
});
edges.forEach((e) => {
  dot += `  "${e.from}" -> "${e.to}";\n`;
});
dot += "}\n";
fs.writeFileSync(path.join(OUT_DIR, "glaf_export.dot"), dot);
console.log("Wrote glaf_export.json and glaf_export.dot in", OUT_DIR);
