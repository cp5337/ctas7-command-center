const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureWorkflowInterfaces() {
  console.log('🎭 Starting Playwright workflow interface capture...');

  const browser = await chromium.launch({
    headless: false,  // Show browser for debugging
    viewport: { width: 1920, height: 1080 }
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'workflow-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const workflows = [
    {
      name: 'n8n',
      url: 'https://n8n.io',
      selector: '.hero-section, .workflow-canvas, .node-canvas',
      description: 'n8n workflow automation platform'
    },
    {
      name: 'make',
      url: 'https://www.make.com',
      selector: '.hero, .workflow-builder, .scenario-editor',
      description: 'Make (formerly Integromat) visual automation'
    },
    {
      name: 'zapier',
      url: 'https://zapier.com',
      selector: '.hero, .zap-editor, .workflow-canvas',
      description: 'Zapier automation workflows'
    },
    {
      name: 'n8n-demo',
      url: 'https://demo.n8n.io',
      selector: '.workflow-canvas, .node-view',
      description: 'n8n live demo interface'
    }
  ];

  for (const workflow of workflows) {
    try {
      console.log(`📸 Capturing ${workflow.name} - ${workflow.description}`);

      await page.goto(workflow.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(3000);

      // Try to dismiss any popups/cookies
      try {
        await page.click('button:has-text("Accept"), button:has-text("Got it"), button:has-text("Close"), .cookie-accept', { timeout: 2000 });
      } catch (e) {
        console.log('No popup to dismiss');
      }

      // Take full page screenshot
      await page.screenshot({
        path: path.join(screenshotsDir, `${workflow.name}-full.png`),
        fullPage: true
      });

      // Try to capture specific workflow interface elements
      try {
        const element = await page.locator(workflow.selector).first();
        if (await element.isVisible()) {
          await element.screenshot({
            path: path.join(screenshotsDir, `${workflow.name}-interface.png`)
          });
        }
      } catch (e) {
        console.log(`Could not capture specific element for ${workflow.name}`);
      }

      // Take viewport screenshot
      await page.screenshot({
        path: path.join(screenshotsDir, `${workflow.name}-viewport.png`)
      });

      console.log(`✅ Captured ${workflow.name} screenshots`);

    } catch (error) {
      console.error(`❌ Failed to capture ${workflow.name}:`, error.message);
    }
  }

  // Capture some additional workflow builder UIs
  const additionalSites = [
    'https://zapier.com/app/editor',
    'https://www.make.com/en/integrations',
    'https://n8n.io/integrations'
  ];

  for (const site of additionalSites) {
    try {
      const siteName = new URL(site).hostname.replace('www.', '').replace('.com', '').replace('.io', '');
      console.log(`📸 Capturing additional interface: ${siteName}`);

      await page.goto(site, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: path.join(screenshotsDir, `${siteName}-additional.png`)
      });

    } catch (error) {
      console.error(`❌ Failed to capture additional site:`, error.message);
    }
  }

  await browser.close();

  console.log('🎉 Workflow interface capture complete!');
  console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  // Generate analysis report
  const analysisReport = {
    timestamp: new Date().toISOString(),
    total_screenshots: fs.readdirSync(screenshotsDir).length,
    workflow_platforms: workflows.map(w => ({
      name: w.name,
      description: w.description,
      captured: true
    })),
    next_steps: [
      "Analyze visual workflow patterns",
      "Extract UI component designs",
      "Build Dioxus interface components",
      "Implement drag-and-drop workflow builder",
      "Add CTAS-7 tactical integration"
    ]
  };

  fs.writeFileSync(
    path.join(screenshotsDir, 'analysis-report.json'),
    JSON.stringify(analysisReport, null, 2)
  );

  return analysisReport;
}

// CLI execution
if (require.main === module) {
  captureWorkflowInterfaces()
    .then(report => {
      console.log('📊 Analysis Report:', JSON.stringify(report, null, 2));
    })
    .catch(error => {
      console.error('💥 Capture failed:', error);
      process.exit(1);
    });
}

module.exports = { captureWorkflowInterfaces };