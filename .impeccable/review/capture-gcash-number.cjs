// All API/socket traffic is intercepted. Wallet values here are synthetic QA data.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const category = { id: 'qa-category', name: 'Computer & Laptop Repair', isActive: true };
const location = { latitude: 10.258, longitude: 123.95, label: 'Cordova, Cebu' };
const base = 'http://localhost:3106';
async function paymentStep(page, workspace) {
  const provider = workspace === 'provider';
  await page.goto(base + (provider ? '/provider/offer-services' : '/seeker/post-request'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: provider ? 'Service name' : 'Request title', exact: true }).fill(provider ? 'Laptop repair services' : 'Laptop will not start');
  await page.getByRole('textbox', { name: provider ? 'What is included?' : 'Describe what you need', exact: true }).fill('Please diagnose the laptop power issue and repair it. Replacement parts cost extra.');
  await page.getByRole('combobox', { name: 'Service category', exact: true }).selectOption(category.id);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  if (!provider) await page.getByRole('radio', { name: /You go to the provider/ }).check();
  await page.locator('[data-wizard-step="1"] summary').click();
  await page.getByRole('textbox', { name: 'Find a city or barangay', exact: true }).fill('Cordova');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: 'Cordova, Cebu', exact: true }).click();
  if (provider) await page.getByRole('combobox', { name: 'How far will you travel? (required)', exact: true }).selectOption('10');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('spinbutton', { name: provider ? 'Service price (₱)' : 'Your service budget (₱)', exact: true }).fill('1500');
  if (!provider) await page.getByRole('combobox', { name: 'When do you need help?', exact: true }).selectOption('This Week');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('checkbox', { name: /GCash/ }).check();
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const workspace of (process.env.GCASH_QA_WORKSPACE ? [process.env.GCASH_QA_WORKSPACE] : ['provider', 'seeker'])) for (const [width, theme] of [[1440, 'light'], [390, 'dark'], [320, 'light']]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
      const page = await context.newPage(); page.setDefaultTimeout(15000);
      let saved = null; const writes = []; const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ workspace, theme }) => { localStorage.setItem('workspaceRole', workspace); localStorage.setItem('theme', theme); }, { workspace, theme });
      await context.routeWebSocket('**/socket.io/**', socket => socket.close());
      await page.route('**/socket.io/**', route => route.abort());
      const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'qa-viewer', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
      await page.route('**/api/**', async route => {
        const p = new URL(route.request().url()).pathname; const method = route.request().method();
        let body = { success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
        if (['/api/auth/me', '/api/auth/session', '/api/auth/refresh'].includes(p)) body.data = { authenticated: true, accessToken: token, user: { id: 'qa-viewer', role: 'user', name: 'QA Member', email: 'qa@example.test', phone: '09911111111', emailVerified: true, verificationStatus: 'APPROVED', moderationStatus: 'ACTIVE', onboardingStatus: 'COMPLETED', trustScore: 70 } };
        else if (p === '/api/categories') body.data = [category];
        else if (p === '/api/locations/search') body.data = [location];
        else if (p === '/api/auth/gcash-number') {
          if (method === 'PUT') { const payload = route.request().postDataJSON(); writes.push({ p, payload }); saved = payload.gcashNumber; }
          body.data = { gcashNumber: saved };
        } else if (method !== 'GET' && !p.startsWith('/api/auth/')) writes.push({ p, payload: route.request().postDataJSON() });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      });
      await paymentStep(page, workspace);
      await page.getByRole('button', { name: 'Add GCash number', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Add GCash number', exact: true });
      await dialog.waitFor();
      await page.getByRole('button', { name: 'Save number', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '11 digits' }).waitFor();
      assert.equal(writes.length, 0);
      await page.getByRole('textbox', { name: 'GCash mobile number', exact: true }).fill('+63 912-345-6789');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `.impeccable/review/gcash-${workspace}-${width}-${theme}.png`, fullPage: true });
      const rect = await dialog.boundingBox(); assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width && rect.y + rect.height <= 900);
      assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth), false);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const submit = page.getByRole('button', { name: 'Save number', exact: true });
      await submit.focus(); await page.keyboard.press('Tab');
      assert.equal(await page.getByRole('button', { name: 'Close GCash number', exact: true }).evaluate(el => el === document.activeElement), true);
      await submit.click(); await dialog.waitFor({ state: 'hidden' });
      assert.equal(writes.length, 1); assert.deepEqual(writes[0], { p: '/api/auth/gcash-number', payload: { gcashNumber: '09123456789' } });
      await page.getByText('GCash number saved. Your contact number is unchanged.', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Back', exact: true }).click();
      assert.equal(await page.getByRole('spinbutton', { name: workspace === 'provider' ? 'Service price (₱)' : 'Your service budget (₱)', exact: true }).inputValue(), '1500');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Edit GCash number', exact: true }).click();
      assert.equal(await page.getByRole('textbox', { name: 'GCash mobile number', exact: true }).inputValue(), '09123456789');
      await page.keyboard.press('Escape'); assert.equal(await page.getByRole('button', { name: 'Edit GCash number', exact: true }).evaluate(el => el === document.activeElement), true);
      assert.deepEqual(errors, []);
      results.push({ workspace, width, theme, modalFits: true, focusTrap: true, draftPreserved: true, privatePreferenceWrites: 1, listingWrites: 0, horizontalOverflow: false, pageErrors: errors });
      console.log(JSON.stringify(results.at(-1))); await context.close();
    }
    fs.writeFileSync('.impeccable/review/gcash-number-review.json', JSON.stringify({ illustrativeFixtures: true, results }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
