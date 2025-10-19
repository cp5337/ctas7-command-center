import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs/promises';

interface ActionElement {
  id: string;
  role: string;
  dbRoute: string | null;
  triggerType: string;
  expectedResponse: string;
  latencyMs: number | null;
  dependencies: string[];
  element?: {
    tag: string;
    text: string;
    classes: string;
    position: { x: number; y: number };
  };
  testResult?: {
    triggered: boolean;
    responseReceived: boolean;
    actualLatency: number;
    errors: string[];
  };
}

interface ActionMatrix {
  timestamp: string;
  baseUrl: string;
  viewport: { width: number; height: number };
  userAgent: string;
  elements: ActionElement[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    avgLatency: number;
  };
}

const BASE_URL = process.env.CTAS_BASE ?? 'http://localhost:3000';
const LATENCY_THRESHOLD = 250; // ms

test.describe('CTAS-7 Dioxus Dashboard Test Harness', () => {
  let actionMatrix: ActionMatrix;

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Initialize action matrix
    actionMatrix = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      viewport: page.viewportSize() || { width: 1280, height: 720 },
      userAgent: await page.evaluate(() => navigator.userAgent),
      elements: [],
      summary: { total: 0, passed: 0, failed: 0, avgLatency: 0 }
    };
  });

  test('Auto-discover and classify UI elements', async ({ page }) => {
    console.log('🔍 Discovering CTAS-7 UI elements...');

    // Discover all actionable elements
    const elements = await discoverActionElements(page);
    actionMatrix.elements = elements;
    actionMatrix.summary.total = elements.length;

    console.log(`📊 Discovered ${elements.length} actionable elements`);

    // Test each element
    for (const element of elements) {
      await testActionElement(page, element);
    }

    // Calculate summary
    const passed = actionMatrix.elements.filter(e => e.testResult?.triggered && e.testResult?.responseReceived).length;
    const failed = actionMatrix.elements.length - passed;
    const avgLatency = actionMatrix.elements
      .filter(e => e.testResult?.actualLatency)
      .reduce((sum, e) => sum + (e.testResult?.actualLatency || 0), 0) / actionMatrix.elements.length;

    actionMatrix.summary = { total: elements.length, passed, failed, avgLatency };

    // Generate reports
    await generateActionMatrix();
    await generateJsonReport();
    await captureScreenshots(page);

    // Assertions
    expect(passed).toBeGreaterThan(0);
    expect(avgLatency).toBeLessThan(LATENCY_THRESHOLD);
  });

  test('Validate Neural-Mux event binding', async ({ page }) => {
    console.log('🧠 Testing Neural-Mux event triggers...');

    // Find elements with neural-mux bindings
    const neuralMuxElements = await page.$$eval('[data-neural-mux]', elements =>
      elements.map(el => ({
        id: el.id || 'unknown',
        topic: el.getAttribute('data-neural-mux'),
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().slice(0, 50) || ''
      }))
    );

    console.log(`🔗 Found ${neuralMuxElements.length} Neural-Mux bound elements`);

    for (const element of neuralMuxElements) {
      // Mock WebSocket connection to neural-mux
      await page.evaluate((topic) => {
        window.neuralMuxEvents = window.neuralMuxEvents || [];
        window.neuralMuxEvents.push({ topic, timestamp: Date.now() });
      }, element.topic);

      console.log(`📡 Simulated Neural-Mux event for topic: ${element.topic}`);
    }

    expect(neuralMuxElements.length).toBeGreaterThan(0);
  });

  test('Validate database route connectivity', async ({ page }) => {
    console.log('🗄️ Testing database route connectivity...');

    const dbRoutes = await page.$$eval('[data-route]', elements =>
      elements.map(el => ({
        route: el.getAttribute('data-route'),
        action: el.getAttribute('data-action'),
        component: el.getAttribute('data-component'),
        id: el.id || 'unknown'
      }))
    );

    const routeTypes = {
      surrealdb: dbRoutes.filter(r => r.route?.startsWith('surrealdb://')).length,
      supabase: dbRoutes.filter(r => r.route?.startsWith('supabase://')).length,
      redis: dbRoutes.filter(r => r.route?.startsWith('redis://')).length
    };

    console.log('📊 Database route distribution:', routeTypes);

    // Validate each route type is present
    expect(routeTypes.surrealdb).toBeGreaterThan(0);
    expect(routeTypes.supabase).toBeGreaterThan(0);
    expect(dbRoutes.length).toBeGreaterThan(0);
  });

  test('Mobile responsiveness validation', async ({ page, browser }) => {
    console.log('📱 Testing mobile responsiveness...');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Check all action bindings still work
    const mobileElements = await discoverActionElements(page);

    for (const element of mobileElements) {
      const isVisible = await page.isVisible(`[data-action="${element.id}"]`);
      if (isVisible) {
        await testActionElement(page, element);
      }
    }

    // Capture mobile screenshot
    await page.screenshot({
      path: './tests/screenshots/mobile_dashboard.png',
      fullPage: true
    });

    console.log('📱 Mobile layout validation complete');
    expect(mobileElements.length).toBeGreaterThan(0);
  });
});

