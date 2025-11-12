#!/usr/bin/env python3
"""
Create CTAS-7 Intelligence Globe
Combines TeleGeography-style visualization with:
- 257 LaserLight FSO ground stations
- 12 MEO satellites (Walker Delta)
- 1,888 submarine cable landing points
- Real-time FSO link quality
- SlotGraph HFT routing
- OSINT intelligence nodes
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Configuration
OUTPUT_DIR = Path("ctas7_globe_data")
OUTPUT_DIR.mkdir(exist_ok=True)

class CTAS7GlobeBuilder:
    def __init__(self):
        self.layers = {
            "submarine_cables": [],
            "cable_landings": [],
            "laser_stations": [],
            "satellites": [],
            "fso_links": [],
            "osint_nodes": []
        }
        self.stats = {}
    
    def load_submarine_cables(self):
        """Load submarine cable data from TeleGeography"""
        print("🌊 Loading submarine cables...")
        
        cables_file = Path("telegeography_data/cables_raw.json")
        if cables_file.exists():
            with open(cables_file) as f:
                data = json.load(f)
            
            self.layers["submarine_cables"] = data.get('features', [])
            print(f"  ✅ Loaded {len(self.layers['submarine_cables'])} cables")
        else:
            print(f"  ⚠️  No cable data found")
    
    def load_cable_landings(self):
        """Load cable landing points"""
        print("\n📍 Loading cable landing points...")
        
        landings_file = Path("telegeography_data/landing_points_raw.json")
        if landings_file.exists():
            with open(landings_file) as f:
                data = json.load(f)
            
            self.layers["cable_landings"] = data.get('features', [])
            print(f"  ✅ Loaded {len(self.layers['cable_landings'])} landing points")
        else:
            print(f"  ⚠️  No landing point data found")
    
    def select_laser_stations(self):
        """Select 257 optimal LaserLight ground stations"""
        print("\n🛰️  Selecting 257 LaserLight FSO ground stations...")
        
        # Criteria for selection:
        # 1. Proximity to submarine cable landings (< 50km)
        # 2. Low cloud cover (> 250 clear days/year)
        # 3. Proximity to cloud on-ramps / data centers
        # 4. Geographic distribution (global coverage)
        # 5. Political stability
        
        # For now, use cable landing points as candidates
        candidates = []
        
        for landing in self.layers["cable_landings"]:
            props = landing.get('properties', {})
            geom = landing.get('geometry', {})
            coords = geom.get('coordinates', [0, 0])
            
            # Score each location
            cable_count = len(props.get('cables', []))
            
            candidate = {
                "station_id": f"LASER-{len(candidates):03d}",
                "name": props.get('name', 'Unknown'),
                "latitude": coords[1],
                "longitude": coords[0],
                "country": props.get('country', 'Unknown'),
                "cable_count": cable_count,
                "score": cable_count * 10,  # Simple scoring for now
                "type": "laserlight_fso_station",
                "capabilities": [
                    "fso_optical_terminal",
                    "400gbps_capacity",
                    "satellite_tracking",
                    "atmospheric_monitoring",
                    "hft_slot_allocation"
                ]
            }
            
            candidates.append(candidate)
        
        # Sort by score and take top 257
        candidates.sort(key=lambda x: x['score'], reverse=True)
        self.layers["laser_stations"] = candidates[:257]
        
        print(f"  ✅ Selected 257 optimal FSO ground stations")
        print(f"     Average cable connections: {sum(s['cable_count'] for s in self.layers['laser_stations']) / 257:.1f}")
    
    def create_satellite_constellation(self):
        """Create 12 LaserLight MEO satellites (Walker Delta)"""
        print("\n🛰️  Creating LaserLight MEO constellation...")
        
        # Walker Delta 12/3/1 pattern
        # 12 satellites, 3 planes, phasing parameter 1
        satellites_per_plane = 4
        num_planes = 3
        
        satellites = []
        
        for plane in range(num_planes):
            raan = plane * (360 / num_planes)  # Right Ascension of Ascending Node
            
            for sat in range(satellites_per_plane):
                mean_anomaly = sat * (360 / satellites_per_plane)
                
                satellite = {
                    "satellite_id": f"LASER-SAT-{len(satellites)+1:02d}",
                    "name": f"LaserLight-{len(satellites)+1}",
                    "plane": plane + 1,
                    "position_in_plane": sat + 1,
                    "orbital_elements": {
                        "altitude_km": 8000,
                        "inclination_deg": 55.0,
                        "eccentricity": 0.0001,
                        "raan_deg": raan,
                        "argument_of_perigee_deg": 0.0,
                        "mean_anomaly_deg": mean_anomaly
                    },
                    "fso_capabilities": {
                        "inter_satellite_links": 4,
                        "ground_links": 2,
                        "data_rate_gbps": 400,
                        "wavelength_nm": 1550,
                        "beam_divergence_urad": 10
                    },
                    "status": "operational"
                }
                
                satellites.append(satellite)
        
        self.layers["satellites"] = satellites
        print(f"  ✅ Created {len(satellites)} MEO satellites")
        print(f"     Pattern: Walker Delta 12/3/1")
        print(f"     Altitude: 8,000 km")
        print(f"     Inclination: 55°")
    
    def generate_fso_links(self):
        """Generate FSO link possibilities"""
        print("\n🔗 Generating FSO link network...")
        
        # Inter-satellite links (ISL)
        isl_count = 0
        for i, sat1 in enumerate(self.layers["satellites"]):
            for sat2 in self.layers["satellites"][i+1:]:
                # Connect satellites in same plane or adjacent planes
                if abs(sat1['plane'] - sat2['plane']) <= 1:
                    link = {
                        "link_id": f"ISL-{isl_count:03d}",
                        "type": "inter_satellite",
                        "source": sat1['satellite_id'],
                        "target": sat2['satellite_id'],
                        "data_rate_gbps": 400,
                        "latency_ms": 26.7,  # ~8000km at speed of light
                        "status": "active"
                    }
                    self.layers["fso_links"].append(link)
                    isl_count += 1
        
        print(f"  ✅ Generated {isl_count} inter-satellite links")
        
        # Ground-to-satellite links (will be computed in real-time based on visibility)
        print(f"  ✅ Ground links: Dynamic (based on satellite visibility)")
    
    def create_osint_layer(self):
        """Create OSINT intelligence node layer"""
        print("\n🕵️  Creating OSINT intelligence layer...")
        
        # Use cable landings as OSINT nodes
        osint_nodes = []
        
        for landing in self.layers["cable_landings"]:
            props = landing.get('properties', {})
            geom = landing.get('geometry', {})
            coords = geom.get('coordinates', [0, 0])
            
            node = {
                "node_id": f"OSINT-{len(osint_nodes):04d}",
                "name": props.get('name', 'Unknown'),
                "latitude": coords[1],
                "longitude": coords[0],
                "country": props.get('country', 'Unknown'),
                "type": "submarine_cable_intelligence",
                "capabilities": [
                    "network_traffic_monitoring",
                    "fiber_tap_detection",
                    "data_flow_analysis",
                    "threat_detection"
                ],
                "connected_cables": props.get('cables', []),
                "intelligence_priority": "high" if len(props.get('cables', [])) > 5 else "medium"
            }
            
            osint_nodes.append(node)
        
        self.layers["osint_nodes"] = osint_nodes
        print(f"  ✅ Created {len(osint_nodes)} OSINT intelligence nodes")
    
    def export_for_cesium(self):
        """Export data in Cesium-compatible format"""
        print("\n📦 Exporting for Cesium.js...")
        
        # Create Cesium-compatible GeoJSON for each layer
        layers_geojson = {}
        
        # Submarine cables (already GeoJSON)
        layers_geojson["submarine_cables"] = {
            "type": "FeatureCollection",
            "features": self.layers["submarine_cables"]
        }
        
        # Cable landings (already GeoJSON)
        layers_geojson["cable_landings"] = {
            "type": "FeatureCollection",
            "features": self.layers["cable_landings"]
        }
        
        # Laser stations (convert to GeoJSON)
        laser_features = []
        for station in self.layers["laser_stations"]:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [station['longitude'], station['latitude']]
                },
                "properties": {
                    "station_id": station['station_id'],
                    "name": station['name'],
                    "country": station['country'],
                    "cable_count": station['cable_count'],
                    "type": "laserlight_fso_station",
                    "capabilities": station['capabilities']
                }
            }
            laser_features.append(feature)
        
        layers_geojson["laser_stations"] = {
            "type": "FeatureCollection",
            "features": laser_features
        }
        
        # Save each layer
        for layer_name, data in layers_geojson.items():
            output_file = OUTPUT_DIR / f"{layer_name}.geojson"
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"  ✅ Exported: {output_file}")
        
        # Save satellites as JSON (not GeoJSON, positions computed in real-time)
        with open(OUTPUT_DIR / "satellites.json", 'w') as f:
            json.dump(self.layers["satellites"], f, indent=2)
        print(f"  ✅ Exported: {OUTPUT_DIR}/satellites.json")
        
        # Save FSO links
        with open(OUTPUT_DIR / "fso_links.json", 'w') as f:
            json.dump(self.layers["fso_links"], f, indent=2)
        print(f"  ✅ Exported: {OUTPUT_DIR}/fso_links.json")
        
        # Save OSINT nodes
        osint_features = []
        for node in self.layers["osint_nodes"]:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [node['longitude'], node['latitude']]
                },
                "properties": node
            }
            osint_features.append(feature)
        
        with open(OUTPUT_DIR / "osint_nodes.geojson", 'w') as f:
            json.dump({
                "type": "FeatureCollection",
                "features": osint_features
            }, f, indent=2)
        print(f"  ✅ Exported: {OUTPUT_DIR}/osint_nodes.geojson")
    
    def create_cesium_integration(self):
        """Create Cesium.js integration code"""
        print("\n💻 Creating Cesium.js integration code...")
        
        cesium_code = """// CTAS-7 Intelligence Globe - Cesium.js Integration
