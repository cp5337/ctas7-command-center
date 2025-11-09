#!/usr/bin/env python3
"""
Generate Node and Crate Interviews using Gemini 2M
Uses the TOML schemas as templates and generates interviews for all 165 nodes and ~40 crates
"""

import os
import sys
import json
import toml
import time
from pathlib import Path
from datetime import datetime

# Add Google AI SDK
try:
    import google.generativeai as genai
except ImportError:
    print("Installing google-generativeai...")
    os.system("pip install -q google-generativeai")
    import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAH3wXqjFPaP8HbKCqAkCbbHUqoSAcmuU8")
MODEL_NAME = "gemini-2.0-flash-exp"  # 2M context window
OUTPUT_DIR = Path("generated_interviews")
NODE_SCHEMA = Path("../NODE_INTERVIEW_SCHEMA_V7.3.1.toml")
CRATE_SCHEMA = Path("../CRATE_INTERVIEW_SCHEMA_V7.3.1.toml")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

def load_ctas_tasks():
    """Load 165 CTAS tasks from Supabase or CSV"""
    # For now, use a sample list - replace with actual Supabase query
    tasks = []
    
    # Sample tasks from IED TTL
    sample_tasks = [
        {"id": "uuid-001-000-000-A", "name": "Pre-Operational Planning", "category": "mandatory"},
        {"id": "uuid-002-000-000-A", "name": "Reconnaissance and Targeting – Phase 1", "category": "mandatory"},
        {"id": "uuid-003-000-000-A", "name": "Logistics and Resource Acquisition", "category": "mandatory"},
        {"id": "uuid-004-000-000-A", "name": "Financial Operations", "category": "mandatory"},
        {"id": "uuid-005-000-000-A", "name": "Communications and C2", "category": "mandatory"},
        # Add all 165 tasks here
    ]
    
    return sample_tasks

def load_ctas_crates():
    """Load ~40 CTAS crates"""
    crates = [
        {"name": "ctas7-foundation-core", "type": "foundation", "hd4": "all"},
        {"name": "ctas7-foundation-math", "type": "foundation", "hd4": "all"},
        {"name": "ctas7-foundation-data", "type": "foundation", "hd4": "all"},
        {"name": "ctas7-enhanced-geolocation", "type": "tactical", "hd4": "hunt"},
        {"name": "ctas7-hashing-engine", "type": "foundation", "hd4": "all"},
        {"name": "ctas7-intelligence-generator", "type": "tactical", "hd4": "detect"},
        {"name": "ctas7-layer2-mathematical-intelligence", "type": "tactical", "hd4": "detect"},
        {"name": "ctas7-network-world", "type": "tactical", "hd4": "hunt"},
        {"name": "ctas7-space-world", "type": "tactical", "hd4": "hunt"},
        # Add all ~40 crates here
    ]
    
    return crates

def generate_node_interview(model, task, schema_template):
    """Generate a single node interview using Gemini 2M"""
    
    prompt = f"""
You are generating a CTAS-7 Node Interview for adversary task analysis.

TASK:
- ID: {task['id']}
- Name: {task['name']}
- Category: {task['category']}

SCHEMA TEMPLATE:
{schema_template}

INSTRUCTIONS:
1. Generate a complete node interview following the TOML schema
2. Write a first-person adversary narrative (capabilities, limitations)
3. Define time-of-value (half-life, collection phase, actionable window)
4. List key indicators (behavioral, technical, financial, social, geospatial)
5. Specify toolchain for 1n (defensive) and 2n (offensive) modes
6. Map to HD4 phases (Hunt, Detect, Disrupt, Disable, Dominate)
7. Include MITRE ATT&CK TTPs
8. Define EEI priority (critical, high, medium, low)
9. Include NIEM/N-DEx field mappings
10. Generate a realistic trivariate hash (SCH-CUID-UUID)

OUTPUT FORMAT: Valid TOML matching the schema exactly.

Generate the node interview now:
"""
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating node interview for {task['id']}: {e}")
        return None

