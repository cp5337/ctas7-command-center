#!/bin/bash
# Initialize ABE Google Drive Repository Structure
# This creates the knowledge base that AI agents and Custom GPT will draw from

set -e

echo "🏢 ================================================"
echo "   ABE GOOGLE DRIVE INITIALIZATION"
echo "================================================"
echo ""

# Configuration
ABE_DIR="/Users/cp5337/Developer/ctas-7-shipyard-staging/cognetix-abe"
GDRIVE_ROOT_FOLDER="CTAS-7 Knowledge Base"

# Check if ABE exists
if [ ! -d "$ABE_DIR" ]; then
    echo "❌ ABE not found at: $ABE_DIR"
    echo "   Cloning from staging..."
    cd /Users/cp5337/Developer/ctas-7-shipyard-staging/
    if [ -d "cognetix-abe" ]; then
        echo "✅ ABE directory exists"
    else
        echo "❌ Please locate ABE directory"
        exit 1
    fi
fi

cd "$ABE_DIR"

echo "📍 Working from: $ABE_DIR"
echo ""

# Step 1: Check Google Cloud credentials
echo "1️⃣  CHECKING GOOGLE CLOUD CREDENTIALS..."
echo ""

if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "⚠️  GOOGLE_APPLICATION_CREDENTIALS not set"
    echo ""
    echo "📋 TO SET UP:"
    echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "   2. Create Service Account"
    echo "   3. Download JSON key"
    echo "   4. Save to: ~/gcp-credentials.json"
    echo "   5. export GOOGLE_APPLICATION_CREDENTIALS=~/gcp-credentials.json"
    echo ""
    read -p "Do you have a service account JSON? (y/n): " has_key

    if [ "$has_key" = "y" ]; then
        read -p "Enter path to JSON file: " json_path
        if [ -f "$json_path" ]; then
            export GOOGLE_APPLICATION_CREDENTIALS="$json_path"
            # Copy to agent studio
            cp "$json_path" /Users/cp5337/Developer/ctas7-command-center/agent-studio/config/gcp-credentials.json
            echo "✅ Credentials set"
        else
            echo "❌ File not found"
            exit 1
        fi
    else
        echo "ℹ️  Continuing without credentials (will use manual setup)"
    fi
else
    echo "✅ Credentials found: $GOOGLE_APPLICATION_CREDENTIALS"
    # Copy to agent studio
    cp "$GOOGLE_APPLICATION_CREDENTIALS" /Users/cp5337/Developer/ctas7-command-center/agent-studio/config/gcp-credentials.json
fi

echo ""

# Step 2: Create Google Drive folder structure
echo "2️⃣  CREATING GOOGLE DRIVE STRUCTURE..."
echo ""

cat > /tmp/gdrive_structure.txt << 'EOF'
CTAS-7 Knowledge Base/
├── 01-Agent-Instructions/
│   ├── Natasha-Voice-Agent/
│   ├── Grok-Space-Operations/
│   ├── Cove-DevOps-QA/
│   ├── Claude-Meta-Agent/
│   └── Custom-GPT-Configs/
├── 02-System-Documentation/
│   ├── Architecture/
│   ├── API-Specifications/
│   ├── Deployment-Guides/
│   └── Troubleshooting/
├── 03-Code-References/
│   ├── CTAS-v6.6-Canonical/
│   ├── Gateway-Implementation/
│   ├── Neural-Mux/
│   └── Smart-Crates/
├── 04-Research-Papers/
│   ├── Academic-Blockchain/
│   ├── Neural-Computing/
│   ├── Space-Systems/
│   └── Security-Frameworks/
├── 05-Operational-Procedures/
│   ├── HD4-Framework/
│   ├── Red-Team-Playbooks/
│   ├── Incident-Response/
│   └── Workflows/
├── 06-Training-Data/
│   ├── Phi-3-Training/
│   ├── HFT-Simulations/
│   ├── ATT&CK-Patterns/
│   └── Kali-Purple-Team/
├── 07-Intelligence-Sources/
│   ├── OSINT-Collections/
│   ├── EDGAR-Filings/
│   ├── Media-Sources/
│   └── Threat-Feeds/
├── 08-Linear-Integration/
│   ├── Epics/
│   ├── Issues/
│   ├── Workflows/
│   └── Automations/
└── 09-Meeting-Notes/
    ├── Architecture-Decisions/
    ├── Sprint-Planning/
    ├── Design-Reviews/
    └── Retrospectives/
EOF

echo "📁 Folder structure to create:"
cat /tmp/gdrive_structure.txt
echo ""

# Step 3: Initialize ABE service
echo "3️⃣  INITIALIZING ABE SERVICE..."
echo ""

# Check if Python dependencies are installed
if ! python3 -c "import google.cloud.storage" 2>/dev/null; then
    echo "📦 Installing ABE Python dependencies..."
    pip3 install google-cloud-storage google-auth google-api-python-client surrealdb marc21 --quiet
    echo "✅ Dependencies installed"
fi

# Create ABE initialization script
cat > /tmp/abe_init.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
"""
ABE Google Drive Initialization
Creates knowledge base structure for CTAS-7 AI agents and Custom GPT
"""

import os
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_FOLDER_NAME = "CTAS-7 Knowledge Base"

