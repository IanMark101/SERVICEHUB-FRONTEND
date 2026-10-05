import { CanceledError } from 'axios';
import { ALL_CACHE_RESOURCES, type CachePolicy, type CacheResource } from './cachePolicy';

export type CacheReason = 'mutation' | 'socket' | 'focus' | 'online' | 'reconnect' | 'manual' | 'read' | 'cross-tab';
export interface CacheChange { tags: readonly CacheResource[]; reason: CacheReason }
export interface CachedResponse { data: unknown; status: number; statusText: string; headers: Record<string, string> }
interface Entry { key: string; response: CachedResponse; expiresAt: number; policy: CachePolicy }
interface Flight { promise: Promise<CachedResponse>; tags: CacheResource[] }
const PUBLIC_STORAGE = 'servicehub:api-cache:v1:public';
const PRIVATE_STORAGE = 'servicehub:api-cache:v1:account';
const MAX_ENTRIES = 150;
const MAX_STORAGE_BYTES = 1_000_000;
const MAX_ENTRY_BYTES = 250_000;
const MAX_MEMORY_BYTES = 5_000_000;

export function cloneCacheData<T>(value: T): T {
  // The API serves JSON. Cloning prevents one screen changing another screen's
  // cached response, and Axios transforming a shared adapter response twice.
  return value === undefined ? value : JSON.parse(JSON.stringify(value)) as T;
}

export class ResponseCache {
  private entries = new Map<string, Entry>();
  private flights = new Map<string, Flight>();
  private versions = new Map<CacheResource, number>();
  private epoch = 0;
  private identity: string | null = null;
  private listeners = new Set<(change: CacheChange) => void>();

  constructor(private storage?: () => Storage, private now = () => Date.now()) {
    this.restore(PUBLIC_STORAGE, null);
  }

  get scope() { return this.identity; }
  get generation() { return this.epoch; }
  get accountId(): string | null {
    if (!this.identity) return null;
    try { return JSON.parse(this.identity)[0] || null; } catch { return this.identity; }
  }

  setIdentity(identity: string | null) {
    if (identity === this.identity) return;
    this.epoch++;
    this.entries.clear();
    this.flights.clear();
    this.identity = identity;
    if (identity) this.restore(PRIVATE_STORAGE, identity);
    else {
      this.removeStorage(PRIVATE_STORAGE);
      this.restore(PUBLIC_STORAGE, null);
    }
  }

  clear() {
    this.epoch++;
    this.entries.clear();
    this.flights.clear();
    this.identity = null;
    this.removeStorage(PRIVATE_STORAGE);
    this.removeStorage(PUBLIC_STORAGE);
  }

  subscribe(listener: (change: CacheChange) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  invalidate(tags: readonly CacheResource[], reason: CacheReason = 'manual') {
    if (!tags.length) return;
    const affected = new Set(tags);
    tags.forEach(tag => this.versions.set(tag, (this.versions.get(tag) || 0) + 1));
    for (const [key, entry] of this.entries) if (entry.policy.tags.some(tag => affected.has(tag))) this.entries.delete(key);
    for (const [key, flight] of this.flights) if (flight.tags.some(tag => affected.has(tag))) this.flights.delete(key);
    if (this.identity && (affected.has('services') || affected.has('categories'))) this.removeStorage(PUBLIC_STORAGE);
    this.persist();
    this.listeners.forEach(listener => {
      try { listener({ tags, reason }); } catch { /* A subscriber must not fail a successful save. */ }
    });
  }

  peek(key: string): CachedResponse | null {
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= this.now()) return null;
    this.entries.delete(key);
    this.entries.set(key, entry);
    return cloneCacheData(entry.response);
  }

  private revision(policy: CachePolicy) { return policy.tags.map(tag => this.versions.get(tag) || 0).join(':'); }

  async read(key: string, policy: CachePolicy, loader: () => Promise<CachedResponse>, reload = false, attempt = 0): Promise<CachedResponse> {
    const epoch = this.epoch;
    const revision = this.revision(policy);
    if (!reload) {
      const cached = this.peek(key);
      if (cached) {
        await Promise.resolve();
        if (epoch !== this.epoch) throw new CanceledError('Account changed while loading data');
        return cached;
      }
    } else this.entries.delete(key);

    let flight = this.flights.get(key);
    if (!flight) {
      const promise = Promise.resolve().then(loader).then(response => {
        if (epoch === this.epoch && revision === this.revision(policy) && this.cacheable(response)) {
          const parsed = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          const ttl = parsed?.data?.refreshing ? Math.min(2_000, policy.ttl) : policy.ttl;
          this.entries.delete(key);
          this.entries.set(key, { key, policy, response: cloneCacheData(response), expiresAt: this.now() + ttl });
          let bytes = [...this.entries.values()].reduce((sum, entry) => sum + JSON.stringify(entry.response).length * 2, 0);
          while (this.entries.size > MAX_ENTRIES || bytes > MAX_MEMORY_BYTES) {
            const oldest = this.entries.keys().next().value!;
            bytes -= JSON.stringify(this.entries.get(oldest)!.response).length * 2;
            this.entries.delete(oldest);
          }
          this.persist();
        }
        return response;
      });
      flight = { promise, tags: policy.tags };
      this.flights.set(key, flight);
      const ownFlight = flight;
      void promise.finally(() => { if (this.flights.get(key) === ownFlight) this.flights.delete(key); }).catch(() => {});
    }
    const response = await flight.promise;
    if (epoch !== this.epoch) throw new CanceledError('Account changed while loading data');
    // A pre-save or pre-socket response must not overwrite the updated screen.
    if (revision !== this.revision(policy)) {
      if (attempt >= 2) throw new CanceledError('Data changed while loading; retry the request');
      return this.read(key, policy, loader, false, attempt + 1);
    }
    return cloneCacheData(response);
  }

