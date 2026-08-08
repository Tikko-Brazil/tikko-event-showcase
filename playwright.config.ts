import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SMOKE_TEST_BASE_URL || 'http://127.0.0.1:4173';
const isLocal = /^(https?:\/\/)?(127\.0\.0\.1|localhost)(:\d+)?/.test(baseURL);
const localPort = new URL(baseURL).port || '4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  webServer: isLocal
    ? {
        command: `npm run dev -- --host 127.0.0.1 --port ${localPort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
