#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Restart Synaptix Services
# @raycast.mode fullOutput
# @raycast.packageName Synaptix CTAS-7
# @raycast.icon 🔄

# Optional parameters:
# @raycast.description Restart all PM2 services
# @raycast.author Charlie Payne

echo "🔄 RESTARTING SYNAPTIX SERVICES"
echo "================================"
echo ""

pm2 restart all

echo ""
echo "✅ Services restarted!"
echo ""
pm2 list

