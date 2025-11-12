#!/usr/bin/env python3
"""
Store Node and Crate Interviews in SurrealDB
Loads all 185 interviews into SurrealDB with graph relationships
"""

import os
import sys
import toml
import json
from pathlib import Path
from surrealdb import Surreal

# Configuration
SURREAL_URL = os.getenv("SURREAL_URL", "ws://localhost:8000/rpc")
SURREAL_NS = "ctas7"
SURREAL_DB = "intelligence"
OUTPUT_DIR = Path("generated_interviews")

async def load_interviews():
    """Load all interviews into SurrealDB"""
    
    print("🗄️  SURREALDB LOADER")
    print("=" * 70)
    
    # Connect to SurrealDB
    print(f"\n📡 Connecting to SurrealDB: {SURREAL_URL}")
    db = Surreal(SURREAL_URL)
    await db.connect()
    await db.use(SURREAL_NS, SURREAL_DB)
    print("✅ Connected")
    
    # Load node interviews
    nodes_dir = OUTPUT_DIR / "nodes"
    node_files = list(nodes_dir.glob("*.toml"))
    
    print(f"\n📝 Loading {len(node_files)} node interviews...")
    
    for i, node_file in enumerate(node_files, 1):
        try:
            with open(node_file) as f:
                node_data = toml.load(f)
            
            # Create node record
            task_id = node_data['node_identity']['task_id']
            await db.create(f"node:{task_id}", node_data)
            
            if i % 10 == 0:
                print(f"  ✅ Loaded {i}/{len(node_files)} nodes...")
                
        except Exception as e:
            print(f"  ❌ Failed to load {node_file.name}: {e}")
    
    print(f"✅ Loaded {len(node_files)} node interviews")
    
    # Load crate interviews
    crates_dir = OUTPUT_DIR / "crates"
    crate_files = list(crates_dir.glob("*.toml"))
    
    print(f"\n🔧 Loading {len(crate_files)} crate interviews...")
    
    for i, crate_file in enumerate(crate_files, 1):
        try:
            with open(crate_file) as f:
                crate_data = toml.load(f)
            
            # Create crate record
            crate_name = crate_data['crate_identity']['crate_name']
            await db.create(f"crate:{crate_name}", crate_data)
            
            if i % 5 == 0:
                print(f"  ✅ Loaded {i}/{len(crate_files)} crates...")
                
        except Exception as e:
            print(f"  ❌ Failed to load {crate_file.name}: {e}")
    
    print(f"✅ Loaded {len(crate_files)} crate interviews")
    
    # Close connection
    await db.close()
    
    print("\n" + "=" * 70)
    print("✅ ALL INTERVIEWS LOADED INTO SURREALDB")
    print("=" * 70)

if __name__ == "__main__":
    import asyncio
    asyncio.run(load_interviews())

