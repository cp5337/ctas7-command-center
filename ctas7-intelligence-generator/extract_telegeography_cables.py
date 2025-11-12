#!/usr/bin/env python3
"""
TeleGeography Submarine Cable Map 2025 - Data Extraction
Extracts submarine cable routes, landing points, and metadata
Source: https://submarine-cable-map-2025.telegeography.com/

Extraction Methods:
1. API endpoints (if available)
2. GeoJSON/KML export
3. Playwright browser automation (fallback)
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from datetime import datetime

# Configuration
TELEGEOGRAPHY_BASE = "https://submarine-cable-map-2025.telegeography.com"
TELEGEOGRAPHY_API = "https://www.submarinecablemap.com/api/v3"
OUTPUT_DIR = Path("telegeography_data")
CACHE_FILE = OUTPUT_DIR / "cables_cache.json"

class TeleGeographyExtractor:
    def __init__(self):
        self.cables = []
        self.landing_points = []
        self.stats = {
            "cables_found": 0,
            "landing_points_found": 0,
            "total_length_km": 0
        }
        OUTPUT_DIR.mkdir(exist_ok=True)
    
    def extract_via_api(self):
        """Extract data via TeleGeography API (primary method)"""
        print("📡 Extracting via TeleGeography API...")
        
        # API endpoints we already successfully used
        endpoints = {
            "cables": f"{TELEGEOGRAPHY_API}/cable/cable-geo.json",
            "landing_points": f"{TELEGEOGRAPHY_API}/landing-point/landing-point-geo.json"
        }
        
        headers = {
            'User-Agent': 'CTAS-7-Intelligence-System/7.3.1 (Submarine Cable Analysis)',
            'Accept': 'application/json'
        }
        
        # Extract cables
        try:
            print("  📦 Fetching submarine cables...")
            response = requests.get(endpoints["cables"], headers=headers, timeout=30)
            response.raise_for_status()
            
            cables_data = response.json()
            self.cables = cables_data.get('features', [])
            self.stats["cables_found"] = len(self.cables)
            
            print(f"  ✅ Found {len(self.cables)} submarine cables")
            
            # Save raw cable data
            with open(OUTPUT_DIR / "cables_raw.json", 'w') as f:
                json.dump(cables_data, f, indent=2)
            
        except Exception as e:
            print(f"  ❌ Failed to fetch cables: {e}")
        
        # Extract landing points
        try:
            print("  📦 Fetching landing points...")
            response = requests.get(endpoints["landing_points"], headers=headers, timeout=30)
            response.raise_for_status()
            
            landing_data = response.json()
            self.landing_points = landing_data.get('features', [])
            self.stats["landing_points_found"] = len(self.landing_points)
            
            print(f"  ✅ Found {len(self.landing_points)} landing points")
            
            # Save raw landing point data
            with open(OUTPUT_DIR / "landing_points_raw.json", 'w') as f:
                json.dump(landing_data, f, indent=2)
            
        except Exception as e:
            print(f"  ❌ Failed to fetch landing points: {e}")
    
    def process_cable_data(self):
        """Process and enrich cable data"""
        print("\n🔧 Processing cable data...")
        
        processed_cables = []
        
        for cable in self.cables:
            props = cable.get('properties', {})
            geom = cable.get('geometry', {})
            
            # Extract key information
            cable_info = {
                "cable_id": props.get('id', ''),
                "name": props.get('name', 'Unknown'),
                "length_km": props.get('length', 0),
                "ready_for_service": props.get('rfs', 'Unknown'),
                "owners": props.get('owners', []),
                "url": props.get('url', ''),
                "coordinates": geom.get('coordinates', []),
                "geometry_type": geom.get('type', ''),
                "color": props.get('color', ''),
                "feature_id": props.get('feature_id', '')
            }
            
            processed_cables.append(cable_info)
            
            # Update stats
            if cable_info['length_km']:
                self.stats["total_length_km"] += cable_info['length_km']
        
        # Save processed data
        with open(OUTPUT_DIR / "cables_processed.json", 'w') as f:
            json.dump(processed_cables, f, indent=2)
        
        print(f"  ✅ Processed {len(processed_cables)} cables")
        print(f"  📏 Total cable length: {self.stats['total_length_km']:,.0f} km")
    
    def process_landing_points(self):
        """Process and enrich landing point data"""
        print("\n🔧 Processing landing points...")
        
        processed_points = []
        
        for point in self.landing_points:
            props = point.get('properties', {})
            geom = point.get('geometry', {})
            coords = geom.get('coordinates', [0, 0])
            
            # Extract key information
            point_info = {
                "landing_point_id": props.get('id', ''),
                "name": props.get('name', 'Unknown'),
                "latitude": coords[1] if len(coords) > 1 else 0,
                "longitude": coords[0] if len(coords) > 0 else 0,
                "country": props.get('country', 'Unknown'),
                "cables": props.get('cables', []),
                "cable_count": len(props.get('cables', [])),
                "url": props.get('url', ''),
                "feature_id": props.get('feature_id', '')
            }
            
            processed_points.append(point_info)
        
        # Save processed data
        with open(OUTPUT_DIR / "landing_points_processed.json", 'w') as f:
            json.dump(processed_points, f, indent=2)
        
        print(f"  ✅ Processed {len(processed_points)} landing points")
    
    def create_osint_integration(self):
        """Create integration file for OSINT intelligence nodes"""
        print("\n🕵️  Creating OSINT integration...")
        
        # Convert landing points to OSINT nodes
        osint_nodes = []
        
        for point in self.landing_points:
            props = point.get('properties', {})
            geom = point.get('geometry', {})
            coords = geom.get('coordinates', [0, 0])
            
            node = {
                "node_id": f"CABLE-{props.get('id', len(osint_nodes))}",
                "name": props.get('name', 'Unknown'),
                "type": "submarine_cable_landing",
                "latitude": coords[1] if len(coords) > 1 else 0,
                "longitude": coords[0] if len(coords) > 0 else 0,
                "country": props.get('country', 'Unknown'),
                "capabilities": [
                    "submarine_cable_monitoring",
                    "network_traffic_analysis",
                    "fiber_optic_tap_detection",
                    "international_data_flow_tracking"
                ],
                "connected_cables": props.get('cables', []),
                "strategic_value": "critical" if len(props.get('cables', [])) > 3 else "high",
                "database": "osint_surrealdb",
                "source": "telegeography_2025"
            }
            
            osint_nodes.append(node)
        
        # Save OSINT integration
        osint_data = {
            "timestamp": datetime.now().isoformat(),
            "source": "TeleGeography Submarine Cable Map 2025",
            "url": "https://submarine-cable-map-2025.telegeography.com/",
            "total_nodes": len(osint_nodes),
            "node_type": "submarine_cable_landing",
            "database": "osint_surrealdb",
            "nodes": osint_nodes
        }
        
        with open(OUTPUT_DIR / "osint_cable_nodes.json", 'w') as f:
            json.dump(osint_data, f, indent=2)
        
        print(f"  ✅ Created {len(osint_nodes)} OSINT cable landing nodes")
    
    def create_kml_export(self):
        """Create KML file for GIS integration"""
        print("\n🗺️  Creating KML export...")
        
        kml_header = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Submarine Cable Landing Points 2025</name>
  <description>TeleGeography Submarine Cable Map Data</description>
"""
        
        kml_footer = """</Document>
</kml>"""
        
        placemarks = []
        
        for point in self.landing_points:
            props = point.get('properties', {})
            geom = point.get('geometry', {})
            coords = geom.get('coordinates', [0, 0])
            
            name = props.get('name', 'Unknown')
            country = props.get('country', 'Unknown')
            cable_count = len(props.get('cables', []))
            
            placemark = f"""  <Placemark>
    <name>{name}</name>
    <description>Country: {country}, Cables: {cable_count}</description>
    <Point>
      <coordinates>{coords[0]},{coords[1]},0</coordinates>
    </Point>
  </Placemark>
"""
            placemarks.append(placemark)
        
        kml_content = kml_header + ''.join(placemarks) + kml_footer
        
        with open(OUTPUT_DIR / "submarine_cable_landing_points_2025.kml", 'w') as f:
            f.write(kml_content)
        
        print(f"  ✅ Created KML file with {len(placemarks)} placemarks")
    
    def generate_analytics(self):
        """Generate analytics and insights"""
        print("\n📊 Generating analytics...")
        
        # Cable statistics
        cable_stats = {
            "total_cables": len(self.cables),
            "total_length_km": self.stats["total_length_km"],
            "average_length_km": self.stats["total_length_km"] / len(self.cables) if self.cables else 0
        }
        
        # Landing point statistics
        landing_stats = {
            "total_landing_points": len(self.landing_points),
            "countries": len(set(p.get('properties', {}).get('country', '') for p in self.landing_points)),
            "major_hubs": []  # Points with 5+ cables
        }
        
        # Find major hubs
        for point in self.landing_points:
            props = point.get('properties', {})
            cable_count = len(props.get('cables', []))
            if cable_count >= 5:
                landing_stats["major_hubs"].append({
                    "name": props.get('name', 'Unknown'),
                    "country": props.get('country', 'Unknown'),
                    "cable_count": cable_count
                })
        
        analytics = {
            "timestamp": datetime.now().isoformat(),
            "source": "TeleGeography 2025",
            "cable_statistics": cable_stats,
            "landing_point_statistics": landing_stats
        }
        
        with open(OUTPUT_DIR / "analytics.json", 'w') as f:
            json.dump(analytics, f, indent=2)
        
        print(f"  ✅ Analytics generated")
        print(f"     Total cables: {cable_stats['total_cables']}")
        print(f"     Total length: {cable_stats['total_length_km']:,.0f} km")
        print(f"     Landing points: {landing_stats['total_landing_points']}")
        print(f"     Countries: {landing_stats['countries']}")
        print(f"     Major hubs: {len(landing_stats['major_hubs'])}")
    
    def print_summary(self):
        """Print extraction summary"""
        print("\n" + "=" * 70)
        print("📊 TELEGEOGRAPHY EXTRACTION SUMMARY")
        print("=" * 70)
        
        print(f"\n✅ Data Extracted:")
        print(f"   Submarine Cables: {self.stats['cables_found']}")
        print(f"   Landing Points: {self.stats['landing_points_found']}")
        print(f"   Total Cable Length: {self.stats['total_length_km']:,.0f} km")
        
        print(f"\n📁 Output Files:")
        print(f"   {OUTPUT_DIR}/cables_raw.json")
        print(f"   {OUTPUT_DIR}/cables_processed.json")
        print(f"   {OUTPUT_DIR}/landing_points_raw.json")
        print(f"   {OUTPUT_DIR}/landing_points_processed.json")
        print(f"   {OUTPUT_DIR}/osint_cable_nodes.json")
        print(f"   {OUTPUT_DIR}/submarine_cable_landing_points_2025.kml")
        print(f"   {OUTPUT_DIR}/analytics.json")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Review extracted data in {OUTPUT_DIR}/")
        print(f"   2. Integrate with OSINT nodes: python3 merge_cable_osint.py")
        print(f"   3. Load into SurrealDB: python3 load_cables_surrealdb.py")
        print(f"   4. Visualize on CTAS Main Ops: http://localhost:15174")

def main():
    """Main execution"""
    print("🌊 TELEGEOGRAPHY SUBMARINE CABLE MAP 2025 - DATA EXTRACTION")
    print("=" * 70)
    print("Source: https://submarine-cable-map-2025.telegeography.com/")
    print("=" * 70)
    
    extractor = TeleGeographyExtractor()
    
    # Extract via API
    extractor.extract_via_api()
    
    if not extractor.cables and not extractor.landing_points:
        print("\n❌ No data extracted. Check network connection or API availability.")
        sys.exit(1)
    
    # Process data
    if extractor.cables:
        extractor.process_cable_data()
    
    if extractor.landing_points:
        extractor.process_landing_points()
        extractor.create_osint_integration()
        extractor.create_kml_export()
    
    # Generate analytics
    extractor.generate_analytics()
    
    # Print summary
    extractor.print_summary()

if __name__ == "__main__":
    main()

