import { test } from '@playwright/test';

test('Page Load Check', async ({ page }) => {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  console.log('\n📄 Loading page...\n');
  
  await page.goto('http://localhost:21575/');
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/page-load.png', 
    fullPage: true 
  });
  
  console.log('\n📸 Screenshot saved');
  console.log('\n❌ Errors:');
  if (errors.length === 0) {
    console.log('  No errors!');
  } else {
    errors.slice(0, 20).forEach(err => console.log(`  ${err}`));
  }
});

