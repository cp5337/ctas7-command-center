import { chromium } from 'playwright';
import fs from 'fs';

async function analyzeScreens() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Set viewport for consistent screenshots
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to CTAS-7 Command Center...');
    await page.goto('http://localhost:25175');
    await page.waitForLoadState('networkidle');

    // Get all tabs
    const tabs = [
      'overview',
      'chat',
      'tasks',
      'metrics',
      'enterprise',
      'cyberops',
      'ontology',
      'crates',
      'tools'
    ];

    const screenAnalysis = [];

    for (const tab of tabs) {
      console.log(`\n=== Analyzing ${tab.toUpperCase()} Tab ===`);

      // Click the tab
      const tabButton = await page.locator(`button:has-text("${tab === 'tasks' ? 'DevOps' : tab.charAt(0).toUpperCase() + tab.slice(1)}")`).first();
      await tabButton.click();
      await page.waitForTimeout(1000); // Wait for content to load

      // Take screenshot
      const screenshotPath = `./screenshots/${tab}-screen.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Analyze screen content
      const content = await page.evaluate(() => {
        const mainContent = document.querySelector('main') || document.body;
        return {
          title: document.title,
          mainHeadings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean),
          buttons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean),
          inputs: Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
            type: input.type || input.tagName.toLowerCase(),
            placeholder: input.placeholder || '',
            label: input.labels?.[0]?.textContent?.trim() || ''
          })),
          cards: Array.from(document.querySelectorAll('[class*="card"], [class*="bg-slate"]')).length,
          tables: Array.from(document.querySelectorAll('table')).length,
          forms: Array.from(document.querySelectorAll('form')).length,
          modals: Array.from(document.querySelectorAll('[class*="modal"], [class*="fixed"]')).length
        };
      });

      screenAnalysis.push({
        tab,
        screenshot: screenshotPath,
        content,
        timestamp: new Date().toISOString()
      });

      console.log(`✓ ${tab} captured - ${content.mainHeadings.length} sections, ${content.buttons.length} buttons`);
    }

    return screenAnalysis;

  } catch (error) {
    console.error('Error analyzing screens:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run analysis
analyzeScreens()
  .then(analysis => {
    console.log('\n=== SCREEN ANALYSIS COMPLETE ===');
    console.log(`Analyzed ${analysis.length} screens`);

    // Save analysis to JSON
    fs.writeFileSync('./screen-analysis.json', JSON.stringify(analysis, null, 2));
    console.log('Analysis saved to screen-analysis.json');
  })
  .catch(console.error);