#!/bin/bash
# CTAS7 API Key Management Script
# Centralized control for all API keys and credentials

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRED_SERVER="$SCRIPT_DIR/mcp-servers/credentials-server.cjs"

echo "🔑 CTAS7 API Key Management System"
echo "=================================="

# Check if credential server exists
if [ ! -f "$CRED_SERVER" ]; then
    echo "❌ Credential server not found at: $CRED_SERVER"
    exit 1
fi

# Function to display help
show_help() {
    echo ""
    echo "📋 Available Commands:"
    echo "  ./manage-api-keys.sh status     - Show credential status"
    echo "  ./manage-api-keys.sh validate   - Validate all API keys"
    echo "  ./manage-api-keys.sh fix        - Fix credential issues automatically"
    echo "  ./manage-api-keys.sh backup     - Create manual backup"
    echo "  ./manage-api-keys.sh restore    - Restore from backup"
    echo "  ./manage-api-keys.sh test       - Test key functionality"
    echo ""
}

# Handle commands
case "${1:-status}" in
    "status")
        echo "📊 Getting credential status..."
        node "$CRED_SERVER" status | jq '.' 2>/dev/null || node "$CRED_SERVER" status
        ;;

    "validate")
        echo "🔍 Validating all credentials..."
        node "$CRED_SERVER" validate | jq '.' 2>/dev/null || node "$CRED_SERVER" validate
        ;;

    "fix")
        echo "🛠️  Fixing credential issues..."
        node "$CRED_SERVER" fix | jq '.' 2>/dev/null || node "$CRED_SERVER" fix
        echo ""
        echo "✅ Running validation after fixes..."
        node "$CRED_SERVER" validate | jq '.' 2>/dev/null || node "$CRED_SERVER" validate
        ;;

    "backup")
        echo "💾 Creating manual backup..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_DIR="$SCRIPT_DIR/.credentials-backup"
        mkdir -p "$BACKUP_DIR"

        if [ -f "$SCRIPT_DIR/.env" ]; then
            cp "$SCRIPT_DIR/.env" "$BACKUP_DIR/.env.manual.$TIMESTAMP"
            echo "✅ Backup created: .env.manual.$TIMESTAMP"
        else
            echo "❌ .env file not found"
            exit 1
        fi
        ;;

    "restore")
        echo "🔄 Available backups:"
        ls -la "$SCRIPT_DIR/.credentials-backup/" | grep ".env"
        echo ""
        echo "To restore a backup, copy it back to .env manually"
        echo "Example: cp .credentials-backup/.env.backup.2025-11-17 .env"
        ;;

    "test")
        echo "🧪 Testing key functionality..."
        echo ""

        # Test CrowdStrike intelligence
        echo "Testing CrowdStrike ABE integration..."
        cd "$SCRIPT_DIR/ctas7-intelligence-generator"
        python -c "
import os
print('✅ GOOGLE_AI_API_KEY:', 'SET' if os.getenv('GOOGLE_AI_API_KEY') else 'MISSING')
print('✅ ELEVENLABS_API_KEY:', 'SET' if os.getenv('ELEVENLABS_API_KEY') else 'MISSING')
print('✅ GCP Auth:', 'CONFIGURED' if os.path.exists('/Users/cp5337/.config/gcloud') else 'MISSING')
"

        # Test if GCP is authenticated
        if command -v gcloud &> /dev/null; then
            echo ""
            echo "GCP Authentication Status:"
            gcloud auth list 2>/dev/null | head -3
        fi
        ;;

    "help"|"-h"|"--help")
        show_help
        ;;

    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "💡 Pro Tip: Run './manage-api-keys.sh status' regularly to check your keys"
echo "🔗 MCP Server: mcp-servers/credentials-server.cjs"