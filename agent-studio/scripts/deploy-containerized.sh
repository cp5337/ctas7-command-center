#!/bin/bash
# Deploy Containerized CTAS Agent Studio
# Complete Docker deployment with ABE integration

set -e

echo "🐳 ================================================"
echo "   CTAS-7 CONTAINERIZED DEPLOYMENT"
echo "================================================"
echo ""

cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/

# Step 1: Pre-flight checks
echo "1️⃣  PRE-FLIGHT CHECKS..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed"
    echo "   Install from: https://docker.com/get-started"
    exit 1
fi
echo "✅ Docker installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed"
    exit 1
fi
echo "✅ Docker Compose installed"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo "   Start Docker Desktop and try again"
    exit 1
fi
echo "✅ Docker running"

# Check .env file
if [ ! -f config/.env ]; then
    echo "❌ .env file not found"
    echo "   Create: config/.env"
    exit 1
fi
echo "✅ .env file found"

echo ""

# Step 2: Build gateway image
echo "2️⃣  BUILDING GATEWAY IMAGE..."
echo ""

cd gateway
docker build -t ctas7-agent-gateway:latest .
if [ $? -eq 0 ]; then
    echo "✅ Gateway image built"
else
    echo "❌ Gateway build failed"
    exit 1
fi
cd ..

echo ""

# Step 3: Pull other required images
echo "3️⃣  PULLING REQUIRED IMAGES..."
echo ""

images=(
    "surrealdb/surrealdb:latest"
    "redis:7-alpine"
)

for image in "${images[@]}"; do
    echo "📥 Pulling: $image"
    docker pull $image
done

echo "✅ All images ready"
echo ""

# Step 4: Create network if it doesn't exist
echo "4️⃣  SETTING UP NETWORK..."
echo ""

if ! docker network ls | grep -q ctas-network; then
    docker network create ctas-network
    echo "✅ Created ctas-network"
else
    echo "✅ ctas-network exists"
fi

echo ""

# Step 5: Start services
echo "5️⃣  STARTING SERVICES..."
echo ""

docker-compose up -d

echo "✅ Services starting..."
echo ""

# Step 6: Wait for services to be healthy
echo "6️⃣  WAITING FOR HEALTH CHECKS..."
echo ""

sleep 10

services=(
    "ctas-agent-gateway:15181"
    "ctas-surrealdb:8000"
    "ctas-redis:6379"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)

    echo -n "🔍 Checking $name..."

    if [ "$port" = "15181" ] || [ "$port" = "8000" ]; then
        # HTTP services
        if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo " ✅ HEALTHY"
        else
            echo " ⏳ STARTING..."
        fi
    else
        # Other services
        if docker ps | grep -q "$name"; then
            echo " ✅ RUNNING"
        else
            echo " ❌ NOT RUNNING"
        fi
    fi
done

echo ""

# Step 7: Show status
echo "7️⃣  DEPLOYMENT STATUS..."
echo ""

docker-compose ps

echo ""
echo "================================================"
echo "✅ CONTAINERIZED DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "🌐 SERVICES:"
echo "   - Gateway:    http://localhost:15181"
echo "   - SurrealDB:  http://localhost:8000"
echo "   - Redis:      localhost:6379"
echo ""
echo "📊 LOGS:"
echo "   docker-compose logs -f agent-gateway"
echo "   docker-compose logs -f abe-service"
echo ""
echo "🛑 TO STOP:"
echo "   docker-compose down"
echo ""
echo "🔄 TO RESTART:"
echo "   docker-compose restart"
echo ""
echo "🧹 TO CLEAN:"
echo "   docker-compose down -v"
echo ""
