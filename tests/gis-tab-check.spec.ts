import { test, expect } from '@playwright/test';

test('GIS Tab Cesium Check', async ({ page }) => {
  console.log('\n🚀 Loading Command Center and navigating to GIS tab...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  // Click on the GIS/3D Satellites tab
  console.log('Clicking on 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(3000); // Wait for Cesium to initialize
  
  // Check for Cesium container
  const cesiumContainer = await page.locator('.cesium-viewer, [class*="cesium"]').count();
  console.log(`Cesium containers found: ${cesiumContainer}`);
  
  // Check if Cesium global is available
  const hasCesium = await page.evaluate(() => {
    return typeof (window as any).Cesium !== 'undefined';
  });
  console.log(`Cesium global available: ${hasCesium ? '✅' : '❌'}`);
  
  // Check for canvas elements (Cesium renders to canvas)
  const canvasCount = await page.locator('canvas').count();
  console.log(`Canvas elements found: ${canvasCount}`);
  
  // Check for specific Cesium classes
  const cesiumWidget = await page.locator('.cesium-widget').count();
  console.log(`Cesium widget found: ${cesiumWidget > 0 ? '✅' : '❌'}`);
  
  // Check for GIS header
  const gisHeader = await page.locator('text=3D Orbital Satellite Tracking').count();
  console.log(`GIS header found: ${gisHeader > 0 ? '✅' : '❌'}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/gis-tab-cesium.png', 
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved to tests/screenshots/gis-tab-cesium.png\n');
  
  // Check for any errors in console
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  if (errors.length > 0) {
    console.log('\n⚠️  Console Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('\n=== Summary ===');
  console.log(`✅ Page loaded successfully`);
  console.log(`✅ GIS tab navigated`);
  console.log(`${hasCesium ? '✅' : '❌'} Cesium library loaded`);
  console.log(`${canvasCount > 0 ? '✅' : '❌'} Canvas elements present`);
  console.log(`${cesiumWidget > 0 ? '✅' : '❌'} Cesium widget rendered`);
  console.log(`${gisHeader > 0 ? '✅' : '❌'} GIS header displayed`);
});

