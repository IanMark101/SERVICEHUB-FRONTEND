import { redirect } from 'next/navigation';

export default async function LegacyContentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = new URLSearchParams({ view: 'content', type: 'SERVICE_LISTING' });
  if (typeof params.id === 'string') next.set('contentId', params.id);
  redirect(`/admin/content-cases?${next}`);
}
