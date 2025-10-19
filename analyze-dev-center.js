const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to dev center at http://localhost:25275/...');
    await page.goto('http://localhost:25275/', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a moment for any dynamic content
    await page.waitForTimeout(2000);

    // Take initial screenshot
    const timestamp = Date.now();
    await page.screenshot({
      path: `/Users/cp5337/Developer/ctas7-command-center/screenshots/dev-center-main-${timestamp}.png`,
      fullPage: true
    });
    console.log('Screenshot saved: dev-center-main-' + timestamp + '.png');

    // Extract page information
    const pageInfo = await page.evaluate(() => {
      const info = {
        title: document.title,
        url: window.location.href,
        headings: [],
        links: [],
        buttons: [],
        forms: [],
        agentProfiles: [],
        dataAttributes: [],
        metadata: {}
      };

      // Get all headings
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        info.headings.push({
          tag: h.tagName,
          text: h.textContent.trim()
        });
      });

      // Get all links
      document.querySelectorAll('a').forEach(a => {
        if (a.href) {
          info.links.push({
            text: a.textContent.trim(),
            href: a.href,
            classes: a.className
          });
        }
      });

      // Get all buttons
      document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
        info.buttons.push({
          text: btn.textContent.trim() || btn.value,
          type: btn.type,
          classes: btn.className,
          id: btn.id
        });
      });

      // Get all forms
      document.querySelectorAll('form').forEach(form => {
        const fields = [];
        form.querySelectorAll('input, select, textarea').forEach(field => {
          fields.push({
            type: field.type,
            name: field.name,
            id: field.id,
            placeholder: field.placeholder
          });
        });
        info.forms.push({
          action: form.action,
          method: form.method,
          fields: fields
        });
      });

      // Look for agent-related elements
      document.querySelectorAll('[data-agent], [class*="agent"], [id*="agent"]').forEach(el => {
        info.agentProfiles.push({
          tag: el.tagName,
          classes: el.className,
          id: el.id,
          text: el.textContent.trim().substring(0, 200),
          dataAttributes: Array.from(el.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => ({ name: attr.name, value: attr.value }))
        });
      });

      // Get all data attributes
      document.querySelectorAll('[data-port], [data-endpoint], [data-ws], [data-websocket]').forEach(el => {
        info.dataAttributes.push({
          tag: el.tagName,
          attributes: Array.from(el.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => ({ name: attr.name, value: attr.value }))
        });
      });

      // Look for meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          info.metadata[name] = content;
        }
      });

      // Get body classes and data attributes
      info.bodyClasses = document.body.className;
      info.bodyDataAttributes = Array.from(document.body.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .map(attr => ({ name: attr.name, value: attr.value }));

      return info;
    });

    console.log('\n=== PAGE ANALYSIS ===');
    console.log('Title:', pageInfo.title);
    console.log('URL:', pageInfo.url);
    console.log('\nHeadings found:', pageInfo.headings.length);
    console.log('\nLinks found:', pageInfo.links.length);
    console.log('\nButtons found:', pageInfo.buttons.length);
    console.log('\nAgent-related elements:', pageInfo.agentProfiles.length);

    // Save detailed analysis to file
    fs.writeFileSync(
      `/Users/cp5337/Developer/ctas7-command-center/screenshots/dev-center-analysis-${timestamp}.json`,
      JSON.stringify(pageInfo, null, 2)
    );
    console.log('\nDetailed analysis saved to: dev-center-analysis-' + timestamp + '.json');

    // Look for navigation elements and take screenshots
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      '.navigation',
      '.nav',
      '.menu',
      '.sidebar'
    ];

    for (const selector of navSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.screenshot({
          path: `/Users/cp5337/Developer/ctas7-command-center/screenshots/dev-center-nav-${selector.replace(/[^a-z0-9]/gi, '_')}-${timestamp}.png`
        });
        console.log('Navigation screenshot saved:', selector);
      }
    }

    // Check for agent profile sections
    const agentSections = await page.$$('[data-agent], .agent-profile, .agent-card, [id*="agent"]');
    console.log('\nFound', agentSections.length, 'potential agent profile sections');

    for (let i = 0; i < Math.min(agentSections.length, 5); i++) {
      await agentSections[i].screenshot({
        path: `/Users/cp5337/Developer/ctas7-command-center/screenshots/dev-center-agent-${i}-${timestamp}.png`
      });
      console.log('Agent section screenshot saved:', i);
    }

    // Get the full HTML structure
    const html = await page.content();
    fs.writeFileSync(
      `/Users/cp5337/Developer/ctas7-command-center/screenshots/dev-center-source-${timestamp}.html`,
      html
    );
    console.log('\nHTML source saved to: dev-center-source-' + timestamp + '.html');

    console.log('\n=== COORDINATION ANALYSIS ===');

    // Check for WebSocket connections
    const wsInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const wsMatches = scripts
        .map(s => s.textContent)
        .join('\n')
        .match(/ws:\/\/[^'")\s]+|wss:\/\/[^'")\s]+|WebSocket\([^)]+\)/g);

      return {
        websockets: wsMatches || [],
        hasWebSocket: scripts.some(s => s.textContent.includes('WebSocket'))
      };
    });

    console.log('WebSocket detection:', wsInfo);

    // Check for port references
    const portInfo = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      const ports = [];
      const portRegex = /\b(15173|25173|25175|25275|8765|15180)\b/g;
      let match;
      while ((match = portRegex.exec(bodyText)) !== null) {
        ports.push(match[0]);
      }
      return { ports: [...new Set(ports)] };
    });

    console.log('Port references found:', portInfo.ports);

    console.log('\n=== KEEPING BROWSER OPEN FOR INSPECTION ===');
    console.log('Press Ctrl+C when done inspecting...');

    // Keep browser open for manual inspection
    await new Promise(() => {}); // Wait forever

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({
      path: `/Users/cp5337/Developer/ctas7-command-center/screenshots/dev-center-error-${Date.now()}.png`
    });
  } finally {
    // This won't execute because of the infinite wait above
    // User will need to Ctrl+C
  }
})();
