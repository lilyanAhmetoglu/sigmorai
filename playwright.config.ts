import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { COOKIE_NOTICE_STORAGE_KEY } from './lib/constants/legal-copy';

const BASE_URL = 'http://localhost:3000';
const LOCAL_ENV = '.env.local';

// Playwright runs on Node and its test workers don't see Bun's .env loading,
// so read .env.local here (local runs only). CI sets the same names as job env.
if (existsSync(LOCAL_ENV)) process.loadEnvFile(LOCAL_ENV);

/**
 * E2E (ENGINEERING.md → Amendments 2026-10-06, SIG-26): one Chromium project
 * against the production build (`bun run build` first). Tests and the web
 * server share one test user and one database.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // One test user and one database: tests must not run side by side.
  workers: 1,
  // No retries: the setup resets the test user once, so a retried loop can't pass.
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // Every test starts with the cookie notice dismissed, so the sticky bar
    // never sits over a button a test clicks. header.spec.ts clears it to test the notice.
    storageState: {
      cookies: [],
      origins: [
        { origin: BASE_URL, localStorage: [{ name: COOKIE_NOTICE_STORAGE_KEY, value: '1' }] },
      ],
    },
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'bun run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