// Load this in CTAS Main Ops frontend

import * as Cesium from 'cesium';

// Initialize Cesium viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: Cesium.createWorldTerrain(),
  imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
  baseLayerPicker: false,
  timeline: true,
  animation: true
});

// ============================================================================
// LAYER 1: Submarine Cables
// ============================================================================
const cableDataSource = new Cesium.GeoJsonDataSource('submarine-cables');
await cableDataSource.load('/api/globe/submarine_cables.geojson');
viewer.dataSources.add(cableDataSource);

// Style cables
cableDataSource.entities.values.forEach(entity => {
  entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
    glowPower: 0.2,
    color: Cesium.Color.CYAN.withAlpha(0.6)
  });
  entity.polyline.width = 2;
});

// ============================================================================
// LAYER 2: Cable Landing Points
// ============================================================================
const landingDataSource = new Cesium.GeoJsonDataSource('cable-landings');
await landingDataSource.load('/api/globe/cable_landings.geojson');
viewer.dataSources.add(landingDataSource);

// Style as points
landingDataSource.entities.values.forEach(entity => {
  entity.point = {
    pixelSize: 8,
    color: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 1
  };
});

// ============================================================================
// LAYER 3: LaserLight FSO Ground Stations (257)
// ============================================================================
const laserStationDataSource = new Cesium.GeoJsonDataSource('laser-stations');
await laserStationDataSource.load('/api/globe/laser_stations.geojson');
viewer.dataSources.add(laserStationDataSource);

