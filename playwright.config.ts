import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/playwright',

  // Global test timeout
  timeout: 30 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['json', { outputFile: './tests/reports/playwright-report.json' }],
    ['html', { outputFolder: './tests/reports/html-report' }]
  ],

  // Global setup
  globalSetup: './tests/global-setup.ts',

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.CTAS_BASE || 'http://localhost:3000',

    // Collect trace when retrying failed test
    trace: 'retain-on-failure',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'CTAS7-Dioxus',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Custom user agent for CTAS-7 identification
        userAgent: 'CTAS7-Playwright/1.0 (Dioxus; EA-Dashboard) Chrome/118.0.0.0',
      },
      testMatch: /.*ctas7.*\.spec\.ts/,
    },

    {
      name: 'CTAS7-Mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 },
        userAgent: 'CTAS7-Playwright/1.0 (Dioxus; Mobile) Safari/15.0',
      },
      testMatch: /.*ctas7.*\.spec\.ts/,
    },

    {
      name: 'CTAS7-Tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
        userAgent: 'CTAS7-Playwright/1.0 (Dioxus; Tablet) Safari/15.0',
      },
      testMatch: /.*ctas7.*\.spec\.ts/,
    },

    // Legacy browser support for enterprise environments
    {
      name: 'CTAS7-Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*ctas7.*\.spec\.ts/,
    },
  ],

  // Configure local dev server
  webServer: process.env.CI ? undefined : {
    command: 'cargo run --bin ctas-dioxus-server',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for Rust compilation
    env: {
      CTAS_ENV: 'test',
      CTAS_DB_URL: 'ws://localhost:8000',
      CTAS_NEURAL_MUX: 'ws://localhost:18100',
      RUST_LOG: 'info',
    }
  },

  // Output directories
  outputDir: './tests/results',

  // Global test configuration
  globalTimeout: 10 * 60 * 1000, // 10 minutes

  // Test metadata
  metadata: {
    framework: 'CTAS-7 Dioxus',
    version: '0.7.0',
    environment: process.env.CTAS_ENV || 'development',
    neural_mux: process.env.CTAS_NEURAL_MUX || 'ws://localhost:18100',
    database: process.env.CTAS_DB_URL || 'ws://localhost:8000',
  }
});