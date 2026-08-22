import React from 'react';
import { Metadata } from 'next';
import HelpCategoryPage from '@/features/help/pages/HelpCategoryPage';
import { getCategoryBySlug } from '@/features/help/data';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  return {
    title: cat ? `${cat.title} | ServiceHub Help Center` : 'Help Category | ServiceHub Cordova',
    description: cat?.description || 'Browse documentation and guides by category on ServiceHub Cordova.',
  };
}

export default async function Page({ params }: PageProps) {
  const { category } = await params;
  return <HelpCategoryPage categorySlug={category} />;
}
