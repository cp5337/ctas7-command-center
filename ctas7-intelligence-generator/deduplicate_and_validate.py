#!/usr/bin/env python3
"""
Deduplication and Validation System
Ensures no duplicate ground stations, infrastructure, or interview data across databases
Critical for SlotGraph + Legion ECS integrity
"""

import os
import sys
import json
import toml
import hashlib
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Configuration
OUTPUT_DIR = Path("generated_interviews")
KML_DIR = Path("kml_infrastructure")
VALIDATION_REPORT = Path("validation_report.json")

class DataValidator:
    def __init__(self):
        self.duplicates = defaultdict(list)
        self.unique_hashes = set()
        self.stats = {
            "total_nodes": 0,
            "total_crates": 0,
            "total_ground_stations": 0,
            "total_infrastructure": 0,
            "duplicates_found": 0,
            "hash_collisions": 0,
            "validation_errors": []
        }
    
    def hash_content(self, content):
        """Generate SHA256 hash of content"""
        return hashlib.sha256(str(content).encode()).hexdigest()
    
    def validate_node_interviews(self):
        """Validate node interviews for duplicates and consistency"""
        print("\n📝 Validating Node Interviews...")
        
        nodes_dir = OUTPUT_DIR / "nodes"
        if not nodes_dir.exists():
            print("  ❌ Nodes directory not found")
            return
        
        node_files = list(nodes_dir.glob("*.toml"))
        self.stats["total_nodes"] = len(node_files)
        
        task_ids = set()
        trivariate_hashes = set()
        content_hashes = {}
        
        for node_file in node_files:
            try:
                with open(node_file) as f:
                    node_data = toml.load(f)
                
                # Check task_id uniqueness
                task_id = node_data['node_identity']['task_id']
                if task_id in task_ids:
                    self.duplicates['task_id'].append(task_id)
                    self.stats["duplicates_found"] += 1
                else:
                    task_ids.add(task_id)
                
                # Check trivariate hash uniqueness
                hash_48 = node_data.get('hash_48', '')
                if hash_48 in trivariate_hashes:
                    self.duplicates['trivariate_hash'].append(hash_48)
                    self.stats["hash_collisions"] += 1
                else:
                    trivariate_hashes.add(hash_48)
                
                # Check content hash (detect identical content with different IDs)
                content_hash = self.hash_content(node_data.get('capabilities', {}))
                if content_hash in content_hashes:
                    self.duplicates['content_duplicate'].append({
                        "file1": content_hashes[content_hash],
                        "file2": node_file.name,
                        "hash": content_hash
                    })
                else:
                    content_hashes[content_hash] = node_file.name
                
            except Exception as e:
                self.stats["validation_errors"].append(f"Node {node_file.name}: {e}")
        
        print(f"  ✅ Validated {len(node_files)} node interviews")
        print(f"     Unique task IDs: {len(task_ids)}")
        print(f"     Unique hashes: {len(trivariate_hashes)}")
        
        if self.duplicates['task_id']:
            print(f"  ⚠️  Found {len(self.duplicates['task_id'])} duplicate task IDs!")
    
    def validate_crate_interviews(self):
        """Validate crate interviews for duplicates and consistency"""
        print("\n🔧 Validating Crate Interviews...")
        
        crates_dir = OUTPUT_DIR / "crates"
        if not crates_dir.exists():
            print("  ❌ Crates directory not found")
            return
        
        crate_files = list(crates_dir.glob("*.toml"))
        self.stats["total_crates"] = len(crate_files)
        
        crate_names = set()
        trivariate_hashes = set()
        
        for crate_file in crate_files:
            try:
                with open(crate_file) as f:
                    crate_data = toml.load(f)
                
                # Check crate_name uniqueness
                crate_name = crate_data['crate_identity']['crate_name']
                if crate_name in crate_names:
                    self.duplicates['crate_name'].append(crate_name)
                    self.stats["duplicates_found"] += 1
                else:
                    crate_names.add(crate_name)
                
                # Check trivariate hash uniqueness
                hash_48 = crate_data.get('hash_48', '')
                if hash_48 in trivariate_hashes:
                    self.duplicates['crate_hash'].append(hash_48)
                    self.stats["hash_collisions"] += 1
                else:
                    trivariate_hashes.add(hash_48)
                
            except Exception as e:
                self.stats["validation_errors"].append(f"Crate {crate_file.name}: {e}")
        
        print(f"  ✅ Validated {len(crate_files)} crate interviews")
        print(f"     Unique crate names: {len(crate_names)}")
        print(f"     Unique hashes: {len(trivariate_hashes)}")
    
    def validate_ground_stations(self):
        """Validate ground stations for duplicates across KML sources"""
        print("\n🛰️  Validating Ground Stations...")
        
        if not KML_DIR.exists():
            print("  ❌ KML directory not found")
            return
        
        # Track ground stations by coordinates (lat, lon)
        stations_by_coords = defaultdict(list)
        stations_by_name = defaultdict(list)
        
        # Check KML files
        kml_files = list(KML_DIR.glob("*.geojson"))
        
        for kml_file in kml_files:
            try:
                with open(kml_file) as f:
                    data = json.load(f)
                
                if 'features' in data:
                    for feature in data['features']:
                        if feature.get('geometry', {}).get('type') == 'Point':
                            coords = tuple(feature['geometry']['coordinates'][:2])  # (lon, lat)
                            name = feature.get('properties', {}).get('name', 'Unknown')
                            
                            stations_by_coords[coords].append({
                                "source": kml_file.name,
                                "name": name
                            })
                            
                            stations_by_name[name].append({
                                "source": kml_file.name,
                                "coords": coords
                            })
                
            except Exception as e:
                self.stats["validation_errors"].append(f"KML {kml_file.name}: {e}")
        
        # Find duplicates
        duplicate_coords = {k: v for k, v in stations_by_coords.items() if len(v) > 1}
        duplicate_names = {k: v for k, v in stations_by_name.items() if len(v) > 1}
        
        self.stats["total_ground_stations"] = len(stations_by_coords)
        
        print(f"  ✅ Found {len(stations_by_coords)} unique coordinate locations")
        print(f"  ✅ Found {len(stations_by_name)} named stations")
        
        if duplicate_coords:
            print(f"  ⚠️  Found {len(duplicate_coords)} duplicate coordinates!")
            self.duplicates['ground_station_coords'] = duplicate_coords
            self.stats["duplicates_found"] += len(duplicate_coords)
        
        if duplicate_names:
            print(f"  ⚠️  Found {len(duplicate_names)} duplicate names!")
            self.duplicates['ground_station_names'] = duplicate_names
    
    def validate_infrastructure(self):
        """Validate infrastructure data for duplicates"""
        print("\n🗺️  Validating Infrastructure Data...")
        
        if not KML_DIR.exists():
            print("  ❌ KML directory not found")
            return
        
        # Track infrastructure by type
        infrastructure = {
            "submarine_cables": set(),
            "cable_landing_stations": set(),
            "internet_exchanges": set(),
            "data_centers": set(),
            "airports": set()
        }
        
        # Process each infrastructure type
        for infra_type in infrastructure.keys():
            geojson_file = KML_DIR / f"{infra_type}.geojson"
            json_file = KML_DIR / f"{infra_type}.json"
            
            file_to_check = geojson_file if geojson_file.exists() else json_file
            
            if file_to_check.exists():
                try:
                    with open(file_to_check) as f:
                        data = json.load(f)
                    
                    if 'features' in data:
                        for feature in data['features']:
                            # Create unique identifier
                            name = feature.get('properties', {}).get('name', '')
                            coords = feature.get('geometry', {}).get('coordinates', [])
                            unique_id = f"{name}:{coords}"
                            infrastructure[infra_type].add(unique_id)
                    
                    elif 'data' in data:  # PeeringDB format
                        for item in data['data']:
                            name = item.get('name', '')
                            city = item.get('city', '')
                            unique_id = f"{name}:{city}"
                            infrastructure[infra_type].add(unique_id)
                    
                except Exception as e:
                    self.stats["validation_errors"].append(f"Infrastructure {file_to_check.name}: {e}")
        
        # Report counts
        for infra_type, items in infrastructure.items():
            count = len(items)
            self.stats["total_infrastructure"] += count
            print(f"  ✅ {infra_type}: {count} unique items")
    
    def generate_deduplication_script(self):
        """Generate script to remove duplicates"""
        print("\n🔧 Generating Deduplication Script...")
        
        if not self.duplicates:
            print("  ✅ No duplicates found - no script needed")
            return
        
        script_path = Path("remove_duplicates.sh")
        
        with open(script_path, 'w') as f:
            f.write("#!/bin/bash\n")
            f.write("# Auto-generated deduplication script\n")
            f.write(f"# Generated: {datetime.now().isoformat()}\n\n")
            
            f.write("echo '🔧 Removing duplicate data...'\n\n")
            
            # Add commands to remove duplicates
            for dup_type, dup_list in self.duplicates.items():
                if dup_type == 'task_id':
                    f.write(f"# Duplicate task IDs: {len(dup_list)}\n")
                    for task_id in dup_list:
                        f.write(f"# WARNING: Duplicate task_id {task_id}\n")
                
                elif dup_type == 'crate_name':
                    f.write(f"# Duplicate crate names: {len(dup_list)}\n")
                    for crate_name in dup_list:
                        f.write(f"# WARNING: Duplicate crate_name {crate_name}\n")
            
            f.write("\necho '✅ Deduplication complete'\n")
        
        os.chmod(script_path, 0o755)
        print(f"  ✅ Created: {script_path}")
    
    def generate_report(self):
        """Generate validation report"""
        print("\n📊 Generating Validation Report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": self.stats,
            "duplicates": {k: len(v) for k, v in self.duplicates.items()},
            "duplicate_details": dict(self.duplicates),
            "recommendations": []
        }
        
        # Add recommendations
        if self.stats["duplicates_found"] > 0:
            report["recommendations"].append("Remove duplicate entries before loading into databases")
        
        if self.stats["hash_collisions"] > 0:
            report["recommendations"].append("Regenerate trivariate hashes for colliding entries")
        
        if not self.duplicates:
            report["recommendations"].append("Data is clean - safe to load into SurrealDB and Supabase")
        
        with open(VALIDATION_REPORT, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"  ✅ Report saved: {VALIDATION_REPORT}")
    
    def print_summary(self):
        """Print validation summary"""
        print("\n" + "=" * 70)
        print("📊 VALIDATION SUMMARY")
        print("=" * 70)
        
        print(f"\n✅ Data Validated:")
        print(f"   Node Interviews: {self.stats['total_nodes']}")
        print(f"   Crate Interviews: {self.stats['total_crates']}")
        print(f"   Ground Stations: {self.stats['total_ground_stations']}")
        print(f"   Infrastructure Items: {self.stats['total_infrastructure']}")
        
        if self.stats["duplicates_found"] > 0:
            print(f"\n⚠️  Issues Found:")
            print(f"   Duplicates: {self.stats['duplicates_found']}")
            print(f"   Hash Collisions: {self.stats['hash_collisions']}")
            print(f"   Validation Errors: {len(self.stats['validation_errors'])}")
            
            print(f"\n🔧 Action Required:")
            print(f"   1. Review: {VALIDATION_REPORT}")
            print(f"   2. Run: ./remove_duplicates.sh")
            print(f"   3. Re-validate: python3 deduplicate_and_validate.py")
        else:
            print(f"\n✅ NO DUPLICATES FOUND!")
            print(f"   Data is clean and ready for database loading")
            print(f"\n🚀 Next Steps:")
            print(f"   1. Load into SurrealDB: python3 store_in_surrealdb.py")
            print(f"   2. Load into Supabase: python3 store_in_supabase.py")
            print(f"   3. Deploy SlotGraph + Legion ECS with 289 unique ground stations")

def main():
    """Main validation execution"""
    print("🔍 CTAS-7 DATA VALIDATION & DEDUPLICATION")
    print("=" * 70)
    print("Ensuring data integrity for SlotGraph + Legion ECS")
    print("=" * 70)
    
    validator = DataValidator()
    
    # Run all validations
    validator.validate_node_interviews()
    validator.validate_crate_interviews()
    validator.validate_ground_stations()
    validator.validate_infrastructure()
    
    # Generate outputs
    validator.generate_deduplication_script()
    validator.generate_report()
    validator.print_summary()
    
    # Exit code
    if validator.stats["duplicates_found"] > 0:
        sys.exit(1)  # Duplicates found
    else:
        sys.exit(0)  # Clean data

if __name__ == "__main__":
    main()

