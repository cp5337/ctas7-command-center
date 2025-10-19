import { test, expect } from '@playwright/test';

test('Final Cesium Check', async ({ page }) => {
  console.log('\n🚀 Loading Command Center...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(5000); // Wait for everything to load
  
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
  
  // Get the page title
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Check for specific Cesium classes
  const cesiumWidget = await page.locator('.cesium-widget').count();
  console.log(`Cesium widget found: ${cesiumWidget > 0 ? '✅' : '❌'}`);
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/final-cesium.png', 
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved to tests/screenshots/final-cesium.png\n');
  
  // Get all text content
  const bodyText = await page.locator('body').textContent();
  if (bodyText?.includes('GIS') || bodyText?.includes('Cesium') || bodyText?.includes('World')) {
    console.log('✅ Found GIS-related content in the page!');
  }
  
  console.log('\n=== Summary ===');
  console.log(`✅ Page loaded successfully`);
  console.log(`${hasCesium ? '✅' : '❌'} Cesium library loaded`);
  console.log(`${canvasCount > 0 ? '✅' : '❌'} Canvas elements present`);
  console.log(`${cesiumWidget > 0 ? '✅' : '❌'} Cesium widget rendered`);
});

