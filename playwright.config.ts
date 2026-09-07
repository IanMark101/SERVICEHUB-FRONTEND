import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../SERVICEHUB-BACKEND',
      url: 'http://localhost:3101/health',
      env: { PORT: '3101', FRONTEND_URL: 'http://localhost:3100', NODE_ENV: 'development' },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run start -- -p 3100',
      url: 'http://localhost:3100',
      env: { NEXT_PUBLIC_API_URL: 'http://localhost:3101/api' },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
