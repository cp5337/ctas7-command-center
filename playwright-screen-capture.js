import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    // Navigate to the application
    await page.goto('http://localhost:25175');
    await page.waitForLoadState('networkidle');

    // Wait for React to fully load
    await page.waitForTimeout(3000);

    console.log('🚀 Starting screen-by-screen capture of CTAS-7 Command Center...');

    // 1. Main Dashboard / Home Screen
    console.log('📸 Capturing: Main Dashboard');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-main-dashboard.png'),
      fullPage: true
    });

    // 2. Linear Project Management
    console.log('📸 Capturing: Linear Project Management');
    const linearTab = page.locator('text=Linear Project Management').first();
    if (await linearTab.isVisible()) {
      await linearTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '02-linear-project-management.png'),
        fullPage: true
      });
    }

    // 3. Mission Critical DevOps
    console.log('📸 Capturing: Mission Critical DevOps');
    const devopsTab = page.locator('text=Mission Critical DevOps').first();
    if (await devopsTab.isVisible()) {
      await devopsTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '03-mission-critical-devops.png'),
        fullPage: true
      });
    }

    // 4. Advanced Kanban
    console.log('📸 Capturing: Advanced Kanban');
    const kanbanTab = page.locator('text=Advanced Kanban').first();
    if (await kanbanTab.isVisible()) {
      await kanbanTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '04-advanced-kanban.png'),
        fullPage: true
      });
    }

    // 5. Enterprise Hub
    console.log('📸 Capturing: Enterprise Hub');
    const enterpriseTab = page.locator('text=Enterprise Hub').first();
    if (await enterpriseTab.isVisible()) {
      await enterpriseTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '05-enterprise-hub.png'),
        fullPage: true
      });

      // 5a. XSD Schema Tab within Enterprise Hub
      const xsdTab = page.locator('text=XSD Schema').first();
      if (await xsdTab.isVisible()) {
        await xsdTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '05a-enterprise-hub-xsd-schema.png'),
          fullPage: true
        });
      }

      // 5b. Cybersecurity Ontology Tab
      const ontologyTab = page.locator('text=Cybersecurity Ontology').first();
      if (await ontologyTab.isVisible()) {
        await ontologyTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '05b-enterprise-hub-cybersecurity-ontology.png'),
          fullPage: true
        });
      }
    }

    // 6. System Administration
    console.log('📸 Capturing: System Administration');
    const sysAdminTab = page.locator('text=System Administration').first();
    if (await sysAdminTab.isVisible()) {
      await sysAdminTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '06-system-administration.png'),
        fullPage: true
      });
    }

    // 7. iOS Architecture Mapper (if available)
    console.log('📸 Looking for: iOS Architecture Mapper');
    const iosMapperTab = page.locator('text=iOS Architecture').first();
    if (await iosMapperTab.isVisible()) {
      await iosMapperTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '07-ios-architecture-mapper.png'),
        fullPage: true
      });

      // 7a. Components tab
      const componentsTab = page.locator('text=Components').first();
      if (await componentsTab.isVisible()) {
        await componentsTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '07a-ios-components.png'),
          fullPage: true
        });
      }

      // 7b. iOS Features tab
      const featuresTab = page.locator('text=iOS Features').first();
      if (await featuresTab.isVisible()) {
        await featuresTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '07b-ios-features.png'),
          fullPage: true
        });
      }

      // 7c. Architecture tab
      const architectureTab = page.locator('text=Architecture').first();
      if (await architectureTab.isVisible()) {
        await architectureTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '07c-ios-architecture.png'),
          fullPage: true
        });
      }

      // 7d. Export tab
      const exportTab = page.locator('text=Export').first();
      if (await exportTab.isVisible()) {
        await exportTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '07d-ios-export.png'),
          fullPage: true
        });
      }
    }

    // 8. Look for any additional tabs or features
    console.log('📸 Looking for additional features...');

    // Check for Evil Tool Chain Factory
    const evilToolTab = page.locator('text=Evil Tool').first();
    if (await evilToolTab.isVisible()) {
      await evilToolTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '08-evil-tool-chain-factory.png'),
        fullPage: true
      });
    }

    // Check for CTAS Crate Management
    const crateTab = page.locator('text=CTAS Crate').first();
    if (await crateTab.isVisible()) {
      await crateTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '09-ctas-crate-management.png'),
        fullPage: true
      });
    }

    // Check for Neural Mux
    const neuralMuxTab = page.locator('text=Neural Mux').first();
    if (await neuralMuxTab.isVisible()) {
      await neuralMuxTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(screenshotsDir, '10-neural-mux.png'),
        fullPage: true
      });
    }

    console.log('✅ Screen capture complete! Check the screenshots directory.');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

    // List all captured screens
    const files = fs.readdirSync(screenshotsDir);
    console.log('\n📸 Captured screens:');
    files.forEach(file => {
      console.log(`   • ${file}`);
    });

  } catch (error) {
    console.error('❌ Error during screen capture:', error);
  } finally {
    await browser.close();
  }
})();