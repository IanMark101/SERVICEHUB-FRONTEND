import { hasSessionHint } from './browserStorage';

/** Public entry pages remain usable without a successful session-recovery request. */
export function isPublicEntryRoute(pathname: string): boolean {
  return pathname === '/'
    || /^\/(get-started|help|privacy|terms|login|register|forgot-password|reset-password|verify-email|profile)(\/|$)/.test(pathname);
}

/** A hint can trigger verification; it never establishes authentication. */
export function hasStoredSessionHint(): boolean {
  return hasSessionHint();
}
