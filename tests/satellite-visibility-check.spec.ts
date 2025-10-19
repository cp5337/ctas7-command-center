import { test, expect } from '@playwright/test';

test('Satellite Visibility Check', async ({ page }) => {
  console.log('\n🛰️  Checking Satellite Visibility...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Navigating to 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(8000); // Wait for data to load
  
  // Check Cesium viewer and entities
  const satelliteCheck = await page.evaluate(() => {
    const viewer = (window as any).cesiumViewer;
    if (!viewer) return { viewerFound: false };
    
    // Get all data sources
    const dataSources = viewer.dataSources;
    let totalEntities = 0;
    let satelliteEntities = 0;
    let groundStationEntities = 0;
    let entitiesWithPosition = 0;
    
    for (let i = 0; i < dataSources.length; i++) {
      const ds = dataSources.get(i);
      const entities = ds.entities.values;
      
      for (let j = 0; j < entities.length; j++) {
        const entity = entities[j];
        totalEntities++;
        
        // Check if entity has position
        if (entity.position) {
          entitiesWithPosition++;
          
          // Try to get position value
          try {
            const pos = entity.position.getValue(viewer.clock.currentTime);
            if (pos) {
              // Check entity type
              const type = entity.properties?.type?.getValue();
              if (type === 'satellite') {
                satelliteEntities++;
              } else if (type === 'ground_station') {
                groundStationEntities++;
              }
            }
          } catch (e) {
            // Position might not be available at current time
          }
        }
      }
    }
    
    return {
      viewerFound: true,
      totalEntities,
      satelliteEntities,
      groundStationEntities,
      entitiesWithPosition,
      cameraHeight: viewer.camera.positionCartographic.height,
      globeVisible: viewer.scene.globe.show
    };
  });
  
  console.log('\n📊 Entity Count:');
  console.log(`  Total entities: ${satelliteCheck.totalEntities}`);
  console.log(`  Satellites: ${satelliteCheck.satelliteEntities}`);
  console.log(`  Ground stations: ${satelliteCheck.groundStationEntities}`);
  console.log(`  Entities with position: ${satelliteCheck.entitiesWithPosition}`);
  console.log(`\n🌍 Scene State:`);
  console.log(`  Globe visible: ${satelliteCheck.globeVisible ? '✅' : '❌'}`);
  console.log(`  Camera height: ${Math.round(satelliteCheck.cameraHeight / 1000)}km`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/satellite-visibility.png', 
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved to tests/screenshots/satellite-visibility.png\n');
  
  // Assertions
  expect(satelliteCheck.viewerFound).toBe(true);
  expect(satelliteCheck.totalEntities).toBeGreaterThan(0);
  expect(satelliteCheck.entitiesWithPosition).toBeGreaterThan(0);
});

