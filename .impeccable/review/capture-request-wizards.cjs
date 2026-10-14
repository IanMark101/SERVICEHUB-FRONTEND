// Bounded browser QA: every API/socket call is intercepted; no live writes.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const category = { id: 'qa-category', name: 'Computer & Laptop Repair', description: 'Laptop and desktop repairs.', isActive: true };
const service = { id: 'qa-service', providerId: 'qa-owner', title: 'LAPTOP REPAIR', description: 'Laptop diagnostics and repairs.', price: 500, priceType: 'PER_HOUR', estimatedDurationMins: 60, status: 'ACTIVE', isAvailable: true, paymentMethods: { cash: true, gcash: true }, serviceLocationMode: 'BOTH', locationLabel: 'Cordova workshop', coverageRadiusKm: 10, transportationFee: 75, provider: { id: 'qa-owner', name: 'Ian Buenaflor', location: 'Cordova', verificationStatus: 'APPROVED', trustScore: 65 }, category, photos: [] };
const template = { title: 'LAPTOP WILL NOT START', description: 'My laptop does not start, even when plugged in. Please diagnose and repair it.', categoryId: category.id, categoryName: category.name, budget: 1500, paymentMethods: { cash: true, gcash: true }, serviceLocationMode: 'PROVIDER_VISITS', jobLocation: { latitude: 10.258, longitude: 123.95, label: 'Cordova, Cebu', address: 'Blue gate beside the barangay hall' }, transportationFee: 50, photos: [{ id: 'qa-photo', url: '/images/hero-paper.png', width: 640, height: 400 }] };
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
      await page.addInitScript(theme => { localStorage.setItem('workspaceRole', 'seeker'); localStorage.setItem('theme', theme); }, theme);
      await context.routeWebSocket('**/socket.io/**', socket => socket.close());
      await page.route('**/socket.io/**', route => route.abort());
      const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'qa-viewer', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
      await page.route('**/api/**', async route => {
        const p = new URL(route.request().url()).pathname, method = route.request().method();
        const requestBody = route.request().postDataJSON();
        if (method === 'POST') writes.push({ p, body: requestBody });
        let body = { success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
        if (['/api/auth/me', '/api/auth/session', '/api/auth/refresh'].includes(p)) body = { success: true, data: { authenticated: true, accessToken: token, user: { id: 'qa-viewer', role: 'user', name: 'QA Member', email: 'qa@example.test', emailVerified: true, verificationStatus: 'APPROVED', moderationStatus: 'ACTIVE', onboardingStatus: 'COMPLETED', trustScore: 70 } } };
        else if (p === '/api/categories') body.data = [category];
        else if (p === '/api/services') body.data = [service];
        else if (p === '/api/services/qa-service') body.data = service;
        else if (p === '/api/requests/qa-repost/repost-template') body.data = template;
        else if (p === '/api/requests' && method === 'POST') body.data = { id: 'qa-created-request', ...requestBody };
        else if (p === '/api/bookings/direct') body.data = { id: 'qa-created-booking' };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      });
      const base = 'http://localhost:3104';
      await page.goto(base + '/seeker/post-request', { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Post a Request', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '0');
      assert.equal(await page.getByRole('textbox', { name: 'Request title', exact: true }).getAttribute('aria-invalid'), 'true');
      await page.getByRole('textbox', { name: 'Request title', exact: true }).fill('Laptop will not turn on');
      await page.getByRole('combobox', { name: 'Service category', exact: true }).selectOption(category.id);
      await page.getByRole('textbox', { name: 'Describe what you need', exact: true }).fill(template.description);
      await page.evaluate(() => document.fonts.ready);
      await capture(page, `.impeccable/review/post-wizard-details-${width}-${theme}.png`);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '25');
      assert.equal(await page.getByRole('textbox', { name: 'Request title', exact: true }).count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(writes.filter(item => item.p === '/api/requests').length, 0);

      await page.goto(base + '/seeker/post-request?repost=qa-repost', { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Post this request again' }).waitFor();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      if (width === 390) {
        await page.locator('[data-wizard-step="1"] summary').click();
        const map = page.locator('[data-wizard-step="1"] .leaflet-container');
        await map.waitFor();
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        assert.equal(await map.evaluate(el => el.clientWidth > 0 && el.clientHeight > 0), true);
        assert.equal(await page.getByRole('textbox', { name: /Address or directions/ }).inputValue(), template.jobLocation.address);
      }
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '50');
      await page.getByRole('combobox', { name: 'When do you need help?', exact: true }).selectOption('This Week');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('checkbox', { name: /GCash/ }).uncheck();
      await page.getByRole('button', { name: 'Review request', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '100');
      await capture(page, `.impeccable/review/post-wizard-review-${width}-${theme}.png`);
      assert.equal(writes.filter(item => item.p === '/api/requests').length, 0);
      await page.getByRole('button', { name: 'Edit request details', exact: true }).click();
      assert.equal(await page.getByRole('textbox', { name: 'Request title', exact: true }).inputValue(), template.title);
      for (const name of ['Next', 'Next', 'Next', 'Review request']) await page.getByRole('button', { name, exact: true }).click();
      await page.getByRole('button', { name: 'Post request', exact: true }).click();
      await page.getByText('Your request is live. Providers can now send offers.', { exact: true }).waitFor();
      const postWrites = writes.filter(item => item.p === '/api/requests');
      assert.equal(postWrites.length, 1);
      assert.deepEqual(postWrites[0].body.photoIds, ['qa-photo']);
      assert.deepEqual(postWrites[0].body.paymentMethods, { cash: true, gcash: false });
      assert.deepEqual(postWrites[0].body.jobLocation, template.jobLocation);

      await page.goto(base + '/seeker/seek-services?serviceId=qa-service', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /Book This Service/i }).click();
      await page.getByRole('heading', { name: 'Send a request', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '0');
      await page.getByRole('textbox', { name: 'Describe the work needed', exact: true }).fill('Please repair my laptop. I can bring it to your workshop.');
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('radio', { name: /You go to the provider/ }).check();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('textbox', { name: /Preferred schedule/ }).fill('Saturday afternoon');
      await page.getByRole('spinbutton', { name: 'Number of hours', exact: true }).fill('2');
      await capture(page, `.impeccable/review/booking-wizard-payment-${width}-${theme}.png`);
      await page.getByRole('button', { name: 'Review request', exact: true }).click();
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), '100');
      assert.equal(writes.filter(item => item.p === '/api/bookings/direct').length, 0);
      await capture(page, `.impeccable/review/booking-wizard-review-${width}-${theme}.png`);
      const dialog = page.getByRole('dialog', { name: 'Send a request' });
      assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth), false);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole('button', { name: 'Back', exact: true }).click();
      assert.equal(await page.getByRole('spinbutton', { name: 'Number of hours', exact: true }).inputValue(), '2');
      assert.equal(await page.getByRole('textbox', { name: /Preferred schedule/ }).inputValue(), 'Saturday afternoon');
      await page.getByRole('button', { name: 'Review request', exact: true }).click();
      await page.getByRole('button', { name: 'Send Request', exact: true }).click();
      await page.getByRole('heading', { name: 'Request Sent Successfully!', exact: true }).waitFor();
      const bookingWrites = writes.filter(item => item.p === '/api/bookings/direct');
      assert.equal(bookingWrites.length, 1);
      assert.equal(bookingWrites[0].body.quantity, 2);
      assert.equal(bookingWrites[0].body.schedule, 'Saturday afternoon');
      assert.equal(bookingWrites[0].body.serviceLocationMode, 'SEEKER_VISITS');
      assert.equal('jobLocation' in bookingWrites[0].body, false);
      assert.deepEqual(errors, []);
      results.push({ width, theme, postSteps: 5, bookingSteps: 4, noEarlyWrites: true, draftPreserved: true, openMapRestored: width === 390 ? true : null, postWrites: 1, bookingWrites: 1, horizontalOverflow: false, pageErrors: errors });
      console.log(JSON.stringify(results.at(-1)));
      await context.close();
    }
    fs.writeFileSync('.impeccable/review/request-form-wizards-review.json', JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
