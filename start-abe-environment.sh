#!/bin/bash
# ABE System Startup Script
# Automated Business Environment for CTAS-7

set -e

echo "🏢 Starting ABE (Automated Business Environment)"
echo "=============================================="

# Check if we're in the right directory
if [ ! -d "/Users/cp5337/Developer/ctas7-command-center" ]; then
    echo "❌ Please run from CTAS-7 command center directory"
    exit 1
fi

cd /Users/cp5337/Developer/ctas7-command-center

# 1. Extract and process CTAS Archive Manager
echo "📦 Step 1: Processing CTAS Archive Manager..."
if [ -f "/Users/cp5337/Desktop/Organization and archive/ctas_archive_manager.zip" ]; then
    echo "✅ Found ctas_archive_manager.zip"
    
    # Create ABE workspace
    mkdir -p /Users/cp5337/Developer/ABE-automated-business-environment
    mkdir -p /Users/cp5337/Developer/ABE-organized-systems
    
    echo "📁 Created ABE workspace directories"
else
    echo "⚠️  ctas_archive_manager.zip not found, skipping archive processing"
fi

# 2. Create organized file system structure
echo ""
echo "🗂️  Step 2: Creating organized file system..."

BASE_DIR="/Users/cp5337/Developer/ABE-organized-systems"

# Core system directories
DIRS=(
    "01-backend-canonical"
    "02-frontend-command-center"
    "03-intelligence-coordination"
    "04-space-laserlight-orbital"
    "05-agent-ecosystem"
    "06-voice-whisper-elevenlabs"
    "07-forge-workflows"
    "08-documentation-specs"
    "09-iac-infrastructure"
    "10-container-registry"
)

for dir in "${DIRS[@]}"; do
    mkdir -p "$BASE_DIR/$dir"
    echo "✅ Created: $dir"
done

# 3. Copy existing systems to organized structure
echo ""
echo "📋 Step 3: Organizing existing CTAS-7 systems..."

# Backend systems
if [ -f "docker-compose.canonical-backend.yml" ]; then
    cp docker-compose.canonical-backend.yml "$BASE_DIR/01-backend-canonical/"
    echo "✅ Moved: Canonical backend configuration"
fi

if [ -f "start-canonical-backend-docker.sh" ]; then
    cp start-canonical-backend-docker.sh "$BASE_DIR/01-backend-canonical/"
    echo "✅ Moved: Backend startup script"
fi

# Frontend systems
if [ -f "package.json" ]; then
    cp package.json "$BASE_DIR/02-frontend-command-center/"
    echo "✅ Moved: Frontend package configuration"
fi

# Container registry files
if [ -f "CONTAINER_REGISTRY_ARCHIVE_STRATEGY.md" ]; then
    cp CONTAINER_REGISTRY_ARCHIVE_STRATEGY.md "$BASE_DIR/10-container-registry/"
    echo "✅ Moved: Container registry strategy"
fi

# Documentation
cp *.md "$BASE_DIR/08-documentation-specs/" 2>/dev/null || echo "⚠️  No markdown files to copy"

# 4. Generate Infrastructure as Code
echo ""
echo "🏗️  Step 4: Generating Infrastructure as Code..."

# Create IAC structure
mkdir -p "$BASE_DIR/09-iac-infrastructure/terraform"
mkdir -p "$BASE_DIR/09-iac-infrastructure/docker"
mkdir -p "$BASE_DIR/09-iac-infrastructure/kubernetes"

# Generate main Terraform file
cat > "$BASE_DIR/09-iac-infrastructure/terraform/main.tf" << 'EOF'
# ABE-Generated CTAS-7 Infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# CTAS-7 Backend Services
resource "docker_container" "ctas7_backend" {
  name  = "abe-ctas7-backend"
  image = "localhost:5000/ctas7/backend-services:latest"
  
  ports {
    internal = 15170
    external = 15170
  }
  ports {
    internal = 15171
    external = 15171
  }
  ports {
    internal = 15172
    external = 15172
  }
  ports {
    internal = 15173
    external = 15173
  }
  ports {
    internal = 15174
    external = 15174
  }
}

