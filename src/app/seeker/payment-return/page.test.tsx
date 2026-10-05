import { describe, expect, it } from 'vitest';
import PaymentReturnPage from './page';

describe('PayMongo return route', () => {
  it('passes a duplicated matching payment intent to the status screen', async () => {
    const page = await PaymentReturnPage({
      searchParams: Promise.resolve({ payment_intent_id: ['pi_same', 'pi_same'] }),
    });
    expect((page.props as { paymentIntentId: string | null }).paymentIntentId).toBe('pi_same');
  });

  it('does not select between conflicting payment intents', async () => {
    const page = await PaymentReturnPage({
      searchParams: Promise.resolve({ payment_intent_id: ['pi_first', 'pi_second'] }),
    });
    expect((page.props as { paymentIntentId: string | null }).paymentIntentId).toBeNull();
  });
});
