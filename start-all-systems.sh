#!/usr/bin/env bash
# Consolidated startup orchestrator for CTAS-7 systems
# Runs known startup scripts (local) and produces logs for n8n or manual use

set -euo pipefail

# Determine script directory and load .env if present (export variables)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "🔐 Loading environment from $ENV_FILE"
  # export all variables defined in .env
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

BASE_LOG_DIR="/Users/cp5337/Developer/ctas7-command-center/logs/startup"
mkdir -p "$BASE_LOG_DIR"

# List of startup scripts (adjust order as needed)
SCRIPTS=(
  "/Users/cp5337/Developer/ctas7-command-center/start-abe-environment.sh"
  "/Users/cp5337/Developer/ctas7-command-center/start-canonical-backend.sh"
  "/Users/cp5337/Developer/ctas7-command-center/start-canonical-backend-docker.sh"
  "/Users/cp5337/Developer/ctas7-command-center/start-command-center-voice.sh"
  "/Users/cp5337/Developer/ctas7-command-center/start-linear-coordination.sh"
  "/Users/cp5337/Developer/ctas7-command-center/agent-studio/scripts/start-all.sh"
  "/Users/cp5337/Developer/ctas7-command-center/agent-studio/scripts/start-gateway.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/start-n8n-ctas7.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/start-voice-system.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/start-elevenlabs-voice.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-wasm-ground-station/start_cesium_server.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/start-gateway.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-intelligence-generator/start_abe_pipeline.sh"
  "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/start-main-ops.sh"
)

