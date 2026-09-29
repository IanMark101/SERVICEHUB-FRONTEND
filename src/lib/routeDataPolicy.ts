const MARKETPLACE_ROUTE_PREFIXES = ['/admin', '/dashboard', '/provider', '/seeker'] as const;

/** Public marketing and help pages are static and must not trigger marketplace API traffic. */
export function shouldLoadMarketplaceData(pathname: string): boolean {
  return MARKETPLACE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

