import { describe, expect, it } from 'vitest';
import { resolveNotificationLink } from './notificationRoutes';

describe('notification profile destinations', () => {
  it.each(['seeker', 'provider'] as const)('opens old and new verification alerts in private settings from %s', role => {
    for (const title of ['Verification Approved', 'Verification Rejected']) {
      expect(resolveNotificationLink('/seeker/user-profile?id=john', role, 'john', title))
        .toBe('/account/settings#verification');
      expect(resolveNotificationLink('/account/settings#verification', role, 'john', title))
        .toBe('/account/settings#verification');
    }
  });

  it('opens received ratings directly in the target profile reviews tab', () => {
    expect(resolveNotificationLink('/seeker/user-profile?id=john&tab=reviews', 'seeker', 'john'))
      .toBe('/profile/john?tab=reviews');
    expect(resolveNotificationLink('/provider/user-profile?id=ian&tab=reviews', 'seeker', 'john'))
      .toBe('/profile/ian?tab=reviews');
  });

  it('uses the signed-in account for old profile links without an id', () => {
    expect(resolveNotificationLink('user-profile', 'seeker', 'john')).toBe('/profile/john');
    expect(resolveNotificationLink('/seeker/user-profile?tab=reviews', 'seeker', 'john'))
      .toBe('/profile/john?tab=reviews');
    expect(resolveNotificationLink('/seeker/user-profile?tab=reviews', 'seeker'))
      .toBe('/seeker/user-profile?tab=reviews');
  });

  it('preserves verification, settings and encoded profile destinations', () => {
    expect(resolveNotificationLink('/provider/user-profile?id=member%2Fone&verify=true&tab=reviews', 'provider'))
      .toBe('/profile/member%2Fone?tab=verification');
    expect(resolveNotificationLink('/seeker/user-profile?tab=settings', 'seeker', 'john'))
      .toBe('/account/settings');
    expect(resolveNotificationLink('/profile/john?tab=reviews', 'seeker', 'john'))
      .toBe('/profile/john?tab=reviews');
  });

  it('keeps booking links and admin profile routes intact', () => {
    expect(resolveNotificationLink('/provider/provider-activity?booking=one', 'seeker', 'john'))
      .toBe('/provider/provider-activity?booking=one&tab=all');
    expect(resolveNotificationLink('/admin/user-profile', 'admin', 'admin-id')).toBe('/admin/user-profile');
    expect(resolveNotificationLink(null, 'seeker', 'john')).toBeNull();
  });
});
