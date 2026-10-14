// Match the primary host currently configured in Vercel. The API deliberately
// remains at api.servicehubcordova.tech and is never a frontend redirect alias.
export const PRODUCTION_SITE_ORIGIN = 'https://www.servicehub.bond';
export const FRONTEND_REDIRECT_HOSTS = [
  'servicehubcordova.tech',
  'www.servicehubcordova.tech',
  'servicehub.bond',
] as const;

export function getSiteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  const url = new URL(value?.trim() || PRODUCTION_SITE_ORIGIN);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, a path, query or fragment.');
  }
  // A retained build-time value for the retired domain must not publish old
  // canonicals again. Other explicitly configured origins still work for QA.
  if (FRONTEND_REDIRECT_HOSTS.some(host => host === url.hostname) && !url.port) return PRODUCTION_SITE_ORIGIN;
  return url.origin;
}
