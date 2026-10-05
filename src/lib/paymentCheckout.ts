export interface PendingGcashCheckout {
  seekerId: string;
  serviceId?: string;
  offerId?: string;
  paymentIntentId: string;
  redirectUrl?: string;
}

const CHECKOUT_KEY = 'servicehub:pending-gcash-checkout';

export function paymentReturnPath(paymentIntentId: string) {
  return `/seeker/payment-return?payment_intent_id=${encodeURIComponent(paymentIntentId)}`;
}

// PayMongo may append its own payment_intent_id even when our return URL
// already contains one. Accept matching duplicates, but never guess between
// conflicting payment attempts.
export function resolveReturnPaymentIntentId(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (!value?.length) return null;
  const first = value[0]?.trim();
  return first && value.every((id) => id.trim() === first) ? first : null;
}

export function isPayMongoCheckoutUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'paymongo.com' || url.hostname.endsWith('.paymongo.com'));
  } catch {
    return false;
  }
}

export function rememberGcashCheckout(checkout: PendingGcashCheckout) {
  localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkout));
  // Older in-flight checkouts still use these keys, but a new attempt must
  // not let Activity later reconcile an unrelated stale intent.
  localStorage.removeItem('pending_payment_intent_id');
  localStorage.removeItem('pending_service_id');
  localStorage.removeItem('pending_offer_id');
}

export function readGcashCheckout(seekerId: string, paymentIntentId: string): PendingGcashCheckout | null {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKOUT_KEY) || 'null') as PendingGcashCheckout | null;
    return stored?.seekerId === seekerId && stored.paymentIntentId === paymentIntentId ? stored : null;
  } catch {
    return null;
  }
}

export function clearGcashCheckout(paymentIntentId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKOUT_KEY) || 'null') as PendingGcashCheckout | null;
    if (stored?.paymentIntentId === paymentIntentId) localStorage.removeItem(CHECKOUT_KEY);
  } catch {
    localStorage.removeItem(CHECKOUT_KEY);
  }
}
