import { test, expect } from '@playwright/test';

test('Data Loading Check', async ({ page }) => {
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
  });
  
  console.log('\n📦 Checking Data Loading...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Navigating to 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(10000); // Wait longer for data to load
  
  // Print all console logs
  console.log('\n📋 Console Logs:');
  consoleLogs.forEach(log => {
    if (log.includes('Loaded data') || 
        log.includes('Loading') || 
        log.includes('Cesium') ||
        log.includes('satellite') ||
        log.includes('ground') ||
        log.includes('Failed')) {
      console.log(`  ${log}`);
    }
  });
  
  // Print errors
  console.log('\n❌ Errors:');
  if (errors.length === 0) {
    console.log('  No errors!');
  } else {
    errors.forEach(err => console.log(`  ${err}`));
  }
  
  // Check if data was loaded
  const dataCheck = await page.evaluate(() => {
    const viewer = (window as any).cesiumViewer;
    if (!viewer) return { viewerFound: false };
    
    return {
      viewerFound: true,
      dataSourceCount: viewer.dataSources.length,
      clockTime: viewer.clock.currentTime.toString()
    };
  });
  
  console.log('\n🔍 Viewer State:');
  console.log(`  Data sources: ${dataCheck.dataSourceCount}`);
  console.log(`  Clock time: ${dataCheck.clockTime}`);
});

