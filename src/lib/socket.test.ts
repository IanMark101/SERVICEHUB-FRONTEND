import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ io: vi.fn(), getToken: vi.fn(), refresh: vi.fn(), clear: vi.fn(), invalidate: vi.fn() }));
vi.mock('socket.io-client', () => ({ io: mocks.io }));
vi.mock('./api/axios', () => ({ getAccessToken: mocks.getToken, refreshAccessTokenOnce: mocks.refresh, clearAccessToken: mocks.clear }));
vi.mock('./api/responseCache', () => ({ invalidateApiCache: mocks.invalidate }));
import { connectSocket, disconnectSocket, getSocketEndpoint } from './socket';

function fixture() {
  type Listener = (...args: unknown[]) => unknown;
  const handlers = new Map<string, Listener>();
  const managerHandlers = new Map<string, Listener>();
  return {
    connected: false, auth: {}, connect: vi.fn(), disconnect: vi.fn(), onAny: vi.fn(),
    on: vi.fn((name: string, callback: Listener) => handlers.set(name, callback)), removeAllListeners: vi.fn(() => handlers.clear()),
    io: { on: vi.fn((name: string, callback: Listener) => managerHandlers.set(name, callback)), removeAllListeners: vi.fn(() => managerHandlers.clear()) },
    fire: (name: string, ...args: unknown[]) => handlers.get(name)?.(...args),
    managerFire: (name: string, ...args: unknown[]) => managerHandlers.get(name)?.(...args),
  };
}
let current: ReturnType<typeof fixture>;
let warning: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  disconnectSocket(); vi.clearAllMocks(); mocks.getToken.mockReturnValue('fresh-token');
  current = fixture(); mocks.io.mockReturnValue(current);
  warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { disconnectSocket(); vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe('live update connection recovery', () => {
  it('preserves API hostnames and reverse-proxy prefixes when constructing the socket endpoint', () => {
    expect(getSocketEndpoint('https://api.servicehub.example/api')).toEqual({ url: 'https://api.servicehub.example', path: '/socket.io' });
    expect(getSocketEndpoint('https://servicehub.example/backend/api/')).toEqual({ url: 'https://servicehub.example', path: '/backend/socket.io' });
    expect(getSocketEndpoint('http://localhost:3001/api')).toEqual({ url: 'http://localhost:3001', path: '/socket.io' });
  });
  it('does not connect an anonymous visitor and reuses an existing connection', () => {
    expect(connectSocket('')).toBeNull(); expect(mocks.io).not.toHaveBeenCalled();
    connectSocket('first-token'); connectSocket('new-token');
    expect(mocks.io).toHaveBeenCalledTimes(1); expect(current.auth).toEqual({ token: 'new-token' });
    expect(mocks.io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket', 'polling'], tryAllTransports: true }));
  });
  it('refreshes the token on Manager retries and stops when the session no longer exists', () => {
    connectSocket('old-token'); current.managerFire('reconnect_attempt', 1);
    expect(current.auth).toEqual({ token: 'fresh-token' });
    mocks.getToken.mockReturnValue(null); current.managerFire('reconnect_attempt', 2);
    expect(current.disconnect).toHaveBeenCalledOnce();
  });
  it('retries after network recovery and returning to the tab without clearing the session', () => {
    connectSocket('first-token');
    window.dispatchEvent(new Event('online')); window.dispatchEvent(new Event('focus'));
    expect(current.connect).toHaveBeenCalledTimes(2); expect(current.auth).toEqual({ token: 'fresh-token' });
    expect(mocks.clear).not.toHaveBeenCalled();
    disconnectSocket(); window.dispatchEvent(new Event('online')); window.dispatchEvent(new Event('focus'));
    expect(current.connect).toHaveBeenCalledTimes(2);
  });
  it('warns once per outage and restores cached feeds when a connection returns', () => {
    vi.stubEnv('NODE_ENV', 'development'); connectSocket('token'); current.fire('connect');
    current.fire('connect_error', new Error('xhr poll error')); current.fire('connect_error', new Error('xhr poll error'));
    expect(warning).toHaveBeenCalledTimes(1); expect(mocks.clear).not.toHaveBeenCalled();
    current.fire('connect'); expect(mocks.invalidate).toHaveBeenCalledWith(undefined, 'reconnect');
    current.fire('connect_error', new Error('transport error')); expect(warning).toHaveBeenCalledTimes(2);
    vi.unstubAllEnvs();
  });
  it('waits for the tab to be visible and reports exhausted retries without signing out', () => {
    vi.stubEnv('NODE_ENV', 'development'); connectSocket('token');
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange')); expect(current.connect).not.toHaveBeenCalled();
    current.managerFire('reconnect_failed'); expect(warning).toHaveBeenCalledWith(expect.stringContaining('Check the backend'));
    expect(mocks.clear).not.toHaveBeenCalled();
    visibility.mockReturnValue('visible'); document.dispatchEvent(new Event('visibilitychange'));
    expect(current.connect).toHaveBeenCalledOnce();
  });
  it('a late expired-token refresh cannot reconnect or overwrite a new account socket', async () => {
    let finish!: (value: string) => void;
    mocks.refresh.mockReturnValue(new Promise<string>(resolve => { finish = resolve; }));
    connectSocket('old-account-token');
    const pending = current.fire('connect_error', Object.assign(new Error('expired'), { data: { code: 'TOKEN_EXPIRED' } }));
    const oldSocket = current; disconnectSocket(); current = fixture(); mocks.io.mockReturnValue(current);
    connectSocket('new-account-token'); finish('old-refresh-token'); await pending;
    expect(current.auth).toEqual({}); expect(current.connect).not.toHaveBeenCalled();
    expect(oldSocket.connect).not.toHaveBeenCalled();
    expect(mocks.io).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'new-account-token' } }));
  });
});
