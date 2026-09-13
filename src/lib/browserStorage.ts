const LEGACY_AUTH_STORAGE_KEYS = [
  'accessToken',
  'adminToken',
  'refreshToken',
  'token',
  'user',
  'userSession',
  'userToken',
] as const;

const SESSION_HINT_KEY = 'servicehub:session-present';

export function hasSessionHint(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem(SESSION_HINT_KEY) === 'true';
}

export function markSessionPresent(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_HINT_KEY, 'true');
  }
}

export function clearSessionHint(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_HINT_KEY);
  }
}

/**
 * Remove credentials and cached identity data written by older ServiceHub
 * builds. Current authentication keeps the access token in memory and the
 * refresh token in an HttpOnly cookie.
 */
export function clearLegacyAuthStorage(): void {
  if (typeof window === 'undefined') return;

  const hadLegacySession = LEGACY_AUTH_STORAGE_KEYS.some(
    (key) => window.localStorage.getItem(key) !== null || window.sessionStorage.getItem(key) !== null,
  );

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      storage.removeItem(key);
    }
  }

  // Preserve silent session recovery for users upgrading from a legacy build.
  // This value is only a boolean hint; it is not trusted for authorization.
  if (hadLegacySession) markSessionPresent();
}
