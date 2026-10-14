// Illustrative browser QA; all API writes and sockets are intercepted.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const category = { id: 'qa-category', name: 'Computer & Laptop Repair', isActive: true };
const location = { latitude: 10.258, longitude: 123.95, label: 'Cordova, Cebu' };
async function capture(page, path) {
  for (const button of await page.getByRole('button', { name: 'Dismiss toast' }).all()) await button.click();
  await page.screenshot({ path, fullPage: true });
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const [width, theme] of [[1440, 'light'], [768, 'light'], [390, 'dark'], [320, 'light']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
      const page = await context.newPage(); page.setDefaultTimeout(12000);
      const errors = []; const writes = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(theme => { localStorage.setItem('workspaceRole', 'provider'); localStorage.setItem('theme', theme); }, theme);
      await context.routeWebSocket('**/socket.io/**', socket => socket.close());
      await page.route('**/socket.io/**', route => route.abort());
      const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'qa-viewer', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
      await page.route('**/api/**', async route => {
        const p = new URL(route.request().url()).pathname, method = route.request().method();
        const requestBody = route.request().postDataJSON();
        if (p === '/api/services' && method === 'POST') writes.push(requestBody);
        let body = { success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
        if (['/api/auth/me', '/api/auth/session', '/api/auth/refresh'].includes(p)) body = { success: true, data: { authenticated: true, accessToken: token, user: { id: 'qa-viewer', role: 'user', name: 'QA Provider', email: 'qa@example.test', phone: '09123456789', emailVerified: true, verificationStatus: 'APPROVED', moderationStatus: 'ACTIVE', onboardingStatus: 'COMPLETED', trustScore: 70 } } };
        else if (p === '/api/categories') body.data = [category];
        else if (p === '/api/locations/search') body.data = [location];
        else if (p === '/api/services' && method === 'POST') body.data = { id: 'qa-new-service', ...requestBody, category, status: 'ACTIVE', isAvailable: true, photos: [] };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      });
      await page.goto('http://localhost:3105/provider/offer-services', { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Create a Service Listing', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '0');
      await page.getByRole('textbox', { name: 'Service name', exact: true }).fill('Laptop repair services');
      await page.getByRole('combobox', { name: 'Service category', exact: true }).selectOption(category.id);
      await page.getByRole('textbox', { name: 'What is included?', exact: true }).fill('I diagnose and repair laptops. The service includes checking the issue; replacement parts cost extra.');
      await page.evaluate(() => document.fonts.ready);
      await capture(page, `.impeccable/review/provider-wizard-details-${width}-${theme}.png`);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.locator('[data-wizard-step="1"] summary').click();
      await page.getByRole('textbox', { name: 'Find a city or barangay', exact: true }).fill('Cordova');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.getByRole('button', { name: 'Cordova, Cebu', exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '25');
      await page.getByRole('combobox', { name: 'How far will you travel? (required)', exact: true }).selectOption('10');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('spinbutton', { name: 'Service price (₱)', exact: true }).fill('1500');
      await page.getByRole('combobox', { name: 'How do you charge?', exact: true }).selectOption('PER_PROJECT');
      await page.getByRole('spinbutton', { name: 'Time needed (minutes)', exact: true }).fill('60');
      await page.getByRole('spinbutton', { name: /Your travel fee/ }).fill('75');
      await capture(page, `.impeccable/review/provider-wizard-price-${width}-${theme}.png`);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('checkbox', { name: /GCash/ }).uncheck();
      await page.getByRole('button', { name: 'Review service', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '100');
      assert.equal(writes.length, 0);
      await capture(page, `.impeccable/review/provider-wizard-review-${width}-${theme}.png`);
      const fillColor = await page.getByRole('progressbar').locator('span').evaluate(el => getComputedStyle(el).backgroundColor);
      const actionColor = await page.getByRole('button', { name: 'Publish service', exact: true }).evaluate(el => getComputedStyle(el).backgroundColor);
      assert.equal(fillColor, actionColor);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole('button', { name: 'Edit price and duration', exact: true }).click();
      assert.equal(await page.getByRole('spinbutton', { name: 'Service price (₱)', exact: true }).inputValue(), '1500');
      assert.equal(await page.getByRole('combobox', { name: 'How do you charge?', exact: true }).inputValue(), 'PER_PROJECT');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('checkbox', { name: /GCash/ }).isChecked(), false);
      await page.getByRole('button', { name: 'Review service', exact: true }).click();
      await page.getByRole('button', { name: 'Publish service', exact: true }).click();
      await page.getByRole('progressbar').filter({ has: page.locator('span') }).waitFor();
      await page.waitForFunction(() => document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow') === '0');
      assert.equal(writes.length, 1);
      assert.equal(writes[0].price, 1500); assert.equal(writes[0].priceType, 'PER_PROJECT');
      assert.equal(writes[0].estimatedDurationMins, 60); assert.equal(writes[0].coverageRadiusKm, 10);
      assert.equal(writes[0].transportationFee, 75); assert.equal(writes[0].venueAddress, null);
      assert.deepEqual(writes[0].serviceLocation, location); assert.deepEqual(writes[0].paymentMethods, { cash: true, gcash: false });
      assert.deepEqual(errors, []);
      results.push({ width, theme, steps: 5, providerColor: fillColor, noEarlyWrites: true, draftPreserved: true, publishWrites: 1, horizontalOverflow: false, pageErrors: errors });
      console.log(JSON.stringify(results.at(-1)));
      await context.close();
    }
    fs.writeFileSync('.impeccable/review/provider-wizard-review.json', JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
