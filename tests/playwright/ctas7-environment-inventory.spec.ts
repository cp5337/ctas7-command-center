/**
 * CTAS-7 Environment Inventory and Bootstrap Testing
 *
 * Comprehensive inventory of CTAS-7 environment with Layer 2 fabric integration
 * Enhanced with stealth capabilities and mathematical intelligence monitoring
 */

import { test, expect } from './stealth-config';
import fs from 'fs';
import path from 'path';

test.describe('CTAS-7 Environment Inventory and Bootstrap', () => {
  let inventoryResults: Record<string, any>;

  test.beforeEach(async ({ stealthPage }) => {
    // Initialize inventory results
    inventoryResults = {
      timestamp: new Date().toISOString(),
      ctas_version: '7.0.0',
      layer2_fabric: 'mathematical-intelligence',
      environment: process.env.CTAS_ENV || 'development',
      found: [],
      modules: [],
      components: [],
      services: [],
      fabric_status: {},
      performance_metrics: {}
    };

    // Ensure analysis directory exists
    const analysisDir = path.join(process.cwd(), 'analysis');
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }
  });

  test('CTAS-7 Primary Dashboard Inventory', async ({ stealthPage }) => {
    const baseUrl = process.env.CTAS_BASE || 'http://localhost:5173';

    console.log(`🔍 Scanning CTAS-7 environment at: ${baseUrl}`);

    // 1️⃣ Open primary dashboard with stealth monitoring
    await stealthPage.goto(baseUrl);
    await stealthPage.waitForTimeout(2000);

    // Verify page loaded successfully
    const title = await stealthPage.title();
    inventoryResults.page_title = title;
    expect(title).toContain('CTAS');

    // 2️⃣ Scan sidebar and navigation modules
    const navigationSelectors = [
      'text=/Compute|Data|Networking|Deception|Layer2|Fabric|Intelligence/',
      '[data-testid*="nav"]',
      '[role="navigation"]',
      '.sidebar',
      '.nav-menu',
      '.module-selector'
    ];

    for (const selector of navigationSelectors) {
      try {
        const elements = await stealthPage.locator(selector).allTextContents();
        if (elements.length > 0) {
          inventoryResults.modules.push(...elements.filter(text => text.trim()));
        }
      } catch (e) {
        // Selector not found, continue
      }
    }

    console.log(`📋 Found ${inventoryResults.modules.length} navigation modules`);

    // 3️⃣ Enumerate interactive elements
    const buttonTexts = await stealthPage.locator('button').allTextContents();
    const linkTexts = await stealthPage.locator('a').allTextContents();
    const inputElements = await stealthPage.locator('input').count();

    inventoryResults.interactive_elements = {
      buttons: buttonTexts.filter(text => text.trim()),
      links: linkTexts.filter(text => text.trim()),
      input_count: inputElements
    };

    console.log(`🎛️  Found ${buttonTexts.length} buttons, ${linkTexts.length} links, ${inputElements} inputs`);

    // 4️⃣ Check for CTAS-7 specific components
    const ctasComponents = [
      '[data-testid*="ctas7"]',
      '[data-dioxus-component]',
      '[data-testid*="layer2"]',
      '[data-testid*="fabric"]',
      '[data-testid*="neural-mux"]',
      '[data-testid*="surreal"]',
      '[data-testid*="teth"]',
      '[data-testid*="lstar"]'
    ];

    inventoryResults.ctas_components = {};
    for (const selector of ctasComponents) {
      try {
        const count = await stealthPage.locator(selector).count();
        const componentType = selector.replace(/[\[\]"'*=]/g, '');
        if (count > 0) {
          inventoryResults.ctas_components[componentType] = count;
        }
      } catch (e) {
        // Component not found
      }
    }

    console.log(`🧩 CTAS-7 Components:`, inventoryResults.ctas_components);

    // 5️⃣ Layer 2 Fabric Status Check
    const fabricSelectors = [
      '[data-testid="teth-algorithm"]',
      '[data-testid="lstar-learning"]',
      '[data-testid="blake3-auth"]',
      '[data-testid="layer2-fabric"]',
      '[data-testid="mathematical-intelligence"]'
    ];

    inventoryResults.layer2_fabric_status = {};
    for (const selector of fabricSelectors) {
      try {
        const element = stealthPage.locator(selector);
        const isVisible = await element.isVisible();
        const text = isVisible ? await element.textContent() : null;

        const fabricComponent = selector.replace(/[\[\]"'=-]/g, '').replace('data-testid', '');
        inventoryResults.layer2_fabric_status[fabricComponent] = {
          visible: isVisible,
          content: text?.trim() || null
        };
      } catch (e) {
        // Fabric component not found
      }
    }

    console.log(`🧠 Layer 2 Fabric Status:`, inventoryResults.layer2_fabric_status);
  });

  test('Service Discovery and Health Check', async ({ stealthPage }) => {
    // 6️⃣ Check for service endpoints
    const serviceEndpoints = [
      '/api/repo',      // Repository services
      '/api/cannon',    // Neural Mux services
      '/api/stat',      // Statistics services
      '/forge',         // Forge/build services
      '/playwright'     // Playwright testing
    ];

    inventoryResults.service_health = {};

    for (const endpoint of serviceEndpoints) {
      try {
        const response = await stealthPage.request.get(`${stealthPage.url()}${endpoint}`);
        inventoryResults.service_health[endpoint] = {
          status: response.status(),
          ok: response.ok(),
          statusText: response.statusText()
        };

        console.log(`🌐 ${endpoint}: ${response.status()} ${response.statusText()}`);
      } catch (e) {
        inventoryResults.service_health[endpoint] = {
          status: 'ERROR',
          error: e.message
        };
      }
    }

    // 7️⃣ Check SurrealDB connection
    try {
      const dbResponse = await stealthPage.request.get('ws://localhost:8000');
      inventoryResults.surrealdb_status = 'WebSocket connection available';
    } catch (e) {
      inventoryResults.surrealdb_status = `Connection failed: ${e.message}`;
    }

    // 8️⃣ Check Neural Mux connection
    try {
      const muxResponse = await stealthPage.request.get('ws://localhost:18100');
      inventoryResults.neural_mux_status = 'Neural Mux available';
    } catch (e) {
      inventoryResults.neural_mux_status = `Neural Mux unavailable: ${e.message}`;
    }
  });

  test('Data Export and Configuration Discovery', async ({ stealthPage }) => {
    // 9️⃣ Look for export capabilities
    const exportSelectors = [
      'text=/EXPORT|Download|Save|Export JSON|Export CSV/',
      '[data-testid*="export"]',
      'button:has-text("Export")',
      'button:has-text("Download")'
    ];

    inventoryResults.export_capabilities = [];

    for (const selector of exportSelectors) {
      try {
        const elements = await stealthPage.locator(selector).all();
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            const text = await element.textContent();
            inventoryResults.export_capabilities.push(text?.trim());
          }
        }
      } catch (e) {
        // Export option not found
      }
    }

    // 🔟 Try to trigger JSON export if available
    const jsonExportButton = stealthPage.locator('text=/EXPORT JSON|Export JSON/i').first();
    if (await jsonExportButton.isVisible()) {
      console.log('📤 Triggering JSON export...');

      // Set up download handler
      const downloadPromise = stealthPage.waitForEvent('download');
      await jsonExportButton.click();

      try {
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        const downloadPath = path.join(process.cwd(), 'analysis', `exported_${filename}`);
        await download.saveAs(downloadPath);

        inventoryResults.exported_data = {
          filename: filename,
          path: downloadPath,
          timestamp: new Date().toISOString()
        };

        console.log(`💾 Exported data saved to: ${downloadPath}`);
      } catch (e) {
        console.log('⚠️  Export attempt failed:', e.message);
      }
    }
  });

  test('Network Topology and Configuration Analysis', async ({ stealthPage }) => {
    // 1️⃣1️⃣ Check for network topology visualization
    const topologySelectors = [
      '[data-testid*="topology"]',
      '[data-testid*="network"]',
      '.network-graph',
      '.topology-view',
      'canvas',
      'svg'
    ];

    inventoryResults.topology_elements = {};

    for (const selector of topologySelectors) {
      try {
        const count = await stealthPage.locator(selector).count();
        if (count > 0) {
          const elementType = selector.replace(/[\[\]"'*=.]/g, '');
          inventoryResults.topology_elements[elementType] = count;
        }
      } catch (e) {
        // Topology element not found
      }
    }

    // 1️⃣2️⃣ Extract configuration data from page
    const configData = await stealthPage.evaluate(() => {
      const config: any = {};

      // Check for global CTAS configuration
      if (typeof window !== 'undefined') {
        // @ts-ignore
        config.ctas_config = window.CTAS_CONFIG || null;
        // @ts-ignore
        config.layer2_fabric = window.CTAS7_LAYER2_FABRIC || null;
        // @ts-ignore
        config.neural_mux = window.neuralMux ? 'active' : 'inactive';
        // @ts-ignore
        config.surreal_telemetry = window.surrealTelemetry ? 'active' : 'inactive';
      }

      return config;
    });

    inventoryResults.runtime_configuration = configData;
    console.log('⚙️  Runtime Configuration:', configData);
  });

  test('Performance Metrics Collection', async ({ stealthPage }) => {
    // 1️⃣3️⃣ Measure page performance
    const startTime = Date.now();

    // Navigate and measure load time
    await stealthPage.goto(stealthPage.url(), { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Collect performance metrics
    const performanceMetrics = await stealthPage.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadEventEnd: navigation.loadEventEnd,
        domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
        responseEnd: navigation.responseEnd,
        requestStart: navigation.requestStart
      };
    });

    inventoryResults.performance_metrics = {
      total_load_time_ms: loadTime,
      dom_content_loaded: performanceMetrics.domContentLoadedEventEnd - performanceMetrics.requestStart,
      network_response_time: performanceMetrics.responseEnd - performanceMetrics.requestStart,
      page_load_complete: performanceMetrics.loadEventEnd - performanceMetrics.requestStart
    };

    console.log('📊 Performance Metrics:', inventoryResults.performance_metrics);

    // Verify performance meets CTAS-7 requirements
    expect(loadTime).toBeLessThan(10000); // 10 second max load time
    expect(inventoryResults.performance_metrics.dom_content_loaded).toBeLessThan(5000); // 5 second DOM ready
  });

  test.afterEach(async () => {
    // 1️⃣4️⃣ Persist comprehensive inventory
    const inventoryPath = path.join(process.cwd(), 'analysis', 'ctas7_inventory_snapshot.json');
    fs.writeFileSync(inventoryPath, JSON.stringify(inventoryResults, null, 2));

    console.log('✅ CTAS-7 Inventory snapshot written to:', inventoryPath);
    console.log('📈 Summary:');
    console.log(`  - Modules: ${inventoryResults.modules?.length || 0}`);
    console.log(`  - Buttons: ${inventoryResults.interactive_elements?.buttons?.length || 0}`);
    console.log(`  - CTAS Components: ${Object.keys(inventoryResults.ctas_components || {}).length}`);
    console.log(`  - Layer 2 Fabric: ${Object.keys(inventoryResults.layer2_fabric_status || {}).length} components`);
    console.log(`  - Services: ${Object.keys(inventoryResults.service_health || {}).length}`);
    console.log(`  - Load Time: ${inventoryResults.performance_metrics?.total_load_time_ms || 'N/A'}ms`);
  });
});

// Export inventory results for other tests
export { test as inventoryTest };