# Synaptix9 integration: read crate specs and create a synaptix queue.
# To auto-trigger Synaptix workflows set SYNAPTIX_ENABLED=true in the environment
SYNAPTIX_ENABLED="${SYNAPTIX_ENABLED:-false}"
CRATE_SPECS_DIR="/Users/cp5337/Developer/ctas7-command-center/crate-specs"
SYNAPTIX_QUEUE=()
if [ -d "$CRATE_SPECS_DIR" ]; then
  for spec in "$CRATE_SPECS_DIR"/*.yml; do
    [ -f "$spec" ] || continue
    # Look for a line: synaptix9: true (case-insensitive)
    if grep -Ei '^[[:space:]]*synaptix9:[[:space:]]*true' "$spec" >/dev/null 2>&1; then
      crate_name=$(basename "$spec" .yml)
      SYNAPTIX_QUEUE+=("$crate_name")
      echo "🔗 Crate '$crate_name' declares synaptix9: true"
    fi
  done
fi

# Protect canonical dashboard 7.1.3: if a file/.tag exists that marks canonical, skip Synaptix starts
CANONICAL_FLAG_FILE="$SCRIPT_DIR/CANONICAL_7_1_3.lock"
if [ -f "$CANONICAL_FLAG_FILE" ]; then
  echo "🚫 Canonical 7.1.3 flag present ($CANONICAL_FLAG_FILE). Skipping Synaptix starts to avoid touching canonical dashboard."
  SYNAPTIX_ENABLED="false"
fi

# When triggering synaptix, use wrapper that detects docker vs OrbStack
SYNAPTIX_WRAPPER="$SCRIPT_DIR/synaptix/synaptix-start-wrapper.sh"

if [ ${#SYNAPTIX_QUEUE[@]} -gt 0 ]; then
  echo "🧭 Synaptix9 queue: ${SYNAPTIX_QUEUE[*]}"
  if [ "$SYNAPTIX_ENABLED" = "true" ]; then
    for c in "${SYNAPTIX_QUEUE[@]}"; do
      echo "▶️ Triggering Synaptix workflow for $c via wrapper"
      "$SYNAPTIX_WRAPPER" "$c" >/dev/null 2>&1 &
    done
  else
    echo "ℹ️  SYNAPTIX_ENABLED not set. To auto-trigger set: export SYNAPTIX_ENABLED=true"
  fi
fi

# Optional: provide --serial to run one-by-one and wait for health checks
RUN_SERIAL=false
if [[ "${1:-}" == "--serial" ]]; then
  RUN_SERIAL=true
fi

run_script() {
  local script="$1"
  local name
  name=$(basename "$script")
  local log_file="$BASE_LOG_DIR/${name}.log"

  if [ ! -x "$script" ]; then
    if [ -f "$script" ]; then
      chmod +x "$script" || true
    else
      echo "⚠️  Script not found: $script" | tee -a "$log_file"
      return 1
    fi
  fi

  echo "🚀 Starting: $script" | tee -a "$log_file"
  # Run in background for parallel mode; in serial mode run foreground
  if [ "$RUN_SERIAL" = true ]; then
    bash "$script" 2>&1 | tee -a "$log_file"
    local rc=${PIPESTATUS[0]}
    echo "🔚 Finished $script (rc=$rc)" | tee -a "$log_file"
    return $rc
  else
    nohup bash "$script" > "$log_file" 2>&1 &
    echo "🔛 Launched $script (log: $log_file)" | tee -a "$BASE_LOG_DIR/startup-launch.log"
    return 0
  fi
}

# After main() but before exit, add hooks to run non-invasive tools when available

# Non-invasive post-start hooks directory
POST_HOOKS_DIR="$SCRIPT_DIR/post-start-hooks"
mkdir -p "$POST_HOOKS_DIR"

# Helper to run a hook script non-invasively (background) and log
run_hook() {
  local hook="$1"
  local name; name=$(basename "$hook")
  local log="$BASE_LOG_DIR/${name}.hook.log"
  if [ -x "$hook" ]; then
    nohup bash "$hook" > "$log" 2>&1 &
    echo "Hook launched: $hook (log: $log)" | tee -a "$BASE_LOG_DIR/startup.log"
  elif [ -f "$hook" ]; then
    chmod +x "$hook" || true
    nohup bash "$hook" > "$log" 2>&1 &
    echo "Hook launched (made executable): $hook (log: $log)" | tee -a "$BASE_LOG_DIR/startup.log"
  else
    echo "No hook: $hook" | tee -a "$BASE_LOG_DIR/startup.log"
  fi
}

# Launch optional non-invasive tasks: generator, glaf export, fuzzy fingerprint scan
# Only run if inventory tools exist
INVENTORY_TOOLS_DIR="$SCRIPT_DIR/CTAS7_Inventory_Tools"
if [ -d "$INVENTORY_TOOLS_DIR" ]; then
  # Generate crate specs (non-invasive read CSV -> write crate-specs)
  if [ -f "$INVENTORY_TOOLS_DIR/generate_crate_specs.js" ]; then
    run_hook "$INVENTORY_TOOLS_DIR/generate_crate_specs.js"
  fi
  # GLAF export
  if [ -f "$INVENTORY_TOOLS_DIR/glaf_export.js" ]; then
    run_hook "$INVENTORY_TOOLS_DIR/glaf_export.js"
  fi
  # Fuzzy fingerprint scan
  if [ -f "$INVENTORY_TOOLS_DIR/fuzzy_search_fingerprint.sh" ]; then
    run_hook "$INVENTORY_TOOLS_DIR/fuzzy_search_fingerprint.sh"
  fi
fi

# Non-invasive synaptix health check (runs but does not trigger workflows)
if [ -f "$SCRIPT_DIR/synaptix/health_check_synaptix.sh" ]; then
  run_hook "$SCRIPT_DIR/synaptix/health_check_synaptix.sh"
fi

# Main function to orchestrate the startup
main() {
  echo "Starting consolidated startup at $(date)" | tee -a "$BASE_LOG_DIR/startup.log"

  for s in "${SCRIPTS[@]}"; do
    run_script "$s" || echo "Failed to start $s" | tee -a "$BASE_LOG_DIR/startup.log"
    if [ "$RUN_SERIAL" = true ]; then
      echo "Waiting 5s before next..." | tee -a "$BASE_LOG_DIR/startup.log"
      sleep 5
    fi
  done

  echo "All start commands issued. Check logs in $BASE_LOG_DIR" | tee -a "$BASE_LOG_DIR/startup.log"
}

main "$@"
