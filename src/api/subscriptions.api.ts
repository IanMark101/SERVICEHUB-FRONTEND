import { api } from '../lib/api/axios';

export type ProviderPlan = 'FREE' | 'BASIC' | 'PRO';
export type PaidProviderPlan = Exclude<ProviderPlan, 'FREE'>;
export interface SubscriptionPayment {
  id: string; plan: PaidProviderPlan; amount: number; currency: 'PHP'; paymentMethod: string;
  paymentReference: string | null; paymentIntentId: string | null;
  paymentStatus: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUND_REQUIRED' | 'REFUNDED';
  billingAction?: string;
  redirectUrl: string | null; isTestMode: boolean; checkoutExpiresAt: string;
  subscriptionStartedAt: string | null; subscriptionExpiresAt: string | null; createdAt: string; paidAt: string | null;
}
export interface ProviderSubscription {
  plan: ProviderPlan; subscriptionPlan: ProviderPlan; subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  subscriptionStartedAt: string | null; subscriptionExpiresAt: string | null;
  freePlanStartedAt: string | null; freePlanExpiresAt: string | null;
  startsAt: string | null; expiresAt: string | null; daysRemaining: number;
  trialStarted: boolean; marketplaceAccess: boolean; fullAnalytics: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  commissionRateBps: number; activeListingLimit: number | null; featuredPriority: boolean;
  activeListings: number; monthlyPrice: number; isTestMode: boolean; payments: SubscriptionPayment[];
}
export interface MembershipQuote {
  plan: PaidProviderPlan; amount: number; monthlyPrice: number; billingAction: string;
  periodExpiresAt: string | null; listingsToPause: number; quoteToken: string; validUntil: string;
}
export interface AdminSubscriptions {
  summary: { activeFreeProviders: number; activeBasicProviders: number; activeProProviders: number; expiredProSubscriptions: number; subscriptionRevenue: number; testSubscriptionTotal: number; isTestMode: boolean };
  memberships: (Pick<ProviderSubscription, 'plan' | 'monthlyPrice' | 'status' | 'marketplaceAccess' | 'startsAt' | 'expiresAt' | 'commissionRateBps'> & { id: string; name: string })[];
  membershipsPagination: { page: number; limit: number; total: number; totalPages: number };
  payments: (SubscriptionPayment & { provider: { id: string; name: string } })[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export async function getSubscription(signal?: AbortSignal): Promise<ProviderSubscription> {
  return (await api.get('/provider/subscription', { signal, apiCache: 'no-store' })).data.data;
}
export async function startFreeProviderPlan(signal?: AbortSignal): Promise<ProviderSubscription> {
  return (await api.post('/provider/subscription/start-free', { providerIntent: true }, { signal })).data.data;
}
export async function getMembershipQuote(plan: PaidProviderPlan): Promise<MembershipQuote> {
  return (await api.post('/provider/subscription/quote', { plan })).data.data;
}
export async function startMembershipCheckout(plan: PaidProviderPlan, quoteToken: string): Promise<SubscriptionPayment> {
  return (await api.post('/provider/subscription/checkout', { plan, quoteToken }, { timeout: 45_000 })).data.data;
}
export async function startProCheckout(): Promise<SubscriptionPayment> {
  const quote = await getMembershipQuote('PRO');
  return startMembershipCheckout('PRO', quote.quoteToken);
}
export async function confirmProPayment(paymentIntentId: string): Promise<SubscriptionPayment> {
  return (await api.post('/provider/subscription/confirm', { paymentIntentId }, { timeout: 20_000 })).data.data;
}
export async function cancelProCheckout(paymentIntentId: string): Promise<SubscriptionPayment> {
  return (await api.post('/provider/subscription/checkout/cancel', { paymentIntentId })).data.data;
}
export async function cancelPro(): Promise<ProviderSubscription> {
  return (await api.post('/provider/subscription/cancel', {})).data.data;
}
export async function getAdminSubscriptions(page: number, signal?: AbortSignal): Promise<AdminSubscriptions> {
  return (await api.get('/admin/subscriptions', { params: { page, limit: 20 }, signal, apiCache: 'no-store' })).data.data;
}
