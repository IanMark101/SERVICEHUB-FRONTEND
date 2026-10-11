import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { canIndexPublicPages, getSiteOrigin, publicPageMetadata, rootMetadata, siteUrl, websiteSchema } from './seo';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://servicehubcordova.tech');
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('SEO_INDEXING_ENABLED', 'true');
});
afterEach(() => vi.unstubAllEnvs());

describe('public SEO and account indexing boundaries', () => {
  it('defaults all routes to noindex without assigning the homepage canonical to private URLs', () => {
    expect(rootMetadata.robots).toEqual({ index: false, follow: false });
    expect(rootMetadata.alternates?.canonical).toBeUndefined();
  });

  it('gives public content its own canonical, title, social description and indexing rules', () => {
    const metadata = publicPageMetadata({ title: 'Help Center', description: 'Read ServiceHub guides.', path: '/help' });
    expect(metadata.alternates?.canonical).toBe('https://servicehubcordova.tech/help');
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ title: 'Help Center | ServiceHub', url: 'https://servicehubcordova.tech/help', description: 'Read ServiceHub guides.' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Help Center | ServiceHub' });
  });

  it.each(['preview', 'disabled'])('keeps public content noindex in a %s deployment', mode => {
    if (mode === 'preview') vi.stubEnv('VERCEL_ENV', 'preview');
    else vi.stubEnv('SEO_INDEXING_ENABLED', 'false');
    expect(canIndexPublicPages()).toBe(false);
    expect(publicPageMetadata({ title: 'Home', description: 'Home', path: '/' }).robots).toEqual({ index: false, follow: false });
  });

  it('uses the configured canonical origin consistently and normalizes a trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.example.test/');
    expect(getSiteOrigin()).toBe('https://www.example.test');
    expect(siteUrl('/help')).toBe('https://www.example.test/help');
    const schema = websiteSchema();
    expect(schema['@graph'][1]).toMatchObject({ '@type': 'WebSite', name: 'ServiceHub', url: 'https://www.example.test/' });
  });

  it.each(['ftp://example.test', 'https://user:password@example.test', 'https://example.test/wrong-path', 'https://example.test/?token=value', 'https://example.test/#section'])('rejects an unsuitable canonical origin: %s', value => {
    expect(() => getSiteOrigin(value)).toThrow();
  });
});
