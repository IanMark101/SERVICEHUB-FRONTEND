import { HelpArticle } from '../types/help.types';

export const REVIEWS_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-reviews-and-ratings-work',
    title: 'How Ratings, Reviews, and Feedback Tags Work',
    category: 'reviews',
    description: 'Learn how genuine post-service reviews work, the 24-hour edit window, and how feedback impacts provider reputations.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['reviews', 'ratings', 'feedback', 'stars', 'tags', 'verified review', 'ai summary'],
    relatedArticleSlugs: ['what-is-trust-score', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'Genuine, Transaction-Verified Reviews Only',
        paragraphs: [
          'On ServiceHub Cordova, nobody can leave fake reviews or review a service they did not actually hire. The review option is strictly unlocked only after a service booking has been confirmed as completed.',
        ],
      },
      {
        heading: 'Review Components',
        bullets: [
          '1 to 5 Star Rating: Overall rating of quality, communication, and punctuality.',
          'Written Review Comment: Specific details about your experience.',
          'Feedback Tags: Select descriptive tags such as "On Time", "Skilled", "Fair Pricing", "Clean Work", or "Polite".',
        ],
      },
      {
        heading: 'The 24-Hour Edit Window',
        paragraphs: [
          'Seekers can edit their submitted review within 24 hours of posting in case of typos or updated remarks. After 24 hours, reviews are permanently locked to ensure integrity.',
        ],
      },
    ],
  },
];
