import { test, expect } from '@playwright/test';

test('Detailed GIS Check with Console', async ({ page }) => {
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
  
  console.log('\n🚀 Loading Command Center...\n');
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Clicking on 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(5000); // Give Cesium more time
  
  // Get the GIS viewer div content
  const gisContent = await page.locator('.h-\\[calc\\(100\\%-4rem\\)\\]').innerHTML();
  console.log('\n📦 GIS Viewer Container HTML:');
  console.log(gisContent.substring(0, 500));
  
  // Check what components are rendered
  const componentCheck = await page.evaluate(() => {
    const root = document.querySelector('#root');
    return {
      hasRoot: !!root,
      rootChildren: root?.children.length || 0,
      bodyHTML: document.body.innerHTML.substring(0, 1000)
    };
  });
  
  console.log('\n🔍 Component Check:');
  console.log(`  Root exists: ${componentCheck.hasRoot}`);
  console.log(`  Root children: ${componentCheck.rootChildren}`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/detailed-gis.png', 
    fullPage: true 
  });
  
  console.log('\n📋 Console Messages (last 20):');
  consoleMessages.slice(-20).forEach(msg => console.log(`  ${msg}`));
  
  console.log('\n❌ Errors:');
  if (errors.length === 0) {
    console.log('  No errors!');
  } else {
    errors.forEach(err => console.log(`  ${err}`));
  }
});