def generate_crate_interview(model, crate, schema_template):
    """Generate a single crate interview using Gemini 2M"""
    
    prompt = f"""
You are generating a CTAS-7 Crate Interview for system analysis.

CRATE:
- Name: {crate['name']}
- Type: {crate['type']}
- HD4 Phase: {crate['hd4']}

SCHEMA TEMPLATE:
{schema_template}

INSTRUCTIONS:
1. Generate a complete crate interview following the TOML schema
2. Write a first-person crate voice (narrative, capabilities, limitations)
3. Define dependencies (Rust crates, system dependencies, data dependencies)
4. Map to node applications (which CTAS tasks use this crate?)
5. Specify toolchain integration (Kali tools, Metasploit, CALDERA, etc.)
6. Include MCP integration details
7. Define GNN/Vector DB integration
8. Specify XSD validation schemas
9. Include PhD QA scoring
10. Map to IED TTL categories
11. Generate a realistic trivariate hash (SCH-CUID-UUID)

OUTPUT FORMAT: Valid TOML matching the schema exactly.

Generate the crate interview now:
"""
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating crate interview for {crate['name']}: {e}")
        return None

def main():
    """Main execution"""
    print("🚀 CTAS-7 Interview Generator")
    print("=" * 60)
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    (OUTPUT_DIR / "nodes").mkdir(exist_ok=True)
    (OUTPUT_DIR / "crates").mkdir(exist_ok=True)
    
    # Load schemas
    print("\n📄 Loading schemas...")
    with open(NODE_SCHEMA) as f:
        node_schema = f.read()
    with open(CRATE_SCHEMA) as f:
        crate_schema = f.read()
    
    # Initialize Gemini model
    print(f"\n🤖 Initializing Gemini {MODEL_NAME}...")
    model = genai.GenerativeModel(MODEL_NAME)
    
    # Load tasks and crates
    tasks = load_ctas_tasks()
    crates = load_ctas_crates()
    
    print(f"\n📊 Loaded {len(tasks)} tasks and {len(crates)} crates")
    
    # Generate node interviews
    print("\n" + "=" * 60)
    print("📝 Generating Node Interviews...")
    print("=" * 60)
    
    start_time = time.time()
    node_count = 0
    
    for i, task in enumerate(tasks, 1):
        print(f"\n[{i}/{len(tasks)}] Generating: {task['name']}")
        
        interview = generate_node_interview(model, task, node_schema)
        
        if interview:
            # Save to file
            filename = OUTPUT_DIR / "nodes" / f"{task['id']}.toml"
            with open(filename, 'w') as f:
                f.write(interview)
            
            node_count += 1
            print(f"  ✅ Saved to {filename}")
        else:
            print(f"  ❌ Failed to generate")
        
        # Rate limiting (avoid hitting API limits)
        time.sleep(1)
    
    node_time = time.time() - start_time
    
    # Generate crate interviews
    print("\n" + "=" * 60)
    print("🔧 Generating Crate Interviews...")
    print("=" * 60)
    
    start_time = time.time()
    crate_count = 0
    
    for i, crate in enumerate(crates, 1):
        print(f"\n[{i}/{len(crates)}] Generating: {crate['name']}")
        
        interview = generate_crate_interview(model, crate, crate_schema)
        
        if interview:
            # Save to file
            filename = OUTPUT_DIR / "crates" / f"{crate['name']}.toml"
            with open(filename, 'w') as f:
                f.write(interview)
            
            crate_count += 1
            print(f"  ✅ Saved to {filename}")
        else:
            print(f"  ❌ Failed to generate")
        
        # Rate limiting
        time.sleep(1)
    
    crate_time = time.time() - start_time
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 GENERATION SUMMARY")
    print("=" * 60)
    print(f"\n✅ Node Interviews: {node_count}/{len(tasks)} generated")
    print(f"   Time: {node_time:.1f} seconds ({node_time/60:.1f} minutes)")
    print(f"\n✅ Crate Interviews: {crate_count}/{len(crates)} generated")
    print(f"   Time: {crate_time:.1f} seconds ({crate_time/60:.1f} minutes)")
    print(f"\n⏱️  Total Time: {(node_time + crate_time)/60:.1f} minutes")
    print(f"\n📁 Output Directory: {OUTPUT_DIR.absolute()}")
    
    # Next steps
    print("\n" + "=" * 60)
    print("🚀 NEXT STEPS")
    print("=" * 60)
    print("\n1. Review generated interviews in:", OUTPUT_DIR.absolute())
    print("2. Store in SurrealDB: python store_in_surrealdb.py")
    print("3. Store in Supabase: python store_in_supabase.py")
    print("4. Generate hashes: python generate_hashes.py")
    print("5. Deploy to frontend: npm run dev")

if __name__ == "__main__":
    main()

