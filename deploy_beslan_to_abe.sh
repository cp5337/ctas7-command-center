#!/bin/bash
# Deploy Beslan OSINT Extraction to ABE (Google Cloud AI Studio)
# This will run on ABE's GPU with all dependencies pre-installed

set -e

echo "🚀 Deploying Beslan OSINT Extraction to ABE..."
echo "================================================"

# ABE Project ID
ABE_PROJECT="ctas7-ai-studio-project-one"
ABE_BUCKET="gs://abe-drop-zone"
ABE_REGION="us-central1"

# Upload the script to ABE drop zone
echo ""
echo "[1/4] Uploading script to ABE drop zone..."
gsutil cp beslan_osint_extraction.py ${ABE_BUCKET}/osint/beslan_osint_extraction.py

# Create requirements file for ABE
cat > beslan_requirements.txt << 'EOF'
beautifulsoup4==4.12.3
requests==2.31.0
nltk==3.8.1
lxml==5.1.0
EOF

echo "[2/4] Uploading requirements..."
gsutil cp beslan_requirements.txt ${ABE_BUCKET}/osint/requirements.txt

# Create ABE execution script
cat > run_beslan_on_abe.py << 'EOF'
#!/usr/bin/env python3
"""
ABE Execution Wrapper for Beslan OSINT Collection
Runs on Google Cloud AI Studio with GPU acceleration
"""

import subprocess
import sys
import os
from datetime import datetime

def setup_environment():
    """Install dependencies on ABE"""
    print("📦 Installing dependencies on ABE...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", 
                   "beautifulsoup4", "requests", "nltk", "lxml"])
    
    # Download NLTK data
    import nltk
    print("📚 Downloading NLTK data...")
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('averaged_perceptron_tagger_eng', quiet=True)
    nltk.download('maxent_ne_chunker', quiet=True)
    nltk.download('words', quiet=True)
    print("✓ Environment ready")

def run_collection():
    """Execute the Beslan OSINT collection"""
    print("\n" + "="*60)
    print("🔍 BESLAN OSINT COLLECTION - ABE EXECUTION")
    print("="*60)
    print(f"Start Time: {datetime.now().isoformat()}")
    print(f"Platform: Google Cloud AI Studio")
    print(f"GPU: Available" if os.getenv('CUDA_VISIBLE_DEVICES') else "CPU Only")
    print("="*60 + "\n")
    
    # Download the script from bucket
    subprocess.run(["gsutil", "cp", 
                   "gs://abe-drop-zone/osint/beslan_osint_extraction.py", 
                   "./beslan_osint_extraction.py"])
    
    # Run the collection
    result = subprocess.run([sys.executable, "beslan_osint_extraction.py"], 
                          capture_output=True, text=True)
    
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr, file=sys.stderr)
    
    # Upload results back to bucket
    print("\n📤 Uploading results to ABE drop zone...")
    subprocess.run(["gsutil", "cp", "beslan_osint_results.json", 
                   "gs://abe-drop-zone/osint/results/beslan_osint_results.json"])
    
    print(f"\n✅ Collection complete: {datetime.now().isoformat()}")
    print(f"📊 Results: gs://abe-drop-zone/osint/results/beslan_osint_results.json")
    
    return result.returncode

if __name__ == "__main__":
    setup_environment()
    exit_code = run_collection()
    sys.exit(exit_code)
EOF

echo "[3/4] Uploading ABE execution wrapper..."
gsutil cp run_beslan_on_abe.py ${ABE_BUCKET}/osint/run_beslan_on_abe.py

# Submit to Vertex AI for execution
echo ""
echo "[4/4] Submitting to Vertex AI for execution..."
echo ""
echo "⚡ Executing on ABE with GPU acceleration..."

gcloud ai custom-jobs create \
  --region=${ABE_REGION} \
  --display-name="beslan-osint-collection-$(date +%Y%m%d-%H%M%S)" \
  --python-package-uris=${ABE_BUCKET}/osint/run_beslan_on_abe.py \
  --worker-pool-spec=machine-type=n1-standard-4,replica-count=1,python-version=3.10 \
  --project=${ABE_PROJECT}

echo ""
echo "================================================"
echo "✅ Beslan OSINT Collection submitted to ABE"
echo ""
echo "📍 Monitor progress:"
echo "   gcloud ai custom-jobs list --region=${ABE_REGION} --project=${ABE_PROJECT}"
echo ""
echo "📥 Download results when complete:"
echo "   gsutil cp ${ABE_BUCKET}/osint/results/beslan_osint_results.json ."
echo ""
echo "💰 Cost estimate: ~$0.10 for 5-10 minute run"
echo "================================================"

