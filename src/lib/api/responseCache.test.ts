import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResponseCache, type CachedResponse } from './responseCache';
import { getCachePolicy } from './cachePolicy';

const policy = getCachePolicy('/requests/mine')!;
const response = (title = 'First'): CachedResponse => ({ data: { success: true, data: [{ title }] }, status: 200, statusText: 'OK', headers: {} });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

describe('application response cache', () => {
  beforeEach(() => sessionStorage.clear());

  it('deduplicates parallel reads and returns isolated copies until TTL expires', async () => {
    let now = 1000;
    const cache = new ResponseCache(undefined, () => now);
    const pending = deferred<CachedResponse>();
    const loader = vi.fn(() => pending.promise);
    const first = cache.read('owner', policy, loader);
    const second = cache.read('owner', policy, loader);
    await Promise.resolve();
    expect(loader).toHaveBeenCalledTimes(1);
    pending.resolve(response());
    const [a, b] = await Promise.all([first, second]);
    (a.data as { data: { title: string }[] }).data[0].title = 'Changed by UI';
    expect(b).toEqual(response());
    expect(await cache.read('owner', policy, loader)).toEqual(response());
    expect(loader).toHaveBeenCalledTimes(1);
    now += policy.ttl + 1;
    await cache.read('owner', policy, loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('refreshes a response that was overtaken by a successful save', async () => {
    const cache = new ResponseCache();
    const old = deferred<CachedResponse>();
    const loader = vi.fn().mockImplementationOnce(() => old.promise).mockResolvedValue(response('Saved'));
    const read = cache.read('owner', policy, loader);
    await Promise.resolve();
    cache.invalidate(['requests'], 'mutation');
    old.resolve(response('Old'));
    expect(await read).toEqual(response('Saved'));
    expect(cache.peek('owner')).toEqual(response('Saved'));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('clears private data and rejects late responses on logout/account switch', async () => {
    const cache = new ResponseCache(() => sessionStorage);
    cache.setIdentity('account-a');
    await cache.read('owner', policy, async () => response('Private A'));
    const pending = deferred<CachedResponse>();
    const read = cache.read('slow', policy, () => pending.promise);
    const rejection = expect(read).rejects.toThrow('Account changed');
    cache.setIdentity('account-b');
    expect(cache.peek('owner')).toBeNull();
    pending.resolve(response('Late A'));
    await rejection;
    expect(cache.peek('slow')).toBeNull();
    cache.clear();
    expect(sessionStorage.length).toBe(0);
  });

  it('restores a recent catalog only after the same account is verified', async () => {
    const cache = new ResponseCache(() => sessionStorage);
    cache.setIdentity('verified-account');
    await cache.read('owner', policy, async () => response());
    const reloaded = new ResponseCache(() => sessionStorage);
    expect(reloaded.peek('owner')).toBeNull();
    reloaded.setIdentity('verified-account');
    expect(reloaded.peek('owner')).toEqual(response());
    reloaded.setIdentity('another-account');
    expect(reloaded.peek('owner')).toBeNull();
  });

  it('does not persist chats, account profiles, balances or administrator records', async () => {
    const cache = new ResponseCache(() => sessionStorage);
    cache.setIdentity('account');
    for (const path of ['/messages/contacts', '/auth/profile/user', '/transactions', '/admin/users']) {
      await cache.read(path, getCachePolicy(path)!, async () => response('Sensitive'));
    }
    expect([...Array(sessionStorage.length)].map((_, i) => sessionStorage.getItem(sessionStorage.key(i)!)).join('')).not.toContain('Sensitive');
  });

  it('never caches unsuccessful envelopes, errors or non-JSON responses', async () => {
    const cache = new ResponseCache();
    for (const result of [{ ...response(), data: { success: false } }, { ...response(), status: 403 }, { ...response(), data: '<html>error</html>' }]) {
      const loader = vi.fn(async () => result);
      await cache.read('bad', policy, loader);
      await cache.read('bad', policy, loader);
      expect(loader).toHaveBeenCalledTimes(2);
    }
    const loader = vi.fn().mockRejectedValue(new Error('Offline'));
    await expect(cache.read('offline', policy, loader)).rejects.toThrow('Offline');
    await expect(cache.read('offline', policy, loader)).rejects.toThrow('Offline');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('supports forced reloads without duplicating simultaneous reload requests', async () => {
    const cache = new ResponseCache();
    await cache.read('key', policy, async () => response());
    const loader = vi.fn(async () => response('New'));
    const results = await Promise.all([cache.read('key', policy, loader, true), cache.read('key', policy, loader, true)]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(results).toEqual([response('New'), response('New')]);
  });

  it('invalidates dependencies without removing unrelated resource entries', async () => {
    const cache = new ResponseCache();
    await cache.read('requests', policy, async () => response());
    await cache.read('categories', getCachePolicy('/categories')!, async () => response());
    cache.invalidate(['requests']);
    expect(cache.peek('requests')).toBeNull();
    expect(cache.peek('categories')).toEqual(response());
  });

  it('limits memory size and handles disabled storage', async () => {
    const cache = new ResponseCache(() => { throw new Error('Storage blocked'); });
    for (let i = 0; i < 170; i++) await cache.read(String(i), policy, async () => response());
    expect(cache.peek('0')).toBeNull();
    expect(cache.peek('169')).toEqual(response());
    cache.clear();
  });
});
