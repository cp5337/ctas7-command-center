#!/usr/bin/env python3
"""
ABE Orbital Station Ingestion
Reads orbital ground station data WITHOUT disturbing the source
Creates a separate OSINT node database that does NOT report to orbital GIS

CRITICAL: This maintains separation between:
1. Orbital GIS Ground Stations (259 stations for satellite tracking)
2. OSINT Intelligence Nodes (247 nodes for intelligence collection)
"""

import os
import sys
import csv
import json
from pathlib import Path
from datetime import datetime

# Configuration
ORBITAL_DIR = Path("/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-orbital")
OSINT_OUTPUT = Path("osint_nodes_separate.json")
ORBITAL_OUTPUT = Path("orbital_stations_readonly.json")

class StationSeparator:
    def __init__(self):
        self.orbital_stations = []
        self.osint_nodes = []
        self.stats = {
            "orbital_found": 0,
            "osint_created": 0,
            "duplicates_prevented": 0
        }
    
    def find_orbital_data(self):
        """Find all orbital ground station data files"""
        print("🔍 Searching for orbital ground station data...")
        
        # Search patterns
        patterns = [
            "ground_station*.csv",
            "*259*.csv",
            "station*.csv",
            "*.json"
        ]
        
        found_files = []
        
        for pattern in patterns:
            files = list(ORBITAL_DIR.rglob(pattern))
            found_files.extend(files)
        
        # Deduplicate
        found_files = list(set(found_files))
        
        print(f"  ✅ Found {len(found_files)} potential data files")
        
        for f in found_files:
            print(f"     - {f.relative_to(ORBITAL_DIR)}")
        
        return found_files
    
    def ingest_orbital_stations(self, files):
        """Ingest orbital stations WITHOUT modifying source"""
        print("\n📡 Ingesting orbital ground stations (READ-ONLY)...")
        
        seen_coords = set()
        
        for file_path in files:
            try:
                if file_path.suffix == '.csv':
                    with open(file_path) as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            # Extract coordinates
                            lat = float(row.get('latitude', row.get('lat', 0)))
                            lon = float(row.get('longitude', row.get('lon', 0)))
                            
                            coord_key = (round(lat, 4), round(lon, 4))
                            
                            if coord_key not in seen_coords:
                                station = {
                                    "station_id": row.get('station_id', row.get('id', f"ORBITAL-{len(self.orbital_stations)}")),
                                    "name": row.get('name', 'Unknown'),
                                    "latitude": lat,
                                    "longitude": lon,
                                    "altitude": float(row.get('altitude', row.get('elevation', 0))),
                                    "source": "orbital_gis",
                                    "type": "ground_station"
                                }
                                
                                self.orbital_stations.append(station)
                                seen_coords.add(coord_key)
                                self.stats["orbital_found"] += 1
                
                elif file_path.suffix == '.json':
                    with open(file_path) as f:
                        data = json.load(f)
                        
                        if isinstance(data, list):
                            for item in data:
                                lat = float(item.get('latitude', item.get('lat', 0)))
                                lon = float(item.get('longitude', item.get('lon', 0)))
                                
                                coord_key = (round(lat, 4), round(lon, 4))
                                
                                if coord_key not in seen_coords:
                                    station = {
                                        "station_id": item.get('station_id', item.get('id', f"ORBITAL-{len(self.orbital_stations)}")),
                                        "name": item.get('name', 'Unknown'),
                                        "latitude": lat,
                                        "longitude": lon,
                                        "altitude": float(item.get('altitude', item.get('elevation', 0))),
                                        "source": "orbital_gis",
                                        "type": "ground_station"
                                    }
                                    
                                    self.orbital_stations.append(station)
                                    seen_coords.add(coord_key)
                                    self.stats["orbital_found"] += 1
                        
            except Exception as e:
                print(f"  ⚠️  Could not read {file_path.name}: {e}")
        
        print(f"  ✅ Ingested {len(self.orbital_stations)} orbital stations (READ-ONLY)")
    
    def create_osint_nodes(self):
        """Create OSINT intelligence nodes (SEPARATE from orbital)"""
        print("\n🕵️  Creating OSINT intelligence nodes (SEPARATE DATABASE)...")
        
        # OSINT nodes are intelligence collection points, NOT ground stations
        # They use the KML infrastructure data we fetched earlier
        
        kml_dir = Path("kml_infrastructure")
        
        if not kml_dir.exists():
            print("  ⚠️  No KML infrastructure data found")
            print("     Run: python3 fetch_kml_infrastructure.py")
            return
        
        # Load cable landing stations as OSINT nodes
        landing_stations_file = kml_dir / "cable_landing_stations.geojson"
        
        if landing_stations_file.exists():
            with open(landing_stations_file) as f:
                data = json.load(f)
            
            seen_coords = set()
            
            for feature in data.get('features', []):
                if feature.get('geometry', {}).get('type') == 'Point':
                    coords = feature['geometry']['coordinates']
                    lat, lon = coords[1], coords[0]
                    
                    coord_key = (round(lat, 4), round(lon, 4))
                    
                    if coord_key not in seen_coords:
                        node = {
                            "node_id": f"OSINT-{len(self.osint_nodes):03d}",
                            "name": feature.get('properties', {}).get('name', 'Unknown'),
                            "latitude": lat,
                            "longitude": lon,
                            "source": "osint_infrastructure",
                            "type": "intelligence_node",
                            "capabilities": ["submarine_cable_monitoring", "network_traffic_analysis"],
                            "database": "osint_surrealdb"  # SEPARATE DATABASE
                        }
                        
                        self.osint_nodes.append(node)
                        seen_coords.add(coord_key)
                        self.stats["osint_created"] += 1
        
        print(f"  ✅ Created {len(self.osint_nodes)} OSINT intelligence nodes")
    
    def verify_separation(self):
        """Verify orbital and OSINT are completely separate"""
        print("\n🔒 Verifying data separation...")
        
        orbital_coords = set((round(s['latitude'], 4), round(s['longitude'], 4)) for s in self.orbital_stations)
        osint_coords = set((round(n['latitude'], 4), round(n['longitude'], 4)) for n in self.osint_nodes)
        
        overlap = orbital_coords & osint_coords
        
        if overlap:
            print(f"  ⚠️  Found {len(overlap)} overlapping coordinates")
            self.stats["duplicates_prevented"] = len(overlap)
            
            # Remove overlaps from OSINT (orbital takes precedence)
            self.osint_nodes = [
                n for n in self.osint_nodes
                if (round(n['latitude'], 4), round(n['longitude'], 4)) not in overlap
            ]
            
            print(f"  ✅ Removed {len(overlap)} duplicates from OSINT nodes")
        else:
            print(f"  ✅ NO OVERLAP - Complete separation maintained")
        
        print(f"\n📊 Final Counts:")
        print(f"   Orbital Stations: {len(self.orbital_stations)} (for satellite tracking)")
        print(f"   OSINT Nodes: {len(self.osint_nodes)} (for intelligence collection)")
    
    def save_data(self):
        """Save separated data"""
        print("\n💾 Saving separated data...")
        
        # Save orbital stations (READ-ONLY reference)
        orbital_data = {
            "timestamp": datetime.now().isoformat(),
            "source": "orbital_gis",
            "readonly": True,
            "database": "orbital_surrealdb",
            "count": len(self.orbital_stations),
            "stations": self.orbital_stations
        }
        
        with open(ORBITAL_OUTPUT, 'w') as f:
            json.dump(orbital_data, f, indent=2)
        
        print(f"  ✅ Saved orbital stations: {ORBITAL_OUTPUT}")
        
        # Save OSINT nodes (SEPARATE database)
        osint_data = {
            "timestamp": datetime.now().isoformat(),
            "source": "osint_infrastructure",
            "database": "osint_surrealdb",
            "separate_from_orbital": True,
            "count": len(self.osint_nodes),
            "nodes": self.osint_nodes
        }
        
        with open(OSINT_OUTPUT, 'w') as f:
            json.dump(osint_data, f, indent=2)
        
        print(f"  ✅ Saved OSINT nodes: {OSINT_OUTPUT}")
    
    def generate_database_config(self):
        """Generate database configuration to maintain separation"""
        print("\n⚙️  Generating database configuration...")
        
        config = {
            "databases": {
                "orbital_gis": {
                    "url": "ws://localhost:8001/rpc",
                    "namespace": "ctas7",
                    "database": "orbital",
                    "purpose": "Satellite tracking and ground station management",
                    "data_types": ["ground_stations", "satellites", "orbital_elements"],
                    "readonly_from_osint": True
                },
                "osint_intelligence": {
                    "url": "ws://localhost:8002/rpc",
                    "namespace": "ctas7",
                    "database": "osint",
                    "purpose": "Intelligence collection and OSINT node management",
                    "data_types": ["osint_nodes", "node_interviews", "crate_interviews"],
                    "isolated_from_orbital": True
                }
            },
            "separation_rules": {
                "osint_cannot_write_to_orbital": True,
                "orbital_cannot_write_to_osint": True,
                "shared_read_only": False,
                "duplicate_prevention": True
            }
        }
        
        config_file = Path("database_separation_config.json")
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"  ✅ Saved config: {config_file}")

