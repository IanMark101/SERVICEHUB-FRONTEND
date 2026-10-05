import { beforeEach, describe, expect, it } from 'vitest';
import { clearGcashCheckout, isPayMongoCheckoutUrl, paymentReturnPath, readGcashCheckout, rememberGcashCheckout, resolveReturnPaymentIntentId } from './paymentCheckout';

describe('GCash checkout context', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the return tied to the owning seeker and the exact intent', () => {
    rememberGcashCheckout({ seekerId: 'seeker-one', serviceId: 'service-one', paymentIntentId: 'pi_one', redirectUrl: 'https://test-sources.paymongo.com/sources/one' });
    expect(readGcashCheckout('seeker-two', 'pi_one')).toBeNull();
    expect(readGcashCheckout('seeker-one', 'pi_other')).toBeNull();
    expect(readGcashCheckout('seeker-one', 'pi_one')?.serviceId).toBe('service-one');
    clearGcashCheckout('pi_other');
    expect(readGcashCheckout('seeker-one', 'pi_one')).not.toBeNull();
    clearGcashCheckout('pi_one');
    expect(readGcashCheckout('seeker-one', 'pi_one')).toBeNull();
  });

  it('allows only HTTPS PayMongo checkout links and encodes the return intent', () => {
    expect(isPayMongoCheckoutUrl('https://test-sources.paymongo.com/sources/example')).toBe(true);
    expect(isPayMongoCheckoutUrl('https://paymongo.com.evil.example/sources/example')).toBe(false);
    expect(isPayMongoCheckoutUrl('javascript:alert(1)')).toBe(false);
    expect(isPayMongoCheckoutUrl('http://test-sources.paymongo.com/sources/example')).toBe(false);
    expect(paymentReturnPath('pi_1&evil=1')).toBe('/seeker/payment-return?payment_intent_id=pi_1%26evil%3D1');
  });

  it('accepts a PayMongo return with the same intent twice but rejects conflicting intents', () => {
    expect(resolveReturnPaymentIntentId('pi_one')).toBe('pi_one');
    expect(resolveReturnPaymentIntentId(['pi_one', 'pi_one'])).toBe('pi_one');
    expect(resolveReturnPaymentIntentId(['pi_one', 'pi_other'])).toBeNull();
    expect(resolveReturnPaymentIntentId(['pi_one', ''])).toBeNull();
    expect(resolveReturnPaymentIntentId(undefined)).toBeNull();
  });
});
