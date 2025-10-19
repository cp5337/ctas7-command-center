import { test, expect } from '@playwright/test';

test('Detailed Graphics Check', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  console.log('\n🚀 Loading Command Center and checking graphics...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Clicking on 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(8000); // Give Cesium more time to fully load
  
  // Check for Cesium viewer
  const cesiumViewer = await page.locator('.cesium-viewer').count();
  console.log(`\n🌍 Cesium viewer found: ${cesiumViewer > 0 ? '✅' : '❌'}`);
  
  // Check for Cesium widget
  const cesiumWidget = await page.locator('.cesium-widget').count();
  console.log(`🎨 Cesium widget found: ${cesiumWidget > 0 ? '✅' : '❌'}`);
  
  // Check for canvas
  const canvas = await page.locator('canvas').count();
  console.log(`🖼️  Canvas elements: ${canvas}`);
  
  // Check canvas size
  if (canvas > 0) {
    const canvasSize = await page.locator('canvas').first().evaluate(el => ({
      width: el.width,
      height: el.height,
      style: el.style.cssText
    }));
    console.log(`📐 Canvas size: ${canvasSize.width}x${canvasSize.height}`);
    console.log(`🎭 Canvas style: ${canvasSize.style || 'none'}`);
  }
  
  // Check for Cesium credit container
  const credits = await page.locator('.cesium-credit-logoContainer').count();
  console.log(`©️  Cesium credits: ${credits > 0 ? '✅' : '❌'}`);
  
  // Check for Cesium toolbar
  const toolbar = await page.locator('.cesium-viewer-toolbar').count();
  console.log(`🔧 Cesium toolbar: ${toolbar > 0 ? '✅' : '❌'}`);
  
  // Check if globe is rendering
  const globeCheck = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { hasCanvas: false };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return { hasCanvas: true, hasContext: false };
    
    // Check if canvas has any pixels drawn (not all black/transparent)
    try {
      const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
      const data = imageData.data;
      let hasColor = false;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 0 || data[i+1] > 0 || data[i+2] > 0) {
          hasColor = true;
          break;
        }
      }
      return { hasCanvas: true, hasContext: true, hasColor };
    } catch (e) {
      return { hasCanvas: true, hasContext: true, error: 'Cannot read canvas (WebGL)' };
    }
  });
  
  console.log(`\n🎨 Globe rendering check:`, globeCheck);
  
  // Check for left/right panels
  const leftPanel = await page.locator('text=World Selection').count();
  const rightPanel = await page.locator('text=Layers').count();
  console.log(`\n📱 Left panel (World Selection): ${leftPanel > 0 ? '✅' : '❌'}`);
  console.log(`📱 Right panel (Layers): ${rightPanel > 0 ? '✅' : '❌'}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/graphics-check.png', 
    fullPage: true 
  });
  console.log('\n📸 Screenshot saved to tests/screenshots/graphics-check.png\n');
  
  // Print errors
  console.log('\n❌ Errors:');
  if (errors.length === 0) {
    console.log('  No errors!');
  } else {
    errors.slice(0, 10).forEach(err => console.log(`  ${err}`));
  }
  
  // Print relevant console messages
  console.log('\n📋 Relevant Console Messages:');
  const relevantMessages = consoleMessages.filter(msg => 
    msg.includes('Cesium') || 
    msg.includes('globe') || 
    msg.includes('WebGL') ||
    msg.includes('canvas') ||
    msg.includes('token')
  );
  relevantMessages.slice(0, 15).forEach(msg => console.log(`  ${msg}`));
});

