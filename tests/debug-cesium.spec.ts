import { test, expect } from '@playwright/test';

test('Debug Cesium Integration', async ({ page }) => {
  // Collect all console messages
  const messages: string[] = [];
  page.on('console', msg => {
    messages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect page errors
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
  });

  // Collect failed requests
  const failedRequests: string[] = [];
  page.on('requestfailed', request => {
    failedRequests.push(`FAILED: ${request.method()} ${request.url()}`);
  });

  console.log('\n🚀 Navigating to http://localhost:21575/...\n');
  
  try {
    await page.goto('http://localhost:21575/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded\n');
    
    // Wait for React to mount
    await page.waitForTimeout(5000);
    
    // Check what's in the DOM
    const bodyText = await page.locator('body').textContent();
    console.log('=== Page Body Text ===');
    console.log(bodyText?.substring(0, 500));
    console.log('\n');
    
    // Check for specific elements
    const hasRoot = await page.locator('#root').count();
    console.log(`Root div found: ${hasRoot > 0 ? '✅' : '❌'}`);
    
    const hasGISViewer = await page.locator('text=GIS').count();
    console.log(`GIS text found: ${hasGISViewer}`);
    
    const hasCesium = await page.evaluate(() => {
      return typeof (window as any).Cesium !== 'undefined';
    });
    console.log(`Cesium global available: ${hasCesium ? '✅' : '❌'}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/debug-cesium.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to tests/screenshots/debug-cesium.png\n');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
  
  // Print all collected data
  console.log('\n=== Console Messages ===');
  messages.forEach(msg => console.log(msg));
  
  console.log('\n=== Page Errors ===');
  errors.forEach(err => console.log(err));
  
  console.log('\n=== Failed Requests ===');
  failedRequests.forEach(req => console.log(req));
});

