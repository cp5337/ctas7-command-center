#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Start All Synaptix Services
# @raycast.mode fullOutput
# @raycast.packageName Synaptix CTAS-7
# @raycast.icon ▶️

# Optional parameters:
# @raycast.description Start PM2 services and Docker containers
# @raycast.author Charlie Payne

echo "🚀 STARTING SYNAPTIX SERVICES"
echo "=============================="
echo ""

# Start PM2 services
echo "📊 Starting PM2 services..."
cd /Users/cp5337/Developer/ctas7-command-center
pm2 start ecosystem.config.cjs
echo ""

# Start Docker backend
echo "🐳 Starting Docker backend..."
./start-canonical-backend-docker.sh
echo ""

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 5

# Check status
echo ""
echo "✅ Services started!"
echo ""
pm2 list

