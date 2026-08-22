import { HelpArticle, HelpCategory, HelpCategorySlug } from '../types/help.types';
import { HELP_CATEGORIES, getCategoryBySlug } from './categories';
import { GETTING_STARTED_ARTICLES } from './gettingStarted';
import { VERIFICATION_ARTICLES } from './verification';
import { TRUST_SCORE_ARTICLES } from './trustScore';
import { SERVICES_ARTICLES } from './services';
import { BOOKING_ARTICLES } from './booking';
import { OFFERS_REQUESTS_ARTICLES } from './offersRequests';
import { QUEUE_ARTICLES } from './queue';
import { MESSAGING_ARTICLES } from './messaging';
import { PAYMENTS_ARTICLES } from './payments';
import { REVIEWS_ARTICLES } from './reviews';
import { NOTIFICATIONS_ARTICLES } from './notifications';
import { ACTIVITY_ARTICLES } from './activity';
import { SAFETY_ARTICLES } from './safety';

export const ALL_HELP_ARTICLES: HelpArticle[] = [
  ...GETTING_STARTED_ARTICLES,
  ...VERIFICATION_ARTICLES,
  ...TRUST_SCORE_ARTICLES,
  ...SERVICES_ARTICLES,
  ...BOOKING_ARTICLES,
  ...OFFERS_REQUESTS_ARTICLES,
  ...QUEUE_ARTICLES,
  ...MESSAGING_ARTICLES,
  ...PAYMENTS_ARTICLES,
  ...REVIEWS_ARTICLES,
  ...NOTIFICATIONS_ARTICLES,
  ...ACTIVITY_ARTICLES,
  ...SAFETY_ARTICLES,
];

export { HELP_CATEGORIES, getCategoryBySlug };

export function getAllArticles(): HelpArticle[] {
  return ALL_HELP_ARTICLES;
}

export function getArticlesByCategory(categorySlug: HelpCategorySlug): HelpArticle[] {
  return ALL_HELP_ARTICLES.filter((article) => article.category === categorySlug);
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return ALL_HELP_ARTICLES.find((article) => article.slug === slug);
}

export function getArticleByCategoryAndSlug(categorySlug: string, slug: string): HelpArticle | undefined {
  return ALL_HELP_ARTICLES.find(
    (article) => article.category === categorySlug && article.slug === slug
  );
}

export function getPopularArticles(limit = 6): HelpArticle[] {
  return ALL_HELP_ARTICLES.filter((article) => article.popular).slice(0, limit);
}

export function getRelatedArticles(article: HelpArticle, limit = 3): HelpArticle[] {
  if (article.relatedArticleSlugs && article.relatedArticleSlugs.length > 0) {
    const explicitRelated = article.relatedArticleSlugs
      .map((slug) => getArticleBySlug(slug))
      .filter((a): a is HelpArticle => a !== undefined);
    if (explicitRelated.length >= limit) {
      return explicitRelated.slice(0, limit);
    }
  }

  // Fallback: other articles in the same category
  const sameCategory = ALL_HELP_ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  );
  return sameCategory.slice(0, limit);
}
