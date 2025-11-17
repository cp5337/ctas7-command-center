#!/usr/bin/env bash
# Inspect current Finder selection (or Desktop) and run case-insensitive search for ctas7-fingerprint variants
# Non-invasive: reads files only, writes report to Desktop

set -euo pipefail
SELECTION=$(osascript -e 'tell application "Finder" to if (count of selection) > 0 then POSIX path of (item 1 of (get selection) as alias) else ""') || true
ROOT="${SELECTION:-$HOME/Desktop}"
OUT="$HOME/Desktop/ctas7_fingerprint_finder_report.txt"
> "$OUT"

echo "CTAS7 fingerprint quick inspect: $(date)" >> "$OUT"
echo "Searching root: $ROOT" >> "$OUT"

PATTERN='ctas7[-_ ]?fingerprint|ctas7fingerprint|ctas7[-_ ]?finger|ctas7-fingerpint|fingerprint|ephemeral_fingerprint|biometric_fingerprint'

if [ -d "$ROOT" ]; then
  echo "\n-- Grep content matches --" >> "$OUT"
  grep -RIn --binary-files=without-match -i -E "$PATTERN" "$ROOT" >> "$OUT" 2>/dev/null || true

  echo "\n-- Filenames/dirs matching 'finger' --" >> "$OUT"
  find "$ROOT" -type d -iname '*finger*' -print 2>/dev/null | sed -n '1,200p' >> "$OUT" || true
  find "$ROOT" -type f -iname '*ctas7*finger*' -print 2>/dev/null | sed -n '1,200p' >> "$OUT" || true
else
  echo "Provided root is not a directory: $ROOT" >> "$OUT"
fi

echo "\nReport saved to: $OUT"

echo "Done. Report: $OUT"