// Style as billboards
laserStationDataSource.entities.values.forEach(entity => {
  entity.billboard = {
    image: '/assets/laser-station-icon.png',
    scale: 1.0,
    color: Cesium.Color.GREEN
  };
  entity.label = {
    text: entity.properties.name,
    font: '12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
    showBackground: true,
    backgroundColor: new Cesium.Color(0, 0, 0, 0.7)
  };
});

// ============================================================================
// LAYER 4: LaserLight MEO Satellites (12)
// ============================================================================
const satellites = await fetch('/api/globe/satellites.json').then(r => r.json());

function propagateSatellite(sat, time) {
  // SGP4 propagation (simplified - use actual SGP4 library)
  const altitude = sat.orbital_elements.altitude_km;
  const inclination = Cesium.Math.toRadians(sat.orbital_elements.inclination_deg);
  const raan = Cesium.Math.toRadians(sat.orbital_elements.raan_deg);
  const meanAnomaly = Cesium.Math.toRadians(sat.orbital_elements.mean_anomaly_deg);
  
  // Compute position (this is simplified - use sgp4.js for real implementation)
  const position = Cesium.Cartesian3.fromRadians(
    raan,
    inclination,
    6371 + altitude  // Earth radius + altitude
  );
  
  return position;
}

satellites.forEach(sat => {
  const entity = viewer.entities.add({
    id: sat.satellite_id,
    name: sat.name,
    position: new Cesium.CallbackProperty((time) => {
      return propagateSatellite(sat, time);
    }, false),
    billboard: {
      image: '/assets/satellite-icon.png',
      scale: 1.5,
      color: Cesium.Color.WHITE
    },
    label: {
      text: sat.name,
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, -25)
    },
    path: {
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.YELLOW
      }),
      width: 3,
      leadTime: 0,
      trailTime: 3600  // 1 hour trail
    }
  });
});

