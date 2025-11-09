#!/bin/bash
# Test Gemini API access for Marcus and Elena

cd "$(dirname "$0")"

echo "🧪 Testing Gemini API Access..."
echo ""

# Load environment
source .env 2>/dev/null || true

if [ -z "$GOOGLE_AI_API_KEY" ]; then
  echo "❌ GOOGLE_AI_API_KEY not set"
  echo "Get your API key from: https://aistudio.google.com/app/apikey"
  echo "Then run: echo 'GOOGLE_AI_API_KEY=your-key-here' >> .env"
  exit 1
fi

echo "✅ API key found"
echo ""

# Test Marcus (technical analysis)
echo "🤖 Testing Marcus (Gemini 2M context)..."
node agents/gemini-client.cjs marcus "Marcus. Neural Mux status report. Analyze CTAS7 architecture briefly."

echo ""
echo "---"
echo ""

# Test Elena (creative analysis)
echo "🎨 Testing Elena (Gemini 2M context)..."
node agents/gemini-client.cjs elena "Elena. Creative Director check-in. Analyze ABE launch video concept briefly."

echo ""
echo "✅ Gemini tests complete!"
echo ""
echo "💰 Cost tracking:"
echo "- Each test costs ~$0.001 (pay-per-use)"
echo "- 2M context window available for both agents"
echo "- Marcus: Technical/IAC analysis"
echo "- Elena: Creative/Marketing strategy"

