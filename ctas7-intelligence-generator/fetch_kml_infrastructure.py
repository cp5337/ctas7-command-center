#!/usr/bin/env python3
"""
Fetch KML/KMZ Infrastructure Layers for CTAS-7 Ground Station Network
Pulls global ground stations, submarine cable landings, and telecom infrastructure
Target: 5-minute fetch for high-GPU processing
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from datetime import datetime
import zipfile
import io

# Configuration
OUTPUT_DIR = Path("kml_infrastructure")
FETCH_TIMEOUT = 300  # 5 minutes

# KML/KMZ Sources
KML_SOURCES = {
    # Submarine Cable Map (TeleGeography)
    "submarine_cables": {
        "url": "https://www.submarinecablemap.com/api/v3/cable/cable-geo.json",
        "type": "geojson",
        "description": "Global submarine cable routes and landing points"
    },
    
    # Submarine Cable Landing Stations
    "cable_landing_stations": {
        "url": "https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json",
        "type": "geojson",
        "description": "Submarine cable landing stations (beachheads)"
    },
    
    # Internet Exchange Points (PeeringDB)
    "internet_exchanges": {
        "url": "https://www.peeringdb.com/api/ix",
        "type": "json",
        "description": "Global Internet Exchange Points (IXPs)"
    },
    
    # Data Centers (PeeringDB)
    "data_centers": {
        "url": "https://www.peeringdb.com/api/fac",
        "type": "json",
        "description": "Global data center facilities"
    },
    
    # Starlink Ground Stations (Community-sourced)
    "starlink_gateways": {
        "url": "https://raw.githubusercontent.com/djtaylor8/starlink-gateways/main/starlink_gateways.geojson",
        "type": "geojson",
        "description": "Starlink ground station gateways"
    },
    
    # Cell Tower Database (OpenCelliD - sample, full DB requires API key)
    "cell_towers_sample": {
        "url": "https://opencellid.org/downloads.php?token=sample",
        "type": "csv",
        "description": "Cell tower locations (sample dataset)",
        "note": "Full dataset requires API key"
    },
    
    # Power Grid Infrastructure (OpenInfraMap - via Overpass API)
    "power_grid": {
        "url": "https://overpass-api.de/api/interpreter",
        "type": "overpass",
        "query": """
        [out:json][timeout:60];
        (
          node["power"="substation"](bbox);
          way["power"="line"](bbox);
          node["power"="plant"](bbox);
        );
        out body;
        >;
        out skel qt;
        """,
        "description": "Power grid substations, transmission lines, plants"
    },
    
    # Airports (OurAirports)
    "airports": {
        "url": "https://davidmegginson.github.io/ourairports-data/airports.csv",
        "type": "csv",
        "description": "Global airport locations"
    },
    
    # Seaports (World Port Index)
    "seaports": {
        "url": "https://msi.nga.mil/api/publications/world-port-index",
        "type": "json",
        "description": "Global seaport locations"
    },
}

def fetch_url(url, description, timeout=30):
    """Fetch data from URL with error handling"""
    try:
        print(f"  📡 Fetching: {description}")
        print(f"     URL: {url[:80]}...")
        
        headers = {
            'User-Agent': 'CTAS-7-Ground-Station-Network/7.3.1 (Infrastructure Analysis)'
        }
        
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        print(f"  ✅ Downloaded {len(response.content)} bytes")
        return response.content
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Failed: {e}")
        return None

def convert_geojson_to_kml(geojson_data, output_file):
    """Convert GeoJSON to KML format"""
    try:
        import json
        data = json.loads(geojson_data)
        
        kml_header = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
"""
        kml_footer = """</Document>
</kml>"""
        
        placemarks = []
        
        if 'features' in data:
            for feature in data['features']:
                if feature.get('geometry', {}).get('type') == 'Point':
                    coords = feature['geometry']['coordinates']
                    name = feature.get('properties', {}).get('name', 'Unknown')
                    
                    placemark = f"""  <Placemark>
    <name>{name}</name>
    <Point>
      <coordinates>{coords[0]},{coords[1]},0</coordinates>
    </Point>
  </Placemark>
"""
                    placemarks.append(placemark)
        
        kml_content = kml_header + ''.join(placemarks) + kml_footer
        
        with open(output_file, 'w') as f:
            f.write(kml_content)
        
        print(f"  ✅ Converted to KML: {output_file}")
        return True
        
    except Exception as e:
        print(f"  ❌ Conversion failed: {e}")
        return False