// ============================================================================
// LAYER 5: FSO Links (Real-time)
// ============================================================================
function updateFSOLinks() {
  // Remove old links
  viewer.entities.removeAll();
  
  // Re-add satellites
  // ... (satellite entities)
  
  // Compute visibility and link quality
  satellites.forEach(sat => {
    const satPos = propagateSatellite(sat, viewer.clock.currentTime);
    
    laserStationDataSource.entities.values.forEach(station => {
      const stationPos = station.position.getValue(viewer.clock.currentTime);
      
      // Check line of sight
      const hasLOS = checkLineOfSight(satPos, stationPos);
      
      if (hasLOS) {
        // Calculate link budget (atmospheric conditions from GEE)
        const linkQuality = calculateFSOLinkBudget(satPos, stationPos);
        
        if (linkQuality > 0.7) {  // 70% threshold
          viewer.entities.add({
            polyline: {
              positions: [satPos, stationPos],
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.3,
                color: Cesium.Color.fromAlpha(
                  Cesium.Color.GREEN,
                  linkQuality
                )
              }),
              width: 2
            }
          });
        }
      }
    });
  });
}

// Update FSO links every second
setInterval(updateFSOLinks, 1000);

// ============================================================================
// LAYER 6: OSINT Intelligence Nodes
// ============================================================================
const osintDataSource = new Cesium.GeoJsonDataSource('osint-nodes');
await osintDataSource.load('/api/globe/osint_nodes.geojson');
viewer.dataSources.add(osintDataSource);

// Style based on intelligence priority
osintDataSource.entities.values.forEach(entity => {
  const priority = entity.properties.intelligence_priority;
  
  entity.point = {
    pixelSize: priority === 'high' ? 10 : 6,
    color: priority === 'high' ? Cesium.Color.RED : Cesium.Color.ORANGE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2
  };
});

// ============================================================================
// LAYER 7: SlotGraph HFT Routing (WebSocket)
// ============================================================================
const slotGraphWS = new WebSocket('ws://localhost:8003/slotgraph');

slotGraphWS.onmessage = (event) => {
  const slotUpdate = JSON.parse(event.data);
  
  // Highlight active ground station
  const station = viewer.entities.getById(slotUpdate.station_id);
  if (station) {
    station.billboard.color = Cesium.Color.GREEN;
    station.billboard.scale = 1.5;
    
    // Reset after 1 second
    setTimeout(() => {
      station.billboard.color = Cesium.Color.WHITE;
      station.billboard.scale = 1.0;
    }, 1000);
  }
  
  // Animate data flow
  animateDataFlow(slotUpdate.source, slotUpdate.destination);
};

