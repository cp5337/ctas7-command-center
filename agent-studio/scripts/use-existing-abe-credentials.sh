#!/bin/bash
# Use Existing ABE Service Account
# Locates and configures existing Google Cloud credentials

set -e

echo "🔍 ================================================"
echo "   LOCATE EXISTING ABE SERVICE ACCOUNT"
echo "================================================"
echo ""

echo "Let's find your existing ABE service account credentials!"
echo ""

# Step 1: Ask user for credentials location
echo "📋 WHERE ARE YOUR ABE CREDENTIALS?"
echo ""
echo "Common locations:"
echo "  1. ~/gcp-credentials.json"
echo "  2. ~/abe-service-account.json"
echo "  3. ~/.config/gcloud/application_default_credentials.json"
echo "  4. /Users/cp5337/Developer/ctas-7-shipyard-staging/cognetix-abe/*.json"
echo "  5. Custom location"
echo ""

read -p "Enter the full path to your service account JSON: " CREDS_PATH

# Validate file exists
if [ ! -f "$CREDS_PATH" ]; then
    echo "❌ File not found: $CREDS_PATH"
    echo ""
    echo "🔍 Let me search for JSON files..."
    find ~ -name "*service*.json" -o -name "*abe*.json" -o -name "*gcp*.json" 2>/dev/null | grep -v node_modules | head -10
    echo ""
    exit 1
fi

echo "✅ Found credentials: $CREDS_PATH"
echo ""

# Step 2: Validate it's a service account
echo "🔍 VALIDATING SERVICE ACCOUNT..."
echo ""

if grep -q "service_account" "$CREDS_PATH" && grep -q "private_key" "$CREDS_PATH"; then
    echo "✅ Valid service account JSON"

    # Extract info
    if command -v jq &> /dev/null; then
        CLIENT_EMAIL=$(jq -r '.client_email' "$CREDS_PATH")
        PROJECT_ID=$(jq -r '.project_id' "$CREDS_PATH")
        echo ""
        echo "📧 Service Account: $CLIENT_EMAIL"
        echo "📁 Project ID: $PROJECT_ID"
    fi
else
    echo "⚠️  This doesn't look like a service account JSON"
    echo "   Make sure it has 'type': 'service_account'"
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        exit 1
    fi
fi

echo ""

# Step 3: Copy to agent studio
echo "📦 CONFIGURING AGENT STUDIO..."
echo ""

AGENT_STUDIO_CONFIG="/Users/cp5337/Developer/ctas7-command-center/agent-studio/config"
mkdir -p "$AGENT_STUDIO_CONFIG"

cp "$CREDS_PATH" "$AGENT_STUDIO_CONFIG/gcp-credentials.json"
echo "✅ Copied to: $AGENT_STUDIO_CONFIG/gcp-credentials.json"

# Step 4: Update .env
echo ""
echo "📝 UPDATING .ENV FILE..."
echo ""

ENV_FILE="$AGENT_STUDIO_CONFIG/.env"

# Add or update GOOGLE_APPLICATION_CREDENTIALS
if [ -f "$ENV_FILE" ]; then
    if grep -q "GOOGLE_APPLICATION_CREDENTIALS" "$ENV_FILE"; then
        # Update existing line
        sed -i.bak "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=$AGENT_STUDIO_CONFIG/gcp-credentials.json|" "$ENV_FILE"
        echo "✅ Updated GOOGLE_APPLICATION_CREDENTIALS in .env"
    else
        # Add new line
        echo "" >> "$ENV_FILE"
        echo "# Google Cloud / ABE" >> "$ENV_FILE"
        echo "GOOGLE_APPLICATION_CREDENTIALS=$AGENT_STUDIO_CONFIG/gcp-credentials.json" >> "$ENV_FILE"
        echo "✅ Added GOOGLE_APPLICATION_CREDENTIALS to .env"
    fi
else
    echo "❌ .env file not found at: $ENV_FILE"
    exit 1
fi

# Step 5: Ask for Google Drive folder ID (if ABE already set up)
echo ""
echo "📁 GOOGLE DRIVE FOLDER ID"
echo ""
echo "If you already have a CTAS-7 Knowledge Base folder in Google Drive,"
echo "enter the folder ID (from the URL)."
echo ""
echo "Example URL: https://drive.google.com/drive/folders/1abc123xyz"
echo "Folder ID:   1abc123xyz"
echo ""
read -p "Enter folder ID (or press Enter to create new): " FOLDER_ID

if [ -n "$FOLDER_ID" ]; then
    # Add folder ID to .env
    if grep -q "GOOGLE_DRIVE_FOLDER_ID" "$ENV_FILE"; then
        sed -i.bak "s|GOOGLE_DRIVE_FOLDER_ID=.*|GOOGLE_DRIVE_FOLDER_ID=$FOLDER_ID|" "$ENV_FILE"
        echo "✅ Updated GOOGLE_DRIVE_FOLDER_ID in .env"
    else
        echo "GOOGLE_DRIVE_FOLDER_ID=$FOLDER_ID" >> "$ENV_FILE"
        echo "✅ Added GOOGLE_DRIVE_FOLDER_ID to .env"
    fi
else
    echo "ℹ️  No folder ID provided - will create new structure during deployment"
fi

echo ""
echo "================================================"
echo "✅ ABE SERVICE ACCOUNT CONFIGURED!"
echo "================================================"
echo ""
echo "📁 Credentials: $AGENT_STUDIO_CONFIG/gcp-credentials.json"
echo "📝 Configuration: $ENV_FILE"
echo ""

if [ -n "$FOLDER_ID" ]; then
    echo "🗂️  Google Drive Folder: $FOLDER_ID"
    echo ""
    echo "✅ Ready to deploy!"
else
    echo "📋 Next: Run deployment to create Google Drive structure"
    echo ""
    echo "🚀 Run: ~/Desktop/DEPLOY_CTAS_COMPLETE.sh"
fi

echo ""
echo "💡 TIP: Make sure the service account has access to your Google Drive folder!"
echo "   Share the folder with: $(jq -r '.client_email' "$CREDS_PATH" 2>/dev/null || echo 'your service account email')"
echo ""
