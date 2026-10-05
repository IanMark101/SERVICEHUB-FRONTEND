import { describe, expect, it } from 'vitest';
import SeekerPage from './seeker/page';
import ProviderPage from './provider/page';

describe('workspace aliases resolve before client effects', () => {
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
