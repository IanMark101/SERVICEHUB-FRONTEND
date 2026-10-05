export type CacheResource = 'services' | 'requests' | 'offers' | 'bookings' | 'transactions'
  | 'notifications' | 'messages' | 'categories' | 'profiles' | 'reviews' | 'community'
  | 'admin' | 'content' | 'users' | 'summaries';

export interface CachePolicy {
  tags: CacheResource[];
  ttl: number;
  persist: boolean;
  public: boolean;
}

export const ALL_CACHE_RESOURCES: CacheResource[] = [
  'services', 'requests', 'offers', 'bookings', 'transactions', 'notifications',
  'messages', 'categories', 'profiles', 'reviews', 'community', 'admin', 'content', 'users', 'summaries',
];

export function apiPath(url = ''): string {
  const path = new URL(url, 'http://servicehub.invalid').pathname;
  return path.replace(/^\/api(?=\/|$)/, '').replace(/\/$/, '') || '/';
}

/** Only known read endpoints are cached. Identity, permissions, signed access
 * URLs, payment checks, audited access and GETs that mark messages read stay live. */
export function getCachePolicy(path: string): CachePolicy | null {
  if (/\/(access|proofs|evidence|account-deletion|security|payments|payment-attempts)(\/|$)/.test(path)
    || /^\/verifications/.test(path)
    || /^\/admin\/bookings\/[^/]+\/messages$/.test(path)) return null;
  if (path === '/categories') return { tags: ['categories'], ttl: 300_000, persist: true, public: true };
  if (path.startsWith('/categories/')) return { tags: ['categories'], ttl: 30_000, persist: false, public: false };
  if (/^\/services(?:\/|$)/.test(path)) return { tags: ['services'], ttl: 20_000, persist: true, public: path !== '/services/mine' };
  if (/^\/requests(?:\/|$)/.test(path)) return { tags: ['requests'], ttl: 20_000, persist: true, public: false };
  if (/^\/offers(?:\/|$)/.test(path)) return { tags: ['offers'], ttl: 15_000, persist: false, public: false };
  if (/^\/bookings(?:\/|$)/.test(path)) return { tags: ['bookings'], ttl: 10_000, persist: false, public: false };
  if (path === '/transactions') return { tags: ['transactions'], ttl: 10_000, persist: false, public: false };
  if (path === '/notifications') return { tags: ['notifications'], ttl: 10_000, persist: false, public: false };
  if (path === '/messages/conversations' || /^\/messages\/contacts(?:\/|$)/.test(path)) {
    return { tags: ['messages'], ttl: 5_000, persist: false, public: false };
  }
  if (/^\/auth\/(profile\/|trust-history(?:\/|$))/.test(path)) return { tags: ['profiles'], ttl: 30_000, persist: false, public: false };
  if (/^\/reviews\/provider\//.test(path)) return { tags: ['reviews'], ttl: 30_000, persist: false, public: false };
  if (path === '/community/stats') return { tags: ['community'], ttl: 20_000, persist: false, public: false };
  if (/^\/ai\/(provider|seeker)-summary\//.test(path)) return { tags: ['summaries'], ttl: 300_000, persist: false, public: false };
  if (/^\/content-cases(?:\/|$)/.test(path)) return { tags: ['content'], ttl: 15_000, persist: false, public: false };
  if (/^\/users?(?:\/|$)/.test(path)) return { tags: ['users'], ttl: 30_000, persist: false, public: false };
  if (/^\/admin(?:\/|$)/.test(path)) return { tags: ['admin'], ttl: 5_000, persist: false, public: false };
  return null;
}

/** Invalidate dependencies too: a booking changes queues, offers and balances;
 * a review changes the profile, trust display and generated summary. */
export function mutationResources(path: string): CacheResource[] {
  if (/^\/admin(?:\/|$)/.test(path)) return ALL_CACHE_RESOURCES;
  if (/^\/bookings(?:\/|$)/.test(path)) return ['bookings', 'services', 'requests', 'offers', 'transactions', 'notifications', 'messages', 'profiles', 'community', 'admin'];
  if (/^\/offers(?:\/|$)/.test(path)) return ['offers', 'requests', 'bookings', 'notifications', 'admin'];
  if (/^\/requests(?:\/|$)/.test(path)) return ['requests', 'offers', 'community', 'admin'];
  if (/^\/services(?:\/|$)/.test(path)) return ['services', 'community', 'profiles', 'summaries', 'admin'];
  if (/^\/reviews(?:\/|$)/.test(path)) return ['reviews', 'profiles', 'summaries', 'services', 'community', 'admin'];
  if (/^\/messages(?:\/|$)/.test(path)) return ['messages', 'notifications'];
  if (/^\/notifications(?:\/|$)/.test(path)) return ['notifications'];
  if (/^\/categories(?:\/|$)/.test(path)) return ['categories', 'community', 'admin'];
  if (/^\/verifications(?:\/|$)/.test(path)) return ['profiles', 'admin', 'notifications', 'community'];
  if (/^\/content-cases(?:\/|$)/.test(path)) return ['content', 'admin', 'notifications'];
  if (/^\/(auth|users)(?:\/|$)/.test(path)) return ['profiles', 'users', 'services', 'requests', 'community', 'admin'];
  return [];
}

export function socketResources(event: string): CacheResource[] {
  if (event.startsWith('SERVICE_REQUEST')) return ['requests', 'offers', 'community', 'admin'];
  if (event.startsWith('SERVICE_LISTING')) return ['services', 'community', 'profiles', 'summaries', 'admin'];
  if (event === 'OFFERS_CHANGED') return ['offers', 'requests', 'notifications'];
  if (event === 'ENGAGEMENT_CHANGED' || event === 'queue_update') return mutationResources('/bookings');
  if (event === 'notification') return ['notifications', 'profiles', 'reviews', 'summaries', 'admin'];
  if (event === 'new_message' || event === 'message_notification') return ['messages', 'notifications'];
  if (event === 'COMMUNITY_CATEGORIES_CHANGED') return ['categories', 'community', 'admin'];
  if (event === 'COMMUNITY_ANNOUNCEMENTS_CHANGED') return ['community', 'admin'];
  if (event === 'ADMIN_MODERATION_CHANGED' || event === 'accountStatusChanged') return ALL_CACHE_RESOURCES;
  if (event === 'verification_submitted') return ['admin', 'profiles'];
  if (event === 'CONTENT_CASES_CHANGED') return ['content', 'admin', 'services', 'requests'];
  return [];
}
