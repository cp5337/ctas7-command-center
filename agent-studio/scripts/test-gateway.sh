#!/bin/bash
# Test CTAS Agent Gateway endpoints

API_KEY="ctas7-edad7e5ed1580f5b8753a91085803d9ec194f914e786616ae75cab81ff80754b"
BASE_URL="http://localhost:15181"

echo "🧪 Testing CTAS Agent Gateway"
echo "=================================="
echo ""

# Test 1: Health check (no auth required)
echo "1️⃣  Testing /health..."
curl -s $BASE_URL/health | jq '.'
echo ""

# Test 2: Agent status
echo "2️⃣  Testing /agents/status..."
curl -s -H "X-API-Key: $API_KEY" $BASE_URL/agents/status | jq '.'
echo ""

# Test 3: Route task through meta-agent
echo "3️⃣  Testing /meta_agent/route_task..."
curl -s -X POST $BASE_URL/meta_agent/route_task \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Get system status", "priority": 2}' | jq '.'
echo ""

# Test 4: Voice command
echo "4️⃣  Testing /agents/natasha/voice_command..."
curl -s -X POST $BASE_URL/agents/natasha/voice_command \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command": "Check all agents"}' | jq '.'
echo ""

# Test 5: Dispatch to Cove
echo "5️⃣  Testing /agents/cove/dispatch..."
curl -s -X POST $BASE_URL/agents/cove/dispatch \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task": "Run QA checks"}' | jq '.'
echo ""

echo "✅ All tests complete!"
