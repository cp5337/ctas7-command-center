import { test, expect } from '@playwright/test';

test.describe('GIS Systems Comparison', () => {
  test('Command Center GIS (port 21575) - Check rendering', async ({ page }) => {
    console.log('🔍 Testing Command Center GIS on port 21575...');
    
    await page.goto('http://localhost:21575');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/command-center-homepage.png', fullPage: true });
    console.log('📸 Screenshot saved: command-center-homepage.png');
    
    // Check for GIS tab
    const gisTab = page.locator('text=/GIS|3D Satellites|Satellite/i').first();
    if (await gisTab.isVisible()) {
      console.log('✅ Found GIS tab, clicking...');
      await gisTab.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot of GIS view
      await page.screenshot({ path: 'test-results/command-center-gis.png', fullPage: true });
      console.log('📸 Screenshot saved: command-center-gis.png');
      
      // Check for Cesium canvas
      const cesiumCanvas = page.locator('canvas.cesium-widget');
      const canvasExists = await cesiumCanvas.count() > 0;
      console.log(`🎨 Cesium canvas found: ${canvasExists}`);
      
      // Check for ground stations
      const groundStations = await page.evaluate(() => {
        const viewer = (window as any).cesiumViewer;
        if (viewer && viewer.entities) {
          return viewer.entities.values.filter((e: any) => 
            e.name && e.name.includes('Ground')
          ).length;
        }
        return 0;
      });
      console.log(`🌍 Ground stations visible: ${groundStations}`);
      
      // Check for satellites
      const satellites = await page.evaluate(() => {
        const viewer = (window as any).cesiumViewer;
        if (viewer && viewer.entities) {
          return viewer.entities.values.filter((e: any) => 
            e.name && (e.name.includes('Sat') || e.name.includes('LEO'))
          ).length;
        }
        return 0;
      });
      console.log(`🛰️ Satellites visible: ${satellites}`);
      
      // Check for panels
      const leftPanel = await page.locator('[class*="left"]').count();
      const rightPanel = await page.locator('[class*="right"]').count();
      console.log(`📊 Left panels: ${leftPanel}, Right panels: ${rightPanel}`);
      
    } else {
      console.log('❌ No GIS tab found');
    }
    
    // Get all console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    console.log('\n📋 Console messages:', consoleLogs.slice(-10));
  });

  test('Main Ops Platform (port 15173) - Check rendering', async ({ page }) => {
    console.log('\n🔍 Testing Main Ops Platform on port 15173...');
    
    await page.goto('http://localhost:15173');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/main-ops-homepage.png', fullPage: true });
    console.log('📸 Screenshot saved: main-ops-homepage.png');
    
    // Check for HFT Dashboard
    const hftLink = page.locator('text=/HFT|High.Frequency/i').first();
    if (await hftLink.isVisible()) {
      console.log('✅ Found HFT link, clicking...');
      await hftLink.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot of HFT view
      await page.screenshot({ path: 'test-results/main-ops-hft.png', fullPage: true });
      console.log('📸 Screenshot saved: main-ops-hft.png');
      
      // Check for Cesium
      const cesiumCanvas = page.locator('canvas.cesium-widget');
      const canvasExists = await cesiumCanvas.count() > 0;
      console.log(`🎨 Cesium canvas found: ${canvasExists}`);
      
      // Check for ground stations count
      const stationCount = await page.locator('text=/257|259|289/').count();
      console.log(`🌍 Station count indicators: ${stationCount}`);
      
    } else {
      console.log('⚠️ No HFT link found, checking for Map...');
      
      const mapLink = page.locator('text=/Map|GIS/i').first();
      if (await mapLink.isVisible()) {
        await mapLink.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/main-ops-map.png', fullPage: true });
        console.log('📸 Screenshot saved: main-ops-map.png');
      }
    }
    
    // Check sidebar for available options
    const sidebarLinks = await page.locator('nav a, aside a').allTextContents();
    console.log('📋 Available navigation:', sidebarLinks.slice(0, 20));
  });

  test('Compare both systems side-by-side', async ({ page }) => {
    console.log('\n🔍 Comparing both GIS systems...');
    
    // Command Center
    await page.goto('http://localhost:21575');
    await page.waitForTimeout(2000);
    const commandCenterTitle = await page.title();
    const commandCenterHTML = await page.content();
    const hasCommandCenterCesium = commandCenterHTML.includes('cesium') || commandCenterHTML.includes('Cesium');
    
    console.log(`\n📊 Command Center (21575):`);
    console.log(`   Title: ${commandCenterTitle}`);
    console.log(`   Has Cesium: ${hasCommandCenterCesium}`);
    console.log(`   HTML length: ${commandCenterHTML.length} chars`);
    
    // Main Ops
    await page.goto('http://localhost:15173');
    await page.waitForTimeout(2000);
    const mainOpsTitle = await page.title();
    const mainOpsHTML = await page.content();
    const hasMainOpsCesium = mainOpsHTML.includes('cesium') || mainOpsHTML.includes('Cesium');
    
    console.log(`\n📊 Main Ops Platform (15173):`);
    console.log(`   Title: ${mainOpsTitle}`);
    console.log(`   Has Cesium: ${hasMainOpsCesium}`);
    console.log(`   HTML length: ${mainOpsHTML.length} chars`);
    
    console.log('\n✅ Comparison complete!');
  });
});

