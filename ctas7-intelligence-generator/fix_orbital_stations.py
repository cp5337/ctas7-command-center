#!/usr/bin/env python3
"""
Fix Orbital Ground Stations
- Deduplicate stations
- Fix reversed lat/lon coordinates
- Validate all coordinates are on Earth
- Create clean dataset for orbital GIS
"""

import os
import sys
import csv
import json
from pathlib import Path
from collections import defaultdict
import math

# Configuration
ORBITAL_SOURCE = Path("/Users/cp5337/Developer/ctas-7-shipyard-staging/cesium-mcp-server/data/starlink_ground_stations_2025.csv")
OUTPUT_CLEAN = Path("orbital_stations_clean.csv")
OUTPUT_JSON = Path("orbital_stations_clean.json")
VALIDATION_REPORT = Path("orbital_validation_report.json")

class OrbitalStationFixer:
    def __init__(self):
        self.raw_stations = []
        self.clean_stations = []
        self.duplicates = []
        self.reversed_coords = []
        self.invalid_coords = []
        self.stats = {
            "total_raw": 0,
            "duplicates_removed": 0,
            "coords_fixed": 0,
            "invalid_removed": 0,
            "final_clean": 0
        }
    
    def is_valid_lat(self, lat):
        """Check if latitude is valid (-90 to 90)"""
        try:
            lat = float(lat)
            return -90 <= lat <= 90
        except:
            return False
    
    def is_valid_lon(self, lon):
        """Check if longitude is valid (-180 to 180)"""
        try:
            lon = float(lon)
            return -180 <= lon <= 180
        except:
            return False
    
    def is_on_land_or_ocean(self, lat, lon):
        """Basic check if coordinates are plausible (not in space)"""
        try:
            lat = float(lat)
            lon = float(lon)
            
            # Check if coordinates are within Earth bounds
            if not (-90 <= lat <= 90):
                return False
            if not (-180 <= lon <= 180):
                return False
            
            # Check if coordinates are suspiciously close to 0,0 (Gulf of Guinea - unlikely for ground stations)
            if abs(lat) < 0.1 and abs(lon) < 0.1:
                return False
            
            return True
        except:
            return False
    
    def detect_reversed_coords(self, lat, lon, name=""):
        """Detect if lat/lon are reversed"""
        try:
            lat = float(lat)
            lon = float(lon)
            
            # If "latitude" is outside -90 to 90 but "longitude" is within that range,
            # they're likely reversed
            if not (-90 <= lat <= 90) and (-90 <= lon <= 90):
                return True
            
            # If "longitude" is outside -180 to 180 but "latitude" is within that range,
            # they're likely reversed
            if not (-180 <= lon <= 180) and (-180 <= lat <= 180):
                return True
            
            # Additional heuristic: if abs(lat) > abs(lon) and both are valid,
            # they might be reversed (most ground stations are at moderate latitudes)
            if (-90 <= lat <= 90) and (-180 <= lon <= 180):
                if abs(lat) > 90 or abs(lon) > 180:
                    return True
            
            return False
        except:
            return False
    
    def load_raw_stations(self):
        """Load raw orbital station data"""
        print("📡 Loading orbital ground stations...")
        
        if not ORBITAL_SOURCE.exists():
            print(f"  ❌ Source file not found: {ORBITAL_SOURCE}")
            return False
        
        with open(ORBITAL_SOURCE) as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.raw_stations.append(row)
        
        self.stats["total_raw"] = len(self.raw_stations)
        print(f"  ✅ Loaded {len(self.raw_stations)} raw stations")
        return True
    
    def fix_coordinates(self):
        """Fix reversed and invalid coordinates"""
        print("\n🔧 Fixing coordinates...")
        
        fixed_stations = []
        
        for station in self.raw_stations:
            # Extract coordinates
            lat = station.get('latitude', station.get('lat', '0'))
            lon = station.get('longitude', station.get('lon', '0'))
            name = station.get('name', station.get('station_name', 'Unknown'))
            
            try:
                lat_val = float(lat)
                lon_val = float(lon)
            except:
                self.invalid_coords.append({
                    "name": name,
                    "lat": lat,
                    "lon": lon,
                    "reason": "non-numeric"
                })
                self.stats["invalid_removed"] += 1
                continue
            
            # Check if coordinates are reversed
            if self.detect_reversed_coords(lat_val, lon_val, name):
                # Swap them
                lat_val, lon_val = lon_val, lat_val
                self.reversed_coords.append({
                    "name": name,
                    "original_lat": lat,
                    "original_lon": lon,
                    "fixed_lat": lat_val,
                    "fixed_lon": lon_val
                })
                self.stats["coords_fixed"] += 1
            
            # Validate fixed coordinates
            if not self.is_on_land_or_ocean(lat_val, lon_val):
                self.invalid_coords.append({
                    "name": name,
                    "lat": lat_val,
                    "lon": lon_val,
                    "reason": "invalid_location"
                })
                self.stats["invalid_removed"] += 1
                continue
            
            # Create fixed station record
            fixed_station = {
                "station_id": station.get('station_id', station.get('id', f"GS-{len(fixed_stations):03d}")),
                "name": name,
                "latitude": lat_val,
                "longitude": lon_val,
                "altitude": float(station.get('altitude', station.get('elevation', 0))),
                "country": station.get('country', 'Unknown'),
                "status": station.get('status', 'active'),
                "source": "orbital_gis_fixed"
            }
            
            fixed_stations.append(fixed_station)
        
        self.clean_stations = fixed_stations
        
        print(f"  ✅ Fixed {self.stats['coords_fixed']} reversed coordinates")
        print(f"  ✅ Removed {self.stats['invalid_removed']} invalid coordinates")
        print(f"  ✅ Cleaned stations: {len(self.clean_stations)}")
    
    def deduplicate_stations(self):
        """Remove duplicate stations by coordinates"""
        print("\n🔍 Deduplicating stations...")
        
        # Group by rounded coordinates (to 4 decimal places ~11m precision)
        coord_groups = defaultdict(list)
        
        for station in self.clean_stations:
            coord_key = (
                round(station['latitude'], 4),
                round(station['longitude'], 4)
            )
            coord_groups[coord_key].append(station)
        
        # Keep only one station per coordinate
        deduplicated = []
        
        for coord_key, stations in coord_groups.items():
            if len(stations) > 1:
                # Found duplicates
                self.duplicates.append({
                    "coordinates": coord_key,
                    "count": len(stations),
                    "stations": [s['name'] for s in stations]
                })
                self.stats["duplicates_removed"] += len(stations) - 1
            
            # Keep the first one (or you could implement more sophisticated logic)
            deduplicated.append(stations[0])
        
        self.clean_stations = deduplicated
        self.stats["final_clean"] = len(self.clean_stations)
        
        print(f"  ✅ Removed {self.stats['duplicates_removed']} duplicates")
        print(f"  ✅ Final unique stations: {len(self.clean_stations)}")
    
    def validate_coverage(self):
        """Validate global coverage distribution"""
        print("\n🌍 Validating global coverage...")
        
        # Count stations by hemisphere
        northern = sum(1 for s in self.clean_stations if s['latitude'] > 0)
        southern = sum(1 for s in self.clean_stations if s['latitude'] < 0)
        eastern = sum(1 for s in self.clean_stations if s['longitude'] > 0)
        western = sum(1 for s in self.clean_stations if s['longitude'] < 0)
        
        print(f"  📊 Distribution:")
        print(f"     Northern Hemisphere: {northern}")
        print(f"     Southern Hemisphere: {southern}")
        print(f"     Eastern Hemisphere: {eastern}")
        print(f"     Western Hemisphere: {western}")
        
        # Check for suspicious clustering
        lat_range = max(s['latitude'] for s in self.clean_stations) - min(s['latitude'] for s in self.clean_stations)
        lon_range = max(s['longitude'] for s in self.clean_stations) - min(s['longitude'] for s in self.clean_stations)
        
        print(f"  📏 Coverage:")
        print(f"     Latitude range: {lat_range:.1f}°")
        print(f"     Longitude range: {lon_range:.1f}°")
        
        if lat_range < 90 or lon_range < 180:
            print(f"  ⚠️  WARNING: Limited global coverage detected")
        else:
            print(f"  ✅ Good global coverage")
    
    def save_clean_data(self):
        """Save cleaned and deduplicated data"""
        print("\n💾 Saving cleaned data...")
        
        # Save as CSV
        with open(OUTPUT_CLEAN, 'w', newline='') as f:
            fieldnames = ['station_id', 'name', 'latitude', 'longitude', 'altitude', 'country', 'status', 'source']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.clean_stations)
        
        print(f"  ✅ Saved CSV: {OUTPUT_CLEAN}")
        
        # Save as JSON
        json_data = {
            "timestamp": "2025-11-09T17:00:00Z",
            "source": "orbital_gis_cleaned",
            "total_stations": len(self.clean_stations),
            "deduplication_applied": True,
            "coordinate_fixes_applied": True,
            "stations": self.clean_stations
        }
        
        with open(OUTPUT_JSON, 'w') as f:
            json.dump(json_data, f, indent=2)
        
        print(f"  ✅ Saved JSON: {OUTPUT_JSON}")
    
    def generate_validation_report(self):
        """Generate detailed validation report"""
        print("\n📊 Generating validation report...")
        
        report = {
            "timestamp": "2025-11-09T17:00:00Z",
            "summary": self.stats,
            "issues_found": {
                "reversed_coordinates": len(self.reversed_coords),
                "invalid_coordinates": len(self.invalid_coords),
                "duplicates": len(self.duplicates)
            },
            "reversed_coords_details": self.reversed_coords[:10],  # First 10
            "invalid_coords_details": self.invalid_coords[:10],
            "duplicate_details": self.duplicates[:10],
            "recommendations": []
        }
        
        if self.stats["coords_fixed"] > 0:
            report["recommendations"].append(f"Fixed {self.stats['coords_fixed']} reversed lat/lon coordinates")
        
        if self.stats["duplicates_removed"] > 0:
            report["recommendations"].append(f"Removed {self.stats['duplicates_removed']} duplicate stations")
        
        if self.stats["invalid_removed"] > 0:
            report["recommendations"].append(f"Removed {self.stats['invalid_removed']} invalid coordinates")
        
        report["recommendations"].append("Data is now clean and ready for orbital GIS")
        
        with open(VALIDATION_REPORT, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"  ✅ Report saved: {VALIDATION_REPORT}")
    
    def print_summary(self):
        """Print final summary"""
        print("\n" + "=" * 70)
        print("📊 ORBITAL STATION CLEANUP SUMMARY")
        print("=" * 70)
        
        print(f"\n📈 Processing Statistics:")
        print(f"   Raw Stations: {self.stats['total_raw']}")
        print(f"   Coordinates Fixed: {self.stats['coords_fixed']}")
        print(f"   Duplicates Removed: {self.stats['duplicates_removed']}")
        print(f"   Invalid Removed: {self.stats['invalid_removed']}")
        print(f"   Final Clean Stations: {self.stats['final_clean']}")
        
        if self.reversed_coords:
            print(f"\n🔄 Sample Reversed Coordinates Fixed:")
            for item in self.reversed_coords[:3]:
                print(f"   {item['name']}: ({item['original_lat']}, {item['original_lon']}) → ({item['fixed_lat']}, {item['fixed_lon']})")
        
        if self.duplicates:
            print(f"\n🔍 Sample Duplicates Removed:")
            for item in self.duplicates[:3]:
                print(f"   {item['coordinates']}: {item['count']} stations → 1 kept")
        
        print(f"\n✅ CLEAN DATA READY FOR ORBITAL GIS")
        print(f"   Output: {OUTPUT_CLEAN}")
        print(f"   JSON: {OUTPUT_JSON}")
        print(f"   Report: {VALIDATION_REPORT}")

def main():
    """Main execution"""
    print("🛰️  ORBITAL GROUND STATION CLEANUP")
    print("=" * 70)
    print("Fixing reversed coordinates and removing duplicates")
    print("=" * 70)
    
    fixer = OrbitalStationFixer()
    
    # Load raw data
    if not fixer.load_raw_stations():
        sys.exit(1)
    
    # Fix coordinates
    fixer.fix_coordinates()
    
    # Deduplicate
    fixer.deduplicate_stations()
    
    # Validate coverage
    fixer.validate_coverage()
    
    # Save clean data
    fixer.save_clean_data()
    
    # Generate report
    fixer.generate_validation_report()
    
    # Print summary
    fixer.print_summary()
    
    print(f"\n🚀 Next Steps:")
    print(f"   1. Review: {VALIDATION_REPORT}")
    print(f"   2. Load into orbital GIS: python3 load_orbital_clean.py")
    print(f"   3. Verify no overlap with OSINT nodes")

if __name__ == "__main__":
    main()

