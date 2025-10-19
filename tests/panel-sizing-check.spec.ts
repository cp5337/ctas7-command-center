import { test, expect } from '@playwright/test';

test('Panel Sizing and Controls Check', async ({ page }) => {
  console.log('\n🎨 Checking panel sizing and controls...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Navigating to 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(5000);
  
  // Check for panels
  const panelCheck = await page.evaluate(() => {
    // Look for panel elements
    const leftPanel = document.querySelector('[class*="left"]') || 
                     document.querySelector('[class*="Left"]') ||
                     document.querySelector('[class*="panel"]');
    const rightPanel = document.querySelector('[class*="right"]') || 
                      document.querySelector('[class*="Right"]') ||
                      document.querySelector('[class*="layer"]');
    
    return {
      leftPanelFound: !!leftPanel,
      rightPanelFound: !!rightPanel,
      leftPanelClasses: leftPanel?.className || 'not found',
      rightPanelClasses: rightPanel?.className || 'not found',
      bodyWidth: document.body.clientWidth,
      bodyHeight: document.body.clientHeight
    };
  });
  
  console.log('\n📊 Panel Detection:');
  console.log(`  Left panel: ${panelCheck.leftPanelFound ? '✅' : '❌'}`);
  console.log(`  Right panel: ${panelCheck.rightPanelFound ? '✅' : '❌'}`);
  console.log(`  Viewport: ${panelCheck.bodyWidth}x${panelCheck.bodyHeight}`);
  console.log(`  Left classes: ${panelCheck.leftPanelClasses}`);
  console.log(`  Right classes: ${panelCheck.rightPanelClasses}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/panel-sizing.png', 
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved to tests/screenshots/panel-sizing.png\n');
  
  // Check for specific UI elements
  const uiElements = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const textContent = allElements.map(el => el.textContent?.trim()).filter(Boolean);
    
    return {
      hasWorldSelection: textContent.some(t => t?.includes('World')),
      hasLayers: textContent.some(t => t?.includes('Layer')),
      hasTimeControls: textContent.some(t => t?.includes('Time') || t?.includes('Play')),
      relevantText: textContent.filter(t => 
        t && (t.includes('Layer') || t.includes('World') || t.includes('Time') || 
              t.includes('Satellite') || t.includes('Ground') || t.includes('Orbit'))
      ).slice(0, 15)
    };
  });
  
  console.log('\n🎛️  UI Elements:');
  console.log(`  World Selection: ${uiElements.hasWorldSelection ? '✅' : '❌'}`);
  console.log(`  Layers: ${uiElements.hasLayers ? '✅' : '❌'}`);
  console.log(`  Time Controls: ${uiElements.hasTimeControls ? '✅' : '❌'}`);
  console.log(`  Found text: ${JSON.stringify(uiElements.allText, null, 2)}`);
});

