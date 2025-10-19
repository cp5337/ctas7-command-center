import { test, expect } from '@playwright/test';

test('Cesium Imagery Check', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push(`[${type}] ${text}`);
    
    if (type === 'error') errors.push(text);
    if (type === 'warning') warnings.push(text);
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  // Track network requests
  const failedRequests: string[] = [];
  const imageryRequests: string[] = [];
  
  page.on('requestfailed', request => {
    const url = request.url();
    failedRequests.push(`${request.method()} ${url}`);
  });
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('cesium') || url.includes('ion') || url.includes('tile') || url.includes('imagery')) {
      imageryRequests.push(`${request.method()} ${url}`);
    }
  });
  
  console.log('\n🌍 Checking Cesium Imagery Loading...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Navigating to 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(10000); // Wait longer for imagery to load
  
  // Check Cesium state
  const cesiumState = await page.evaluate(() => {
    const viewer = (window as any).viewer || (window as any).cesiumViewer;
    if (!viewer) return { viewerFound: false };
    
    return {
      viewerFound: true,
      hasGlobe: !!viewer.scene?.globe,
      globeShow: viewer.scene?.globe?.show,
      imageryLayersLength: viewer.scene?.imageryLayers?.length || 0,
      baseLayerShown: viewer.scene?.imageryLayers?.get(0)?.show,
      terrainProviderReady: viewer.scene?.globe?.terrainProvider?.ready,
      cameraPosition: {
        x: viewer.camera?.position?.x,
        y: viewer.camera?.position?.y,
        z: viewer.camera?.position?.z
      }
    };
  });
  
  console.log('\n🔍 Cesium State:', cesiumState);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/imagery-check.png', 
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved\n');
  
  // Print Cesium-related errors
  console.log('❌ Cesium Errors:');
  const cesiumErrors = errors.filter(e => 
    e.toLowerCase().includes('cesium') || 
    e.toLowerCase().includes('ion') ||
    e.toLowerCase().includes('imagery') ||
    e.toLowerCase().includes('tile')
  );
  if (cesiumErrors.length === 0) {
    console.log('  No Cesium-specific errors');
  } else {
    cesiumErrors.forEach(e => console.log(`  ${e}`));
  }
  
  // Print warnings
  console.log('\n⚠️  Cesium Warnings:');
  const cesiumWarnings = warnings.filter(w => 
    w.toLowerCase().includes('cesium') || 
    w.toLowerCase().includes('ion') ||
    w.toLowerCase().includes('token')
  );
  if (cesiumWarnings.length === 0) {
    console.log('  No Cesium-specific warnings');
  } else {
    cesiumWarnings.slice(0, 5).forEach(w => console.log(`  ${w}`));
  }
  
  // Print failed requests
  console.log('\n🚫 Failed Requests:');
  if (failedRequests.length === 0) {
    console.log('  No failed requests');
  } else {
    failedRequests.slice(0, 10).forEach(r => console.log(`  ${r}`));
  }
  
  // Print imagery requests
  console.log('\n🖼️  Imagery Requests (first 10):');
  if (imageryRequests.length === 0) {
    console.log('  No imagery requests detected');
  } else {
    imageryRequests.slice(0, 10).forEach(r => console.log(`  ${r}`));
  }
});

