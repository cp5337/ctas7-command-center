#!/usr/bin/env bash
# Non-invasive fuzzy search for ctas7-fingerprint (and variants) across repo files
# Scans markdown and inventory CSVs for terms related to fingerprint, IP, patent, NLP
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT_DIR}/CTAS7_Inventory_Tools/fuzzy_fingerprint_report.txt"
> "$OUT"

PATTERNS=("ctas7-fingerprint" "ctas7-fingerpint" "fingerprint" "ip scan" "ip-scan" "ipscan" "patent" "nlp" "nlp-scan" "ip scanning")

echo "Fuzzy fingerprint scan report: $(date)" >> "$OUT"
for p in "${PATTERNS[@]}"; do
  echo "--- Searching for: $p ---" >> "$OUT"
  grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=logs -e "$p" "$ROOT_DIR" >> "$OUT" || true
done

# Run a heuristic: look for crates mentioning fingerprint in crates_inventory.csv
CSV="$ROOT_DIR/CTAS7_Inventory_Tools/crates_inventory.csv"
if [ -f "$CSV" ]; then
  echo "--- Checking crates_inventory.csv for fingerprint-related rows ---" >> "$OUT"
  grep -Ei "fingerprint|nlp|ip" "$CSV" >> "$OUT" || true
fi

# report location
echo "Report saved to: $OUT"
