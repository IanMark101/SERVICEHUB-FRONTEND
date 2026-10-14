import fs from 'node:fs';
import { createRequire } from 'node:module';
const loadRuntime = createRequire(import.meta.url);
const { chromium } = loadRuntime(process.env.SERVICEHUB_PLAYWRIGHT_RUNTIME || 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--bypass-app-banner-engagement-checks'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const notices = [];
    const errors = [];
    const snapshots = [];
    page.on('console', message => {
      if (message.text().includes('Banner not shown') || message.text().includes('was preloaded')) notices.push({ url: page.url(), text: message.text() });
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__installEvents = [];
      window.addEventListener('beforeinstallprompt', event => {
        queueMicrotask(() => window.__installEvents.push({ trusted: event.isTrusted, cancelled: event.defaultPrevented }));
      });
    });
    await page.route('**/api/auth/captcha-config', route => route.fulfill({ json: { success: true, data: { enabled: false, siteKey: null, loginRequired: false } } }));
    await page.route('**/api/auth/session', route => route.fulfill({ json: { success: true, data: { authenticated: false } } }));
    const base = process.argv[2] || 'http://127.0.0.1:3107';
    async function snapshot(label) {
      // Wait for Chrome's delayed unused-preload diagnostic.
      await page.waitForTimeout(8000);
      snapshots.push({ label, url: page.url(), state: await page.evaluate(() => ({
        events: window.__installEvents,
        preloads: [...document.querySelectorAll('link[rel="preload"][as="style"]')].map(link => link.href),
        stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.href),
      })) });
    }
    await page.goto(`${base}/install`, { waitUntil: 'networkidle' });
    await snapshot('install');
    await page.getByRole('link', { name: 'Open ServiceHub', exact: true }).click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await snapshot('sign-in after workspace redirect');
    const report = { notices, errors, snapshots };
    fs.writeFileSync('.pwa-console-review.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (errors.length || notices.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
