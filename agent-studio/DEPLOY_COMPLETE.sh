#!/bin/bash
# COMPLETE CTAS-7 DEPLOYMENT
# Orchestrates: Gateway + ABE + Containerization + Google Drive

set -e

echo "🇷🇺 ================================================"
echo "   CTAS-7 COMPLETE SYSTEM DEPLOYMENT"
echo "   Agent Studio + ABE + Containers"
echo "================================================"
echo ""

cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/

# Make all scripts executable
chmod +x scripts/*.sh

echo "📋 DEPLOYMENT PLAN:"
echo ""
echo "1️⃣  Initialize ABE & Google Drive"
echo "2️⃣  Build and containerize services"
echo "3️⃣  Start agent gateway"
echo "4️⃣  Verify all systems"
echo "5️⃣  Display access information"
echo ""
read -p "Continue with deployment? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "================================================"
echo "STEP 1: ABE & GOOGLE DRIVE INITIALIZATION"
echo "================================================"
echo ""

./scripts/initialize-abe-gdrive.sh

echo ""
read -p "Did ABE initialization complete successfully? (y/n): " abe_ok

if [ "$abe_ok" != "y" ]; then
    echo "⚠️  ABE initialization incomplete"
    echo "   You can continue and set up ABE later"
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "================================================"
echo "STEP 2: CONTAINERIZATION"
echo "================================================"
echo ""

read -p "Deploy with Docker containers? (y/n): " use_docker

if [ "$use_docker" = "y" ]; then
    echo "🐳 Starting containerized deployment..."
    ./scripts/deploy-containerized.sh
else
    echo "📦 Starting local deployment..."
    ./scripts/start-all.sh &
    GATEWAY_PID=$!
    sleep 5
fi

echo ""
echo "================================================"
echo "STEP 3: VERIFICATION"
echo "================================================"
echo ""

echo "🧪 Testing endpoints..."
./scripts/test-gateway.sh

echo ""
echo "================================================"
echo "STEP 4: DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""

echo "✅ SERVICES RUNNING:"
echo ""
echo "   🌐 Agent Gateway:  http://localhost:15181"
echo "   🏢 ABE Service:    http://localhost:15170 (if containerized)"
echo "   💾 SurrealDB:      http://localhost:8000"
echo "   📦 Redis:          localhost:6379"
echo ""

echo "🔑 API KEY:"
echo "   $(grep GATEWAY_API_KEY config/.env | cut -d'=' -f2)"
echo ""

echo "📁 GOOGLE DRIVE:"
if [ -f config/.env ] && grep -q GOOGLE_DRIVE_FOLDER_ID config/.env; then
    echo "   ✅ Configured"
    echo "   ID: $(grep GOOGLE_DRIVE_FOLDER_ID config/.env | cut -d'=' -f2)"
else
    echo "   ⚠️  Not configured yet"
    echo "   Add GOOGLE_DRIVE_FOLDER_ID to config/.env"
fi
echo ""

echo "📋 CUSTOM GPT YAML:"
echo "   config/NATASHA_GPT_PROMPT.yaml"
pbcopy < config/NATASHA_GPT_PROMPT.yaml
echo "   ✅ Copied to clipboard"
echo ""

echo "🎯 NEXT STEPS:"
echo ""
echo "1. Configure Custom GPT:"
echo "   - Go to: https://chat.openai.com/gpts/editor"
echo "   - Paste YAML (in clipboard)"
echo "   - Add API key from above"
echo ""
echo "2. Upload documentation to Google Drive:"
echo "   - Architecture docs"
echo "   - API specifications"
echo "   - Code references"
echo ""
echo "3. Test voice commands:"
echo '   - "Natasha, check system status"'
echo '   - "Get all agents"'
echo '   - "Analyze architecture"'
echo ""

if [ "$use_docker" = "y" ]; then
    echo "🐳 DOCKER COMMANDS:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop:         docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo "   Clean:        docker-compose down -v"
else
    echo "🛑 TO STOP:"
    echo "   pkill -f 'cargo run.*gateway'"
    echo "   pkill -f 'vite'"
fi

echo ""
echo "================================================"
echo "🚀 CTAS-7 AGENT STUDIO IS OPERATIONAL!"
echo "================================================"
echo ""

