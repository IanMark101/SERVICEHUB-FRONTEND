export type HelpCategorySlug =
  | 'getting-started'
  | 'verification'
  | 'trust-reputation'
  | 'services'
  | 'bookings'
  | 'offers-requests'
  | 'queue'
  | 'messaging'
  | 'payments'
  | 'reviews'
  | 'notifications'
  | 'activity'
  | 'safety';

export interface HelpCategory {
  slug: HelpCategorySlug;
  title: string;
  shortTitle?: string;
  description: string;
  iconName: string;
  color: string;
  popular?: boolean;
}

export interface ArticleCallout {
  type: 'tip' | 'info' | 'warning' | 'important';
  title?: string;
  text: string;
}

export interface ArticleExample {
  title: string;
  description: string;
}

export interface ArticleSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  callout?: ArticleCallout;
  example?: ArticleExample;
}

export interface HelpArticle {
  slug: string;
  title: string;
  category: HelpCategorySlug;
  description: string;
  lastUpdated: string;
  readTimeMinutes: number;
  keywords: string[];
  popular?: boolean;
  sections: ArticleSection[];
  relatedArticleSlugs?: string[];
}

export interface SearchResult {
  article: HelpArticle;
  category: HelpCategory;
  score: number;
  matchedField: 'title' | 'description' | 'keywords' | 'content';
}
