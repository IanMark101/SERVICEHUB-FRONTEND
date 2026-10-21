import { api } from '../lib/api/axios';

export interface SubscriptionPayment {
  id: string; plan: 'PRO'; amount: number; currency: 'PHP'; paymentMethod: string;
  paymentReference: string | null; paymentIntentId: string | null;
  paymentStatus: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUND_REQUIRED' | 'REFUNDED';
  redirectUrl: string | null; isTestMode: boolean; checkoutExpiresAt: string;
  subscriptionStartedAt: string | null; subscriptionExpiresAt: string | null; createdAt: string; paidAt: string | null;
}
export interface ProviderSubscription {
  plan: 'FREE' | 'PRO'; subscriptionPlan: 'FREE' | 'PRO'; subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  subscriptionStartedAt: string | null; subscriptionExpiresAt: string | null;
  commissionRateBps: number; activeListingLimit: number | null; featuredPriority: boolean;
  activeListings: number; monthlyPrice: number; isTestMode: boolean; payments: SubscriptionPayment[];
}
export interface AdminSubscriptions {
  summary: { activeProProviders: number; expiredProSubscriptions: number; subscriptionRevenue: number; testSubscriptionTotal: number; isTestMode: boolean };
  payments: (SubscriptionPayment & { provider: { id: string; name: string } })[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export async function getSubscription(signal?: AbortSignal): Promise<ProviderSubscription> {
  return (await api.get('/provider/subscription', { signal, apiCache: 'no-store' })).data.data;
}
export async function startProCheckout(): Promise<SubscriptionPayment> {
  return (await api.post('/provider/subscription/checkout', {}, { timeout: 45_000 })).data.data;
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