def main():
    """Main execution"""
    print("🛰️  ABE ORBITAL STATION INGESTION")
    print("=" * 70)
    print("Maintaining separation between Orbital GIS and OSINT Intelligence")
    print("=" * 70)
    
    separator = StationSeparator()
    
    # Find orbital data
    orbital_files = separator.find_orbital_data()
    
    if not orbital_files:
        print("\n⚠️  No orbital ground station data found")
        print("   Expected location: /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-foundation-orbital")
        print("\n   Creating OSINT nodes from KML infrastructure only...")
    else:
        # Ingest orbital stations (READ-ONLY)
        separator.ingest_orbital_stations(orbital_files)
    
    # Create OSINT nodes (SEPARATE)
    separator.create_osint_nodes()
    
    # Verify separation
    separator.verify_separation()
    
    # Save separated data
    separator.save_data()
    
    # Generate database config
    separator.generate_database_config()
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ DATA SEPARATION COMPLETE")
    print("=" * 70)
    print(f"\n📊 Statistics:")
    print(f"   Orbital Stations Found: {separator.stats['orbital_found']}")
    print(f"   OSINT Nodes Created: {separator.stats['osint_created']}")
    print(f"   Duplicates Prevented: {separator.stats['duplicates_prevented']}")
    
    print(f"\n🗄️  Database Configuration:")
    print(f"   Orbital GIS: ws://localhost:8001/rpc (READ-ONLY from OSINT)")
    print(f"   OSINT Intelligence: ws://localhost:8002/rpc (ISOLATED)")
    
    print(f"\n🚀 Next Steps:")
    print(f"   1. Start SurrealDB instances:")
    print(f"      surreal start --bind 0.0.0.0:8001 file://orbital.db")
    print(f"      surreal start --bind 0.0.0.0:8002 file://osint.db")
    print(f"   2. Load orbital stations (READ-ONLY):")
    print(f"      python3 load_orbital_readonly.py")
    print(f"   3. Load OSINT nodes (SEPARATE):")
    print(f"      python3 load_osint_separate.py")

if __name__ == "__main__":
    main()

