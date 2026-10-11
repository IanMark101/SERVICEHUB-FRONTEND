import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    // Let crawlers see the noindex metadata on account routes. Disallowing those
    // routes here would prevent search engines from reading that directive.
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
