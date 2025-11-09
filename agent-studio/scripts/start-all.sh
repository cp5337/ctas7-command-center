#!/bin/bash
# CTAS Agent Design Studio - Complete Startup

echo "🇷🇺 ================================================"
echo "   CTAS-7 AGENT DESIGN STUDIO"
echo "================================================"
echo ""

# Step 1: Start Gateway
echo "1️⃣  STARTING AGENT GATEWAY (Port 15181)..."
cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/gateway/

# Load environment
if [ -f ../config/.env ]; then
    export $(cat ../config/.env | grep -v '^#' | xargs)
    echo "✅ Environment loaded"
fi

# Build and run gateway in background
cargo build --release --bin gateway
if [ $? -eq 0 ]; then
    cargo run --release --bin gateway > ../logs/gateway.log 2>&1 &
    GATEWAY_PID=$!
    echo "✅ Gateway started (PID: $GATEWAY_PID)"
    sleep 3
else
    echo "❌ Gateway build failed!"
    exit 1
fi

echo ""

# Step 2: Start CTAS v6.6
echo "2️⃣  STARTING CTAS v6.6 (Ports 15174/25174)..."
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas6-reference/
npm run dev > /Users/cp5337/Developer/ctas7-command-center/agent-studio/logs/ctas-v6.log 2>&1 &
CTAS_PID=$!
echo "✅ CTAS v6.6 started (PID: $CTAS_PID)"
sleep 5

echo ""

# Step 3: Test gateway
echo "3️⃣  TESTING GATEWAY..."
cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/scripts/
./test-gateway.sh

echo ""
echo "================================================"
echo "✅ AGENT DESIGN STUDIO OPERATIONAL!"
echo "================================================"
echo ""
echo "📋 SERVICES:"
echo "   - Gateway:    http://localhost:15181"
echo "   - CTAS v6.6:  http://localhost:15174"
echo ""
echo "🔑 API KEY:"
echo "   ctas7-edad7e5ed1580f5b8753a91085803d9ec194f914e786616ae75cab81ff80754b"
echo ""
echo "📝 CUSTOM GPT YAML:"
echo "   /Users/cp5337/Developer/ctas7-command-center/agent-studio/config/NATASHA_GPT_PROMPT.yaml"
echo ""
echo "🎤 TEST IN CUSTOM GPT:"
echo '   Say: "Natasha, check system status"'
echo ""
echo "📊 LOGS:"
echo "   Gateway: agent-studio/logs/gateway.log"
echo "   CTAS v6.6: agent-studio/logs/ctas-v6.log"
echo ""
echo "🛑 TO STOP:"
echo "   kill $GATEWAY_PID $CTAS_PID"
echo "   Or run: pkill -f 'cargo run.*gateway'"
echo ""

