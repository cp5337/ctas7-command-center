#!/usr/bin/env bash
# Wrapper to start Synaptix with Docker/OrbStack detection
set -euo pipefail

ORBSTACK_SOCK="$HOME/.orbstack/run/docker.sock"
DEFAULT_DOCKER_SOCKET="/var/run/docker.sock"

if [ -S "$ORBSTACK_SOCK" ]; then
  echo "Detected OrbStack socket: $ORBSTACK_SOCK"
  export DOCKER_HOST="unix://$ORBSTACK_SOCK"
elif [ -S "$DEFAULT_DOCKER_SOCKET" ]; then
  echo "Using system Docker socket: $DEFAULT_DOCKER_SOCKET"
  export DOCKER_HOST="unix://$DEFAULT_DOCKER_SOCKET"
else
  echo "No docker socket found. Start Docker or OrbStack and re-run this script."
  exit 1
fi

# Path to real Synaptix start script (adjust if different)
TARGET="/Users/cp5337/Developer/ctas-7-shipyard-staging/Cognitive Tactics Engine/start-synaptix-mcp-unified.sh"

if [ ! -f "$TARGET" ]; then
  echo "Synaptix start script not found at: $TARGET"
  exit 1
fi

# Pass through any arguments (crate names, etc.)
"$TARGET" "$@" &
echo "Launched Synaptix start script (background)"
exit 0
