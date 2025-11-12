#!/usr/bin/env bash
# Process secrets from secrets/drop and inject into runtime .env
# Usage: ./secrets/process_secrets.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DROP_DIR="$REPO_DIR/secrets/drop"
RUNTIME_ENV="$REPO_DIR/.env.runtime"

mkdir -p "$DROP_DIR"
> "$RUNTIME_ENV"

for f in "$DROP_DIR"/*; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  if [[ "$base" =~ ^SECRET_(.+)\.txt$ ]]; then
    name=${BASH_REMATCH[1]}
    # read whole file
    value=$(cat "$f")
    # write as variable
    key=$(echo "$name" | tr '[:lower:].-' '[:upper:]__ ' | tr ' ' '_')
    echo "# From $base" >> "$RUNTIME_ENV"
    echo "SECRET_$key='''" >> "$RUNTIME_ENV"
    echo "$value" >> "$RUNTIME_ENV"
    echo "'''" >> "$RUNTIME_ENV"
  elif [[ "$base" =~ ^TOKEN_(.+)\.txt$ ]]; then
    name=${BASH_REMATCH[1]}
    value=$(cat "$f" | tr -d '\r\n')
    key=$(echo "$name" | tr '[:lower:].-' '[:upper:]__ ' | tr ' ' '_')
    echo "# From $base" >> "$RUNTIME_ENV"
    echo "TOKEN_$key=$value" >> "$RUNTIME_ENV"
  else
    echo "Skipping unknown file: $base"
  fi
done

# secure the runtime env
chmod 600 "$RUNTIME_ENV"

echo "Wrote runtime env: $RUNTIME_ENV"
echo "To load secrets: set -a; . $RUNTIME_ENV; set +a"