# CTAS-7 Intelligence Coordination
resource "docker_container" "ctas7_intelligence" {
  name  = "abe-ctas7-intelligence"
  image = "localhost:5000/ctas7/intelligence-coordination:latest"
  
  ports {
    internal = 18200
    external = 18200
  }
  ports {
    internal = 18202
    external = 18202
  }
  ports {
    internal = 18204
    external = 18204
  }
  ports {
    internal = 18206
    external = 18206
  }
  
  depends_on = [docker_container.ctas7_backend]
}
EOF

echo "✅ Generated: Terraform infrastructure"

# Generate Docker Compose
cat > "$BASE_DIR/09-iac-infrastructure/docker/docker-compose.abe.yml" << 'EOF'
version: '3.8'

services:
  abe-backend:
    image: localhost:5000/ctas7/backend-services:latest
    container_name: abe-ctas7-backend
    ports:
      - "15170-15174:15170-15174"
    environment:
      - ABE_MANAGED=true
      - DEPLOYMENT_MODE=abe_automated
    restart: unless-stopped
    labels:
      - "abe.system=backend"
      - "abe.priority=critical"

  abe-intelligence:
    image: localhost:5000/ctas7/intelligence-coordination:latest
    container_name: abe-ctas7-intelligence
    ports:
      - "18200-18207:18200-18207"
    environment:
      - ABE_MANAGED=true
      - INTELLIGENCE_MODE=automated
    depends_on:
      - abe-backend
    labels:
      - "abe.system=intelligence"
      - "abe.priority=high"

networks:
  abe-network:
    driver: bridge
    labels:
      - "abe.network=main"
EOF

echo "✅ Generated: Docker Compose configuration"

# 5. Create ABE control scripts
echo ""
echo "🎛️  Step 5: Creating ABE control scripts..."

# Create ABE status script
cat > "$BASE_DIR/abe-status.sh" << 'EOF'
#!/bin/bash
echo "🏢 ABE (Automated Business Environment) Status"
echo "============================================="

echo "📁 Organized Systems:"
ls -la /Users/cp5337/Developer/ABE-organized-systems/

echo ""
echo "🐳 Container Status:"
docker ps --filter "label=abe.system" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Service Health Checks:"
services=(
    "15170:Backend"
    "18200:Intelligence"
    "15180:Agents"
    "16000:Space Systems"
)

for service in "${services[@]}"; do
    port=$(echo $service | cut -d: -f1)
    name=$(echo $service | cut -d: -f2)
    
    if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "✅ $name (Port $port) - HEALTHY"
    else
        echo "⚠️  $name (Port $port) - NOT RESPONDING"
    fi
done
EOF

chmod +x "$BASE_DIR/abe-status.sh"
echo "✅ Created: ABE status script"

# Create ABE deploy script
cat > "$BASE_DIR/abe-deploy.sh" << 'EOF'
#!/bin/bash
echo "🚀 ABE Deployment Starting..."

cd /Users/cp5337/Developer/ABE-organized-systems/09-iac-infrastructure/docker

echo "🐳 Starting ABE-managed containers..."
docker-compose -f docker-compose.abe.yml up -d

echo "⏳ Waiting for services to initialize..."
sleep 15

echo "🔍 Checking service health..."
./../../abe-status.sh
EOF

chmod +x "$BASE_DIR/abe-deploy.sh"
echo "✅ Created: ABE deployment script"

# 6. Final summary
echo ""
echo "🎯 ABE Environment Setup Complete!"
echo "================================="
echo ""
echo "📍 ABE Base Directory: $BASE_DIR"
echo "📋 Systems Organized: ${#DIRS[@]} categories"
echo "🏗️  Infrastructure: Terraform + Docker generated"
echo "🎛️  Control Scripts: abe-status.sh, abe-deploy.sh"
echo ""
echo "🚀 Next Steps:"
echo "   1. cd $BASE_DIR"
echo "   2. ./abe-deploy.sh (start ABE environment)"
echo "   3. ./abe-status.sh (check system status)"
echo ""
echo "🗣️  Voice Commands:"
echo "   - 'ABE status' - Check system health"
echo "   - 'ABE deploy' - Deploy environment"
echo "   - 'ABE organize' - Re-organize systems"
