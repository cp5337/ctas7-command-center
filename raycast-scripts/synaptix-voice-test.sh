#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Test Voice Gateway
# @raycast.mode fullOutput
# @raycast.packageName Synaptix CTAS-7
# @raycast.icon 🎤

# Optional parameters:
# @raycast.description Test Synaptix voice gateway with audio output
# @raycast.author Charlie Payne

echo "🎤 TESTING VOICE GATEWAY"
echo "========================"
echo ""

# Check health
echo "Checking health..."
HEALTH=$(curl -s http://localhost:19015/health)
if [ $? -eq 0 ]; then
  echo "✅ Voice Gateway is online"
  echo ""
  echo "Response:"
  echo "$HEALTH" | jq
  
  # Generate test audio
  echo ""
  echo "🔊 Generating test audio..."
  curl -s http://localhost:19015/voice/test > /tmp/synaptix-voice-test.mp3
  
  if [ -f /tmp/synaptix-voice-test.mp3 ]; then
    echo "✅ Audio generated: /tmp/synaptix-voice-test.mp3"
    echo ""
    echo "Playing audio..."
    open /tmp/synaptix-voice-test.mp3
  else
    echo "❌ Failed to generate audio"
  fi
else
  echo "❌ Voice Gateway is offline"
  echo "   Start with: pm2 start voice-gateway"
fi

