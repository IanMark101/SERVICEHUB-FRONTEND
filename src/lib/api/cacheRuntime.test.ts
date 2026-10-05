import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearApiCache, invalidateApiCache, responseCache, startCacheRuntime } from './responseCache';

describe('browser cache synchronization', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); responseCache.clear(); });

  it('refreshes on focus/online and synchronizes mutations/sign-out without credentials or loops', () => {
    vi.useFakeTimers();
    const postMessage = vi.fn();
    let receive!: (event: { data: unknown }) => void;
    class Channel {
      postMessage = postMessage;
      set onmessage(callback: typeof receive) { receive = callback; }
    }
    vi.stubGlobal('BroadcastChannel', Channel);
    startCacheRuntime();
    const changed = vi.fn();
    const stop = responseCache.subscribe(changed);
    window.dispatchEvent(new Event('focus'));
    expect(changed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10_001);
    window.dispatchEvent(new Event('focus'));
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ reason: 'focus' }));
    window.dispatchEvent(new Event('online'));
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ reason: 'online' }));
    invalidateApiCache(['requests'], 'mutation');
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage.mock.calls[0][0]).toMatchObject({ tags: ['requests'], clear: false });
    expect(JSON.stringify(postMessage.mock.calls)).not.toMatch(/Authorization|accessToken|Bearer|response|userSession/);
    receive({ data: { source: 'another-tab', tags: ['requests'] } });
    expect(changed).toHaveBeenLastCalledWith({ tags: ['requests'], reason: 'cross-tab' });
    responseCache.setIdentity('verified-account');
    const expired = vi.fn();
    window.addEventListener('auth_session_expired', expired);
    receive({ data: { source: 'another-tab', clear: true } });
    expect(expired).toHaveBeenCalledTimes(1);
    clearApiCache();
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(responseCache.scope).toBeNull();
    window.removeEventListener('auth_session_expired', expired);
    stop();
  });
});
