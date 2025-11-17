#!/usr/bin/env node
// Simple non-invasive crate-spec generator for CTAS-7
// Reads CTAS7_Inventory_Tools/crates_inventory.csv and emits crate-specs/*.yml
// Keeps implementation dependency free (no external npm packages)

const fs = require("fs");
const path = require("path");

const WORKDIR = path.resolve(__dirname);
const CSV = path.join(WORKDIR, "crates_inventory.csv");
const OUTDIR = path.resolve(path.join(__dirname, "..", "crate-specs"));

if (!fs.existsSync(CSV)) {
  console.error("crates_inventory.csv not found at", CSV);
  process.exit(2);
}
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const raw = fs.readFileSync(CSV, "utf8").trim();
const lines = raw.split(/\r?\n/).filter(Boolean);
const header = lines
  .shift()
  .split(",")
  .map((h) => h.trim());

function sanitizeName(n) {
  return n.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
}

lines.forEach((ln, idx) => {
  const cols = ln.split(",");
  const row = {};
  header.forEach((h, i) => (row[h] = (cols[i] || "").trim()));

  const name = row.name || row.crate || `crate-${idx + 1}`;
  const safe = sanitizeName(name);
  const repo = row.repo || "";
  const relpath = row.path || ".";
  const version = row.version || "";
  const notes = row.notes || "";
  const deps = (row.dependencies || "")
    .split(/;|\|/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Heuristics: enable synaptix9 for crates mentioning fingerprint, workflow, synaptix or generator
  const enableSynaptix = /fingerprint|synaptix|workflow|pipeline|scan/i.test(
    name + " " + notes
  );

  const yml = [];
  yml.push(`# Auto-generated crate-spec for ${name}`);
  yml.push(`name: "${name}"`);
  if (repo) yml.push(`repo: "${repo}"`);
  yml.push(`path: "${relpath}"`);
  if (version) yml.push(`version: "${version}"`);
  yml.push(`build_cmd: "cargo build --manifest-path ${relpath}/Cargo.toml"`);
  yml.push(`test_cmd: "cargo test --manifest-path ${relpath}/Cargo.toml"`);
  if (deps.length) yml.push(`dependencies: ${deps.join(", ")}`);
  yml.push(`synaptix9: ${enableSynaptix ? "true" : "false"}`);
  yml.push(`glaf_node_tags: "inventory,auto-generated"`);
  yml.push(`health_check_url: ""`);
  yml.push(`maintainers: ""`);
  if (notes) yml.push(`notes: "${notes.replace(/"/g, '\\"')}"`);

  const out = path.join(OUTDIR, `${safe}.yml`);
  fs.writeFileSync(out, yml.join("\n") + "\n");
  console.log("Wrote", out);
});

console.log("Done. Generated specs in", OUTDIR);
