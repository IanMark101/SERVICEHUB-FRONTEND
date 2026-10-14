// Illustrative browser QA only. All API and socket traffic is intercepted.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const service = { id: 'qa-service', providerId: 'qa-owner', title: 'LAPTOP REPAIR', description: 'Laptop diagnostics and repairs. Discuss the work with the provider before scheduling.', price: 1500, priceType: 'fixed', estimatedDurationMins: 60, status: 'ACTIVE', isAvailable: true, paymentMethods: { cash: true, gcash: true }, serviceLocationMode: 'PROVIDER_VISITS', locationLabel: 'Cordova, Cebu', coverageRadiusKm: 10, provider: { id: 'qa-owner', name: 'Ian Buenaflor', location: 'Cordova', verificationStatus: 'APPROVED', trustScore: 65, avatarUrl: '/images/hero-paper.png' }, category: { name: 'Computer & Laptop Repair' }, photos: [] };
const request = { id: 'qa-request', seekerId: 'qa-owner', title: 'LAPTOP WILL NOT START', description: 'My laptop does not start. I need help diagnosing and repairing the issue.', status: 'OPEN', urgency: 'This Week', budgetMin: 500, budgetMax: 1500, serviceLocationMode: 'PROVIDER_VISITS', locationLabel: 'Cordova, Cebu', paymentMethods: { cash: true, gcash: true }, seeker: { id: 'qa-owner', name: 'Mara Cabahug', location: 'Cordova', verificationStatus: 'APPROVED', trustScore: 60, avatarUrl: '/images/hero-paper.png' }, category: { name: 'Computer & Laptop Repair' }, photos: [] };
const booking = { status: 'ACCEPTED', started: false, paymentStatus: 'PAID', seeker: { name: 'Mara Cabahug' }, service: { title: 'Laptop repair' } };
const workload = { onlineQueueLimit: 5, cashJobs: [{ id: 'qa-cash', status: 'ACCEPTED', started: false, seeker: { name: 'John Sefuesca' }, service: { title: 'Printer repair' } }], paidJobs: [{ id: 'qa-queue-1', bookingId: 'qa-booking-1', position: 1, status: 'WAITING', paymentStatus: 'PAID', estimatedWait: 0, canStart: true, startBlockedReason: null, booking }, { id: 'qa-queue-2', bookingId: 'qa-booking-2', position: 2, status: 'WAITING', paymentStatus: 'PAID', estimatedWait: 60, canStart: false, startBlockedReason: 'An earlier paid booking must start first.', booking: { ...booking, service: { title: 'Desktop computer repair' } } }] };
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const [width, theme] of [[1440, 'light'], [390, 'dark']]) for (const role of ['provider', 'seeker']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
      const page = await context.newPage(); page.setDefaultTimeout(12000);
      const errors = []; const calls = []; let saved = true;
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ role, theme }) => { localStorage.setItem('workspaceRole', role); localStorage.setItem('theme', theme); }, { role, theme });
      await context.routeWebSocket('**/socket.io/**', socket => socket.close());
      await page.route('**/socket.io/**', route => route.abort());
      const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'qa-viewer', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.illustrative`;
      await page.route('**/api/**', async route => {
        const url = new URL(route.request().url()), p = url.pathname, method = route.request().method();
        calls.push({ p, method, body: route.request().postDataJSON() });
        let body = { success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
        if (['/api/auth/me', '/api/auth/session', '/api/auth/refresh'].includes(p)) body = { success: true, data: { authenticated: true, accessToken: token, user: { id: 'qa-viewer', role: 'user', name: 'QA Member', email: 'qa@example.test', emailVerified: true, verificationStatus: 'APPROVED', moderationStatus: 'ACTIVE', onboardingStatus: 'COMPLETED', trustScore: 70 } } };
        else if (p === '/api/bookings/provider-workload') { if (method === 'PATCH') workload.onlineQueueLimit = route.request().postDataJSON().onlineQueueLimit; body = { success: true, data: workload }; }
        else if (p === '/api/services') body.data = [service];
        else if (p === '/api/requests') body.data = [request];
        else if (p === '/api/services/qa-service') body.data = service;
        else if (p === '/api/requests/qa-request') body.data = request;
        else if (p === '/api/saved/status') body.data = saved ? [role === 'seeker' ? service.id : request.id] : [];
        else if (p.startsWith('/api/saved/')) { saved = method === 'PUT'; body.data = { saved }; }
        else if (p === '/api/saved') { const type = role === 'seeker' ? 'SERVICE_LISTING' : 'SERVICE_REQUEST', listing = role === 'seeker' ? service : request; body.data = { items: saved ? [{ id: 'qa-saved', listingId: listing.id, contentType: type, savedAt: '2026-10-14T00:00:00Z', listing }] : [], pagination: { page: 1, limit: 12, total: saved ? 1 : 0, totalPages: 1 } }; }
        else if (p === '/api/content-cases') body.data = { id: 'qa-report', status: 'OPEN' };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      });
      const base = process.env.WORKSPACE_QA_URL || 'http://localhost:3102';
      if (role === 'provider') {
        await page.goto(base + '/provider/work-queue', { waitUntil: 'domcontentloaded' });
        await page.getByRole('heading', { name: 'Your work queue' }).waitFor();
        await page.getByRole('button', { name: 'Start Job', exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: 'Start Job', exact: true }).isEnabled(), true);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `.impeccable/review/work-queue-${width}-${theme}.png`, fullPage: true });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      await page.goto(base + `/${role}/saved`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Saved listings' }).waitFor();
      await page.getByRole('button', { name: 'Remove from Saved' }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `.impeccable/review/saved-${role}-${width}-${theme}.png`, fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width > 1024) assert.equal(await page.locator('.marketplace-results-grid').evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length), 3);
      if (width > 1024) {
        const nav = await page.locator('aside button').allTextContents();
        const manager = nav.findIndex(text => text.trim() === (role === 'seeker' ? 'Request Manager' : 'Service Manager'));
        assert.equal(nav[manager + 1].trim(), 'Saved');
      }
      await page.getByRole('button', { name: 'Report listing', exact: true }).click();
      await page.getByRole('textbox', { name: 'Your explanation' }).fill('This listing contains misleading information. Please review it.');
      await page.getByRole('button', { name: 'Send report' }).click();
      await page.getByRole('button', { name: 'Report sent', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Report sent', exact: true }).isEnabled(), false);
      assert.equal(calls.filter(call => call.p === '/api/content-cases' && call.method === 'POST').length, 1);
      await page.getByRole('button', { name: 'Remove from Saved' }).click();
      await page.getByText('No saved listings yet', { exact: true }).waitFor();
      const type = role === 'seeker' ? 'SERVICE_LISTING' : 'SERVICE_REQUEST';
      assert.equal(calls.filter(call => call.p.includes(`/saved/${type}/`) && call.method === 'DELETE').length, 1);
      saved = true;
      await page.reload({ waitUntil: 'domcontentloaded' });
      const title = role === 'seeker' ? service.title : request.title;
      await page.getByRole('button', { name: `Inspect ${title} details` }).click();
      await page.getByRole('dialog').waitFor();
      assert.equal(calls.some(call => call.p === (role === 'seeker' ? '/api/services/qa-service' : '/api/requests/qa-request')), true);
      assert.deepEqual(errors, []);
      results.push({ role, width, theme, overflow: false, reportPosts: 1, unsaveDeletes: 1, originalDetailRead: true, pageErrors: errors });
      await context.close();
    }
    fs.writeFileSync('.impeccable/review/workspace-saved-review.json', JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
