/**
 * CTAS-7 Bootstrap Validation and System Initialization
 *
 * Validates proper system startup sequence and Layer 2 fabric initialization
 * Tests the complete bootstrap process for CTAS-7 mathematical intelligence
 */

import { test, expect, StealthTestHelpers } from './stealth-config';
import fs from 'fs';
import path from 'path';

test.describe('CTAS-7 Bootstrap Validation', () => {
  test('System Initialization Sequence', async ({ stealthPage }) => {
    const baseUrl = process.env.CTAS_BASE || 'http://localhost:5173';
    const bootstrapResults: Record<string, any> = {
      timestamp: new Date().toISOString(),
      bootstrap_sequence: [],
      initialization_times: {},
      errors: [],
      warnings: []
    };

    console.log('🚀 Starting CTAS-7 Bootstrap Validation...');

    // Inject mathematical intelligence monitoring early
    await StealthTestHelpers.injectMathematicalIntelligence(stealthPage);

    // Monitor console messages during bootstrap
    const consoleLogs: any[] = [];
    stealthPage.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });

      if (msg.type() === 'error') {
        bootstrapResults.errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        bootstrapResults.warnings.push(msg.text());
      }
    });

    // Start timing the initialization
    const startTime = Date.now();

    // Navigate to dashboard and track initialization
    await stealthPage.goto(baseUrl);
    bootstrapResults.initialization_times.navigation = Date.now() - startTime;

    // Wait for Layer 2 fabric initialization
    const fabricStartTime = Date.now();
    try {
      await StealthTestHelpers.waitForLayer2Fabric(stealthPage, 30000);
      bootstrapResults.initialization_times.layer2_fabric = Date.now() - fabricStartTime;
      bootstrapResults.bootstrap_sequence.push('Layer 2 Fabric Initialized');
    } catch (e) {
      bootstrapResults.errors.push(`Layer 2 Fabric initialization failed: ${e.message}`);
    }

    // Check for critical CTAS-7 components
    const criticalComponents = [
      {
        name: 'CTAS Dashboard',
        selector: '[data-testid*="ctas"], .ctas-dashboard, .dashboard-main',
        timeout: 10000
      },
      {
        name: 'Navigation Menu',
        selector: '[role="navigation"], .nav-menu, .sidebar',
        timeout: 5000
      },
      {
        name: 'Dioxus Components',
        selector: '[data-dioxus-component]',
        timeout: 8000
      }
    ];

    for (const component of criticalComponents) {
      const componentStartTime = Date.now();
      try {
        const element = stealthPage.locator(component.selector).first();
        await expect(element).toBeVisible({ timeout: component.timeout });

        bootstrapResults.initialization_times[component.name] = Date.now() - componentStartTime;
        bootstrapResults.bootstrap_sequence.push(`${component.name} Loaded`);

        console.log(`✅ ${component.name} initialized in ${Date.now() - componentStartTime}ms`);
      } catch (e) {
        bootstrapResults.errors.push(`${component.name} failed to initialize: ${e.message}`);
        console.log(`❌ ${component.name} initialization failed`);
      }
    }

    // Validate mathematical intelligence components
    const mathIntelligenceComponents = [
      { name: 'TETH Algorithm', selector: '[data-testid="teth-algorithm"]' },
      { name: 'L* Learning', selector: '[data-testid="lstar-learning"]' },
      { name: 'Blake3 Auth', selector: '[data-testid="blake3-auth"]' },
      { name: 'Neural Mux', selector: '[data-testid="neural-mux"]' }
    ];

    bootstrapResults.mathematical_intelligence = {};
    for (const component of mathIntelligenceComponents) {
      try {
        const element = stealthPage.locator(component.selector);
        const isVisible = await element.isVisible();
        const hasContent = isVisible ? (await element.textContent())?.trim() : null;

        bootstrapResults.mathematical_intelligence[component.name] = {
          initialized: isVisible,
          content: hasContent,
          status: isVisible ? 'ACTIVE' : 'NOT_FOUND'
        };

        if (isVisible) {
          bootstrapResults.bootstrap_sequence.push(`${component.name} Active`);
        }
      } catch (e) {
        bootstrapResults.mathematical_intelligence[component.name] = {
          initialized: false,
          error: e.message,
          status: 'ERROR'
        };
      }
    }

    // Check for service connectivity
    const serviceConnectivity = await stealthPage.evaluate(async () => {
      const services = {
        surrealdb: false,
        neural_mux: false,
        repository: false
      };

      try {
        // Check if WebSocket connections are available
        const surrealCheck = new WebSocket('ws://localhost:8000');
        surrealCheck.onopen = () => services.surrealdb = true;

        const muxCheck = new WebSocket('ws://localhost:18100');
        muxCheck.onopen = () => services.neural_mux = true;

        // Give connections time to establish
        await new Promise(resolve => setTimeout(resolve, 2000));

        surrealCheck.close();
        muxCheck.close();
      } catch (e) {
        // Connection attempts failed
      }

      return services;
    });

    bootstrapResults.service_connectivity = serviceConnectivity;

    // Validate page is fully functional
    const functionalityTests = [
      {
        name: 'Page Title',
        test: async () => {
          const title = await stealthPage.title();
          return title.includes('CTAS') || title.length > 0;
        }
      },
      {
        name: 'Interactive Elements',
        test: async () => {
          const buttonCount = await stealthPage.locator('button').count();
          return buttonCount > 0;
        }
      },
      {
        name: 'Content Loaded',
        test: async () => {
          const bodyText = await stealthPage.locator('body').textContent();
          return bodyText && bodyText.trim().length > 100;
        }
      }
    ];

    bootstrapResults.functionality_validation = {};
    for (const functionalityTest of functionalityTests) {
      try {
        const result = await functionalityTest.test();
        bootstrapResults.functionality_validation[functionalityTest.name] = {
          passed: result,
          status: result ? 'PASS' : 'FAIL'
        };

        if (result) {
          bootstrapResults.bootstrap_sequence.push(`${functionalityTest.name} Validated`);
        } else {
          bootstrapResults.errors.push(`${functionalityTest.name} validation failed`);
        }
      } catch (e) {
        bootstrapResults.functionality_validation[functionalityTest.name] = {
          passed: false,
          error: e.message,
          status: 'ERROR'
        };
      }
    }

    // Calculate total bootstrap time
    bootstrapResults.total_bootstrap_time = Date.now() - startTime;
    bootstrapResults.console_logs = consoleLogs;

    // Performance validation
    const performanceThresholds = {
      total_time: 15000,      // 15 seconds max
      layer2_fabric: 10000,   // 10 seconds max for fabric
      navigation: 5000        // 5 seconds max for navigation
    };

    bootstrapResults.performance_validation = {};
    for (const [metric, threshold] of Object.entries(performanceThresholds)) {
      const actualTime = bootstrapResults.initialization_times[metric] || bootstrapResults.total_bootstrap_time;
      const passed = actualTime <= threshold;

      bootstrapResults.performance_validation[metric] = {
        actual_ms: actualTime,
        threshold_ms: threshold,
        passed: passed,
        status: passed ? 'PASS' : 'FAIL'
      };

      if (passed) {
        console.log(`⚡ ${metric}: ${actualTime}ms (under ${threshold}ms threshold)`);
      } else {
        console.log(`⚠️  ${metric}: ${actualTime}ms (exceeds ${threshold}ms threshold)`);
      }
    }

    // Save bootstrap results
    const analysisDir = path.join(process.cwd(), 'analysis');
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    const bootstrapPath = path.join(analysisDir, 'ctas7_bootstrap_validation.json');
    fs.writeFileSync(bootstrapPath, JSON.stringify(bootstrapResults, null, 2));

    console.log('💾 Bootstrap validation saved to:', bootstrapPath);

    // Assert critical validations
    expect(bootstrapResults.errors.length).toBeLessThan(5); // Allow some minor errors
    expect(bootstrapResults.total_bootstrap_time).toBeLessThan(15000); // 15 second limit
    expect(Object.keys(bootstrapResults.functionality_validation).length).toBeGreaterThan(0);

    // Ensure at least some mathematical intelligence components are active
    const activeComponents = Object.values(bootstrapResults.mathematical_intelligence)
      .filter((comp: any) => comp.status === 'ACTIVE').length;
    expect(activeComponents).toBeGreaterThan(0);

    console.log('✅ CTAS-7 Bootstrap Validation Complete');
    console.log(`📊 Summary: ${bootstrapResults.bootstrap_sequence.length} steps, ${bootstrapResults.errors.length} errors, ${bootstrapResults.total_bootstrap_time}ms total`);
  });

  test('Environment Configuration Validation', async ({ stealthPage }) => {
    console.log('🔧 Validating CTAS-7 Environment Configuration...');

    const configResults: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment_variables: {},
      runtime_config: {},
      service_ports: {},
      validation_status: {}
    };

    // Check environment variables
    const expectedEnvVars = [
      'CTAS_ENV',
      'CTAS_BASE',
      'CTAS_DB_URL',
      'CTAS_NEURAL_MUX'
    ];

    for (const envVar of expectedEnvVars) {
      const value = process.env[envVar];
      configResults.environment_variables[envVar] = {
        set: !!value,
        value: value || null,
        status: value ? 'CONFIGURED' : 'MISSING'
      };
    }

    // Navigate to configuration page if available
    const baseUrl = process.env.CTAS_BASE || 'http://localhost:5173';
    await stealthPage.goto(`${baseUrl}/config`);

    // If config page doesn't exist, try main dashboard
    if (!await stealthPage.locator('body').textContent()) {
      await stealthPage.goto(baseUrl);
    }

    // Extract runtime configuration
    const runtimeConfig = await stealthPage.evaluate(() => {
      const config: any = {};

      // Look for global configuration objects
      try {
        // @ts-ignore
        if (window.CTAS_CONFIG) config.ctas_config = window.CTAS_CONFIG;
        // @ts-ignore
        if (window.APP_CONFIG) config.app_config = window.APP_CONFIG;
        // @ts-ignore
        if (window.ENVIRONMENT) config.environment = window.ENVIRONMENT;
      } catch (e) {
        config.extraction_error = e.message;
      }

      return config;
    });

    configResults.runtime_config = runtimeConfig;

    // Validate service ports are responding
    const servicePorts = [
      { name: 'Dev Server', port: 5173, protocol: 'http' },
      { name: 'SurrealDB', port: 8000, protocol: 'ws' },
      { name: 'Neural Mux', port: 18100, protocol: 'ws' },
      { name: 'Repository', port: 15180, protocol: 'http' },
      { name: 'Statistics', port: 18108, protocol: 'http' }
    ];

    for (const service of servicePorts) {
      try {
        if (service.protocol === 'http') {
          const response = await stealthPage.request.get(`http://localhost:${service.port}`);
          configResults.service_ports[service.name] = {
            port: service.port,
            status: response.status(),
            accessible: response.ok(),
            protocol: service.protocol
          };
        } else {
          // WebSocket services - attempt connection test
          const wsTest = await stealthPage.evaluate(async (port) => {
            try {
              const ws = new WebSocket(`ws://localhost:${port}`);
              return new Promise(resolve => {
                ws.onopen = () => {
                  ws.close();
                  resolve({ accessible: true, status: 'connected' });
                };
                ws.onerror = () => resolve({ accessible: false, status: 'connection_failed' });
                setTimeout(() => resolve({ accessible: false, status: 'timeout' }), 3000);
              });
            } catch (e) {
              return { accessible: false, status: 'error', error: e.message };
            }
          }, service.port);

          configResults.service_ports[service.name] = {
            port: service.port,
            protocol: service.protocol,
            ...wsTest
          };
        }
      } catch (e) {
        configResults.service_ports[service.name] = {
          port: service.port,
          accessible: false,
          error: e.message,
          protocol: service.protocol
        };
      }
    }

    // Overall validation status
    const accessibleServices = Object.values(configResults.service_ports)
      .filter((service: any) => service.accessible).length;
    const configuredEnvVars = Object.values(configResults.environment_variables)
      .filter((env: any) => env.status === 'CONFIGURED').length;

    configResults.validation_status = {
      services_accessible: accessibleServices,
      total_services: servicePorts.length,
      env_vars_configured: configuredEnvVars,
      total_env_vars: expectedEnvVars.length,
      overall_health: (accessibleServices / servicePorts.length) * 100
    };

    // Save configuration validation results
    const configPath = path.join(process.cwd(), 'analysis', 'ctas7_config_validation.json');
    fs.writeFileSync(configPath, JSON.stringify(configResults, null, 2));

    console.log('⚙️  Configuration validation saved to:', configPath);
    console.log(`🏥 Overall Health: ${configResults.validation_status.overall_health.toFixed(1)}%`);
    console.log(`📡 Services: ${accessibleServices}/${servicePorts.length} accessible`);
    console.log(`🔧 Environment: ${configuredEnvVars}/${expectedEnvVars.length} configured`);

    // Assert minimum requirements
    expect(configResults.validation_status.overall_health).toBeGreaterThan(50); // 50% minimum health
    expect(accessibleServices).toBeGreaterThan(0); // At least one service must be accessible
  });
});