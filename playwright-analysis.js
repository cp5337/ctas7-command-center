import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeCTASOpCenter() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'playwright-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    console.log('🚀 Navigating to CTAS Op Center...');
    await page.goto('http://localhost:15173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for animations

    console.log('📸 Taking full page screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-main-interface.png'),
      fullPage: true
    });

    // Analyze page structure
    console.log('\n🔍 Analyzing page structure...');
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        title: document.title,
        mainComponents: [],
        interactiveElements: [],
        dataDisplays: [],
        navigation: []
      };

      // Find main components
      const mainSections = document.querySelectorAll('[class*="dashboard"], [class*="panel"], [class*="container"], section, main');
      mainSections.forEach(section => {
        const classes = section.className;
        const id = section.id;
        const text = section.innerText?.substring(0, 100);
        if (classes || id) {
          analysis.mainComponents.push({
            tag: section.tagName,
            id,
            classes,
            preview: text
          });
        }
      });

      // Find interactive elements
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        analysis.interactiveElements.push({
          type: 'button',
          text: btn.innerText,
          classes: btn.className,
          id: btn.id
        });
      });

      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        analysis.interactiveElements.push({
          type: input.tagName.toLowerCase(),
          placeholder: input.placeholder,
          id: input.id,
          classes: input.className
        });
      });

      // Find data displays
      const metrics = document.querySelectorAll('[class*="metric"], [class*="stat"], [class*="count"], [class*="value"]');
      metrics.forEach(metric => {
        analysis.dataDisplays.push({
          text: metric.innerText,
          classes: metric.className
        });
      });

      // Find navigation elements
      const navElements = document.querySelectorAll('nav, [class*="nav"], [class*="menu"]');
      navElements.forEach(nav => {
        analysis.navigation.push({
          tag: nav.tagName,
          classes: nav.className,
          text: nav.innerText?.substring(0, 100)
        });
      });

      return analysis;
    });

    console.log('\n📊 Page Analysis Results:');
    console.log('Title:', pageAnalysis.title);
    console.log('\n📦 Main Components Found:', pageAnalysis.mainComponents.length);
    pageAnalysis.mainComponents.forEach((comp, i) => {
      console.log(`  ${i + 1}. ${comp.tag} - ID: ${comp.id || 'N/A'} - Classes: ${comp.classes}`);
    });

    console.log('\n🎮 Interactive Elements Found:', pageAnalysis.interactiveElements.length);
    pageAnalysis.interactiveElements.forEach((elem, i) => {
      if (i < 10) { // Show first 10
        console.log(`  ${i + 1}. ${elem.type} - "${elem.text || elem.placeholder}" - ID: ${elem.id || 'N/A'}`);
      }
    });

    console.log('\n📈 Data Displays Found:', pageAnalysis.dataDisplays.length);
    pageAnalysis.dataDisplays.forEach((display, i) => {
      if (i < 10 && display.text) { // Show first 10
        console.log(`  ${i + 1}. ${display.text.substring(0, 50)}`);
      }
    });

    // Test AI CLI interface if present
    console.log('\n🤖 Looking for AI CLI interface...');
    const cliInput = await page.$('input[placeholder*="AI"], input[placeholder*="command"], textarea[placeholder*="AI"]');
    if (cliInput) {
      console.log('✅ AI CLI input found!');
      await page.screenshot({
        path: path.join(screenshotsDir, '02-ai-cli-interface.png'),
        fullPage: true
      });

      // Test CLI interaction
      await cliInput.click();
      await cliInput.type('CTAS SITREP', { delay: 100 });
      await page.screenshot({
        path: path.join(screenshotsDir, '03-cli-with-command.png'),
        fullPage: true
      });
    }

    // Look for dashboard metrics
    console.log('\n📊 Looking for dashboard metrics...');
    const metrics = await page.$$('[class*="metric"], [class*="dashboard"], [class*="stat"]');
    if (metrics.length > 0) {
      console.log(`✅ Found ${metrics.length} metric/dashboard elements`);
      await page.screenshot({
        path: path.join(screenshotsDir, '04-dashboard-metrics.png'),
        fullPage: true
      });
    }

    // Look for geographic visualization
    console.log('\n🗺️ Looking for geographic visualization...');
    const geoElements = await page.$$('[class*="map"], [class*="geo"], canvas');
    if (geoElements.length > 0) {
      console.log(`✅ Found ${geoElements.length} potential geographic elements`);
      await page.screenshot({
        path: path.join(screenshotsDir, '05-geographic-view.png'),
        fullPage: true
      });
    }

    // Look for Neural MUX status
    console.log('\n🧠 Looking for Neural MUX status...');
    const neuralElements = await page.$$('[class*="neural"], [class*="mux"], [class*="status"]');
    if (neuralElements.length > 0) {
      console.log(`✅ Found ${neuralElements.length} potential Neural MUX elements`);
    }

    // Get all visible text content for analysis
    console.log('\n📝 Extracting interface text content...');
    const textContent = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const texts = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text && text.length > 2) {
          texts.push(text);
        }
      }
      return texts;
    });

    // Check for specific CTAS features
    const ctasFeatures = {
      assetManagement: textContent.some(t => t.toLowerCase().includes('asset')),
      neuralMux: textContent.some(t => t.toLowerCase().includes('neural') || t.toLowerCase().includes('mux')),
      dashboard: textContent.some(t => t.toLowerCase().includes('dashboard')),
      monitoring: textContent.some(t => t.toLowerCase().includes('monitor') || t.toLowerCase().includes('status')),
      geographic: textContent.some(t => t.toLowerCase().includes('geo') || t.toLowerCase().includes('map') || t.toLowerCase().includes('location')),
      aiCli: textContent.some(t => t.toLowerCase().includes('cli') || t.toLowerCase().includes('command'))
    };

    console.log('\n🎯 CTAS Features Detected:');
    Object.entries(ctasFeatures).forEach(([feature, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${feature}`);
    });

    // Save detailed analysis to JSON
    const detailedAnalysis = {
      timestamp: new Date().toISOString(),
      url: 'http://localhost:15173/',
      pageAnalysis,
      ctasFeatures,
      textSample: textContent.slice(0, 50),
      screenshots: [
        '01-main-interface.png',
        '02-ai-cli-interface.png',
        '03-cli-with-command.png',
        '04-dashboard-metrics.png',
        '05-geographic-view.png'
      ]
    };

    fs.writeFileSync(
      path.join(screenshotsDir, 'analysis-results.json'),
      JSON.stringify(detailedAnalysis, null, 2)
    );

    console.log('\n✅ Analysis complete! Results saved to playwright-screenshots/');
    console.log(`📸 Screenshots saved: ${screenshotsDir}`);
    console.log('📄 Detailed analysis: analysis-results.json');

    await page.waitForTimeout(3000); // Keep browser open for viewing

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    await page.screenshot({
      path: path.join(screenshotsDir, 'error-screenshot.png'),
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

analyzeCTASOpCenter().catch(console.error);
