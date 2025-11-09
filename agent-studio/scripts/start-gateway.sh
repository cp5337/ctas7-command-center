#!/bin/bash
# CTAS Agent Gateway Startup Script
# Location: ctas7-command-center/agent-studio

cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/gateway/

echo "🔧 Loading environment variables..."
if [ -f ../config/.env ]; then
    export $(cat ../config/.env | grep -v '^#' | xargs)
    echo "✅ Environment loaded"
else
    echo "⚠️  No .env file found, using defaults"
fi

echo ""
echo "🏗️  Building gateway..."
cargo build --release --bin gateway

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Starting CTAS Agent Gateway..."
    echo ""
    cargo run --release --bin gateway
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi
