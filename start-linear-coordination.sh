#!/bin/bash
# Start CTAS7 Linear Coordination System
# Starts PM2 services for Linear integration and loads plans

set -e

echo "🚀 Starting CTAS7 Linear Coordination System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables so LINEAR_API_KEY comes from .env
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "$LINEAR_API_KEY" ]; then
  echo "❌ LINEAR_API_KEY not set. Add it to .env before running this script."
  exit 1
fi

# Navigate to command center
cd /Users/cp5337/Developer/ctas7-command-center

echo -e "${BLUE}📋 Step 1: Starting Linear PM2 Services...${NC}"

# Start only Linear-related services
pm2 start ecosystem.config.cjs --only linear-integration,linear-agent

echo -e "${GREEN}✅ Linear services started${NC}"

# Wait for services to initialize
echo -e "${YELLOW}⏳ Waiting 5 seconds for services to initialize...${NC}"
sleep 5

echo -e "${BLUE}📋 Step 2: Loading Plans into Linear...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules/@linear" ]; then
    echo -e "${YELLOW}📦 Installing @linear/sdk...${NC}"
    npm install @linear/sdk
fi

# Run plan loader
node ctas7-linear-plan-loader.js

echo -e "${GREEN}✅ Plans loaded into Linear!${NC}"

echo -e "${BLUE}📋 Step 3: PM2 Status Check...${NC}"
pm2 list

echo ""
echo -e "${GREEN}✅ CTAS7 Linear Coordination System Ready!${NC}"
echo ""
echo "📡 Services Running:"
echo "  - linear-integration (Port 15182)"
echo "  - linear-agent (Port 18180)"
echo ""
echo "🔗 Linear Team: CognetixALPHA (COG)"
echo "🤖 Agents ready for post-discovery coordination"
echo ""
echo "Next steps:"
echo "  1. Run discovery scripts"
echo "  2. Agents coordinate via Linear"
echo "  3. Deploy containers via PM2"
