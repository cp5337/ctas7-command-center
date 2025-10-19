import { chromium, FullConfig } from '@playwright/test';
import fs from 'node:fs/promises';

async function globalSetup(config: FullConfig) {
  console.log('🚀 CTAS-7 Dioxus Test Harness - Global Setup');

  // Ensure test directories exist
  await fs.mkdir('./tests/reports', { recursive: true });
  await fs.mkdir('./tests/screenshots', { recursive: true });
  await fs.mkdir('./tests/results', { recursive: true });

  // Validate environment
  const requiredEnvVars = [
    'CTAS_BASE',
    'CTAS_DB_URL',
    'CTAS_NEURAL_MUX'
  ];

  const env = {
    CTAS_BASE: process.env.CTAS_BASE || 'http://localhost:3000',
    CTAS_DB_URL: process.env.CTAS_DB_URL || 'ws://localhost:8000',
    CTAS_NEURAL_MUX: process.env.CTAS_NEURAL_MUX || 'ws://localhost:18100',
  };

  console.log('🔧 Environment Configuration:');
  Object.entries(env).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  // Test database connectivity
  console.log('🗄️ Testing database connectivity...');

  try {
    // Test SurrealDB connection
    const response = await fetch(`${env.CTAS_DB_URL.replace('ws://', 'http://')}/health`, {
      method: 'GET',
      timeout: 5000
    });

    if (response.ok) {
      console.log('✅ SurrealDB connection successful');
    } else {
      console.log('⚠️  SurrealDB connection failed - tests may fail');
    }
  } catch (error) {
    console.log('⚠️  SurrealDB health check failed - tests may fail');
  }

  // Setup browser for pre-warming
  console.log('🌐 Pre-warming browser environment...');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'CTAS7-Playwright/1.0 (GlobalSetup; Pre-warm)',
  });

  const page = await context.newPage();

  try {
    // Pre-warm the application
    await page.goto(env.CTAS_BASE, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Application pre-warmed successfully');

    // Check if CTAS dashboard is loaded
    const isDashboardLoaded = await page.$('[data-component="ctas-dashboard"]');
    if (isDashboardLoaded) {
      console.log('✅ CTAS-7 Dashboard detected');
    } else {
      console.log('⚠️  CTAS-7 Dashboard not detected - may be loading');
    }

  } catch (error) {
    console.log('⚠️  Application pre-warm failed:', error);
  } finally {
    await browser.close();
  }

  // Create test session metadata
  const sessionMetadata = {
    sessionId: `ctas7-${Date.now()}`,
    startTime: new Date().toISOString(),
    environment: env,
    config: {
      timeout: config.timeout,
      retries: config.retries,
      workers: config.workers,
    },
    projects: config.projects.map(p => ({
      name: p.name,
      viewport: p.use?.viewport,
      userAgent: p.use?.userAgent,
    })),
  };

  await fs.writeFile(
    './tests/reports/session-metadata.json',
    JSON.stringify(sessionMetadata, null, 2),
    'utf8'
  );

  console.log('📋 Session metadata saved');
  console.log('🎯 Global setup complete - ready for testing');
}

export default globalSetup;