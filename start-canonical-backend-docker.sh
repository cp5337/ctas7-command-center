#!/bin/bash

# CTAS-7 Canonical Backend Docker Preservation Script
# This script starts the canonical backend in Docker to preserve it from modification
# DO NOT REPLACE - this is an ADDITIONAL protection layer

echo "🛡️  CTAS-7 Canonical Backend Docker Preservation"
echo "=================================================="
echo "Starting canonical backend services in Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Set environment variables
export COMPOSE_PROJECT_NAME=ctas7-canonical-backend
export DOCKER_BUILDKIT=1

# Create network if it doesn't exist
docker network create ctas7-canonical-network 2>/dev/null || true

echo "🚀 Starting CTAS-7 Canonical Backend services..."

# Start the canonical backend
docker-compose -f docker-compose.canonical-backend.yml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."

services=(
    "ctas7-real-port-manager:18103"
    "ctas7-synaptix-core:8080"
    "ctas7-sledis-cache:19014"
    "ctas7-neural-mux:50051"
    "ctas7-surrealdb:8000"
    "ctas7-database-bridge:8005"
)

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if docker-compose -f docker-compose.canonical-backend.yml ps | grep -q "$service_name.*Up"; then
        echo "✅ $service_name is running"
    else
        echo "❌ $service_name is not running"
    fi
done

echo ""
echo "📊 Service Status Summary:"
echo "=========================="
docker-compose -f docker-compose.canonical-backend.yml ps

echo ""
echo "🛡️  Canonical Backend Preservation Complete!"
echo ""
echo "📝 Key Ports (PRESERVED):"
echo "  - Real Port Manager: 18103 (Authoritative)"
echo "  - Synaptix Core: 8080 (API Gateway)"
echo "  - Neural Mux: 50051 (gRPC + Atomic Clipboard)"
echo "  - Database Bridge: 8005 (All DB access)"
echo "  - Memory Mesh: 19014 (Sledis cache)"
echo "  - SurrealDB: 8000 (Document storage)"
echo ""
echo "🔧 Management Commands:"
echo "  - View logs: docker-compose -f docker-compose.canonical-backend.yml logs -f"
echo "  - Stop: docker-compose -f docker-compose.canonical-backend.yml down"
echo "  - Restart: docker-compose -f docker-compose.canonical-backend.yml restart"
echo ""
echo "⚠️  WARNING: This is the CANONICAL backend. Do not modify!"
echo "   Any frontend (6.6, 7.0, 7.1) should connect to these ports."
