#!/usr/bin/env bash
set -euo pipefail
# Find shell scripts that may prompt for sudo/credentials and prepend a non-interactive guard
ROOTS=("$HOME/Developer/ctas7-command-center" "$HOME/Developer/ctas-7-shipyard-staging")
OUTLIST="$HOME/Developer/ctas7-command-center/logs/rebuild/modified_sudo_guards.txt"
mkdir -p "$(dirname "$OUTLIST")"
> "$OUTLIST"

PATTERN='sudo|askpass|ssh-agent|keychain|pinentry|GPG_TTY|credential|password|ssh-add'

for root in "${ROOTS[@]}"; do
  [ -d "$root" ] || continue
  # find candidate files: .sh or executable with shebang
  while IFS= read -r -d '' f; do
    # only inspect files under repo (skip .git)
    if grep -I -E -q "$PATTERN" "$f" 2>/dev/null; then
      # check shebang
      if head -n1 "$f" | grep -q '^#!'; then
        # skip if already patched
        if grep -q 'NON_INTERACTIVE_SUDO_GUARD' "$f" 2>/dev/null; then
          continue
        fi
        # backup if not exists
        if [ ! -f "$f.bak" ]; then
          cp -p "$f" "$f.bak" || true
        fi
        # build temp file: keep shebang, then guard, then rest
        TMP="$f.tmp"
        SHEBANG=$(head -n1 "$f")
        tail -n +2 "$f" > "$f.body.tmp"
        cat > "$TMP" <<'EOF'
#!/usr/bin/env bash
# NON_INTERACTIVE_SUDO_GUARD
if [ -z "${ALLOW_INTERACTIVE_SUDO:-}" ]; then
  echo "This script may require privileged actions (sudo)."
  echo "To run, either set ALLOW_INTERACTIVE_SUDO=1 or run manually with appropriate privileges."
  exit 1
fi
EOF
        # replace placeholder shebang with original
        # write final file
        printf '%s\n' "$SHEBANG" > "$f.tmp2"
        cat "$f.tmp" >> "$f.tmp2"
        cat "$f.body.tmp" >> "$f.tmp2"
        mv "$f.tmp2" "$f"
        chmod +x "$f" || true
        rm -f "$f.tmp" "$f.body.tmp"
        echo "$f" >> "$OUTLIST"
      fi
    fi
  done < <(find "$root" -type f \( -name '*.sh' -o -perm -u=x \) -not -path '*/.git/*' -print0)
done

echo "Modified files list written to: $OUTLIST"
