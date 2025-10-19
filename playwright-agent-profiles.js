import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Try different ports that might be the dev center
    const portsToTry = [25275, 25175, 25176];
    let connectedPort = null;

    for (const port of portsToTry) {
      try {
        console.log(`Trying http://localhost:${port}/...`);
        await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle', timeout: 10000 });
        connectedPort = port;
        console.log(`✓ Successfully connected to port ${port}`);
        break;
      } catch (err) {
        console.log(`✗ Port ${port} not accessible`);
      }
    }

    if (!connectedPort) {
      throw new Error('Could not connect to any of the expected ports');
    }

    // Wait a moment for any dynamic content to load
    await page.waitForTimeout(2000);

    // Take initial screenshot
    console.log('Taking initial screenshot...');
    await page.screenshot({
      path: 'screenshots/agent-profiles-home.png',
      fullPage: true
    });

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get page content structure
    const pageStructure = await page.evaluate(() => {
      const structure = {
        url: window.location.href,
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
          tag: h.tagName,
          text: h.textContent.trim()
        })),
        links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()),
        mainContent: document.body.innerText.substring(0, 5000) // First 5000 chars
      };

      // Look for agent-related elements
      structure.agentElements = {
        profileCards: Array.from(document.querySelectorAll('[class*="profile"], [class*="agent"], [class*="card"]')).length,
        dataAttributes: Array.from(document.querySelectorAll('[data-agent], [data-profile], [data-persona]')).map(el => ({
          tag: el.tagName,
          dataset: el.dataset,
          text: el.textContent.trim().substring(0, 100)
        }))
      };

      return structure;
    });

    // Save structure to JSON
    fs.writeFileSync(
      'screenshots/page-structure.json',
      JSON.stringify(pageStructure, null, 2)
    );
    console.log('Page structure saved to screenshots/page-structure.json');

    // Look for navigation elements
    const navElements = await page.evaluate(() => {
      const navs = Array.from(document.querySelectorAll('nav, [role="navigation"]'));
      return navs.map(nav => ({
        html: nav.innerHTML.substring(0, 500),
        links: Array.from(nav.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href')
        }))
      }));
    });

    console.log('Navigation elements:', JSON.stringify(navElements, null, 2));

    // Try to find and click on agent profiles or related sections
    const agentLinks = await page.$$eval('a', links =>
      links
        .filter(a => /agent|profile|persona|team|synthesis|planning|execution/i.test(a.textContent))
        .map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') }))
    );

    console.log('Found potential agent-related links:', agentLinks);

    // If we found agent-related links, try clicking them
    if (agentLinks.length > 0) {
      for (let i = 0; i < Math.min(3, agentLinks.length); i++) {
        try {
          const linkText = agentLinks[i].text;
          console.log(`Clicking on: ${linkText}`);

          await page.click(`text=${linkText}`, { timeout: 5000 });
          await page.waitForTimeout(2000);

          const screenshotName = `agent-profiles-${linkText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
          await page.screenshot({
            path: `screenshots/${screenshotName}`,
            fullPage: true
          });
          console.log(`Screenshot saved: ${screenshotName}`);

          // Go back
          await page.goBack({ waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        } catch (err) {
          console.log(`Could not interact with link: ${agentLinks[i].text}`, err.message);
        }
      }
    }

    // Check for API endpoints or data
    const apiInfo = await page.evaluate(() => {
      // Look for exposed API endpoints or configuration
      const info = {
        windowVars: Object.keys(window).filter(k =>
          /api|config|agent|profile|endpoint/i.test(k) &&
          typeof window[k] === 'object'
        ),
        metaTags: Array.from(document.querySelectorAll('meta')).map(m => ({
          name: m.getAttribute('name'),
          property: m.getAttribute('property'),
          content: m.getAttribute('content')
        })),
        scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
      };

      return info;
    });

    fs.writeFileSync(
      'screenshots/api-info.json',
      JSON.stringify(apiInfo, null, 2)
    );
    console.log('API info saved to screenshots/api-info.json');

    // Try to find any forms or input fields for agent management
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map((form, idx) => ({
        index: idx,
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder
        }))
      }));
    });

    console.log('Forms found:', JSON.stringify(forms, null, 2));

    // Take a final screenshot
    await page.screenshot({
      path: 'screenshots/agent-profiles-final.png',
      fullPage: true
    });

    console.log('\nAnalysis complete! Check the screenshots folder for results.');

  } catch (error) {
    console.error('Error during navigation:', error);
    await page.screenshot({ path: 'screenshots/error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();
