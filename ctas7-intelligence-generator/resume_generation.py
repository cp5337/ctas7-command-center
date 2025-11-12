#!/usr/bin/env python3
"""
Resume ABE Interview Generation
Picks up where the previous run left off
"""

import os
import sys
import asyncio
from pathlib import Path
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAH3wXqjFPaP8HbKCqAkCbbHUqoSAcmuU8")
MODEL_NAME = "gemini-2.0-flash-exp"
OUTPUT_DIR = Path("generated_interviews")

genai.configure(api_key=GEMINI_API_KEY)

# Check what's already done
nodes_dir = OUTPUT_DIR / "nodes"
crates_dir = OUTPUT_DIR / "crates"

existing_nodes = set(f.stem for f in nodes_dir.glob("*.toml")) if nodes_dir.exists() else set()
existing_crates = set(f.stem for f in crates_dir.glob("*.toml")) if crates_dir.exists() else set()

print(f"📊 Current Status:")
print(f"   Nodes: {len(existing_nodes)}/165")
print(f"   Crates: {len(existing_crates)}/20")
print()

# Generate remaining nodes
remaining_nodes = 165 - len(existing_nodes)
remaining_crates = 20 - len(existing_crates)

print(f"🔄 Remaining to generate:")
print(f"   Nodes: {remaining_nodes}")
print(f"   Crates: {remaining_crates}")
print()

if remaining_nodes == 0 and remaining_crates == 0:
    print("✅ All interviews already generated!")
    sys.exit(0)

print("🚀 Resuming generation...")
print("   This will take approximately:")
print(f"   - Nodes: {remaining_nodes * 0.5:.1f} minutes")
print(f"   - Crates: {remaining_crates * 0.5:.1f} minutes")
print(f"   - Total: {(remaining_nodes + remaining_crates) * 0.5:.1f} minutes")
print()

response = input("Continue? (y/n): ")
if response.lower() != 'y':
    print("Cancelled.")
    sys.exit(0)

# Import and run the main pipeline
print("\n🚀 Starting ABE pipeline...")
os.system("source venv/bin/activate && python3 abe_high_gpu_pipeline.py")

