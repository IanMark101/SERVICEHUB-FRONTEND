import React from 'react';
import { Metadata } from 'next';
import HelpArticlePage from '@/features/help/pages/HelpArticlePage';
import { getArticleByCategoryAndSlug, getArticleBySlug } from '@/features/help/data';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticleByCategoryAndSlug(category, slug) || getArticleBySlug(slug);

  return {
    title: article ? `${article.title} | ServiceHub Help Center` : 'Help Article | ServiceHub Cordova',
    description: article?.description || 'Read user guides and documentation on ServiceHub Cordova.',
  };
}

export default async function Page({ params }: PageProps) {
  const { category, slug } = await params;
  return <HelpArticlePage categorySlug={category} articleSlug={slug} />;
}
