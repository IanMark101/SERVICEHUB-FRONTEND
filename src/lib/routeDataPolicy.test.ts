import { describe, expect, it } from 'vitest';
import { shouldLoadMarketplaceData } from './routeDataPolicy';

describe('shouldLoadMarketplaceData', () => {
  it.each(['/', '/login', '/register', '/help', '/help/getting-started']) (
    'keeps public route %s free of marketplace prefetches',
    (pathname) => expect(shouldLoadMarketplaceData(pathname)).toBe(false),
  );

  it.each(['/dashboard', '/seeker/seek-services', '/provider/service-manager', '/admin/overview']) (
    'loads marketplace data for %s',
    (pathname) => expect(shouldLoadMarketplaceData(pathname)).toBe(true),
  );
});

