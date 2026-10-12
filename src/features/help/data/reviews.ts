import { HelpArticle } from '../types/help.types';

export const REVIEWS_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-reviews-and-ratings-work',
    title: 'How Ratings, Reviews, and Feedback Tags Work',
    category: 'reviews',
    description: 'Learn how genuine post-service reviews work, the 24-hour edit window, and how feedback impacts provider reputations.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    keywords: ['reviews', 'ratings', 'feedback', 'stars', 'tags', 'verified review', 'ai summary'],
    relatedArticleSlugs: ['what-is-trust-score', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'Genuine, Transaction-Verified Reviews Only',
        paragraphs: [
          'Both participants can review the other participant once after their booking is confirmed as completed. The target is determined from the booking, and self-reviews are blocked. Booking-linked reviews can still contain subjective or misleading feedback, so a moderation process is available.',
        ],
      },
      {
        heading: 'Review Components',
        bullets: [
          '1 to 5 Star Rating: Overall rating of quality, communication, and punctuality.',
          'Written Review Comment: Explain 1- or 2-star ratings in at least 10 characters. Written feedback is optional for 3-to-5-star ratings.',
          'Feedback Tags: Select descriptive tags such as "On Time", "Skilled", "Fair Pricing", "Clean Work", or "Polite".',
        ],
      },
      {
        heading: 'The 24-Hour Edit Window',
        paragraphs: [
          'Seekers and Providers can edit their own submitted review for 24 hours. Low ratings still require an explanation. Posting, editing, hiding, or restoring a review does not change Trust Score.',
        ],
      },
      { heading: 'Responding to or disputing a review', steps: [
        'Open your User Profile and choose Reviews.',
        'Use Respond publicly to review to explain your perspective respectfully. This response is visible with the review.',
        'Use Report review policy violation for threats, manipulation, harassment, irrelevant content, or fabricated participation. Explain the violation and supporting details in at least 20 characters.',
        'Track the dispute in Trust History. The review author has 48 hours to explain before Admin can uphold the dispute, unless they respond earlier. Admin records a reasoned decision. Harmful content can still be hidden through separately audited direct moderation.',
      ], callout: { type: 'info', title: 'Honest criticism stays visible', text: 'Disagreement with a rating is not a reason to remove it. Reviews express satisfaction; every star rating adds or deducts zero trust points.' } },
    ],
  },
];
