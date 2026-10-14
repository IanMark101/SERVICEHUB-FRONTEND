// Illustrative QA data only; every backend request is intercepted.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
function fixture(file) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('exports', output)(exports);
  return exports;
}
const { safetyCase } = fixture('src/test/fixtures/moderation-cases.ts');
const { fixtureCase } = fixture('src/components/admin/content/fixtures.test-support.ts');
const fixtureToken = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'qa-admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.illustrative-signature`;
safetyCase.booking.messageCount = 121;
safetyCase.allowedPenalties = ['none', 'warn', 'trust_deduct', 'suspend', 'ban'];
const photo = { id: 'qa-photo', url: '/images/hero-paper.png', width: 1600, height: 900 };
fixtureCase.contentSnapshot.photos = [photo, { ...photo, id: 'qa-photo-2' }];
fixtureCase.content.photos = [];
const allMessages = Array.from({ length: 121 }, (_, i) => ({ id: `qa-message-${String(i).padStart(3, '0')}`, senderId: i % 2 ? 'qa-seeker' : 'qa-provider', sender: { name: i % 2 ? 'Mara Cabahug' : 'Rafael Abellana' }, isSystem: i % 12 === 0, createdAt: new Date(Date.UTC(2026, 9, 14, 1, i)).toISOString(), content: i % 12 === 0 ? 'Booking status changed: work is underway.' : `Illustrative message ${i}: We agreed to check the laptop first and confirm the repair price before replacing parts.\n${i % 5 === 0 ? 'Please confirm the visit and the repair details. '.repeat(12) : 'Please keep all updates in this booking conversation.'}` }));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const [width, theme] of [[1440, 'light'], [390, 'dark']]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
      const page = await context.newPage();
      const requests = []; page.on('response', response => { if (!response.url().includes('/_next/')) requests.push([response.status(), response.url()]); });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(theme => localStorage.setItem('theme', theme), theme);
      await page.route('**/socket.io/**', route => route.abort());
      await context.routeWebSocket('**/socket.io/**', socket => socket.close());
      await page.route('**/api/**', async route => {
        const url = new URL(route.request().url()); const p = url.pathname;
        let body = { success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
        if (['/api/auth/session', '/api/auth/me', '/api/auth/refresh'].includes(p)) body = { success: true, data: { authenticated: true, accessToken: fixtureToken, user: { id: 'qa-admin', name: 'QA Administrator', email: 'qa@example.test', role: 'admin', moderationStatus: 'ACTIVE', isActive: true, emailVerified: true, verificationStatus: 'APPROVED', trustScore: 90, onboardingStatus: 'COMPLETED' } } };
        else if (p.includes('/admin/moderation-cases/report/')) body = { success: true, data: safetyCase };
        else if (p === '/api/admin/moderation-cases') body = { success: true, data: [safetyCase], summary: { active: 1, underReview: 1, history: 0, concerns: { INAPPROPRIATE_BEHAVIOR: 1 } }, pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } };
        else if (/\/admin\/bookings\/[^/]+\/messages$/.test(p)) {
          const before = url.searchParams.get('before'); const end = before ? allMessages.findIndex(message => message.id === before) : allMessages.length;
          const start = Math.max(0, end - 50);
          body = { success: true, data: { messages: allMessages.slice(start, end), messageCount: allMessages.length, seeker: safetyCase.booking.seeker, provider: safetyCase.booking.provider, pagination: { hasMore: start > 0, nextBefore: start > 0 ? allMessages[start].id : null } } };
        } else if (p === '/api/admin/content/cases/case-1') body = { success: true, data: fixtureCase };
        else if (p === '/api/admin/content/cases') body = { success: true, data: [fixtureCase], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      });
      await page.goto('http://localhost:3102/admin/reports?case=report:qa-safety-case', { waitUntil: 'domcontentloaded' });
      try { await page.getByRole('heading', { name: 'Safety report', exact: true }).waitFor({ timeout: 8000 }); }
      catch (error) { console.log(await page.locator('body').innerText()); console.log(requests); throw error; }
      try { await page.getByRole('button', { name: 'Messages (121)', exact: true }).click({ timeout: 8000 }); }
      catch (error) { console.log(await page.locator('body').innerText()); console.log(errors); console.log(requests); throw error; }
      const frame = page.getByRole('region', { name: 'Booking conversation' }); await frame.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const initial = await frame.evaluate(element => ({ height: element.clientHeight, scrollHeight: element.scrollHeight, overflowY: getComputedStyle(element).overflowY, width: element.clientWidth }));
      assert.equal(initial.overflowY, 'auto'); assert.ok(initial.height < initial.scrollHeight);
      await page.getByRole('button', { name: 'Load older messages' }).click();
      await page.getByText('100 of 121 messages · Oldest to newest', { exact: true }).waitFor();
      await frame.evaluate(element => element.scrollTop = 0);
      await page.screenshot({ path: `.impeccable/review/admin-conversation-${width}-${theme}.png`, fullPage: true });
      const conversation = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, dark: document.querySelector('.dark') !== null, rows: document.querySelector('[aria-label="Booking conversation"] ol').children.length }));
      assert.equal(conversation.overflow, false); assert.equal(conversation.rows, 100);
      await page.goto('http://localhost:3102/admin/content-cases?caseId=case-1', { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Kitchen faucet repair', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Reported content', exact: true }).click();
      await page.getByText('Photo 1 of 2', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Next photo' }).click();
      await page.getByText('Photo 2 of 2', { exact: true }).waitFor();
      await page.getByText('View current version (changed since submission)', { exact: true }).click();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `.impeccable/review/admin-content-evidence-${width}-${theme}.png`, fullPage: true });
      const content = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, dark: document.querySelector('.dark') !== null, photos: [...document.querySelectorAll('img')].filter(image => image.alt.includes('photo')).map(image => ({ complete: image.complete, width: image.naturalWidth })) }));
      assert.equal(content.overflow, false); assert.ok(content.photos.every(photo => photo.complete && photo.width > 0)); assert.deepEqual(errors, []);
      results.push({ width, theme, initial, conversation, content, errors });
      await context.close();
    }
    fs.writeFileSync('.impeccable/review/admin-case-review.json', JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
