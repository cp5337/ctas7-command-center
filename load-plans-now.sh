#!/bin/bash
# Quick plan loader - Skip PM2, just load into Linear

set -e

echo "🚀 Loading Plans into Linear..."

# Set Linear API key
export LINEAR_API_KEY="YOUR_LINEAR_API_KEY"

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
