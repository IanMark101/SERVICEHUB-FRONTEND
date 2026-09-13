import { HelpArticle } from '../types/help.types';

export const ACTIVITY_ARTICLES: HelpArticle[] = [
  {
    slug: 'tracking-your-activity',
    title: 'Tracking Your Activity & Transaction History',
    category: 'activity',
    description: 'How to monitor ongoing jobs, action-required steps, and complete transaction archives in the Activity Center.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['activity', 'tracker', 'ongoing bookings', 'history', 'transaction history', 'action required'],
    relatedArticleSlugs: ['booking-lifecycle-explained', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'The Activity Center',
        paragraphs: [
          'Under the "Activity" tab in your sidebar, you will find your centralized operational dashboard. It breaks down your engagements into clear categories:',
        ],
        bullets: [
          'Action Required: Tasks waiting for your input (e.g. confirming completion, accepting a price offer, or answering a schedule request).',
          'Ongoing Engagements: Active jobs currently in progress or waiting in queue.',
          'Completed History: A complete archive of all past completed transactions, receipts, and reviews.',
        ],
      },
    ],
  },
];
