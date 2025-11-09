#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Synaptix System Status
# @raycast.mode fullOutput
# @raycast.packageName Synaptix CTAS-7
# @raycast.icon 🚀

# Optional parameters:
# @raycast.description Check status of all Synaptix services
# @raycast.author Charlie Payne
# @raycast.authorURL https://github.com/cognetixalpha

echo "🚀 SYNAPTIX SYSTEM STATUS"
echo "========================="
echo ""

# PM2 Services
echo "📊 PM2 Services:"
pm2 jlist 2>/dev/null | jq -r '.[] | select(.pm2_env.status=="online") | "  ✅ \(.name) (PID: \(.pid))"' 2>/dev/null || echo "  ⚠️  PM2 not running"
echo ""

# Voice Gateway
echo "🎤 Voice Gateway:"
if curl -s http://localhost:19015/health > /dev/null 2>&1; then
  echo "  ✅ Voice Gateway operational (Port 19015)"
else
  echo "  ❌ Voice Gateway offline"
fi

# Slack Interface
echo "💬 Slack Interface:"
if curl -s http://localhost:18299 > /dev/null 2>&1; then
  echo "  ✅ Slack Interface operational (Port 18299)"
else
  echo "  ❌ Slack Interface offline"
fi

# Docker Containers
echo ""
echo "🐳 Docker Containers:"
docker ps --format "  ✅ {{.Names}} ({{.Status}})" 2>/dev/null || echo "  ⚠️  No containers running"

echo ""
echo "🔗 Quick Links:"
echo "  Linear: https://linear.app/cognetixalpha/team/COG"
echo "  Main Ops: http://localhost:25174"
echo "  Command Center: http://localhost:5173"

