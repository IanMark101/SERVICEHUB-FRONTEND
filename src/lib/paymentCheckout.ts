export interface PendingGcashCheckout {
  seekerId: string;
  serviceId?: string;
  offerId?: string;
  paymentIntentId: string;
  redirectUrl?: string;
  quantity?: number;
  title?: string;
  providerName?: string;
  expectedAmount?: number;
}

const CHECKOUT_KEY = 'servicehub:pending-gcash-checkout';
export const GCASH_CHECKOUT_EVENT = 'servicehub:gcash-checkout';
let memoryCheckout: PendingGcashCheckout | null = null;

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
  memoryCheckout = checkout;
  try {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkout));
    // Older in-flight checkouts still use these keys, but a new attempt must
    // not let Activity later reconcile an unrelated stale intent.
    localStorage.removeItem('pending_payment_intent_id');
    localStorage.removeItem('pending_service_id');
    localStorage.removeItem('pending_offer_id');
  } catch { /* The open dialog still works when browser storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent(GCASH_CHECKOUT_EVENT, { detail: checkout }));
}

export function readPendingGcashCheckout(seekerId: string): PendingGcashCheckout | null {
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKOUT_KEY) || 'null') as PendingGcashCheckout | null;
    return stored?.seekerId === seekerId && typeof stored.paymentIntentId === 'string' ? stored : null;
  } catch {
    return memoryCheckout?.seekerId === seekerId ? memoryCheckout : null;
  }
}

export function readGcashCheckout(seekerId: string, paymentIntentId: string): PendingGcashCheckout | null {
  const stored = readPendingGcashCheckout(seekerId);
  return stored?.paymentIntentId === paymentIntentId ? stored : null;
}

export function clearGcashCheckout(paymentIntentId: string) {
  if (memoryCheckout?.paymentIntentId === paymentIntentId) memoryCheckout = null;
  try {
    const stored = JSON.parse(localStorage.getItem(CHECKOUT_KEY) || 'null') as PendingGcashCheckout | null;
    if (stored?.paymentIntentId === paymentIntentId) localStorage.removeItem(CHECKOUT_KEY);
  } catch {
    // Storage may be blocked; server verification is still authoritative.
  }
  window.dispatchEvent(new CustomEvent(GCASH_CHECKOUT_EVENT));
}

// Reserve the tab during the user's click, before awaiting the API. Browsers
// may block it; the status dialog always provides an ordinary checkout link.
export function prepareGcashWindow(): Window | null {
  try {
    const popup = window.open('about:blank', '_blank');
    if (popup) {
      popup.opener = null;
      popup.document.title = 'Opening GCash checkout';
      popup.document.body.textContent = 'Preparing your GCash checkout…';
    }
    return popup;
  } catch { return null; }
}

export function navigateGcashWindow(popup: Window | null, redirectUrl?: string) {
  if (!popup) return;
  if (!isPayMongoCheckoutUrl(redirectUrl)) { popup.close(); return; }
  try { popup.location.replace(redirectUrl); } catch { popup.close(); }
}
