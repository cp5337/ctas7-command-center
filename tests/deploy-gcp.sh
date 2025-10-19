#!/bin/bash
# Deploy HFT Test Harness to Google Cloud Platform

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"ctas7-hft-testing"}
REGION="us-central1"

echo "🚀 Deploying HFT Test Harness to Google Cloud"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📦 Enabling required APIs..."
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage.googleapis.com

# Create Pub/Sub topic
echo "📨 Creating Pub/Sub topic..."
gcloud pubsub topics create hft-test-jobs || echo "Topic already exists"

# Create Firestore database (if not exists)
echo "🗄️  Setting up Firestore..."
gcloud firestore databases create --location=$REGION || echo "Firestore already exists"

# Create BigQuery dataset
echo "📊 Creating BigQuery dataset..."
bq mk --dataset --location=$REGION $PROJECT_ID:hft_analytics || echo "Dataset already exists"

# Create BigQuery table
echo "📊 Creating BigQuery table..."
bq mk --table \
    $PROJECT_ID:hft_analytics.test_results \
    test_id:STRING,test_type:STRING,timestamp:TIMESTAMP,duration_ms:FLOAT,success:BOOLEAN,result_data:STRING,error:STRING,worker_id:STRING \
    || echo "Table already exists"

# Create Cloud Storage bucket
echo "🪣 Creating Cloud Storage bucket..."
gsutil mb -l $REGION gs://$PROJECT_ID-hft-test-data || echo "Bucket already exists"

# Deploy Cloud Function
echo "☁️  Deploying Cloud Function..."
cd cloudfunctions
gcloud functions deploy hft-test-runner \
    --gen2 \
    --runtime=python311 \
    --region=$REGION \
    --source=. \
    --entry-point=run_test \
    --trigger-topic=hft-test-jobs \
    --memory=512MB \
    --timeout=300s \
    --max-instances=1000 \
    --min-instances=0

cd ..

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Set up authentication: gcloud auth application-default login"
echo "   2. Export project ID: export GCP_PROJECT_ID=$PROJECT_ID"
echo "   3. Run tests: python paygo-test-harness.py --suite full --iterations 10000 --parallel 100"
echo ""
echo "💰 Cost estimate for 10,000 iterations with 100 workers: ~\$0.50"
echo ""

