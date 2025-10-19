#!/bin/bash
# CTAS-7 Leptos Knowledge Engine Launcher

cd "$(dirname "$0")"/../ctas-7-shipyard-staging/ctas7-candidate-crates-staging/ctas7-leptose-knowledge-engine

echo "🦀 Starting Leptos Knowledge Engine..."
echo "📚 Documentation Site: http://localhost:8080"
echo "🔍 Knowledge Graph API: http://localhost:8080/api"
echo ""

# Run the knowledge engine
cargo run --release --bin leptose-knowledge-engine