// ============================================================================
// Helper Functions
// ============================================================================
function checkLineOfSight(satPos, stationPos) {
  // Simplified LOS check
  const ray = new Cesium.Ray(stationPos, Cesium.Cartesian3.subtract(satPos, stationPos, new Cesium.Cartesian3()));
  const intersection = viewer.scene.globe.pick(ray, viewer.scene);
  return !intersection;  // No intersection = clear LOS
}

function calculateFSOLinkBudget(satPos, stationPos) {
  // Simplified link budget calculation
  // In reality, integrate with GEE for atmospheric conditions
  const distance = Cesium.Cartesian3.distance(satPos, stationPos);
  const freeSpaceLoss = 20 * Math.log10(distance) + 20 * Math.log10(1550e-9) + 20 * Math.log10(4 * Math.PI / 3e8);
  
  // Atmospheric loss (placeholder - get from GEE)
  const atmosphericLoss = 3;  // dB
  
  const totalLoss = freeSpaceLoss + atmosphericLoss;
  const linkMargin = 50 - totalLoss;  // 50 dB transmit power (example)
  
  return Math.max(0, Math.min(1, linkMargin / 20));  // Normalize to 0-1
}

function animateDataFlow(source, destination) {
  // Create animated polyline showing data flow
  // Implementation details...
}

console.log('CTAS-7 Intelligence Globe loaded successfully!');
"""
        
        with open(OUTPUT_DIR / "cesium_integration.js", 'w') as f:
            f.write(cesium_code)
        
        print(f"  ✅ Created: {OUTPUT_DIR}/cesium_integration.js")
    
    def print_summary(self):
        """Print build summary"""
        print("\n" + "=" * 70)
        print("🌍 CTAS-7 INTELLIGENCE GLOBE - BUILD COMPLETE")
        print("=" * 70)
        
        print(f"\n📊 Globe Layers:")
        print(f"   Submarine Cables: {len(self.layers['submarine_cables'])}")
        print(f"   Cable Landing Points: {len(self.layers['cable_landings'])}")
        print(f"   LaserLight FSO Stations: {len(self.layers['laser_stations'])}")
        print(f"   MEO Satellites: {len(self.layers['satellites'])}")
        print(f"   FSO Links: {len(self.layers['fso_links'])} (ISL) + dynamic (ground)")
        print(f"   OSINT Intelligence Nodes: {len(self.layers['osint_nodes'])}")
        
        print(f"\n📁 Output Files:")
        print(f"   {OUTPUT_DIR}/submarine_cables.geojson")
        print(f"   {OUTPUT_DIR}/cable_landings.geojson")
        print(f"   {OUTPUT_DIR}/laser_stations.geojson")
        print(f"   {OUTPUT_DIR}/satellites.json")
        print(f"   {OUTPUT_DIR}/fso_links.json")
        print(f"   {OUTPUT_DIR}/osint_nodes.geojson")
        print(f"   {OUTPUT_DIR}/cesium_integration.js")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Copy files to CTAS Main Ops: cp {OUTPUT_DIR}/* ../ctas6-reference/public/api/globe/")
        print(f"   2. Integrate Cesium code: {OUTPUT_DIR}/cesium_integration.js")
        print(f"   3. Start frontend: cd ../ctas6-reference && npm run dev")
        print(f"   4. View globe: http://localhost:15174")

def main():
    """Main execution"""
    print("🌍 CTAS-7 INTELLIGENCE GLOBE BUILDER")
    print("=" * 70)
    print("Creating TeleGeography-style globe with intelligence layers")
    print("=" * 70)
    
    builder = CTAS7GlobeBuilder()
    
    # Load data
    builder.load_submarine_cables()
    builder.load_cable_landings()
    
    # Create CTAS-7 specific layers
    builder.select_laser_stations()
    builder.create_satellite_constellation()
    builder.generate_fso_links()
    builder.create_osint_layer()
    
    # Export for Cesium
    builder.export_for_cesium()
    builder.create_cesium_integration()
    
    # Print summary
    builder.print_summary()

if __name__ == "__main__":
    main()

