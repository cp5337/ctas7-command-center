Usage: generate_crate_specs.js

This tool reads `crates_inventory.csv` and generates `crate-specs/*.yml`.

Non-invasive: it only reads CSV and writes to `crate-specs/`.

Run:
node CTAS7_Inventory_Tools/generate_crate_specs.js

Notes:

- Heuristics enable `synaptix9: true` for crates mentioning fingerprint, synaptix, workflow, pipeline, or scan.
- Review generated YAMLs before enabling automation.
