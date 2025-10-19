import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:25175/...');
    await page.goto('http://localhost:25175/', { waitUntil: 'networkidle', timeout: 10000 });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/mirror-site-full.png', fullPage: true });
    console.log('Screenshot saved: /tmp/mirror-site-full.png');

    // Get page title
    const title = await page.title();
    console.log('Page Title:', title);

    // Get page content
    const content = await page.content();

    // Save HTML content
    fs.writeFileSync('/tmp/mirror-site-content.html', content);
    console.log('HTML content saved: /tmp/mirror-site-content.html');

    // Extract text content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\n=== Page Text Content ===');
    console.log(bodyText);

    // Get all links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText,
        href: a.href
      }));
    });
    console.log('\n=== Links Found ===');
    console.log(JSON.stringify(links, null, 2));

    // Get all headings
    const headings = await page.evaluate(() => {
      const h = [];
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        document.querySelectorAll(tag).forEach(el => {
          h.push({ tag, text: el.innerText });
        });
      });
      return h;
    });
    console.log('\n=== Headings ===');
    console.log(JSON.stringify(headings, null, 2));

    // Check for any API endpoints or data attributes
    const apiElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('[data-api], [data-endpoint], [data-url]').forEach(el => {
        elements.push({
          tag: el.tagName,
          dataApi: el.getAttribute('data-api'),
          dataEndpoint: el.getAttribute('data-endpoint'),
          dataUrl: el.getAttribute('data-url'),
          text: el.innerText?.substring(0, 100)
        });
      });
      return elements;
    });
    console.log('\n=== API/Data Elements ===');
    console.log(JSON.stringify(apiElements, null, 2));

    // Get all buttons
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).map(btn => ({
        text: btn.innerText,
        id: btn.id,
        className: btn.className
      }));
    });
    console.log('\n=== Buttons ===');
    console.log(JSON.stringify(buttons, null, 2));

    // Check for WebSocket connections
    const wsInfo = await page.evaluate(() => {
      return {
        hasWebSocket: typeof WebSocket !== 'undefined',
        scriptSources: Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
      };
    });
    console.log('\n=== WebSocket & Scripts Info ===');
    console.log(JSON.stringify(wsInfo, null, 2));

    // Get meta information
    const metaInfo = await page.evaluate(() => {
      return {
        description: document.querySelector('meta[name="description"]')?.content,
        viewport: document.querySelector('meta[name="viewport"]')?.content,
        allMeta: Array.from(document.querySelectorAll('meta')).map(m => ({
          name: m.name,
          property: m.property,
          content: m.content
        }))
      };
    });
    console.log('\n=== Meta Information ===');
    console.log(JSON.stringify(metaInfo, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/mirror-site-error.png' });
  } finally {
    await browser.close();
  }
})();
