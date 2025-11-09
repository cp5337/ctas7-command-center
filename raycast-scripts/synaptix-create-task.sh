#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Create Synaptix Task
# @raycast.mode fullOutput
# @raycast.packageName Synaptix CTAS-7
# @raycast.icon ➕

# Optional parameters:
# @raycast.description Create a new task via voice command
# @raycast.author Charlie Payne
# @raycast.argument1 { "type": "text", "placeholder": "Task description" }

TASK_TEXT="$1"

echo "📋 CREATING SYNAPTIX TASK"
echo "========================="
echo ""
echo "Task: $TASK_TEXT"
echo ""

# Send to voice gateway
RESPONSE=$(curl -s -X POST http://localhost:19015/voice/command \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"natasha $TASK_TEXT\",\"returnAudio\":false}")

if [ $? -eq 0 ]; then
  echo "✅ Task created successfully!"
  echo ""
  echo "$RESPONSE" | jq
  
  # Extract Linear URL
  LINEAR_URL=$(echo "$RESPONSE" | jq -r '.linearUrl')
  if [ "$LINEAR_URL" != "null" ]; then
    echo ""
    echo "🔗 Opening in Linear..."
    open "$LINEAR_URL"
  fi
else
  echo "❌ Failed to create task"
  echo "   Make sure voice-gateway is running: pm2 list"
fi

