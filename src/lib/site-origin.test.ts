import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';
import { FRONTEND_REDIRECT_HOSTS, getSiteOrigin, PRODUCTION_SITE_ORIGIN } from './site-origin';

describe('frontend domain migration', () => {
  it('uses the live primary frontend host, including when the retired build setting remains', () => {
    expect(getSiteOrigin('')).toBe('https://www.servicehub.bond');
    for (const host of FRONTEND_REDIRECT_HOSTS) {
      expect(getSiteOrigin(`https://${host}/`)).toBe(PRODUCTION_SITE_ORIGIN);
    }
    expect(getSiteOrigin('https://preview.example.test')).toBe('https://preview.example.test');
  });

  it('redirects only exact frontend aliases while preserving the path', async () => {
    const redirects = await nextConfig.redirects!();
    const hostRules = redirects.filter(rule => rule.has?.some(item => item.type === 'host'));
    expect(hostRules).toHaveLength(3);
    for (const host of FRONTEND_REDIRECT_HOSTS) {
      const matches = hostRules.filter(rule => new RegExp(`^${rule.has![0].value}$`).test(host));
      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({ source: '/:path*', destination: `${PRODUCTION_SITE_ORIGIN}/:path*`, permanent: true });
    }
    for (const host of ['www.servicehub.bond', 'localhost', 'api.servicehubcordova.tech', 'servicehubcordova.tech.evil.example', 'servicehubXbond']) {
      expect(hostRules.some(rule => new RegExp(`^${rule.has![0].value}$`).test(host))).toBe(false);
    }
  });
});