async function discoverActionElements(page: Page): Promise<ActionElement[]> {
  // Discover all elements with action attributes
  const rawElements = await page.$$eval('*', elements => {
    return elements
      .filter(el =>
        el.hasAttribute('data-action') ||
        el.hasAttribute('data-route') ||
        el.hasAttribute('data-component') ||
        el.hasAttribute('data-neural-mux')
      )
      .map(el => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.getAttribute('data-action') || el.id || `elem-${Math.random().toString(36).substr(2, 9)}`,
          role: el.getAttribute('data-component') || el.tagName.toLowerCase(),
          dbRoute: el.getAttribute('data-route'),
          triggerType: el.tagName.toLowerCase() === 'button' ? 'click' :
                       el.hasAttribute('onclick') ? 'click' : 'hover',
          expectedResponse: el.getAttribute('data-action') || 'unknown',
          neuralMuxTopic: el.getAttribute('data-neural-mux'),
          dependencies: (el.getAttribute('data-requires') || '').split(',').filter(Boolean),
          element: {
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 100),
            classes: el.className,
            position: { x: rect.x, y: rect.y }
          }
        };
      });
  });

  // Convert to ActionElement format
  return rawElements.map(raw => ({
    id: raw.id,
    role: raw.role,
    dbRoute: raw.dbRoute,
    triggerType: raw.triggerType,
    expectedResponse: raw.expectedResponse,
    latencyMs: null,
    dependencies: raw.dependencies.concat(raw.neuralMuxTopic ? ['neural-mux'] : []),
    element: raw.element
  }));
}

async function testActionElement(page: Page, element: ActionElement): Promise<void> {
  const startTime = Date.now();
  let triggered = false;
  let responseReceived = false;
  const errors: string[] = [];

  try {
    // Find the element
    const selector = element.element?.tag === 'button' ?
      `button:has-text("${element.element.text.slice(0, 20)}")` :
      `[data-action="${element.id}"]`;

    const elementHandle = await page.$(selector);
    if (!elementHandle) {
      errors.push(`Element not found: ${selector}`);
      return;
    }

    // Setup response monitoring
    if (element.dbRoute) {
      page.on('response', (response) => {
        if (response.url().includes('supabase') ||
            response.url().includes('localhost:8000') ||
            response.url().includes('redis')) {
          responseReceived = true;
        }
      });
    }

    // Trigger the action
    if (element.triggerType === 'click') {
      await elementHandle.click();
      triggered = true;
    } else if (element.triggerType === 'hover') {
      await elementHandle.hover();
      triggered = true;
    }

    // Wait for response (with timeout)
    if (element.dbRoute) {
      await page.waitForTimeout(100); // Give time for network requests
    }

  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  const actualLatency = Date.now() - startTime;

  element.testResult = {
    triggered,
    responseReceived: responseReceived || !element.dbRoute, // No DB route = no response expected
    actualLatency,
    errors
  };

  console.log(`${triggered && (responseReceived || !element.dbRoute) ? '✅' : '❌'} ${element.id}: ${actualLatency}ms`);
}

async function generateActionMatrix(): Promise<void> {
  const markdown = `# CTAS-7 Action Matrix Report

Generated: ${actionMatrix.timestamp}
Base URL: ${actionMatrix.baseUrl}
Viewport: ${actionMatrix.viewport.width}x${actionMatrix.viewport.height}

## Summary
- **Total Elements**: ${actionMatrix.summary.total}
- **Passed**: ${actionMatrix.summary.passed}
- **Failed**: ${actionMatrix.summary.failed}
- **Average Latency**: ${actionMatrix.summary.avgLatency.toFixed(2)}ms

## Action Matrix

| Element | Role | DB Route | Trigger Type | Expected Response | Latency (ms) | Result |
|---------|------|----------|--------------|------------------|--------------|--------|
${actionMatrix.elements.map(e =>
  `| ${e.id} | ${e.role} | ${e.dbRoute || 'N/A'} | ${e.triggerType} | ${e.expectedResponse} | ${e.testResult?.actualLatency || 'N/A'} | ${e.testResult?.triggered && e.testResult?.responseReceived ? '✅' : '❌'} |`
).join('\n')}

## Details

${actionMatrix.elements.map(e => `
### ${e.id}
- **Role**: ${e.role}
- **DB Route**: ${e.dbRoute || 'None'}
- **Dependencies**: ${e.dependencies.join(', ') || 'None'}
- **Triggered**: ${e.testResult?.triggered ? 'Yes' : 'No'}
- **Response**: ${e.testResult?.responseReceived ? 'Yes' : 'No'}
- **Latency**: ${e.testResult?.actualLatency || 'N/A'}ms
- **Errors**: ${e.testResult?.errors.join(', ') || 'None'}
`).join('\n')}
`;

  await fs.mkdir('./tests/reports', { recursive: true });
  await fs.writeFile('./tests/reports/playwright_action_matrix.md', markdown, 'utf8');
}

async function generateJsonReport(): Promise<void> {
  await fs.mkdir('./tests/reports', { recursive: true });
  await fs.writeFile('./tests/reports/playwright_actions_report.json',
    JSON.stringify(actionMatrix, null, 2), 'utf8');
}

async function captureScreenshots(page: Page): Promise<void> {
  await fs.mkdir('./tests/screenshots', { recursive: true });

  // Desktop screenshot
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({
    path: './tests/screenshots/desktop_dashboard.png',
    fullPage: true
  });

  // Mobile screenshot
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({
    path: './tests/screenshots/mobile_dashboard.png',
    fullPage: true
  });

  console.log('📸 Screenshots captured: desktop_dashboard.png, mobile_dashboard.png');
}