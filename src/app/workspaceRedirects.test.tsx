import { describe, expect, it } from 'vitest';
import SeekerPage from './seeker/page';
import ProviderPage from './provider/page';
import LegacySubscriptionPage from './provider/subscription/page';

describe('workspace aliases resolve before client effects', () => {
  it('moves previous subscription links to the standalone page without losing payment verification', async () => {
    await expect(LegacySubscriptionPage({ searchParams: Promise.resolve({ payment_intent_id: 'pi_verified123' }) })).rejects.toMatchObject({ digest: expect.stringContaining(';/subscription?payment_intent_id=pi_verified123;') });
    await expect(LegacySubscriptionPage({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({ digest: expect.stringContaining(';/subscription;') });
  });
  it.each([
    [SeekerPage, '/seeker/seek-services'],
    [ProviderPage, '/provider/browse-services'],
  ] as const)('redirects to %s without leaving a redirect skeleton mounted', (Page, target) => {
    // Next's real redirect contract: a server render emits NEXT_REDIRECT.
    // No router mock or hydrated client effect is required to reach the target.
    expect(() => Page()).toThrow(expect.objectContaining({
      digest: expect.stringContaining(`;${target};`),
    }));
  });
});
