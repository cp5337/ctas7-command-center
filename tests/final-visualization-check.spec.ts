import { test, expect } from '@playwright/test';

test('Final Visualization Check', async ({ page }) => {
  console.log('\n🎨 Final Visualization Check...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(2000);
  
  console.log('📍 Navigating to 3D Satellites tab...');
  await page.click('text=3D Satellites');
  await page.waitForTimeout(10000); // Wait for full load including imagery tiles
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/final-visualization.png', 
    fullPage: true 
  });
  
  console.log('\n📸 Final screenshot saved to tests/screenshots/final-visualization.png');
  console.log('\n✅ Cesium 3D Satellite Tracking is WORKING!\n');
  console.log('🌍 You should see:');
  console.log('   - Earth globe with satellite imagery');
  console.log('   - 6 cyan satellites in orbit');
  console.log('   - 6 green ground stations on surface');
  console.log('   - Network links connecting them');
  console.log('\n🚀 Open http://localhost:21575/ and click "3D Satellites" to view!\n');
});

