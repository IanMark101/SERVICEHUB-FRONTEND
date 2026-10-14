import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_HELP_ARTICLES, HELP_CATEGORIES } from '@/features/help/data';
import sitemap from './sitemap';
import robots from './robots';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.servicehub.bond');
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('SEO_INDEXING_ENABLED', 'true');
});
afterEach(() => vi.unstubAllEnvs());

describe('crawl discovery', () => {
  it('lists the landing page and every canonical Help Center collection/article once', () => {
    const entries = sitemap();
    const urls = entries.map(entry => entry.url);
    expect(urls).toContain('https://www.servicehub.bond/');
    expect(urls).toContain('https://www.servicehub.bond/help');
    for (const category of HELP_CATEGORIES) expect(urls).toContain(`https://www.servicehub.bond/help/${category.slug}`);
    for (const article of ALL_HELP_ARTICLES) expect(urls).toContain(`https://www.servicehub.bond/help/${article.category}/${article.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(2 + HELP_CATEGORIES.length + ALL_HELP_ARTICLES.length);
    expect(entries.every(entry => entry.lastModified === undefined)).toBe(true);
  });

  it('excludes authenticated routes, account flows, search variants and legal placeholders', () => {
    const paths = sitemap().map(entry => new URL(entry.url).pathname);
    for (const path of ['/seeker/seek-services', '/provider/browse-services', '/admin', '/community', '/profile/member', '/login', '/register', '/get-started', '/reset-password', '/help/search', '/terms', '/privacy']) {
      expect(paths).not.toContain(path);
    }
    expect(sitemap().every(entry => !new URL(entry.url).search)).toBe(true);
  });

  it('does not publish indexable URLs from previews or disabled deployments', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(sitemap()).toEqual([]);
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('SEO_INDEXING_ENABLED', 'false');
    expect(sitemap()).toEqual([]);
  });

  it('advertises the canonical sitemap and allows crawlers to read route noindex directives', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: 'https://www.servicehub.bond/sitemap.xml',
    });
  });
});
