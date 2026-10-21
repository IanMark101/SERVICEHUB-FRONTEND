import { HelpArticle } from '../types/help.types';

export const ACTIVITY_ARTICLES: HelpArticle[] = [
  {
    slug: 'tracking-your-activity',
    title: 'Tracking Bookings and Payment Records',
    category: 'activity',
    description: 'How to monitor ongoing jobs, action-required steps, and complete transaction archives in My Bookings and Provider Payment Records.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 2,
    keywords: ['activity', 'tracker', 'ongoing bookings', 'history', 'transaction history', 'action required'],
    relatedArticleSlugs: ['booking-lifecycle-explained', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'My Bookings',
        paragraphs: [
          'Open My Bookings in either workspace to follow your agreements, see the next action and review completed work:',
        ],
        bullets: [
          'Action Required: Tasks waiting for your input (e.g. confirming completion, accepting a price offer, or answering a schedule request).',
          'Ongoing Engagements: Active jobs currently in progress or waiting in queue.',
          'Completed History: Completed bookings, recorded totals and reviews.',
          'Provider Payment Records: View recorded GCash earnings and the fee breakdown. These records are separate from your Subscription payment history.',
        ],
      },
    ],
  },
];
