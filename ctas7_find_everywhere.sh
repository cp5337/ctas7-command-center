#!/usr/bin/env bash
# Non-invasive exhaustive, case-insensitive search for ctas7-fingerprint variants
# Writes a report; default searches /Users/cp5337 and mounted volumes. Does not use sudo.

set -euo pipefail
ROOTS=("/Users/cp5337" "/Volumes")
OUT="/Users/cp5337/Desktop/ctas7_fingerprint_search_report.txt"
> "$OUT"

PATTERNS=(
  "ctas7-fingerprint"
  "ctas7fingerprint"
  "ctas7 fingerpint"
  "ctas7[-_ ]?finger"
  "fingerprint"
  "ephemeral_fingerprint"
  "biometric_fingerprint"
)

echo "CTAS7 fingerprint exhaustive search report: $(date)" >> "$OUT"

for root in "${ROOTS[@]}"; do
  if [ -d "$root" ]; then
    echo "\n=== Searching under: $root ===" >> "$OUT"
    for p in "${PATTERNS[@]}"; do
      echo "-- Pattern: $p --" >> "$OUT"
      if [[ "$p" == *"["* || "$p" == *"\\?"* ]]; then
        # pattern looks like a regex
        grep -RIn --binary-files=without-match -i -E "$p" "$root" >> "$OUT" 2>/dev/null || true
      else
        grep -RIn --binary-files=without-match -i -e "$p" "$root" >> "$OUT" 2>/dev/null || true
      fi
    done

    # Also find directories and filenames matching token 'finger'
    echo "\n-- Filenames/dirs containing 'finger' --" >> "$OUT"
    find "$root" -type d -iname '*finger*' -print 2>/dev/null | sed -n '1,200p' >> "$OUT" || true
    find "$root" -type f -iname '*ctas7*finger*' -print 2>/dev/null | sed -n '1,200p' >> "$OUT" || true
  fi
done

# Check Cargo.toml package names
echo "\n=== Cargo.toml name fields matching fingerprint variants ===" >> "$OUT"
for root in "${ROOTS[@]}"; do
  if [ -d "$root" ]; then
    grep -RIn --binary-files=without-match -i -E '^name\s*=\s*"?.*(ctas7[-_ ]?fingerprint|fingerprint).*"?' "$root" 2>/dev/null | sed -n '1,500p' >> "$OUT" || true
  fi
done

echo "\nReport saved to: $OUT"
