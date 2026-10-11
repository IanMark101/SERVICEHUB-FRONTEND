import React from 'react';
import { Metadata } from 'next';
import HelpCategoryPage from '@/features/help/pages/HelpCategoryPage';
import { getCategoryBySlug, HELP_CATEGORIES } from '@/features/help/data';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, publicPageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return HELP_CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();
  return publicPageMetadata({ title: `${cat.title} Help`, description: cat.description, path: `/help/${cat.slug}` });
}

export default async function Page({ params }: PageProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbSchema([
        { name: 'Help Center', path: '/help' },
        { name: cat.title, path: `/help/${cat.slug}` },
      ]) }} />
      <HelpCategoryPage categorySlug={cat.slug} />
    </>
  );
}
