import axios, { type InternalAxiosRequestConfig } from 'axios';
import { clearSessionHint, markSessionPresent } from '../browserStorage';
import { prepareCachedRequest } from './cachedAdapter';
import { apiPath, mutationResources } from './cachePolicy';
import { clearApiCache, invalidateApiCache, responseCache } from './responseCache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required for refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Keep the short-lived access token in memory. The long-lived refresh token is
// an HttpOnly cookie, so injected browser scripts cannot copy either credential
// from localStorage and reuse it outside this browser session.
let accessToken: string | null = null;
let sessionGeneration = 0;
const requestGenerations = new WeakMap<object, number>();
const requestCacheGenerations = new WeakMap<object, number>();
const requestAccountIds = new WeakMap<object, string | null>();

declare module 'axios' {
  interface AxiosRequestConfig { _accountStateRetried?: boolean }
}

const SETTINGS_READS = new Set([
  '/verifications/status', '/verifications/privacy-notice', '/auth/security', '/users/me/account-deletion',
]);

// A server-verified profile update invalidates permission-scoped cache entries.
// Re-read settings once for the SAME account instead of surfacing an internal
// cancellation. Logout, account switches, mutations, and audited reads never retry.
function retrySettingsAfterProfileChange(config: InternalAxiosRequestConfig) {
  const accountId = requestAccountIds.get(config);
  if ((config.method || 'get').toLowerCase() !== 'get' || config._accountStateRetried
    || !SETTINGS_READS.has(apiPath(config.url)) || !accountId || accountId !== responseCache.accountId
    || requestGenerations.get(config) !== sessionGeneration || config.signal?.aborted || config.cancelToken?.reason) return null;
  config._accountStateRetried = true;
  return api.request(config);
}

function tokenSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const subject = JSON.parse(atob(payload)).sub;
    return typeof subject === 'string' ? subject : null;
  } catch { return null; }
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Identifies explicit login/logout changes while an earlier request is pending. */
export function getSessionGeneration(): number {
  return sessionGeneration;
}

export function setAccessToken(token: string): void {
  const subject = tokenSubject(token);
  if (subject && responseCache.accountId && subject !== responseCache.accountId) {
    // A refresh cookie can change accounts in another tab. Decoding only
    // rejects an identity mismatch; it never establishes cache authorization.
    sessionGeneration++;
    responseCache.clear();
    accessToken = null;
    delete api.defaults.headers.common.Authorization;
    clearSessionHint();
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth_session_expired'));
    throw new axios.CanceledError('The browser account changed. Sign in again.');
  }
  accessToken = token;
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAccessToken(): void {
  sessionGeneration++;
  accessToken = null;
  delete api.defaults.headers.common.Authorization;
  clearApiCache();
}

// Attach access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    requestGenerations.set(config, sessionGeneration);
    requestCacheGenerations.set(config, responseCache.generation);
    const token = getAccessToken();
    requestAccountIds.set(config, responseCache.accountId || (token ? tokenSubject(token) : null));
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      // Axios defaults survive client-side navigation and hot reloads. Never
      // allow a token removed during logout to remain on later requests.
      delete config.headers.Authorization;
    }
    return prepareCachedRequest(config, !!token);
  },
  (error) => {
    return Promise.reject(error);
  }
);

let refreshPromise: Promise<string> | null = null;
const REFRESH_LOCK = 'servicehub-refresh';
const REFRESH_GENERATION = 'servicehub-refresh-generation';

/** Shared by HTTP retries and Socket.IO; the generation coordinates browser
 * tabs without storing credentials outside memory or the HttpOnly cookie. */
