#!/bin/bash

# CTAS-7 CANONICAL BACKEND STARTUP SCRIPT
# This script starts the complete canonical backend that CANNOT be corrupted
# All frontends (6.6, 7.0, 7.1) should connect to these services
# PRIMARY WORLD: CTAS (Convergent Threat Analysis System) - "main ops"

echo "🚀 Starting CTAS-7 Canonical Backend..."
echo "📅 Date: $(date)"
echo "🎯 Purpose: Preserve the working backend architecture"
echo "🎯 Primary World: CTAS (Convergent Threat Analysis System)"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo "✅ Port $port is active"
        return 0
    else
        echo "❌ Port $port is not active"
        return 1
    fi
}

# Function to wait for a service to start
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name on port $port..."
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo "✅ $service_name is ready on port $port"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start on port $port after $max_attempts attempts"
    return 1
}

echo "🛡️ STEP 1: Starting Real Port Manager (Source of Truth)"
echo "Port: 18103"
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-real-port-manager
if ! check_port 18103; then
    echo "Starting Port Manager..."
    nohup cargo run --release > port_manager.log 2>&1 &
    wait_for_service 18103 "Real Port Manager"
fi
echo ""

echo "💾 STEP 2: Starting Synaptix Core Foundation (Docker)"
echo "Ports: 8000-8080"
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
if ! check_port 8080; then
    echo "Starting Synaptix Core Docker containers..."
    # Add Synaptix Core startup command here
    echo "📝 TODO: Add docker-compose up for Synaptix Core"
fi
echo ""

echo "🗄️ STEP 3: Starting Sledis (Memory Mesh v2.0 RC1)"
echo "Ports: 19014 (Redis), 20014 (gRPC Health)"
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-sledis
if ! check_port 19014; then
    echo "Starting Sledis Cache Server..."
    nohup cargo run --bin server > sledis.log 2>&1 &
    wait_for_service 19014 "Sledis Cache"
fi
echo ""

echo "🧠 STEP 4: Starting Neural Mux (gRPC + Atomic Clipboard)"
echo "Ports: 50051 (Neural Mux), 15001 (Web Bridge)"
cd "/Users/cp5337/Developer/ctas-7-shipyard-staging/Cognitive Tactics Engine/cte-backend/cte-neural-mux"
if ! check_port 50051; then
    echo "Starting Neural Mux with Atomic Clipboard..."
    nohup cargo run --release > neural_mux.log 2>&1 &
    wait_for_service 50051 "Neural Mux"
fi
echo ""

echo "📡 STEP 5: Checking Orbital Services"
echo "Ports: 18120-18126"
services=(
    "18120:Groundstations HFT"
    "18121:Orbital Mechanics"
    "18122:Enhanced Geolocation"
    "18123:Orbital Ingest"
    "18124:Laserlight Constellation"
    "18125:MCP Laser Light"
    "18126:Space World Foundation Bridge"
)

for service in "${services[@]}"; do
    port="${service%%:*}"
    name="${service##*:}"
    check_port $port || echo "⚠️  $name not running on port $port"
done
echo ""

echo "🎯 STEP 6: Backend Health Check"
echo "Checking all critical services..."

critical_ports=(18103 8000 8005 19014 50051)
all_healthy=true

for port in "${critical_ports[@]}"; do
    if ! check_port $port; then
        all_healthy=false
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    echo "✅ CANONICAL BACKEND IS READY!"
    echo "🎯 All critical services are running"
    echo "📝 Frontend can now connect to these ports"
    echo ""
    echo "🔗 Key Connection Points:"
    echo "   - Neural Mux: http://localhost:50051 (gRPC)"
    echo "   - Database Bridge: http://localhost:8005"
    echo "   - Port Manager: http://localhost:18103"
    echo "   - Synaptix Core: http://localhost:8080"
    echo "   - Sledis Cache: redis://localhost:19014"
    echo ""
    echo "🚨 DO NOT USE PORTS 5173/5174 - USE THIS CANONICAL BACKEND!"
else
    echo "❌ SOME SERVICES FAILED TO START"
    echo "🔧 Check the logs and try again"
    exit 1
fi
