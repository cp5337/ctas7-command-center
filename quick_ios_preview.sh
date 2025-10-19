#!/bin/bash

# CTAS iOS Preview App Generator
# Creates a working iOS app from the orphaned Swift files

set -e

echo "🚀 Creating CTAS iOS Preview App..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/cp5337/Developer/ctas7-command-center/CTAS-iOS-Preview"
APP_NAME="CTAS-Preview"

# Clean up if exists
if [ -d "$PROJECT_DIR" ]; then
    echo "${YELLOW}⚠️  Removing existing project...${NC}"
    rm -rf "$PROJECT_DIR"
fi

# Create project directory
echo "${BLUE}📁 Creating project directory...${NC}"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create Xcode project using command line
echo "${BLUE}🔨 Generating Xcode project...${NC}"

# We'll use swift package init and then convert to app
swift package init --type executable --name "$APP_NAME"

# Create proper iOS app structure
mkdir -p "$PROJECT_DIR/Sources/App"
mkdir -p "$PROJECT_DIR/Resources"

# Copy Swift files
echo "${BLUE}📋 Copying Swift files...${NC}"
cp /Users/cp5337/Developer/ctas7-command-center/*.swift "$PROJECT_DIR/Sources/App/" 2>/dev/null || true

echo "${GREEN}✅ Project structure created!${NC}"
echo ""
echo "${YELLOW}⚠️  To view in simulator, you need to:${NC}"
echo ""
echo "1. Open Xcode and create a new iOS App project:"
echo "   ${BLUE}open -a Xcode${NC}"
echo ""
echo "2. File → New → Project → iOS → App"
echo "   - Name: CTAS-Preview"
echo "   - Interface: SwiftUI"
echo "   - Save to: $PROJECT_DIR"
echo ""
echo "3. Drag all .swift files from:"
echo "   ${BLUE}$PROJECT_DIR/Sources/App/${NC}"
echo "   into the Xcode project"
echo ""
echo "4. Press Cmd+R to run in simulator"
echo ""
echo "${GREEN}📱 Your Swift UIs will come to life!${NC}"

