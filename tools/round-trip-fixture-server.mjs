// Local browser test transport only. Proxies the built app while routing its
// API and socket traffic to in-memory fixtures; never touches real accounts.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const port = 3055;
const origin = process.env.SERVICEHUB_QA_APP_ORIGIN || 'http://localhost:3006';
const apiOrigin = `http://localhost:${port}/api`;
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const apiUrl = env.match(/^NEXT_PUBLIC_API_URL\s*=\s*["']?([^\r\n"']+)/m)?.[1].trim() || 'http://localhost:3001/api';
const user = { id: 'round-trip-fixture', name: 'Browser Fixture', email: 'fixture@example.test', role: 'user', emailVerified: true, moderationStatus: 'ACTIVE', verificationStatus: 'APPROVED', onboardingStatus: 'COMPLETED', phone: '09123456789' };
const services = [{ id: 'fixture-service', providerId: 'fixture-provider', title: 'Fixture plumbing service', description: 'Browser navigation fixture only.', price: 250, isAvailable: true, status: 'ACTIVE', category: { name: 'Plumbing' }, provider: { id: 'fixture-provider', name: 'Fixture Provider', avatarUrl: '/logo.svg', verificationStatus: 'APPROVED', trustScore: 80 }, paymentMethods: { cash: true, gcash: false } }];

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, apiOrigin);
  const path = requestUrl.pathname;
  const modes = ['normal', 'slow-services', 'services-error', 'session-error', 'guest', 'mine-error', 'slow-guest-session', 'slow-session', 'form-controls', 'form-controls-admin'];
  const requestedMode = requestUrl.searchParams.get('qaScenario');
  const cookieMode = request.headers.cookie?.match(/(?:^|;\s*)servicehub-fixture-mode=([^;]+)/)?.[1];
  const mode = modes.includes(requestedMode) ? requestedMode : modes.includes(cookieMode) ? cookieMode : 'normal';
  const fixtureUser = mode === 'form-controls-admin' ? { ...user, id: 'admin-control-fixture', role: 'admin' } : user;
  if (modes.includes(requestedMode)) response.setHeader('Set-Cookie', `servicehub-fixture-mode=${mode}; Path=/; SameSite=Lax; HttpOnly`);
  if (path.startsWith('/api/')) {
    if ((path === '/api/auth/session' && mode === 'session-error') || (path === '/api/services' && mode === 'services-error') || (path === '/api/services/mine' && mode === 'mine-error')) {
      response.writeHead(503, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ success: false, error: 'Illustrative temporary QA failure' }));
      return;
    }
    if (path === '/api/auth/logout') response.setHeader('Set-Cookie', 'servicehub-fixture-mode=guest; Path=/; SameSite=Lax; HttpOnly');
    const data = path === '/api/auth/session' ? ['guest', 'slow-guest-session'].includes(mode) ? { authenticated: false } : { authenticated: true, accessToken: 'isolated-fixture-token', user: fixtureUser }
      : path === '/api/auth/me' ? { user: fixtureUser }
      : path === '/api/bookings/my-engagements' ? { bookings: [], completedServices: [] }
      : path === '/api/services' ? services
      : path === '/api/services/mine' && mode === 'form-controls' ? [{ ...services[0], id: 'owned-fixture-service', providerId: user.id, provider: { ...user, trustScore: 80 }, categoryId: 'fixture-category', priceType: 'FIXED', serviceType: 'ONE_TIME', estimatedDurationMins: 30 }]
      : path === '/api/auth/security' ? { passwordEnabled: true, googleConnected: false, legacyPasswordUnconfirmed: false, googleAvailable: true, email: user.email }
      : path === '/api/users/me/account-deletion' ? { eligible: false, counts: {}, blockers: [], googleAvailable: false, passwordAvailable: true }
      : path === `/api/auth/profile/${user.id}` ? { ...user, location: 'Alegria', bio: 'Fixture profile for visual QA.', services: [], reviews: [] }
      : path === '/api/categories' ? [{ id: 'fixture-category', name: 'Plumbing' }]
      : [];
    const send = () => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ success: true, data, pagination: { page: 1, totalPages: 1, total: Array.isArray(data) ? data.length : 0 } }));
    };
    if (path === '/api/auth/session' && ['slow-session', 'slow-guest-session'].includes(mode)) setTimeout(send, 5000);
    else if (path === '/api/services' && mode === 'slow-services') setTimeout(send, 3500);
    else send();
    return;
  }
  const upstream = http.request(`${origin}${request.url}`, {
    method: request.method,
    headers: { ...request.headers, host: new URL(origin).host, 'accept-encoding': 'identity' },
  }, incoming => {
    const chunks = [];
    incoming.on('data', chunk => chunks.push(chunk));
    incoming.on('end', () => {
      let body = Buffer.concat(chunks);
      const headers = { ...incoming.headers };
      if (/javascript|text\//.test(headers['content-type'] || '')) {
        body = Buffer.from(body.toString().replaceAll(apiUrl, apiOrigin));
      }
      // Reproduce the visible server shell with app hydration withheld. This
      // test route proves continuous landing motion does not need client JS.
      if (requestUrl.searchParams.has('static-shell') && /text\/html/.test(headers['content-type'] || '')) {
        body = Buffer.from(body.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
      }
      delete headers['content-length'];
      delete headers['content-encoding'];
      delete headers.etag;
      headers['cache-control'] = 'no-store';
      response.writeHead(incoming.statusCode, headers);
      response.end(body);
    });
  });
  upstream.on('error', () => { response.writeHead(502); response.end('Start the production app on port 3006 first.'); });
  request.pipe(upstream);
});

const require = createRequire(import.meta.url);
const { Server } = require('../../SERVICEHUB-BACKEND/node_modules/socket.io');
const sockets = new Server(server);
sockets.on('connection', () => {});
server.listen(port, 'localhost', () => console.log(`Isolated signed-in fixture: http://localhost:${port}`));
