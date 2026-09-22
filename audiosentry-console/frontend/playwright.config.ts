import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    permissions: ['microphone'], // Auto-grant microphone permissions
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream'
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Configure local web servers to spin up during tests
  webServer: [
    {
      command: 'npm run dev', // Vite server
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node ../bff/src/server.js', // Node BFF
      port: 4000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
