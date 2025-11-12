#!/usr/bin/env python3
"""
ABE Pipeline Progress Monitor
Real-time monitoring of interview generation with progress bars and status updates
"""

import os
import sys
import time
import json
from pathlib import Path
from datetime import datetime

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def format_time(seconds):
    """Format seconds into human-readable time"""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        return f"{seconds/60:.1f}m"
    else:
        return f"{seconds/3600:.1f}h"

def progress_bar(current, total, width=50):
    """Generate a progress bar"""
    if total == 0:
        return "[" + "=" * width + "]"
    
    filled = int(width * current / total)
    bar = "=" * filled + ">" + " " * (width - filled - 1)
    percent = 100 * current / total
    return f"[{bar}] {percent:.1f}% ({current}/{total})"

def monitor_pipeline():
    """Monitor the ABE pipeline execution"""
    
    output_dir = Path("generated_interviews")
    nodes_dir = output_dir / "nodes"
    crates_dir = output_dir / "crates"
    kml_dir = Path("kml_infrastructure")
    
    # Expected totals
    TOTAL_NODES = 165
    TOTAL_CRATES = 20  # Adjusted to match actual crate list
    
    start_time = time.time()
    last_node_count = 0
    last_crate_count = 0
    
    print("🚀 ABE PIPELINE MONITOR")
    print("=" * 80)
    print("Press Ctrl+C to exit\n")
    
    try:
        while True:
            clear_screen()
            
            # Header
            print("🚀 ABE HIGH-GPU PIPELINE MONITOR")
            print("=" * 80)
            elapsed = time.time() - start_time
            print(f"⏱️  Elapsed Time: {format_time(elapsed)}")
            print(f"🤖 Model: gemini-2.0-flash-exp (2M context)")
            print("=" * 80)
            
            # Node Interviews
            print("\n📝 NODE INTERVIEWS (165 CTAS Tasks)")
            if nodes_dir.exists():
                node_files = list(nodes_dir.glob("*.toml"))
                node_count = len(node_files)
                
                print(progress_bar(node_count, TOTAL_NODES))
                
                if node_count > last_node_count:
                    rate = (node_count - last_node_count) / 5  # per 5 seconds
                    eta_seconds = (TOTAL_NODES - node_count) / rate if rate > 0 else 0
                    print(f"   Rate: {rate * 12:.2f} interviews/min")
                    print(f"   ETA: {format_time(eta_seconds)}")
                    last_node_count = node_count
                
                if node_count > 0:
                    latest = max(node_files, key=lambda p: p.stat().st_mtime)
                    print(f"   Latest: {latest.name}")
            else:
                print("   ⏳ Waiting for generation to start...")
            
            # Crate Interviews
            print("\n🔧 CRATE INTERVIEWS (~20 Foundation + Tactical Crates)")
            if crates_dir.exists():
                crate_files = list(crates_dir.glob("*.toml"))
                crate_count = len(crate_files)
                
                print(progress_bar(crate_count, TOTAL_CRATES))
                
                if crate_count > last_crate_count:
                    rate = (crate_count - last_crate_count) / 5
                    eta_seconds = (TOTAL_CRATES - crate_count) / rate if rate > 0 else 0
                    print(f"   Rate: {rate * 12:.2f} interviews/min")
                    print(f"   ETA: {format_time(eta_seconds)}")
                    last_crate_count = crate_count
                
                if crate_count > 0:
                    latest = max(crate_files, key=lambda p: p.stat().st_mtime)
                    print(f"   Latest: {latest.name}")
            else:
                print("   ⏳ Waiting for node interviews to complete...")
            
            # KML Infrastructure
            print("\n🗺️  KML INFRASTRUCTURE")
            if kml_dir.exists():
                kml_files = list(kml_dir.glob("*.kml")) + list(kml_dir.glob("*.geojson"))
                print(f"   ✅ {len(kml_files)} infrastructure files ready")
                
                manifest_file = kml_dir / "fetch_manifest.json"
                if manifest_file.exists():
                    with open(manifest_file) as f:
                        manifest = json.load(f)
                    total_size = sum(s.get('size_bytes', 0) for s in manifest.get('sources', {}).values())
                    print(f"   📦 Total size: {total_size / 1024 / 1024:.2f} MB")
            else:
                print("   ⏳ No infrastructure data yet")
            
            # Execution Log
            print("\n📋 EXECUTION LOG")
            log_file = Path("abe_execution_live.log")
            if log_file.exists():
                with open(log_file) as f:
                    lines = f.readlines()
                    recent_lines = lines[-5:] if len(lines) > 5 else lines
                    for line in recent_lines:
                        print(f"   {line.rstrip()}")
            else:
                print("   ⏳ No log file yet")
            
            # Cost Estimate
            print("\n💰 ESTIMATED COST")
            total_interviews = node_count if nodes_dir.exists() else 0
            total_interviews += crate_count if crates_dir.exists() else 0
            
            # Gemini 2.0 Flash pricing: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
            # Estimate: ~2K tokens input + ~3K tokens output per interview
            estimated_cost = total_interviews * ((2000 * 0.075 / 1000000) + (3000 * 0.30 / 1000000))
            print(f"   Current: ${estimated_cost:.4f}")
            
            total_estimated = (TOTAL_NODES + TOTAL_CRATES) * ((2000 * 0.075 / 1000000) + (3000 * 0.30 / 1000000))
            print(f"   Total (when complete): ${total_estimated:.2f}")
            
            # Status
            print("\n" + "=" * 80)
            print("🔄 Refreshing in 5 seconds... (Ctrl+C to exit)")
            
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\n\n✅ Monitor stopped")
        print(f"⏱️  Total monitoring time: {format_time(time.time() - start_time)}")

if __name__ == "__main__":
    monitor_pipeline()

