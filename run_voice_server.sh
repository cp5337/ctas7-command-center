#!/bin/bash
# CTAS-7 Voice Server Launcher
# Auto-loads environment variables

cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "🎤 Starting CTAS-7 Voice Server..."
echo "📡 ElevenLabs API Key: ${ELEVENLABS_API_KEY:0:10}...${ELEVENLABS_API_KEY: -4}"
echo "🚀 Launching WebSocket server on ws://localhost:15180"

# Run the voice server
cargo run --release --bin voice_system_check



