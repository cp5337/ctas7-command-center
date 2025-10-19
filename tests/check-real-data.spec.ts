import { test, expect } from '@playwright/test';

test('Check if real Supabase data is loading', async ({ page }) => {
  console.log('\n🔍 Checking if Supabase data loads...\n');

  // Capture console logs
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('Loaded') || text.includes('ground') || text.includes('satellite') || text.includes('ERROR') || text.includes('Supabase')) {
      console.log('📋', text);
    }
  });

  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(3000);

  console.log('\n📍 Navigating to 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(8000);

  // Check for data loading messages
  const hasLoadingMessage = logs.some(log => 
    log.includes('Loaded') || 
    log.includes('ground_nodes') || 
    log.includes('satellites') ||
    log.includes('Using mock data')
  );

  console.log('\n📊 Data Loading Status:', hasLoadingMessage ? '✅ Found' : '❌ Not found');
  console.log('\n📋 Relevant console logs:');
  logs.filter(log => 
    log.includes('Loaded') || 
    log.includes('ground') || 
    log.includes('satellite') || 
    log.includes('mock') ||
    log.includes('Supabase') ||
    log.includes('ERROR')
  ).forEach(log => console.log('   ', log));

  // Check if Cesium viewer exists
  const cesiumExists = await page.evaluate(() => {
    return !!(window as any).cesiumViewer;
  });

  console.log('\n🌍 Cesium Viewer:', cesiumExists ? '✅ Initialized' : '❌ Not found');

  // Check for entities
  if (cesiumExists) {
    const entityCount = await page.evaluate(() => {
      const viewer = (window as any).cesiumViewer;
      let total = 0;
      viewer.dataSources.forEach((ds: any) => {
        total += ds.entities.values.length;
      });
      return total;
    });

    console.log('📍 Total entities:', entityCount);
  }

  // Take screenshot
  await page.screenshot({
    path: 'tests/screenshots/real-data-check.png',
    fullPage: true
  });

  console.log('\n📸 Screenshot saved to tests/screenshots/real-data-check.png\n');
});

