#!/bin/bash
# Start ABE Pipeline with proper monitoring

cd "$(dirname "$0")"

echo "🚀 Starting ABE High-GPU Pipeline"
echo "=================================="

# Activate virtual environment
source venv/bin/activate

# Start pipeline in background
echo "📝 Launching interview generation..."
python3 abe_high_gpu_pipeline.py > abe_execution_live.log 2>&1 &
PIPELINE_PID=$!

echo "✅ Pipeline started (PID: $PIPELINE_PID)"
echo "📊 Starting monitor..."
sleep 2

# Start monitor in foreground
python3 abe_monitor.py

# When monitor exits, check if pipeline is still running
if ps -p $PIPELINE_PID > /dev/null; then
    echo ""
    echo "Pipeline is still running in background (PID: $PIPELINE_PID)"
    echo "To stop: kill $PIPELINE_PID"
    echo "To resume monitoring: python3 abe_monitor.py"
fi

