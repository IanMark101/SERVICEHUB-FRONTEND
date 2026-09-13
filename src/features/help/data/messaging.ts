import { HelpArticle } from '../types/help.types';

export const MESSAGING_ARTICLES: HelpArticle[] = [
  {
    slug: 'when-messaging-unlocks',
    title: 'When Messaging Unlocks & Becomes Available',
    category: 'messaging',
    description: 'Learn why messaging requires an active transaction on ServiceHub Cordova to protect against spam and harassment.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['chat', 'messaging', 'unlock chat', 'transaction bound', 'direct message', 'spam prevention'],
    relatedArticleSlugs: ['why-messaging-is-transaction-bound', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'Transaction-Bound Communication',
        paragraphs: [
          'On ServiceHub Cordova, you cannot randomly private message strangers or unsolicited users. Direct messaging is strictly bound to active service transactions.',
        ],
      },
      {
        heading: 'When Does Chat Open?',
        bullets: [
          'Direct Bookings (Flow A): Chat unlocks the moment the provider accepts your booking request.',
          'Custom Job Requests (Flow B): Chat unlocks the moment the seeker accepts a provider\'s bid offer.',
        ],
        example: {
          title: 'Realistic Example',
          description: 'Juan requests Maria\'s tutoring service. Maria clicks "Accept Booking". An active transaction is now established, and the conversation drawer opens immediately for both Juan and Maria to coordinate details.',
        },
      },
    ],
  },
  {
    slug: 'why-messaging-is-transaction-bound',
    title: 'Why Messaging is Tied to Bookings & Read-Only Rules',
    category: 'messaging',
    description: 'How scoped chat logs keep transactions safe, provide evidence during dispute arbitration, and archive upon completion.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['read only chat', 'completed chat', 'dispute evidence', 'chat history', 'privacy'],
    relatedArticleSlugs: ['when-messaging-unlocks', 'reporting-users-and-disputes'],
    sections: [
      {
        heading: 'Why Every Chat is Linked to a Booking',
        paragraphs: [
          'Tying chat messages directly to a specific booking ID provides two crucial protections:',
        ],
        bullets: [
          '1. Spam & Harassment Prevention: Providers and seekers are protected from unsolicited DMs, marketing spam, or out-of-context harassment.',
          '2. Fair Dispute Evidence: If a dispute or report is filed, Municipal Administrators can review the exact, untampered chat logs between both parties for that specific booking to make an impartial decision.',
        ],
      },
      {
        heading: 'When Does Chat Become Read-Only?',
        paragraphs: [
          'Once a transaction is finalized (Confirmed Completed or Cancelled), the conversation is archived in read-only mode. You can still view past messages, agreements, and details anytime in your Messages tab, but new messages cannot be sent.',
        ],
      },
    ],
  },
];
