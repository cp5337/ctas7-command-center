#!/bin/bash
# Quick plan loader - Skip PM2, just load into Linear

set -e

echo "🚀 Loading Plans into Linear..."

# Load environment variables so LINEAR_API_KEY comes from .env
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "$LINEAR_API_KEY" ]; then
  echo "❌ LINEAR_API_KEY not set. Add it to .env before running this script."
  exit 1
fi

# Navigate to command center
cd /Users/cp5337/Developer/ctas7-command-center

# Install dependencies if needed
if [ ! -d "node_modules/@linear" ]; then
    echo "📦 Installing @linear/sdk..."
    npm install @linear/sdk
fi

# Run plan loader
echo "📋 Running plan loader..."
node ctas7-linear-plan-loader.cjs

echo "✅ Done!"
