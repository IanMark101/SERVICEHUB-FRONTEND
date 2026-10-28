import type { ProviderSubscription, SubscriptionPayment, MembershipQuote } from '../../../api/subscriptions.api';
export const free: ProviderSubscription = {
  plan: 'FREE', subscriptionPlan: 'FREE', status: 'ACTIVE', subscriptionStatus: 'ACTIVE',
  subscriptionStartedAt: null, subscriptionExpiresAt: null,
  freePlanStartedAt: '2026-10-20T08:00:00Z', freePlanExpiresAt: '2026-11-19T08:00:00Z',
  startsAt: '2026-10-20T08:00:00Z', expiresAt: '2026-11-19T08:00:00Z', daysRemaining: 28,
  trialStarted: true, marketplaceAccess: true, fullAnalytics: false,
  commissionRateBps: 1000, activeListingLimit: 1, activeListings: 1, monthlyPrice: 0,
  featuredPriority: false, isTestMode: true, payments: [],
};
export const basic: ProviderSubscription = { ...free, plan: 'BASIC', subscriptionPlan: 'BASIC', fullAnalytics: true,
  commissionRateBps: 800, activeListingLimit: 3, monthlyPrice: 99,
  subscriptionStartedAt: '2026-10-20T08:00:00Z', subscriptionExpiresAt: '2026-11-20T08:00:00Z',
  startsAt: '2026-10-20T08:00:00Z', expiresAt: '2026-11-20T08:00:00Z' };
export const pro: ProviderSubscription = { ...basic, plan: 'PRO', subscriptionPlan: 'PRO', commissionRateBps: 500,
  activeListingLimit: null, activeListings: 8, monthlyPrice: 199, featuredPriority: true };
export const quote: MembershipQuote = { plan: 'BASIC', amount: 99, monthlyPrice: 99, billingAction: 'NEW',
  periodExpiresAt: null, listingsToPause: 0, quoteToken: 'server-signed-quote', validUntil: '2099-01-01T00:00:00Z' };
export const pending: SubscriptionPayment = { id: 'sub-1', plan: 'BASIC', amount: 99, currency: 'PHP', paymentMethod: 'gcash',
  paymentReference: null, paymentIntentId: 'pi_sub1', paymentStatus: 'PENDING', billingAction: 'NEW',
  redirectUrl: 'https://test-sources.paymongo.com/sources/sub1', isTestMode: true, checkoutExpiresAt: '2099-01-01T00:00:00Z',
  subscriptionStartedAt: null, subscriptionExpiresAt: null, createdAt: '2026-10-22T08:00:00Z', paidAt: null };
