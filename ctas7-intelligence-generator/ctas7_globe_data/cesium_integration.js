// CTAS-7 Intelligence Globe - Cesium.js Integration
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
