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
    relatedArticleSlugs: ['how-escrow-works', 'how-paymongo-gcash-payouts-work'],
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
  {
    slug: 'how-paymongo-gcash-payouts-work',
    title: 'How PayMongo GCash & Provider Payouts Work',
    category: 'payments',
    description: 'Learn how PayMongo processes GCash payments, how Escrow safeguards your money, and how earnings are delivered directly to the provider’s registered mobile number.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 4,
    popular: true,
    keywords: [
      'paymongo',
      'gcash',
      'payout',
      'mobile number',
      'escrow',
      'disbursement',
      'earnings',
      'wallet',
      'transfer'
    ],
    relatedArticleSlugs: ['how-escrow-works', 'payment-release-and-refunds', 'payment-methods-overview'],
    sections: [
      {
        heading: 'How PayMongo Handles the Seeker\'s Payment',
        paragraphs: [
          'PayMongo serves as ServiceHub’s official Philippine payment gateway. When a seeker pays for a booking or accepts a bid using GCash, PayMongo processes the transaction directly through the official GCash system using a secure One-Time PIN (OTP).',
          'Once authorized, the funds are deposited into ServiceHub’s secure Escrow holding vault (status: PAID_HELD). Neither the seeker nor the provider can prematurely move these funds while the service is pending.',
        ],
        bullets: [
          'Guaranteed Payment: Providers can proceed with confidence knowing that 100% of the contract amount is already secured.',
          'Fraud Prevention: Seekers are protected because money is never handed directly to a provider before the job is done.',
        ],
      },
      {
        heading: 'Why Your Registered Mobile Number is Your GCash Account',
        paragraphs: [
          'In the Philippines, a GCash account number is literally the user\'s 11-digit mobile phone number (e.g., 0917-XXX-XXXX or 0918-XXX-XXXX). There are no complex routing numbers or 16-digit bank codes required.',
          'When you create a profile or verify your identity on ServiceHub, the mobile number saved to your account serves as your official GCash recipient address. This mobile number is what PayMongo uses to deliver earnings directly to your personal GCash e-wallet.',
        ],
        callout: {
          type: 'important',
          title: 'Provider Account Verification',
          text: 'Providers must ensure that the mobile phone number registered on their ServiceHub profile is active and matches their verified GCash account so payouts arrive instantly without disruption.',
        },
      },
      {
        heading: 'How the Money is Delivered Upon Job Completion',
        paragraphs: [
          'Here is the complete delivery lifecycle from the moment work begins to money landing in the provider’s GCash app:',
        ],
        steps: [
          '1. Provider Finishes Work: The provider completes the requested task and clicks "Mark Completed" on their Activity dashboard.',
          '2. Seeker Inspection & Approval: The seeker inspects the finished work and clicks "Release Cash / Escrow".',
          '3. Escrow Release: The status transitions to RELEASED and COMPLETED. ServiceHub\'s ledger records an official "EARNING" transaction in the provider\'s digital wallet.',
          '4. Payout to GCash: The funds are dispatched to the provider\'s registered 11-digit mobile number via PayMongo Payouts and InstaPay, depositing the net earnings straight into the provider\'s real GCash app.',
        ],
        callout: {
          type: 'tip',
          title: 'What Happens if the Provider Declines or Cancels?',
          text: 'If a provider declines a booking request or if a job is cancelled before work begins, the Escrow deposit is automatically refunded back to the seeker’s GCash account.',
        },
      },
    ],
  },
];
