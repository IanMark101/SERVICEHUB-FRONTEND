export const subscriptionPaymentLabels = { PENDING: 'Awaiting payment', SUCCEEDED: 'Paid', FAILED: 'Failed', EXPIRED: 'Checkout expired', CANCELLED: 'Cancelled', REFUND_REQUIRED: 'Refund pending', REFUNDED: 'Refunded' };
export function safeSubscriptionCheckout(url: string | null) {
  try { const parsed = new URL(url || ''); return parsed.protocol === 'https:' && (parsed.hostname === 'paymongo.com' || parsed.hostname.endsWith('.paymongo.com')) ? parsed.href : null; } catch { return null; }
}
