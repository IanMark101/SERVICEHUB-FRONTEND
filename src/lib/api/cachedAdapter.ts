import axios, { AxiosError, AxiosHeaders, CanceledError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { apiPath, getCachePolicy } from './cachePolicy';
import { cloneCacheData, responseCache, startCacheRuntime, type CachedResponse } from './responseCache';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** reload fetches fresh data and updates the cache; no-store bypasses it entirely. */
    apiCache?: 'default' | 'reload' | 'no-store';
  }
}

const underlyingAdapters = new WeakMap<AxiosAdapter, AxiosAdapter>();

export function cacheKey(config: InternalAxiosRequestConfig): string {
  const url = new URL(axios.getUri(config), window.location.origin);
  url.hash = '';
  url.searchParams.sort();
  return JSON.stringify([responseCache.scope, url.href, config.headers.get('Accept-Language') || '']);
}

function snapshot(response: AxiosResponse): CachedResponse {
  return {
    data: cloneCacheData(response.data), status: response.status, statusText: response.statusText,
    headers: { 'content-type': String(response.headers['content-type'] || 'application/json') },
  };
}

function responseFor(response: CachedResponse, config: InternalAxiosRequestConfig): AxiosResponse {
  return { ...response, config, headers: new AxiosHeaders(response.headers) };
}

/** Cancellation belongs to the caller, so aborting one screen does not cancel
 * the identical request another screen is awaiting. */
function waitForCaller<T>(promise: Promise<T>, config: InternalAxiosRequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = config.cancelToken as (typeof config.cancelToken & { subscribe(callback: () => void): void; unsubscribe(callback: () => void): void });
    const cancel = () => {
      const error = new CanceledError('Request canceled');
      error.config = config;
      reject(error);
    };
    const cleanup = () => {
      config.signal?.removeEventListener?.('abort', cancel);
      token?.unsubscribe(cancel);
    };
    if (config.signal?.aborted || config.cancelToken?.reason) { cancel(); return; }
    config.signal?.addEventListener?.('abort', cancel, { once: true });
    token?.subscribe(cancel);
    promise.then(resolve, reject).finally(cleanup);
  });
}

function errorForCaller(error: unknown, config: InternalAxiosRequestConfig): unknown {
  if (!error || typeof error !== 'object') return error;
  const original = error as AxiosError;
  const response = original.response ? { ...original.response, config, data: cloneCacheData(original.response.data) } : undefined;
  if (axios.isCancel(error)) return Object.assign(new CanceledError(original.message), { config });
  if (axios.isAxiosError(error)) return new AxiosError(original.message, original.code, config, original.request, response);
  return Object.assign(new Error(original.message || 'Request failed'), error, { config, ...(response ? { response } : {}) });
}

export function prepareCachedRequest(config: InternalAxiosRequestConfig, hasToken: boolean): InternalAxiosRequestConfig {
  if (typeof window === 'undefined') return config;
  startCacheRuntime();
  if (typeof config.adapter === 'function' && underlyingAdapters.has(config.adapter)) {
    config.adapter = underlyingAdapters.get(config.adapter);
  }
  if ((config.method || 'get').toLowerCase() !== 'get' || config.apiCache === 'no-store'
    || (config.responseType && config.responseType !== 'json')) return config;
  const policy = getCachePolicy(apiPath(config.url));
  if (!policy || (hasToken && !responseCache.scope) || (!hasToken && !policy.public)) return config;

  const key = cacheKey(config);
  const resolved = axios.getAdapter(config.adapter || axios.defaults.adapter);
  // Axios retries keep config.adapter. Always wrap the original transport once.
  const transport = underlyingAdapters.get(resolved) || resolved;
  const adapter: AxiosAdapter = async callerConfig => {
    const generation = responseCache.generation;
    try {
      const pending = responseCache.read(key, policy, async () => {
        const transportConfig = { ...callerConfig, adapter: transport, signal: undefined, cancelToken: undefined, timeout: callerConfig.timeout || 30_000 };
        return snapshot(await transport(transportConfig));
      }, callerConfig.apiCache === 'reload');
      const response = await waitForCaller(pending, callerConfig);
      if (generation !== responseCache.generation) throw new CanceledError('Account changed while loading data');
      return responseFor(response, callerConfig);
    } catch (error) { throw errorForCaller(error, callerConfig); }
  };
  underlyingAdapters.set(adapter, transport);
  config.adapter = adapter;
  return config;
}

export function peekApiResponse<T>(url: string, baseURL: string): T | null {
  if (typeof window === 'undefined') return null;
  const config = { url, baseURL, headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  const cached = responseCache.peek(cacheKey(config));
  if (!cached) return null;
  return (typeof cached.data === 'string' ? JSON.parse(cached.data) : cached.data) as T;
}
