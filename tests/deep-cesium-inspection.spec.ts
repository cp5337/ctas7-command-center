import { test, expect } from '@playwright/test';

test.describe('Deep Cesium Inspection', () => {
  test('Command Center - Deep dive into Cesium state', async ({ page }) => {
    console.log('🔍 Deep inspection of Command Center Cesium...\n');
    
    // Capture console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://localhost:21575');
    await page.waitForTimeout(2000);
    
    // Click GIS tab
    const gisTab = page.locator('text=/GIS|3D Satellites|Satellite/i').first();
    if (await gisTab.isVisible()) {
      await gisTab.click();
      await page.waitForTimeout(5000); // Wait longer for Cesium to load
      
      // Deep inspection
      const cesiumState = await page.evaluate(() => {
        const viewer = (window as any).cesiumViewer;
        const Cesium = (window as any).Cesium;
        
        return {
          viewerExists: !!viewer,
          cesiumLibraryLoaded: !!Cesium,
          canvasElements: document.querySelectorAll('canvas').length,
          cesiumWidgetCanvas: document.querySelectorAll('canvas.cesium-widget').length,
          allCanvasClasses: Array.from(document.querySelectorAll('canvas')).map((c: any) => c.className),
          containerDivs: document.querySelectorAll('[class*="cesium"]').length,
          entities: viewer ? viewer.entities.values.length : 0,
          dataSources: viewer ? viewer.dataSources.length : 0,
          scene: viewer ? {
            mode: viewer.scene.mode,
            globe: !!viewer.scene.globe,
            primitives: viewer.scene.primitives.length
          } : null,
          camera: viewer ? {
            position: viewer.camera.position,
            heading: viewer.camera.heading,
            pitch: viewer.camera.pitch
          } : null,
          errors: (window as any).cesiumErrors || []
        };
      });
      
      console.log('\n📊 Cesium State:');
      console.log(JSON.stringify(cesiumState, null, 2));
      
      // Check for data loading
      const dataState = await page.evaluate(() => {
        return {
          supabaseUrl: (window as any).VITE_SUPABASE_URL || 'not set',
          mockDataUsed: (window as any).usingMockData || false,
          groundNodesLoaded: (window as any).groundNodesCount || 0,
          satellitesLoaded: (window as any).satellitesCount || 0
        };
      });
      
      console.log('\n📊 Data State:');
      console.log(JSON.stringify(dataState, null, 2));
      
      // Take detailed screenshot
      await page.screenshot({ 
        path: 'test-results/command-center-cesium-deep.png', 
        fullPage: true 
      });
      
      console.log('\n📋 Recent console logs:');
      consoleLogs.slice(-20).forEach(log => console.log(log));
      
    } else {
      console.log('❌ GIS tab not found');
    }
  });

  test('Main Ops - Deep dive into HFT/Cesium state', async ({ page }) => {
    console.log('\n🔍 Deep inspection of Main Ops HFT/Cesium...\n');
    
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://localhost:15173');
    await page.waitForTimeout(2000);
    
    // Click HFT Dashboard
    const hftLink = page.locator('text=/HFT|High.Frequency/i').first();
    if (await hftLink.isVisible()) {
      await hftLink.click();
      await page.waitForTimeout(5000);
      
      const cesiumState = await page.evaluate(() => {
        const viewer = (window as any).cesiumViewer;
        const Cesium = (window as any).Cesium;
        
        return {
          viewerExists: !!viewer,
          cesiumLibraryLoaded: !!Cesium,
          canvasElements: document.querySelectorAll('canvas').length,
          cesiumWidgetCanvas: document.querySelectorAll('canvas.cesium-widget').length,
          allCanvasClasses: Array.from(document.querySelectorAll('canvas')).map((c: any) => c.className),
          containerDivs: document.querySelectorAll('[class*="cesium"]').length,
          hftDashboardVisible: !!document.querySelector('[class*="hft"]'),
          groundStationCards: document.querySelectorAll('[class*="station"]').length,
          entities: viewer ? viewer.entities.values.length : 0,
          errors: (window as any).cesiumErrors || []
        };
      });
      
      console.log('\n📊 Main Ops Cesium State:');
      console.log(JSON.stringify(cesiumState, null, 2));
      
      await page.screenshot({ 
        path: 'test-results/main-ops-hft-deep.png', 
        fullPage: true 
      });
      
      console.log('\n📋 Recent console logs:');
      consoleLogs.slice(-20).forEach(log => console.log(log));
      
    } else {
      console.log('❌ HFT link not found');
    }
  });
});

