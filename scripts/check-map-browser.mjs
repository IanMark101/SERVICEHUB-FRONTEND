import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const origin = 'http://127.0.0.1:3197';
let server, browser;
let serverOutput = '';
const user = { id: 'map-browser-fixture', name: 'Map Fixture', email: 'map@example.test', role: 'user', emailVerified: true, verificationStatus: 'APPROVED', moderationStatus: 'ACTIVE', onboardingStatus: 'COMPLETED', trustScore: 55 };
const accessToken = `fixture.${Buffer.from(JSON.stringify({ sub: user.id, sid: 'fixture', exp: Math.floor(Date.now() / 1000) + 900 })).toString('base64url')}.fixture`;
const mapStyle = {
  version: 8,
  sources: { land: { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[123.90, 10.27], [123.94, 10.27], [123.94, 10.34], [123.90, 10.34], [123.90, 10.27]]] } } } },
  layers: [{ id: 'water', type: 'background', paint: { 'background-color': '#204060' } }, { id: 'land', source: 'land', type: 'fill', paint: { 'fill-color': '#e5e0d8' } }],
};
const rasterImage = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><path fill="#204060" d="M0 0h256v256H0z"/><path fill="#e5e0d8" d="M0 0h128v256H0z"/></svg>';

before(async () => {
  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '3197'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  for (const stream of [server.stdout, server.stderr]) stream.on('data', chunk => { serverOutput = (serverOutput + chunk).slice(-6000); });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Production server exited: ${serverOutput}`);
    try { ready = (await fetch(`${origin}/login`)).ok; } catch { /* Server is starting. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  assert(ready, `Production server did not start: ${serverOutput}`);
  browser = await chromium.launch({ executablePath: process.env.MAP_TEST_BROWSER_PATH || undefined, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
}, { timeout: 60_000 });

after(async () => {
  try {
    await browser?.close();
  } finally {
    if (server && server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit', { signal: AbortSignal.timeout(5000) });
      server.kill('SIGTERM');
      await exited;
    }
  }
});

async function openPicker(role, mode = 'vector') {
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
  await context.addInitScript(({ role, disableGL }) => {
    localStorage.setItem('servicehub:session-present', 'true');
    localStorage.setItem('workspaceRole', role);
    if (disableGL) {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...options) { return type === 'webgl2' ? null : original.call(this, type, ...options); };
    }
  }, { role, disableGL: mode === 'no-webgl' });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(30_000);
  const requests = [], errors = [], workers = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().includes('/maplibre/')) workers.push({ url: response.url(), status: response.status() }); });
  await page.routeWebSocket('**/socket.io/**', socket => {
    socket.send('0{"sid":"map-fixture","upgrades":[],"pingInterval":60000,"pingTimeout":60000}');
    socket.onMessage(message => { if (String(message).startsWith('40')) socket.send('40{"sid":"map-fixture"}'); if (message === '2') socket.send('3'); });
  });
  // Isolate API data and external tiles. Real production JS, Leaflet, WebGL and
  // the versioned worker modules run unchanged; no user accounts are modified.
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'tiles.openfreemap.org') return route.fulfill({ status: mode === 'style-failure' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(mapStyle) });
    if (url.hostname === 'tile.openstreetmap.org') return route.fulfill({ contentType: 'image/svg+xml', body: rasterImage });
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io') || url.hostname === 'api.servicehubcordova.tech') {
      if (url.pathname.startsWith('/socket.io')) return route.fulfill({ contentType: 'text/plain', body: route.request().method() === 'POST' ? 'ok' : '0{"sid":"map-fixture","upgrades":[],"pingInterval":60000,"pingTimeout":60000}' });
      const path = url.pathname.replace(/^\/api/, ''); requests.push(path);
      let data = [];
      if (path === '/auth/session') data = { authenticated: true, user, accessToken };
      else if (path === '/auth/me') data = { user };
      else if (path === '/auth/refresh') data = { accessToken };
      else if (path === '/auth/captcha-config') data = { enabled: false, siteKey: '' };
      else if (path.endsWith('/nearby')) data = { items: [], mapPins: [{ id: 'map-fixture-pin', title: role === 'provider' ? 'Fixture seeker request' : 'Fixture public service', label: 'Cordova, Cebu', area: { latitude: 10.303, longitude: 123.925, approximate: role === 'provider' } }], total: 0, page: 1, totalPages: 1 };
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data, pagination: { page: 1, total: 0, totalPages: 1 }, unreadCount: 0 }) });
    }
    return route.continue();
  });
  await page.goto(`${origin}/${role}/${role === 'provider' ? 'browse-services' : 'seek-services'}`);
  const choose = page.getByRole('button', { name: 'Choose your search location' });
  await choose.waitFor({ timeout: 30_000 });
  await choose.click();
  const picker = page.getByRole('dialog', { name: 'Change search location' });
  await picker.waitFor();
  return { context, page, picker, requests, errors, workers };
}

async function assertPainted(page, map) {
  // Decode the actual browser screenshot, so a blank canvas with working
  // controls/markers cannot satisfy this regression check.
  let counts;
  for (let attempt = 0; attempt < 30; attempt++) {
    const screenshot = await map.screenshot();
    counts = await page.evaluate(async base64 => {
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    let water = 0, land = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] === 32 && pixels[i + 1] === 64 && pixels[i + 2] === 96) water++;
      if (pixels[i] === 229 && pixels[i + 1] === 224 && pixels[i + 2] === 216) land++;
    }
    return { water, land };
    }, screenshot.toString('base64'));
    if (counts.water > 1000 && counts.land > 1000) return;
    await page.waitForTimeout(200);
  }
  assert(counts.water > 1000 && counts.land > 1000, `Basemap did not paint: ${JSON.stringify(counts)}`);
}

for (const role of ['seeker', 'provider']) test(`${role}: the production worker renders geography, pins, zoom and fullscreen`, { timeout: 60_000 }, async () => {
  const { context, page, picker, requests, errors, workers } = await openPicker(role);
  try {
    const map = picker.getByRole('region', { name: /Location selection map/ });
    await map.locator('canvas').waitFor();
    await assertPainted(page, map);
    assert(workers.some(worker => worker.url.endsWith('maplibre-gl-worker.mjs') && worker.status === 200));
    await map.locator('[data-map-result]').waitFor();
    assert(requests.includes(role === 'provider' ? '/requests/nearby' : '/services/nearby'));
    await map.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await page.waitForTimeout(500); await assertPainted(page, map);
    await picker.getByRole('button', { name: 'Expand map to full screen' }).click();
    const expanded = page.getByRole('dialog', { name: 'Full-screen location map' });
    await expanded.waitFor(); await page.waitForTimeout(1000);
    await assertPainted(page, expanded.getByRole('region', { name: /Location selection map/ }));
    await page.keyboard.press('Escape');
    await picker.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Choose your search location' }).click();
    await picker.waitFor(); await page.waitForTimeout(1000);
    await assertPainted(page, picker.getByRole('region', { name: /Location selection map/ }));
    assert.deepEqual(errors, []);
  } catch (error) {
    console.error({ role, errors, picker: await picker.innerText() });
    throw error;
  } finally { await context.close(); }
});

for (const mode of ['style-failure', 'no-webgl']) test(`${mode}: raster recovery keeps the picker usable and can reopen`, { timeout: 45_000 }, async () => {
  const { context, page, picker, errors } = await openPicker('seeker', mode);
  try {
    const map = picker.getByRole('region', { name: /Location selection map/ });
    await map.locator('img.leaflet-tile-loaded').first().waitFor();
    await assertPainted(page, map);
    await map.locator('[data-map-result]').waitFor();
    await picker.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Choose your search location' }).click();
    await picker.getByRole('region', { name: /Location selection map/ }).locator('img.leaflet-tile-loaded').first().waitFor();
    assert.deepEqual(errors, []);
  } catch (error) {
    console.error({ mode, errors, picker: await picker.innerText() });
    throw error;
  } finally { await context.close(); }
});
