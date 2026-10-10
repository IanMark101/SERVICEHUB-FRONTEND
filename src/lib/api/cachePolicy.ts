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
  if (path === '/services/nearby' || path === '/requests/nearby' || path.startsWith('/locations')) return null; // Search coordinates remain outside shared/persistent API caches.
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
  if (/^\/bookings\/queue\/[^/]+\/start$/.test(path)) return bookingTransitionResources('started');
  if (/^\/bookings\/queue\/[^/]+\/complete$/.test(path)) return bookingTransitionResources('awaiting_confirmation');
  if (/^\/bookings\/(?:completed\/)?[^/]+\/confirm$/.test(path)) return bookingTransitionResources('completed');
  if (/^\/bookings\/direct$/.test(path)) return bookingTransitionResources('created');
  if (/^\/bookings\/direct\/[^/]+\/respond$/.test(path)) return bookingTransitionResources('accepted');
  if (path === '/bookings/direct-from-offer') return bookingTransitionResources('accepted_offer');
  if (/^\/bookings\/[^/]+\/hide$/.test(path)) return bookingTransitionResources('hidden');
  if (/^\/bookings\/[^/]+\/(dispute|reports)$/.test(path)) return bookingTransitionResources('disputed');
  if (/^\/bookings\/[^/]+\/completion-escalations$/.test(path)) return bookingTransitionResources('completion_escalated');
  if (/^\/bookings\/cancellation-requests\/[^/]+\/escalate$/.test(path)) return bookingTransitionResources('cancellation_escalated');
  if (/^\/bookings(?:\/|$)/.test(path)) return ['bookings', 'services', 'requests', 'offers', 'transactions', 'notifications', 'messages', 'profiles', 'community', 'admin'];
  if (/^\/offers(?:\/|$)/.test(path)) return ['offers', 'requests', 'bookings', 'notifications', 'admin'];
  if (/^\/requests(?:\/|$)/.test(path)) return ['requests', 'offers', 'community', 'admin'];
  if (/^\/services(?:\/|$)/.test(path)) return ['services', 'community', 'profiles', 'summaries', 'admin'];
  if (/^\/reviews(?:\/|$)/.test(path)) return bookingTransitionResources('reviewed');
  if (/^\/messages(?:\/|$)/.test(path)) return ['messages', 'notifications'];
  if (/^\/notifications(?:\/|$)/.test(path)) return ['notifications'];
  if (/^\/categories(?:\/|$)/.test(path)) return ['categories', 'community', 'admin'];
  if (/^\/verifications(?:\/|$)/.test(path)) return ['profiles', 'admin', 'notifications', 'community'];
  if (/^\/content-cases(?:\/|$)/.test(path)) return ['content', 'admin', 'notifications'];
  if (/^\/(auth|users)(?:\/|$)/.test(path)) return ['profiles', 'users', 'services', 'requests', 'community', 'admin'];
  return [];
}

function bookingTransitionResources(type?: string): CacheResource[] {
  if (type === 'created') return ['bookings', 'notifications', 'admin'];
  // Direct responses include declines and refunds of legacy paid requests.
  if (type === 'accepted' || type === 'declined') return ['bookings', 'services', 'transactions', 'notifications', 'messages', 'admin'];
  if (type === 'accepted_offer' || type === 'queue_created') return ['bookings', 'services', 'requests', 'offers', 'transactions', 'notifications', 'messages', 'admin'];
  if (type === 'offer_not_selected') return ['offers', 'notifications', 'admin'];
  if (type === 'hidden') return ['bookings', 'messages'];
  if (type === 'disputed' || type === 'safety_report') return ['bookings', 'notifications', 'admin'];
  if (['completion_escalated', 'cancellation_requested', 'cancellation_declined', 'cancellation_escalated', 'cancellation_processing'].includes(type || '')) return ['bookings', 'notifications', 'admin'];
  if (type === 'reviewed') return ['bookings', 'reviews', 'profiles', 'summaries', 'services', 'community', 'notifications', 'admin'];
  if (type === 'started') return ['bookings', 'services', 'notifications', 'messages', 'admin'];
  if (type === 'awaiting_confirmation') return ['bookings', 'services', 'notifications', 'admin'];
  if (type === 'provider_queue_changed') return ['bookings', 'services', 'admin'];
  if (type === 'completed') return ['bookings', 'requests', 'transactions', 'notifications', 'messages', 'profiles', 'community', 'admin'];
  return mutationResources('/bookings');
}

export function socketResources(event: string, payload?: unknown): CacheResource[] {
  if (event.startsWith('SERVICE_REQUEST')) return ['requests', 'offers', 'community', 'admin'];
  if (event.startsWith('SERVICE_LISTING')) return ['services', 'community', 'profiles', 'summaries', 'admin'];
  if (event === 'OFFERS_CHANGED') return ['offers', 'requests', 'notifications'];
  if (event === 'ENGAGEMENT_CHANGED') return bookingTransitionResources(
    payload && typeof payload === 'object' && 'type' in payload && typeof payload.type === 'string' ? payload.type : undefined,
  );
  if (event === 'queue_update') return ['bookings', 'services'];
  if (event === 'notification') return ['notifications', 'profiles', 'reviews', 'summaries', 'admin'];
  if (event === 'new_message' || event === 'message_notification') return ['messages', 'notifications'];
  if (event === 'COMMUNITY_CATEGORIES_CHANGED') return ['categories', 'community', 'admin'];
  if (event === 'COMMUNITY_ANNOUNCEMENTS_CHANGED') return ['community', 'admin'];
  if (event === 'ADMIN_MODERATION_CHANGED' || event === 'accountStatusChanged') return ALL_CACHE_RESOURCES;
  if (event === 'verification_submitted') return ['admin', 'profiles'];
  if (event === 'CONTENT_CASES_CHANGED') return ['content', 'admin', 'services', 'requests'];
  return [];
}
