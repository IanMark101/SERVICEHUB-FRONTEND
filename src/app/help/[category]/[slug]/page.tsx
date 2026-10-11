import React from 'react';
import { Metadata } from 'next';
import HelpArticlePage from '@/features/help/pages/HelpArticlePage';
import { getArticleByCategoryAndSlug, getArticleBySlug, getCategoryBySlug, ALL_HELP_ARTICLES } from '@/features/help/data';
import { notFound, permanentRedirect } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, publicPageMetadata, siteUrl } from '@/lib/seo';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return ALL_HELP_ARTICLES.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

function resolveArticle(category: string, slug: string) {
  const article = getArticleByCategoryAndSlug(category, slug) || getArticleBySlug(slug);
  if (!article) notFound();
  if (category !== article.category) permanentRedirect(`/help/${article.category}/${article.slug}`);
  return article;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = resolveArticle(category, slug);
  return publicPageMetadata({ title: article.title, description: article.description, path: `/help/${article.category}/${article.slug}` });
}

export default async function Page({ params }: PageProps) {
  const { category, slug } = await params;
  const article = resolveArticle(category, slug);
  const collection = getCategoryBySlug(article.category)!;
  const path = `/help/${article.category}/${article.slug}`;
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          breadcrumbSchema([
            { name: 'Help Center', path: '/help' },
            { name: collection.title, path: `/help/${collection.slug}` },
            { name: article.title, path },
          ]),
          {
            '@type': 'TechArticle', headline: article.title, description: article.description,
            url: siteUrl(path), mainEntityOfPage: { '@type': 'WebPage', '@id': siteUrl(path) },
            inLanguage: 'en', publisher: { '@id': siteUrl('/#organization') },
            isPartOf: { '@id': siteUrl('/#website') },
          },
        ],
      }} />
      <HelpArticlePage categorySlug={article.category} articleSlug={article.slug} />
    </>
  );
}
