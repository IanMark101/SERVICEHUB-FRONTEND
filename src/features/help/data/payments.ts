import { HelpArticle } from '../types/help.types';

export const PAYMENTS_ARTICLES: HelpArticle[] = [
  {
    slug: 'payment-methods-overview',
    title: 'Payment Methods: GCash Online vs. On-Site Cash',
    category: 'payments',
    description: 'An overview of available payment methods on ServiceHub Cordova and when to use each.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['payment methods', 'gcash', 'cash', 'on-site cash', 'paymongo', 'escrow'],
    relatedArticleSlugs: ['how-escrow-works', 'payment-release-and-refunds'],
    sections: [
      {
        heading: 'Two Flexible Ways to Pay',
        paragraphs: [
          'ServiceHub accommodates local Philippine payment habits by supporting both automated online payments and traditional cash arrangements.',
        ],
        bullets: [
          'GCash (Online E-Wallet): Powered by PayMongo secure gateway. Funds are held in escrow and only released when the seeker confirms satisfactory job completion.',
          'On-site Cash (Direct Arrangement): Pay the provider directly in cash upon on-site service delivery after inspecting the finished work.',
        ],
        callout: {
          type: 'tip',
          title: 'Provider Payment Settings',
          text: 'Providers can choose to accept GCash, On-site Cash, or both when configuring their service listings.',
        },
      },
    ],
  },
  {
    slug: 'how-escrow-works',
    title: 'How Escrow Protection Works',
    category: 'payments',
    description: 'Learn how ServiceHub’s escrow holding mechanism protects seekers from unfinished jobs and protects providers from non-payment.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['escrow', 'funds protection', 'held payment', 'safety guarantee', 'payment security'],
    relatedArticleSlugs: ['payment-methods-overview', 'payment-release-and-refunds'],
    sections: [
      {
        heading: 'What is Escrow?',
        paragraphs: [
          'Escrow means that when you pay online via GCash, your money is NOT immediately transferred to the provider\'s personal account. Instead, it is safely held in a protected platform holding state (PAID_HELD).',
        ],
        bullets: [
          'For Seekers: You never have to worry about a provider taking your money and disappearing without doing the work.',
          'For Providers: You know with 100% certainty that the client has already funded the job before you begin traveling or purchasing supplies.',
        ],
      },
    ],
  },
  {
    slug: 'payment-release-and-refunds',
    title: 'Payment Release, Confirmations, and Refunds',
    category: 'payments',
    description: 'How escrow funds transition from held to released upon completion, and how dispute refunds work.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['payment release', 'refund', 'cancellation refund', 'wallet payout', 'completion confirmation'],
    relatedArticleSlugs: ['how-escrow-works', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'When are Funds Released?',
        paragraphs: [
          'Held escrow funds are released to the provider\'s ServiceHub balance under the following conditions:',
        ],
        bullets: [
          '1. Immediate Seeker Confirmation: When the seeker clicks "Confirm Completion" on the booking.',
          '2. Approved Cancellation / Refund: If a booking is cancelled before service delivery or if an administrator approves a dispute refund, escrowed funds are returned directly to the seeker.',
        ],
      },
    ],
  },
];