def fetch_overpass_data(query, bbox="-180,-90,180,90"):
    """Fetch data from OpenStreetMap Overpass API"""
    try:
        # Replace bbox placeholder
        query_with_bbox = query.replace("(bbox)", f"({bbox})")
        
        url = "https://overpass-api.de/api/interpreter"
        response = requests.post(url, data=query_with_bbox, timeout=120)
        response.raise_for_status()
        
        return response.content
        
    except Exception as e:
        print(f"  ❌ Overpass query failed: {e}")
        return None

def main():
    """Main execution"""
    print("🛰️  CTAS-7 KML Infrastructure Fetcher")
    print("=" * 70)
    print(f"Target: Fetch all infrastructure layers in {FETCH_TIMEOUT}s")
    print("=" * 70)
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    start_time = time.time()
    fetch_results = {}
    
    # Fetch all sources
    for source_name, source_config in KML_SOURCES.items():
        print(f"\n📦 [{source_name}]")
        print(f"   {source_config['description']}")
        
        # Skip if time limit exceeded
        elapsed = time.time() - start_time
        if elapsed > FETCH_TIMEOUT:
            print(f"  ⏱️  Time limit exceeded ({elapsed:.1f}s), skipping remaining sources")
            break
        
        # Fetch data
        if source_config['type'] == 'overpass':
            data = fetch_overpass_data(source_config['query'])
        else:
            data = fetch_url(source_config['url'], source_config['description'])
        
        if data:
            # Save raw data
            output_file = OUTPUT_DIR / f"{source_name}.{source_config['type']}"
            with open(output_file, 'wb') as f:
                f.write(data)
            
            fetch_results[source_name] = {
                "status": "success",
                "file": str(output_file),
                "size_bytes": len(data),
                "type": source_config['type']
            }
            
            # Convert GeoJSON to KML
            if source_config['type'] == 'geojson':
                kml_file = OUTPUT_DIR / f"{source_name}.kml"
                convert_geojson_to_kml(data, kml_file)
        else:
            fetch_results[source_name] = {
                "status": "failed",
                "file": None,
                "size_bytes": 0
            }
    
    elapsed_time = time.time() - start_time
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 FETCH SUMMARY")
    print("=" * 70)
    
    success_count = sum(1 for r in fetch_results.values() if r['status'] == 'success')
    total_size = sum(r['size_bytes'] for r in fetch_results.values())
    
    print(f"\n✅ Successfully fetched: {success_count}/{len(KML_SOURCES)} sources")
    print(f"📁 Total data size: {total_size / 1024 / 1024:.2f} MB")
    print(f"⏱️  Total time: {elapsed_time:.1f} seconds")
    print(f"📂 Output directory: {OUTPUT_DIR.absolute()}")
    
    # Save manifest
    manifest = {
        "fetch_timestamp": datetime.now().isoformat(),
        "elapsed_seconds": elapsed_time,
        "sources": fetch_results
    }
    
    manifest_file = OUTPUT_DIR / "fetch_manifest.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n📄 Manifest saved: {manifest_file}")
    
    # Next steps
    print("\n" + "=" * 70)
    print("🚀 NEXT STEPS")
    print("=" * 70)
    print("\n1. Process KML files with high-GPU setup:")
    print("   python3 process_kml_with_gee.py")
    print("\n2. Generate trivariate hashes for all infrastructure:")
    print("   python3 hash_infrastructure.py")
    print("\n3. Load into SlotGraph + Legion ECS:")
    print("   cargo run --bin load_infrastructure")
    print("\n4. Store in SurrealDB + Supabase:")
    print("   python3 store_infrastructure.py")
    
    # GEE Integration note
    print("\n" + "=" * 70)
    print("🌍 GOOGLE EARTH ENGINE INTEGRATION")
    print("=" * 70)
    print("\nFor GEE layers (terrain, weather, FSO atmospheric analysis):")
    print("1. Authenticate: earthengine authenticate")
    print("2. Run GEE script: python3 gee_ground_station_optimization.py")
    print("3. Export KMZ layers from GEE Code Editor")
    print("4. Place in:", OUTPUT_DIR / "gee_layers/")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

