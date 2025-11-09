#!/bin/bash
###############################################################################
# CTAS 7.3 - Git Hooks Installer
# Purpose: Install pre-push hooks across all CTAS repositories
# Usage: ./install-hooks.sh
###############################################################################

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

HOOK_SOURCE="/Users/cp5337/Developer/ctas7-command-center/git-automation/pr-workflow-enforcer.sh"

REPOS=(
    "/Users/cp5337/Developer/ctas7-command-center"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enterprise-mcp-cyrus"
    "/Users/cp5337/Developer/ctas7-EEI-staging"
    "/Users/cp5337/Developer/ctas7-shipyard-system"
    "/Users/cp5337/Developer/ctas7-crate-analyzer-system"
    "/Users/cp5337/Developer/orbital-gis-platform"
    "/Users/cp5337/Developer/usim-system"
    "/Users/cp5337/Developer/agent_os-Claude"
)

echo "=========================================="
echo "CTAS Git Hooks Installer"
echo "=========================================="
echo ""

# Check if hook source exists
if [ ! -f "$HOOK_SOURCE" ]; then
    echo -e "${RED}❌ Hook source not found: $HOOK_SOURCE${NC}"
    exit 1
fi

# Make hook executable
chmod +x "$HOOK_SOURCE"
echo -e "${GREEN}✓${NC} Made hook executable: $HOOK_SOURCE"
echo ""

INSTALLED=0
SKIPPED=0
FAILED=0

for REPO in "${REPOS[@]}"; do
    REPO_NAME=$(basename "$REPO")
    
    if [ ! -d "$REPO" ]; then
        echo -e "${YELLOW}⚠️  Skipping $REPO_NAME (not found)${NC}"
        ((SKIPPED++))
        continue
    fi
    
    if [ ! -d "$REPO/.git" ]; then
        echo -e "${YELLOW}⚠️  Skipping $REPO_NAME (not a Git repository)${NC}"
        ((SKIPPED++))
        continue
    fi
    
    HOOK_DEST="$REPO/.git/hooks/pre-push"
    
    # Backup existing hook if present
    if [ -f "$HOOK_DEST" ] || [ -L "$HOOK_DEST" ]; then
        BACKUP_DEST="${HOOK_DEST}.backup.$(date +%Y%m%d-%H%M%S)"
        mv "$HOOK_DEST" "$BACKUP_DEST"
        echo -e "${YELLOW}⚠️  Backed up existing hook: $BACKUP_DEST${NC}"
    fi
    
    # Create symlink
    if ln -s "$HOOK_SOURCE" "$HOOK_DEST" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Installed hook: $REPO_NAME"
        ((INSTALLED++))
    else
        echo -e "${RED}❌ Failed to install hook: $REPO_NAME${NC}"
        ((FAILED++))
    fi
done

echo ""
echo "=========================================="
echo "Installation Summary"
echo "=========================================="
echo -e "${GREEN}✓  Installed: $INSTALLED${NC}"
echo -e "${YELLOW}⚠️  Skipped: $SKIPPED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ "$INSTALLED" -gt 0 ]; then
    echo "Pre-push hooks have been installed!"
    echo ""
    echo "What this means:"
    echo "  • Direct pushes to main/master are BLOCKED"
    echo "  • PR workflow is now enforced"
    echo "  • Commit messages are validated"
    echo "  • Sensitive data is checked"
    echo "  • PhD QA validation (when integrated)"
    echo ""
    echo "To bypass in emergency:"
    echo "  git push --no-verify"
    echo ""
fi

exit 0

