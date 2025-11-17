#!/usr/bin/env bash
# Non-invasive Synaptix9 & service health checker
# Polls synaptix wrapper, Forge, n8n and container runtimes; emits JSON for n8n ingestion

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_FLAG_FILE="$SCRIPT_DIR/../CANONICAL_7_1_3.lock"
if [ -f "$CANONICAL_FLAG_FILE" ]; then
  echo '{"status":"skipped","reason":"canonical 7.1.3 lock present"}'
  exit 0
fi

# Check synaptix wrapper availability
SYNAPTIX_WRAPPER="$SCRIPT_DIR/synaptix-start-wrapper.sh"
if [ ! -f "$SYNAPTIX_WRAPPER" ]; then
  echo '{"synaptix": {"ok": false, "reason": "wrapper missing"}}'
else
  echo -n '{"synaptix": '
  if bash "$SYNAPTIX_WRAPPER" --health-check >/dev/null 2>&1; then
    echo ' {"ok": true} '
  else
    echo ' {"ok": false} '
  fi
  echo -n '}'
fi

# Simple Docker check
DOCKER_OK=false
if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    DOCKER_OK=true
  fi
fi

# n8n health (if configured)
N8N_URL="${N8N_URL:-http://localhost:5678/healthz}"
N8N_OK=false
if command -v curl >/dev/null 2>&1; then
  if curl -sSf "$N8N_URL" >/dev/null 2>&1; then
    N8N_OK=true
  fi
fi

# Output consolidated JSON
jq -n --argjson docker_ok "$([ "$DOCKER_OK" = true ] && echo true || echo false)" \
  --argjson n8n_ok "$([ "$N8N_OK" = true ] && echo true || echo false)" \
  '{docker: $docker_ok, n8n: $n8n_ok}' || true
