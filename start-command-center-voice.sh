#!/bin/bash

# CTAS-7 Command Center Startup Script
# Starts command center with voice capabilities after backend verification

set -e

echo "🚀 Starting CTAS-7 Command Center with Voice Integration"
echo "=================================================="

# Check if canonical backend is running
echo "📡 Checking canonical backend services..."

check_service() {
    local port=$1
    local service=$2
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $service (port $port) - RUNNING"
        return 0
    else
        echo "❌ $service (port $port) - NOT RUNNING"
        return 1
    fi
}

# Check all backend services
backend_ready=true

check_service 15170 "Real Port Manager" || backend_ready=false
check_service 15171 "Synaptix Core" || backend_ready=false  
check_service 15172 "Neural Mux" || backend_ready=false
check_service 15173 "Sledis" || backend_ready=false
check_service 15174 "Foundation Data" || backend_ready=false

if [ "$backend_ready" = false ]; then
    echo ""
    echo "⚠️  Backend services not running. Starting canonical backend..."
    echo "   Run: ./start-canonical-backend-docker.sh"
    echo ""
    read -p "Start canonical backend now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./start-canonical-backend-docker.sh
        echo "Waiting 10 seconds for services to initialize..."
        sleep 10
    else
        echo "❌ Cannot start command center without backend services"
        exit 1
    fi
fi

echo ""
echo "🎤 Starting Command Center with Voice Integration..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Starting in local development mode..."
    npm run dev
else
    echo "🐳 Starting containerized command center..."
    docker-compose -f docker-compose.command-center.yml up --build
fi
