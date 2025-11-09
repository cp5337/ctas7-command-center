#!/bin/bash
#
# Make All CTAS7/Synaptix Repositories Private
# Security: Protect proprietary code and design systems
#

set -e

echo "🔒 MAKING ALL REPOSITORIES PRIVATE"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not installed"
    echo ""
    echo "Install with:"
    echo "  brew install gh"
    echo ""
    echo "Then authenticate:"
    echo "  gh auth login"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo ""
    echo "Authenticate with:"
    echo "  gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# List of all CTAS7/Synaptix repositories
REPOS=(
    "cp5337/ctas7-v0-design-system-framework-react-native"
    "cp5337/ctas7-command-center"
    "cp5337/ctas7-shipyard-staging"
    "cp5337/ctas7-shipyard-system"
    "cp5337/ctas7-terraform-gis"
    "cp5337/ctas7-EEI-staging"
    "cp5337/ctas7-cesium-mcp"
    "cp5337/ctas7-crate-analyzer-system"
    "cp5337/ctas7-crate-split-inventory"
    "cp5337/ctas7-intelligent-transpiler"
    "cp5337/ctas7-react-native-framework"
    "cp5337/orbital-gis-platform"
    "cp5337/usim-system"
    "cp5337/agent_os-Claude"
)

echo "📋 Repositories to make private:"
for repo in "${REPOS[@]}"; do
    echo "  ■ $repo"
done
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔒 Making repositories private..."
echo ""

SUCCESS=0
FAILED=0
ALREADY_PRIVATE=0

for repo in "${REPOS[@]}"; do
    echo -n "▸ $repo ... "
    
    # Check if repo exists and get visibility
    VISIBILITY=$(gh repo view "$repo" --json visibility -q .visibility 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$VISIBILITY" == "NOT_FOUND" ]; then
        echo "⚠️  NOT FOUND (may not exist or no access)"
        ((FAILED++))
        continue
    fi
    
    if [ "$VISIBILITY" == "PRIVATE" ]; then
        echo "✓ ALREADY PRIVATE"
        ((ALREADY_PRIVATE++))
        continue
    fi
    
    # Make it private
    if gh repo edit "$repo" --visibility private 2>/dev/null; then
        echo "✅ NOW PRIVATE"
        ((SUCCESS++))
    else
        echo "❌ FAILED"
        ((FAILED++))
    fi
    
    # Rate limiting
    sleep 1
done

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "SUMMARY:"
echo "  ✅ Made private: $SUCCESS"
echo "  ✓  Already private: $ALREADY_PRIVATE"
echo "  ❌ Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "⚠️  Some repositories failed. Check permissions and repository names."
    echo ""
fi

echo "🔒 Security Status: $(($SUCCESS + $ALREADY_PRIVATE)) / ${#REPOS[@]} repositories are private"
echo ""

