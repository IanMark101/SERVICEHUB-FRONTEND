import { publicPageMetadata, SITE_DESCRIPTION } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Find Nearby Services & Local Providers',
  description: SITE_DESCRIPTION,
  path: '/',
});

export default function Home() {
  // The public body lives in the landing layout, outside route streaming.
  return null;
}
