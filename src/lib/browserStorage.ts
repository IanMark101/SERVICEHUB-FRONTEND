const LEGACY_AUTH_STORAGE_KEYS = [
  'accessToken',
  'adminToken',
  'refreshToken',
  'token',
  'user',
  'userSession',
  'userToken',
] as const;

/**
 * Remove credentials and cached identity data written by older ServiceHub
 * builds. Current authentication keeps the access token in memory and the
 * refresh token in an HttpOnly cookie.
 */
export function clearLegacyAuthStorage(): void {
  if (typeof window === 'undefined') return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      storage.removeItem(key);
    }
  }
}

