import { test, expect } from '@playwright/test';

test.describe('Cesium Integration', () => {
  test('should load the command center and check for errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error);
    });

    // Navigate to the command center
    await page.goto('http://localhost:21575/', { waitUntil: 'networkidle' });

    // Wait a bit for the app to load
    await page.waitForTimeout(3000);

    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/command-center.png', fullPage: true });

    // Check for errors
    console.log('\n=== Console Errors ===');
    errors.forEach(err => console.log(err));

    console.log('\n=== Page Errors ===');
    pageErrors.forEach(err => console.log(err.message));

    // Get the page content
    const content = await page.content();
    console.log('\n=== Page loaded successfully ===');

    // Check if Cesium is present
    const cesiumContainer = await page.locator('[class*="cesium"]').count();
    console.log(`Cesium containers found: ${cesiumContainer}`);

    // Get all error messages from the page
    const errorOverlay = await page.locator('[class*="error"]').count();
    console.log(`Error overlays found: ${errorOverlay}`);

    if (errorOverlay > 0) {
      const errorText = await page.locator('[class*="error"]').first().textContent();
      console.log('\n=== Error Overlay Text ===');
      console.log(errorText);
    }
  });

  test('should check network requests', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('http://localhost:21575/');
    await page.waitForTimeout(2000);

    console.log('\n=== Failed Network Requests ===');
    failedRequests.forEach(req => console.log(req));
  });

  test('should list all imported modules', async ({ page }) => {
    await page.goto('http://localhost:21575/');
    
    // Get all script tags
    const scripts = await page.locator('script[type="module"]').evaluateAll(scripts => {
      return scripts.map(s => s.getAttribute('src')).filter(Boolean);
    });

    console.log('\n=== Module Scripts ===');
    scripts.forEach(script => console.log(script));
  });
});

