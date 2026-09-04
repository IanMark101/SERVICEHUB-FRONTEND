import { HelpArticle } from '../types/help.types';

export const PAYMENTS_ARTICLES: HelpArticle[] = [
  {
    slug: 'payment-methods-overview',
    title: 'Payment Methods: GCash Test Mode vs. On-Site Cash',
    category: 'payments',
    description: 'When each ServiceHub Cordova payment workflow applies.',
    lastUpdated: 'September 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['payment methods', 'gcash', 'cash', 'on-site cash', 'paymongo', 'payment hold'],
    relatedArticleSlugs: ['how-escrow-works', 'payment-release-and-refunds'],
    sections: [{
      heading: 'Two Ways to Complete a Booking',
      paragraphs: ['ServiceHub supports PayMongo GCash Test Mode for fixed-price queue bookings and a separate direct on-site cash arrangement.'],
      bullets: [
        'GCash Test Mode: PayMongo confirms the simulated payment by a signed server webhook. Only then is an accepted booking added to the listing queue.',
        'On-site Cash: The seeker pays the provider outside ServiceHub. Cash bookings never enter the online-payment queue or provider wallet ledger.',
      ],
      callout: { type: 'important', title: 'Capstone payment scope', text: 'ServiceHub currently demonstrates PayMongo Test Mode. No real-money provider payout or regulated escrow service is implemented.' },
    }],
  },
  {
    slug: 'how-escrow-works',
    title: 'How the Internal Payment Hold Works',
    category: 'payments',
    description: 'What PAID_HELD means inside this capstone system.',
    lastUpdated: 'September 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['payment hold', 'paid held', 'payment status', 'payment security'],
    relatedArticleSlugs: ['payment-methods-overview', 'payment-release-and-refunds'],
    sections: [{
      heading: 'An Internal Workflow State',
      paragraphs: ['After PayMongo Test Mode confirms a payment, ServiceHub records PAID_HELD while the service is unfinished. This is a platform bookkeeping state—not a licensed escrow account or a guarantee of real-money custody.'],
      bullets: [
        'The browser redirect does not confirm payment or create a booking.',
        'A signed, deduplicated PayMongo webhook is the authoritative confirmation.',
        'If a capture cannot be converted into a queue booking, it is marked for refund reconciliation instead of overfilling the queue.',
      ],
    }],
  },
  {
    slug: 'payment-release-and-refunds',
    title: 'Completion, Internal Release, and Refunds',
    category: 'payments',
    description: 'How online and cash bookings reach their final payment states.',
    lastUpdated: 'September 2026',
    readTimeMinutes: 3,
    keywords: ['payment release', 'refund', 'cancellation refund', 'completion confirmation'],
    relatedArticleSlugs: ['how-escrow-works', 'how-paymongo-gcash-payouts-work'],
    sections: [{
      heading: 'Final States',
      paragraphs: ['When the seeker confirms completed work, an online booking becomes RELEASED in ServiceHub’s internal ledger. A cash booking becomes CASH_CONFIRMED and does not increase the provider wallet.'],
      bullets: [
        'Cancellation before completion keeps cash external and submits eligible online refunds through PayMongo Test Mode.',
        'A disputed online payment remains FROZEN_HELD until an administrator refunds it or completes and releases the booking.',
        'Administrator decisions and refund attempts are retained for audit and retry.',
      ],
    }],
  },
  {
    slug: 'how-paymongo-gcash-payouts-work',
    title: 'PayMongo GCash Test Mode and Provider Records',
    category: 'payments',
    description: 'The implemented capstone payment flow and its boundaries.',
    lastUpdated: 'September 2026',
    readTimeMinutes: 4,
    popular: true,
    keywords: ['paymongo', 'gcash', 'test mode', 'webhook', 'provider ledger'],
    relatedArticleSlugs: ['how-escrow-works', 'payment-release-and-refunds', 'payment-methods-overview'],
    sections: [
      {
        heading: 'Payment Confirmation',
        paragraphs: ['ServiceHub creates a durable local attempt, sends the seeker to PayMongo Test Mode, and waits for a signed webhook. It validates the amount, currency, user, listing, offer, and provider intent before creating the booking.'],
      },
      {
        heading: 'Provider Earnings in This Capstone',
        paragraphs: ['Completion creates an internal provider earning record for online bookings. ServiceHub does not currently disburse money to a provider phone number, bank, or personal GCash account.'],
        callout: { type: 'important', title: 'No real payout claim', text: 'A RELEASED status demonstrates application workflow only. Production settlement would require a separately designed and approved payout integration.' },
      },
    ],
  },
];