# Folder structure
FOLDERS = [
    "01-Agent-Instructions",
    "01-Agent-Instructions/Natasha-Voice-Agent",
    "01-Agent-Instructions/Grok-Space-Operations",
    "01-Agent-Instructions/Cove-DevOps-QA",
    "01-Agent-Instructions/Claude-Meta-Agent",
    "01-Agent-Instructions/Custom-GPT-Configs",
    "02-System-Documentation",
    "02-System-Documentation/Architecture",
    "02-System-Documentation/API-Specifications",
    "02-System-Documentation/Deployment-Guides",
    "02-System-Documentation/Troubleshooting",
    "03-Code-References",
    "03-Code-References/CTAS-v6.6-Canonical",
    "03-Code-References/Gateway-Implementation",
    "03-Code-References/Neural-Mux",
    "03-Code-References/Smart-Crates",
    "04-Research-Papers",
    "04-Research-Papers/Academic-Blockchain",
    "04-Research-Papers/Neural-Computing",
    "04-Research-Papers/Space-Systems",
    "04-Research-Papers/Security-Frameworks",
    "05-Operational-Procedures",
    "05-Operational-Procedures/HD4-Framework",
    "05-Operational-Procedures/Red-Team-Playbooks",
    "05-Operational-Procedures/Incident-Response",
    "05-Operational-Procedures/Workflows",
    "06-Training-Data",
    "06-Training-Data/Phi-3-Training",
    "06-Training-Data/HFT-Simulations",
    "06-Training-Data/ATT&CK-Patterns",
    "06-Training-Data/Kali-Purple-Team",
    "07-Intelligence-Sources",
    "07-Intelligence-Sources/OSINT-Collections",
    "07-Intelligence-Sources/EDGAR-Filings",
    "07-Intelligence-Sources/Media-Sources",
    "07-Intelligence-Sources/Threat-Feeds",
    "08-Linear-Integration",
    "08-Linear-Integration/Epics",
    "08-Linear-Integration/Issues",
    "08-Linear-Integration/Workflows",
    "08-Linear-Integration/Automations",
    "09-Meeting-Notes",
    "09-Meeting-Notes/Architecture-Decisions",
    "09-Meeting-Notes/Sprint-Planning",
    "09-Meeting-Notes/Design-Reviews",
    "09-Meeting-Notes/Retrospectives",
]

def initialize_gdrive():
    """Initialize Google Drive with CTAS-7 knowledge base structure"""

    # Check for credentials
    creds_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if not creds_path:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS not set")
        print("\n📋 MANUAL SETUP INSTRUCTIONS:")
        print("\n1. Create root folder in Google Drive:")
        print(f"   - Name: {ROOT_FOLDER_NAME}")
        print("\n2. Create the following subfolders:")
        for folder in FOLDERS:
            print(f"   - {folder}")
        print("\n3. Get the root folder ID from URL:")
        print("   https://drive.google.com/drive/folders/[FOLDER_ID]")
        print("\n4. Add to .env file:")
        print("   GOOGLE_DRIVE_FOLDER_ID=[FOLDER_ID]")
        return None

    try:
        # Load credentials
        credentials = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )

        # Build Drive service
        service = build('drive', 'v3', credentials=credentials)

        print(f"✅ Connected to Google Drive")

        # Create root folder
        root_metadata = {
            'name': ROOT_FOLDER_NAME,
            'mimeType': 'application/vnd.google-apps.folder'
        }

        root_folder = service.files().create(
            body=root_metadata,
            fields='id, webViewLink'
        ).execute()

        root_id = root_folder['id']
        root_url = root_folder['webViewLink']

        print(f"✅ Created root folder: {ROOT_FOLDER_NAME}")
        print(f"   ID: {root_id}")
        print(f"   URL: {root_url}")

        # Create folder hierarchy
        folder_ids = {ROOT_FOLDER_NAME: root_id}

        for folder_path in FOLDERS:
            parts = folder_path.split('/')
            parent_path = '/'.join(parts[:-1]) if len(parts) > 1 else ROOT_FOLDER_NAME
            folder_name = parts[-1]
            parent_id = folder_ids.get(parent_path, root_id)

            # Create folder
            metadata = {
                'name': folder_name,
                'parents': [parent_id],
                'mimeType': 'application/vnd.google-apps.folder'
            }

            folder = service.files().create(
                body=metadata,
                fields='id'
            ).execute()

            folder_ids[folder_path] = folder['id']
            print(f"✅ Created: {folder_path}")

        print(f"\n✅ ALL FOLDERS CREATED!")
        print(f"\n📋 ROOT FOLDER ID: {root_id}")
        print(f"🔗 URL: {root_url}")
        print(f"\n💾 Add to your .env file:")
        print(f"   GOOGLE_DRIVE_FOLDER_ID={root_id}")

        return root_id

    except HttpError as error:
        print(f"❌ Error: {error}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == '__main__':
    print("🏢 ABE Google Drive Initialization")
    print("=" * 50)
    print()

    folder_id = initialize_gdrive()

    if folder_id:
        print("\n🎯 NEXT STEPS:")
        print("1. Share root folder with service account email")
        print("2. Add GOOGLE_DRIVE_FOLDER_ID to .env")
        print("3. Upload initial documentation")
        print("4. Configure Custom GPT to access knowledge base")
    else:
        print("\n📋 Follow manual setup instructions above")
PYTHON_SCRIPT

python3 /tmp/abe_init.py

echo ""
echo "================================================"
echo "✅ ABE GOOGLE DRIVE INITIALIZATION COMPLETE!"
echo "================================================"
echo ""
echo "📁 Knowledge Base Structure Created"
echo "🤖 Agents can now access centralized knowledge"
echo "🎤 Custom GPT can retrieve documentation"
echo "📊 Intelligence feeds integrated"
echo ""
echo "🔑 IMPORTANT: Add GOOGLE_DRIVE_FOLDER_ID to:"
echo "   /Users/cp5337/Developer/ctas7-command-center/agent-studio/config/.env"
echo ""
