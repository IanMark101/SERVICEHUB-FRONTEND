import type { Metadata } from 'next';

export const SITE_NAME = 'ServiceHub';
export const SITE_DESCRIPTION = 'Find nearby services, compare local providers and post service requests on ServiceHub. Choose your search area and follow bookings from start to completion.';
export const PRIVATE_ROBOTS: Metadata['robots'] = { index: false, follow: false };

export function getSiteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  const url = new URL(value?.trim() || 'https://servicehubcordova.tech');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, a path, query or fragment.');
  }
  return url.origin;
}

export function siteUrl(path = '/'): string {
  return new URL(path, getSiteOrigin()).toString();
}

export function canIndexPublicPages(): boolean {
  return process.env.SEO_INDEXING_ENABLED !== 'false' && process.env.VERCEL_ENV !== 'preview';
}

const socialImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'ServiceHub — find nearby services and connect with local providers',
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, statusBarStyle: 'default', title: SITE_NAME },
  // Public routes explicitly opt in below; account and workspace routes inherit
  // noindex without moving their existing client-side authentication guards.
  robots: PRIVATE_ROBOTS,
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_PH', images: [socialImage] },
  twitter: { card: 'summary_large_image', images: [socialImage] },
  icons: {
    icon: [{ url: '/favicon.svg?v=7', type: 'image/svg+xml', sizes: 'any' }, { url: '/favicon.ico?v=7', sizes: 'any' }],
    apple: [{ url: '/pwa/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export function publicPageMetadata({ title, description, path }: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = siteUrl(path);
  const socialTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: canIndexPublicPages()
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : PRIVATE_ROBOTS,
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_PH', url, title: socialTitle, description, images: [socialImage] },
    twitter: { card: 'summary_large_image', title: socialTitle, description, images: [socialImage] },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: siteUrl(item.path),
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': siteUrl('/#organization'), name: SITE_NAME, url: siteUrl(), logo: siteUrl('/logo.png') },
      { '@type': 'WebSite', '@id': siteUrl('/#website'), name: SITE_NAME, url: siteUrl(), description: SITE_DESCRIPTION, inLanguage: 'en', publisher: { '@id': siteUrl('/#organization') } },
    ],
  };
}