export function refreshAccessTokenOnce(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const generation = sessionGeneration;
  const observedGeneration = typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_GENERATION) : null;
  const rotate = async () => {
    const anotherTabRotated = typeof localStorage !== 'undefined'
      && localStorage.getItem(REFRESH_GENERATION) !== observedGeneration;
    const endpoint = anotherTabRotated ? '/auth/session' : '/auth/refresh';
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {}, { withCredentials: true });
    if (generation !== sessionGeneration) throw new axios.CanceledError('Session changed during token refresh');
    if (anotherTabRotated && response.data?.data?.authenticated === false) {
      clearAccessToken();
      clearSessionHint();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth_session_expired'));
      throw new Error('Browser session is no longer active');
    }
    const token = response.data?.data?.accessToken || response.data?.accessToken;
    if (!token) throw new Error('No access token returned from session recovery');
    if (!anotherTabRotated && typeof localStorage !== 'undefined') {
      localStorage.setItem(REFRESH_GENERATION, crypto.randomUUID());
    }
    setAccessToken(token);
    markSessionPresent();
    return token as string;
  };
  const coordinated: Promise<string> = typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request(REFRESH_LOCK, rotate) as unknown as Promise<string>
    : rotate();
  const pending = coordinated.catch((error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken();
      clearSessionHint();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth_session_expired'));
    }
    throw error;
  }).finally(() => { if (refreshPromise === pending) refreshPromise = null; });
  refreshPromise = pending;
  return pending;
}

// Handle 401 Unauthorized response by calling /auth/refresh
api.interceptors.response.use(
  (response) => {
    const generation = requestGenerations.get(response.config);
    if (generation !== undefined && generation !== sessionGeneration) throw new axios.CanceledError('Session changed while loading data');
    const cacheGeneration = requestCacheGenerations.get(response.config);
    if (cacheGeneration !== undefined && cacheGeneration !== responseCache.generation) {
      const retry = retrySettingsAfterProfileChange(response.config);
      if (retry) return retry;
      throw new axios.CanceledError('Account changed while loading data');
    }
    const path = apiPath(response.config.url);
    const method = (response.config.method || 'get').toLowerCase();
    const successful = response.status >= 200 && response.status < 300 && response.data?.success !== false;
    if (successful && typeof window !== 'undefined') {
      // Identity comes only from a server-verified login or /me, never from a
      // cached profile hint. Token rotation for the same account keeps its cache.
      if (['/auth/me', '/auth/session', '/auth/login', '/auth/google-login'].includes(path)) {
        if (['/auth/login', '/auth/google-login'].includes(path)) sessionGeneration++;
        const user = response.data?.data?.user;
        if (user?.moderationStatus === 'BANNED') clearApiCache();
        else if (user?.id) responseCache.setIdentity(JSON.stringify([user.id, user.role, user.emailVerified, user.verificationStatus, user.moderationStatus, user.postingStatus]));
      }
      // GET /users/me/account-deletion only checks eligibility. It shares its
      // URL with the destructive POST and must preserve the signed-in scope
      // while the other settings sections load concurrently.
      if (method !== 'get' && ['/auth/logout', '/auth/change-password', '/users/me/account-deletion'].includes(path)) {
        clearApiCache();
      } else if (method !== 'get' && !['/auth/session', '/auth/refresh'].includes(path)) {
        invalidateApiCache(mutationResources(path), 'mutation');
      } else if (/^\/messages\/[^/]+$/.test(path) && !['/messages/conversations', '/messages/contacts'].includes(path)) {
        // Reading a conversation also marks its messages/notifications read.
        invalidateApiCache(['messages', 'notifications'], 'read');
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    const generation = requestGenerations.get(originalRequest);
    if (generation !== undefined && generation !== sessionGeneration) return Promise.reject(new axios.CanceledError('Session changed while loading data'));
    const cacheGeneration = requestCacheGenerations.get(originalRequest);
    if (cacheGeneration !== undefined && cacheGeneration !== responseCache.generation) {
      const retry = retrySettingsAfterProfileChange(originalRequest);
      if (retry) return retry;
      return Promise.reject(new axios.CanceledError('Account changed while loading data'));
    }

    // Avoid infinite loop if auth/refresh or login fails
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/google-login')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      const errData = error.response.data;
      if (errData?.code === 'ACCOUNT_BANNED') {
        clearApiCache();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('account_banned'));
        return Promise.reject(error);
      }
      if (errData?.error === "Account suspended") {
        clearAccessToken();
        clearSessionHint();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const hadToken = !!getAccessToken();
      const hadAuthHeader = !!originalRequest.headers?.Authorization;

      // If the request had no token and no session exists in storage, do not attempt refresh
      if (!hadToken && !hadAuthHeader) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const token = await refreshAccessTokenOnce();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