  private cacheable(response: CachedResponse) {
    if (response.status < 200 || response.status >= 300 || response.data === undefined) return false;
    try {
      if (JSON.stringify(response.data).length * 2 > MAX_ENTRY_BYTES) return false;
      const body = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      return body !== null && typeof body === 'object' && body.success !== false;
    } catch { return false; }
  }

  private removeStorage(key: string) { try { this.storage?.().removeItem(key); } catch { /* Storage can be disabled. */ } }

  private persist() {
    if (!this.storage) return;
    try {
      const entries = [...this.entries.values()].filter(entry => entry.policy.persist && entry.expiresAt > this.now());
      let json = JSON.stringify({ scope: this.identity, entries });
      while (json.length * 2 > MAX_STORAGE_BYTES && entries.length) {
        entries.shift();
        json = JSON.stringify({ scope: this.identity, entries });
      }
      this.storage().setItem(this.identity ? PRIVATE_STORAGE : PUBLIC_STORAGE, json);
    } catch { /* Memory cache remains usable when storage is full or unavailable. */ }
  }

  private restore(key: string, scope: string | null) {
    try {
      const json = this.storage?.().getItem(key);
      if (!json) return;
      if (json.length * 2 > MAX_STORAGE_BYTES) { this.removeStorage(key); return; }
      const saved = JSON.parse(json);
      if (saved.scope !== scope || !Array.isArray(saved.entries)) { this.removeStorage(key); return; }
      for (const entry of saved.entries.slice(-MAX_ENTRIES)) {
        if (typeof entry.key !== 'string' || !entry.policy?.persist || !Array.isArray(entry.policy.tags)
          || !entry.policy.tags.every((tag: CacheResource) => ALL_CACHE_RESOURCES.includes(tag))
          || !Number.isFinite(entry.expiresAt) || entry.expiresAt <= this.now()
          || entry.expiresAt > this.now() + 300_000 || !this.cacheable(entry.response)) continue;
        this.entries.set(entry.key, entry);
      }
    } catch { this.removeStorage(key); }
  }
}

// No shared server cache: the Axios integration only uses this in the browser.
export const responseCache = new ResponseCache(() => window.sessionStorage);

let runtimeStarted = false;
let channel: BroadcastChannel | undefined;
const INVALIDATION_STORAGE = 'servicehub:api-cache:invalidate';
const SOURCE = Math.random().toString(36).slice(2);

function broadcast(tags: readonly CacheResource[], clear = false) {
  if (typeof window === 'undefined') return;
  const message = { source: SOURCE, tags, clear, nonce: Math.random() };
  if (channel) {
    try { channel.postMessage(message); return; } catch { /* Fall back to the storage event. */ }
  }
  try { window.localStorage.setItem(INVALIDATION_STORAGE, JSON.stringify(message)); } catch { /* Optional cross-tab sync. */ }
}

export function invalidateApiCache(tags: readonly CacheResource[] = ALL_CACHE_RESOURCES, reason: CacheReason = 'manual') {
  responseCache.invalidate(tags, reason);
  if (reason === 'mutation') broadcast(tags);
}

export function clearApiCache() {
  const hadIdentity = responseCache.scope !== null;
  responseCache.clear();
  if (hadIdentity) broadcast(ALL_CACHE_RESOURCES, true);
}

export function startCacheRuntime() {
  if (runtimeStarted || typeof window === 'undefined') return;
  runtimeStarted = true;
  let lastWake = Date.now();
  const wake = (reason: 'focus' | 'online') => {
    if (document.visibilityState === 'hidden' || (reason === 'focus' && Date.now() - lastWake < 10_000)) return;
    lastWake = Date.now();
    invalidateApiCache(ALL_CACHE_RESOURCES, reason);
  };
  window.addEventListener('focus', () => wake('focus'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake('focus'); });
  window.addEventListener('online', () => wake('online'));
  const receive = (message: { source?: string; clear?: boolean; tags?: CacheResource[] }) => {
    if (!message || message.source === SOURCE) return;
    if (message.clear === true) {
      responseCache.clear();
      window.dispatchEvent(new Event('auth_session_expired'));
    } else if (Array.isArray(message.tags) && message.tags.every(tag => ALL_CACHE_RESOURCES.includes(tag))) {
      responseCache.invalidate(message.tags, 'cross-tab');
    }
  };
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel('servicehub:api-cache');
      channel.onmessage = event => receive(event.data);
    } catch { /* Browser privacy settings may disable BroadcastChannel. */ }
  }
  window.addEventListener('storage', event => {
    if (event.key === INVALIDATION_STORAGE && event.newValue) {
      try { receive(JSON.parse(event.newValue)); } catch { /* Ignore unrelated/malformed storage. */ }
    }
  });
}
