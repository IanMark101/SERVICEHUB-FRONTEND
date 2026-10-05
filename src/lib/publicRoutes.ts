/** Public entry pages remain usable without a successful session-recovery request. */
export function isPublicEntryRoute(pathname: string): boolean {
  return pathname === '/'
    || /^\/(get-started|help|privacy|terms|login|register|forgot-password|reset-password|verify-email|profile)(\/|$)/.test(pathname);
}

/** A hint can trigger verification; it never establishes authentication. */
export function hasStoredSessionHint(): boolean {
  try {
    const saved = JSON.parse(localStorage.getItem('userSession') || 'null');
    return typeof saved?.id === 'string' && saved.id.length > 0;
  } catch {
    return false;
  }
}
