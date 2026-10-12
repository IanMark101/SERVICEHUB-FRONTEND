import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface WorkerRequest { url: string; method: string; mode: string }
const origin = 'https://servicehub.test';
let handlers: Record<string, (event: unknown) => void>;
let cache: { addAll: ReturnType<typeof vi.fn>; match: ReturnType<typeof vi.fn> };
let storage: { open: ReturnType<typeof vi.fn>; keys: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
let network: ReturnType<typeof vi.fn>;
let skipWaiting: ReturnType<typeof vi.fn>;
let claim: ReturnType<typeof vi.fn>;
const source = readFileSync(resolve('src/pwa/service-worker.js'), 'utf8');

function request(path: string, mode = 'same-origin', method = 'GET'): WorkerRequest {
  return { url: new URL(path, origin).href, method, mode };
}
function dispatchFetch(request: WorkerRequest) {
  const respondWith = vi.fn();
  handlers.fetch({ request, respondWith });
  return respondWith;
}

describe('PWA cache and update boundaries', () => {
  beforeEach(() => {
    handlers = {};
    cache = { addAll: vi.fn().mockResolvedValue(undefined), match: vi.fn().mockResolvedValue(undefined) };
    storage = { open: vi.fn().mockResolvedValue(cache), keys: vi.fn().mockResolvedValue([]), delete: vi.fn().mockResolvedValue(true) };
    network = vi.fn().mockResolvedValue({ live: true });
    skipWaiting = vi.fn().mockResolvedValue(undefined);
    claim = vi.fn().mockResolvedValue(undefined);
    runInNewContext(source, {
      self: { location: { origin }, clients: { claim }, skipWaiting, addEventListener: (type: string, handler: (event: unknown) => void) => { handlers[type] = handler; } },
      caches: storage, fetch: network, URL, Response,
      Request: class { constructor(public url: string, public options: object) {} },
    });
  });

  it('prepares only the public fallback and icons without credentials or forced activation', async () => {
    const waitUntil = vi.fn(); handlers.install({ waitUntil });
    await waitUntil.mock.calls[0][0];
    const files = cache.addAll.mock.calls[0][0] as { url: string; options: { credentials: string } }[];
    expect(files).toHaveLength(5);
    expect(files.every(file => file.url === '/offline.html' || file.url.startsWith('/pwa/'))).toBe(true);
    expect(files.every(file => file.options.credentials === 'omit')).toBe(true);
    expect(skipWaiting).not.toHaveBeenCalled();
  });

  it.each([
    ['/api/bookings/my-engagements', 'same-origin', 'GET'],
    ['/api/bookings', 'same-origin', 'POST'],
    ['/seeker/seek-services?_rsc=secret', 'same-origin', 'GET'],
    ['/seeker/post-request', 'navigate', 'POST'],
    ['https://maps.example.test/tile.png', 'same-origin', 'GET'],
    ['/pwa/icon-192.png?private=1', 'same-origin', 'GET'],
  ])('does not intercept or cache sensitive/non-public request %s', (path, mode, method) => {
    expect(dispatchFetch(request(path, mode, method))).not.toHaveBeenCalled();
    expect(storage.open).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
  });

  it('returns live authenticated navigation without caching the response', async () => {
    const navigation = request('/seeker/request-manager', 'navigate');
    const respond = dispatchFetch(navigation);
    expect(await respond.mock.calls[0][0]).toEqual({ live: true });
    expect(network).toHaveBeenCalledWith(navigation);
    expect(storage.open).not.toHaveBeenCalled();
  });

  it('shows only the generic offline screen after failed navigation', async () => {
    network.mockRejectedValue(new TypeError('offline'));
    const offline = { publicOfflinePage: true };
    cache.match.mockResolvedValue(offline);
    expect(await dispatchFetch(request('/provider/messages', 'navigate')).mock.calls[0][0]).toBe(offline);
    expect(cache.match).toHaveBeenCalledWith('/offline.html');
  });

  it('remains readable if the offline cache is unexpectedly missing', async () => {
    network.mockRejectedValue(new TypeError('offline'));
    const response = await dispatchFetch(request('/account/settings', 'navigate')).mock.calls[0][0] as Response;
    expect(response.status).toBe(503);
    expect(await response.text()).toMatch(/Reconnect/);
  });

  it('serves public icons offline without fetching account data', async () => {
    cache.match.mockResolvedValue({ icon: true });
    expect(await dispatchFetch(request('/pwa/icon-192.png')).mock.calls[0][0]).toEqual({ icon: true });
    expect(network).not.toHaveBeenCalled();
  });

  it('removes only its own old cache and claims clients after activation', async () => {
    storage.keys.mockResolvedValue(['servicehub-pwa-old', 'another-app-cache', 'servicehub-pwa-__SERVICEHUB_BUILD__']);
    const waitUntil = vi.fn(); handlers.activate({ waitUntil }); await waitUntil.mock.calls[0][0];
    expect(storage.delete).toHaveBeenCalledExactlyOnceWith('servicehub-pwa-old');
    expect(claim).toHaveBeenCalledOnce();
  });

  it('activates a waiting update only after an explicit update message', async () => {
    const waitUntil = vi.fn();
    handlers.message({ data: { type: 'OTHER' }, waitUntil });
    expect(skipWaiting).not.toHaveBeenCalled();
    handlers.message({ data: { type: 'SKIP_WAITING' }, waitUntil });
    await waitUntil.mock.calls[0][0]; expect(skipWaiting).toHaveBeenCalledOnce();
  });
});
