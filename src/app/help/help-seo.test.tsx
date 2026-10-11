import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JsonLd from '@/components/seo/JsonLd';
import ArticlePage, { generateMetadata as articleMetadata } from './[category]/[slug]/page';
import CategoryPage, { generateMetadata as categoryMetadata } from './[category]/page';
import { ALL_HELP_ARTICLES, getCategoryBySlug } from '@/features/help/data';

vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NEXT_NOT_FOUND'); },
  permanentRedirect: (path: string) => { throw new Error(`NEXT_PERMANENT_REDIRECT:${path}`); },
}));

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://servicehubcordova.tech');
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('SEO_INDEXING_ENABLED', 'true');
});
afterEach(() => vi.unstubAllEnvs());

const article = ALL_HELP_ARTICLES[0];
const category = getCategoryBySlug(article.category)!;
const path = `/help/${article.category}/${article.slug}`;
const props = { params: Promise.resolve({ category: article.category, slug: article.slug }) };

describe('server-rendered Help Center SEO', () => {
  it('uses article content for its own title, description and canonical URL', async () => {
    const metadata = await articleMetadata(props);
    expect(metadata.title).toBe(article.title);
    expect(metadata.description).toBe(article.description);
    expect(metadata.alternates?.canonical).toBe(`https://servicehubcordova.tech${path}`);
  });

  it('renders readable article content and matching breadcrumb/article JSON-LD before hydration', async () => {
    const html = renderToStaticMarkup(await ArticlePage(props));
    const container = document.createElement('div');
    container.innerHTML = html;
    expect(container.querySelector('h1')?.textContent).toBe(article.title);
    const data = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(data['@graph'][0].itemListElement.map((item: { name: string }) => item.name)).toEqual(['Help Center', category.title, article.title]);
    expect(data['@graph'][1]).toMatchObject({ '@type': 'TechArticle', headline: article.title, url: `https://servicehubcordova.tech${path}` });
  });

  it('gives collections a distinct canonical and visible-content breadcrumbs', async () => {
    const props = { params: Promise.resolve({ category: category.slug }) };
    expect((await categoryMetadata(props)).alternates?.canonical).toBe(`https://servicehubcordova.tech/help/${category.slug}`);
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(await CategoryPage(props));
    const data = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(data.itemListElement.map((item: { name: string }) => item.name)).toEqual(['Help Center', category.title]);
  });

  it('permanently redirects a known article under the wrong collection instead of serving duplicate content', async () => {
    const wrong = { params: Promise.resolve({ category: 'wrong-category', slug: article.slug }) };
    await expect(ArticlePage(wrong)).rejects.toThrow(`NEXT_PERMANENT_REDIRECT:${path}`);
    await expect(articleMetadata(wrong)).rejects.toThrow(`NEXT_PERMANENT_REDIRECT:${path}`);
  });

  it('uses the not-found boundary for unknown collections and articles', async () => {
    const missingArticle = { params: Promise.resolve({ category: category.slug, slug: 'missing-guide' }) };
    const missingCategory = { params: Promise.resolve({ category: 'missing-collection' }) };
    await expect(ArticlePage(missingArticle)).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(articleMetadata(missingArticle)).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(CategoryPage(missingCategory)).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(categoryMetadata(missingCategory)).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('escapes script-breaking content while preserving valid JSON-LD values', () => {
    const data = { '@context': 'https://schema.org', name: '</script><script>alert("test")</script>' };
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<JsonLd data={data} />);
    expect(container.querySelectorAll('script')).toHaveLength(1);
    expect(JSON.parse(container.querySelector('script')!.textContent!)).toEqual(data);
  });
});
