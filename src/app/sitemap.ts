import type { MetadataRoute } from 'next';
import { ALL_HELP_ARTICLES, HELP_CATEGORIES } from '@/features/help/data';
import { canIndexPublicPages, siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!canIndexPublicPages()) return [];
  // Only anonymous, substantive pages belong here. Account flows, authenticated
  // profiles/workspaces, help search and unfinished legal pages are excluded.
  const paths = [
    '/',
    '/help',
    ...HELP_CATEGORIES.map(category => `/help/${category.slug}`),
    ...ALL_HELP_ARTICLES.map(article => `/help/${article.category}/${article.slug}`),
  ];
  // Article dates currently give a month, not an exact update date. Omit
  // lastModified rather than reporting every build as a content update.
  return [...new Set(paths)].map(path => ({ url: siteUrl(path) }));
}
