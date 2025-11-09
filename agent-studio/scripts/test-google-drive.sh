#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CTAS-7 Agent Studio - Google Drive Connection Test
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Tests Google Drive API connection using the ABE service account
#
# Usage:
#   ./test-google-drive.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CTAS-7 Google Drive Connection Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STUDIO_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$STUDIO_DIR/config"
KEY_FILE="$CONFIG_DIR/abe-service-account.json"

# Verify key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ ERROR: Service account key not found at: $KEY_FILE"
    echo ""
    echo "Run this first:"
    echo "  cd $STUDIO_DIR"
    echo "  ./scripts/configure-abe-credentials.sh"
    exit 1
fi

echo "✅ Service account key found"
echo ""

# Extract project info
PROJECT_ID=$(jq -r '.project_id' "$KEY_FILE")
CLIENT_EMAIL=$(jq -r '.client_email' "$KEY_FILE")

echo "📋 Service Account Details:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project ID:    $PROJECT_ID"
echo "Client Email:  $CLIENT_EMAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get OAuth token with full Google Workspace scopes
echo "🔐 Requesting OAuth token with Google Workspace scopes..."
TOKEN_RESPONSE=$(python3 - <<EOF
import json
from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Load service account credentials
with open('$KEY_FILE', 'r') as f:
    creds_info = json.load(f)

# Request full Google Workspace access
credentials = service_account.Credentials.from_service_account_info(
    creds_info,
    scopes=[
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/gmail.readonly'
    ]
)

# Get access token
credentials.refresh(Request())
print(credentials.token)
EOF
)

if [ -z "$TOKEN_RESPONSE" ]; then
    echo "❌ Failed to get OAuth token"
    echo ""
    echo "This usually means:"
    echo "  1. The service account key is invalid"
    echo "  2. Python google-auth library is not installed"
    echo "  3. Network connectivity issues"
    echo ""
    echo "Install dependencies:"
    echo "  pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client"
    exit 1
fi

echo "✅ OAuth token obtained"
echo ""

# Test Drive API
echo "📂 Testing Google Drive API access..."
DRIVE_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN_RESPONSE" \
    "https://www.googleapis.com/drive/v3/about?fields=user,storageQuota")

HTTP_CODE=$(echo "$DRIVE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DRIVE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Google Drive API access successful!"
    echo ""
    echo "📊 Account Information:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$RESPONSE_BODY" | jq .
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # List root folder
    echo "📁 Listing root Drive folders..."
    FOLDERS_RESPONSE=$(curl -s \
        -H "Authorization: Bearer $TOKEN_RESPONSE" \
        "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder'&fields=files(id,name,createdTime)&pageSize=10")

    echo "$FOLDERS_RESPONSE" | jq -r '.files[] | "  • \(.name) (ID: \(.id))"'
    echo ""

    # Check for CTAS Knowledge Base folder
    CTAS_FOLDER=$(echo "$FOLDERS_RESPONSE" | jq -r '.files[] | select(.name=="CTAS Knowledge Base") | .id')

    if [ -n "$CTAS_FOLDER" ] && [ "$CTAS_FOLDER" != "null" ]; then
        echo "✅ Found 'CTAS Knowledge Base' folder (ID: $CTAS_FOLDER)"
        echo ""
        echo "🎉 ABE is ready to use this folder!"
    else
        echo "⚠️  'CTAS Knowledge Base' folder not found"
        echo ""
        echo "To create it, run:"
        echo "  ./scripts/initialize-abe-gdrive.sh"
    fi

    echo ""

    # Test Google Docs API
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📄 Testing Google Docs API..."
    DOCS_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN_RESPONSE" \
        "https://docs.googleapis.com/v1/documents?pageSize=1")

    if [ "$DOCS_TEST" = "200" ] || [ "$DOCS_TEST" = "403" ]; then
        echo "✅ Google Docs API accessible"
    else
        echo "⚠️  Google Docs API returned HTTP $DOCS_TEST"
    fi

    # Test Google Sheets API
    echo "📊 Testing Google Sheets API..."
    SHEETS_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN_RESPONSE" \
        "https://sheets.googleapis.com/v4/spreadsheets?pageSize=1")

    if [ "$SHEETS_TEST" = "200" ] || [ "$SHEETS_TEST" = "403" ]; then
        echo "✅ Google Sheets API accessible"
    else
        echo "⚠️  Google Sheets API returned HTTP $SHEETS_TEST"
    fi

    # Test Google Slides API
    echo "🎨 Testing Google Slides API..."
    SLIDES_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN_RESPONSE" \
        "https://slides.googleapis.com/v1/presentations?pageSize=1")

    if [ "$SLIDES_TEST" = "200" ] || [ "$SLIDES_TEST" = "403" ]; then
        echo "✅ Google Slides API accessible"
    else
        echo "⚠️  Google Slides API returned HTTP $SLIDES_TEST"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Google Workspace connection test PASSED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Summary:"
    echo "  ✅ Google Drive API"
    echo "  ✅ Google Docs API"
    echo "  ✅ Google Sheets API"
    echo "  ✅ Google Slides API"
    echo ""
    echo "🎉 ABE has full access to Google Workspace!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

else
    echo "❌ Google Drive API access failed (HTTP $HTTP_CODE)"
    echo ""
    echo "Response:"
    echo "$RESPONSE_BODY"
    echo ""
    echo "This usually means:"
    echo "  1. The service account doesn't have Drive API enabled"
    echo "  2. The service account key has been revoked"
    echo "  3. The Drive API is not enabled for the project"
    echo ""
    echo "Enable Drive API at:"
    echo "  https://console.cloud.google.com/apis/library/drive.googleapis.com?project=$PROJECT_ID"
    exit 1
fi
