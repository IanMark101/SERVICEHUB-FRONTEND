// Only cookie lifecycle requests pass through Next.js. Uploads, marketplace
// traffic and Socket.IO continue to use the configured API directly.
export const SESSION_COOKIE_PATHS = [
  '/auth/register', '/auth/login', '/auth/google-login', '/auth/session',
  '/auth/refresh', '/auth/logout', '/auth/reset-password', '/auth/change-password',
  '/users/me/account-deletion',
] as const;

const cookiePaths = new Set<string>(SESSION_COOKIE_PATHS);

export function sessionRequestBaseUrl(path: string, apiBaseUrl: string, inBrowser = typeof window !== 'undefined'): string {
  // A host-only HttpOnly cookie on the website survives third-party-cookie
  // blocking. Both the initial sign-in and every later rotation must use it.
  return inBrowser && cookiePaths.has(path) ? '/api' : apiBaseUrl;
}

export function sessionProxyRewrites(apiBaseUrl: string) {
  const target = new URL(apiBaseUrl);
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash) {
    throw new Error('The API URL must be an HTTP(S) URL without credentials, a query or a fragment.');
  }
  const base = target.href.replace(/\/$/, '');
  return SESSION_COOKIE_PATHS.map(path => ({ source: `/api${path}`, destination: `${base}${path}` }));
}
