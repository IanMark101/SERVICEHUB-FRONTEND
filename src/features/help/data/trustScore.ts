import { HelpArticle } from '../types/help.types';

export const TRUST_SCORE_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-is-trust-score',
    title: 'What is Trust Score?',
    category: 'trust-reputation',
    description: 'Understand ServiceHub Cordova’s 0–100 reputation metric and how it protects community members.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['trust score', 'reputation', 'score', 'audit log', 'trust rating', 'points'],
    relatedArticleSlugs: ['how-trust-score-changes', 'viewing-trust-history', 'why-verification-is-required'],
    sections: [
      {
        heading: 'A Living Measure of Reliability',
        paragraphs: [
          'Trust Score is a transparent 0-to-100 rating assigned to every ServiceHub Cordova user (both Seekers and Providers). It represents your track record of reliability, punctuality, fair transactions, and community standing.',
          'Instead of static star ratings that can be easily manipulated, the Trust Score is calculated dynamically from real, verifiable marketplace actions.',
        ],
      },
      {
        heading: 'Trust Score Tiers',
        bullets: [
          '90 – 100 (Highly Trusted / Green): Top-tier standing with consistent positive reviews, approved Cordova residency, and a flawless transaction record.',
          '70 – 89 (Trusted / Blue): High standing with reliable completed services, verified residency, and strong client feedback.',
          '50 – 69 (Average / Amber): Standard baseline standing. Default starting score for all new accounts is 50.',
          'Below 50 (Needs Attention / Red): Accounts impacted by at-fault cancellations, validated reports, or repeated listing rejections.',
        ],
        callout: {
          type: 'info',
          title: 'Clamped Boundaries',
          text: 'Trust scores can never exceed 100 points or fall below 0 points.',
        },
      },
    ],
  },
  {
    slug: 'how-trust-score-changes',
    title: 'How Trust Score Increases and Decreases',
    category: 'trust-reputation',
    description: 'A complete breakdown of all actions that award or deduct Trust Score points on the platform.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['trust points', 'gain trust', 'lose trust', 'deduction', 'penalty', '5 star review'],
    relatedArticleSlugs: ['what-is-trust-score', 'viewing-trust-history'],
    sections: [
      {
        heading: 'Ways to Gain Trust Points (+)',
        bullets: [
          '+5 Points (One-time): Completing and getting approved for Cordova Residency Verification.',
          '+3 Points: Successfully completing a service transaction upon seeker confirmation (applies to both Cash and Online bookings).',
          '+2 Points: Receiving a 5-star customer review from a confirmed seeker (+1 point for a 4-star review).',
          'Smooth Transactions: Undisputed payments, on-time service delivery, and prompt completion confirmations build long-term reputation.',
        ],
      },
      {
        heading: 'Actions that Deduct Trust Points (-)',
        bullets: [
          '-5 Points: At-fault cancellation after an active service has already been started by the provider.',
          '-5 Points: Second repeated service listing rejection due to non-compliant or misleading descriptions.',
          '-10 Points: Valid report or dispute upheld against your account by an administrator.',
        ],
        example: {
          title: 'Example: Positive Reputation Growth',
          description: 'Juan registers with 50 points. He verifies his Cordova residency (+5 -> 55). He completes 3 plumbing jobs with 5-star ratings (+15 -> 70). He now reaches the "Trusted" tier (70+) in local search results.',
        },
      },
    ],
  },
  {
    slug: 'viewing-trust-history',
    title: 'Viewing Your Trust Score History & Audit Trail',
    category: 'trust-reputation',
    description: 'Learn how to inspect the permanent, immutable log of every point gain and penalty on your account.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['trust history', 'audit log', 'history tab', 'reasons', 'timeline'],
    relatedArticleSlugs: ['what-is-trust-score', 'how-trust-score-changes'],
    sections: [
      {
        heading: 'Total Transparency Guarantee',
        paragraphs: [
          'ServiceHub maintains an immutable event history for every Trust Score adjustment. You never have to guess why your score changed.',
        ],
        steps: [
          'Navigate to your User Profile page.',
          'Click on the "Trust History" tab.',
          'Review the chronological list showing the date, exact point delta (+/-), reason, and snapshot score before & after the event.',
        ],
        callout: {
          type: 'tip',
          title: 'Public vs. Private History',
          text: 'Other users can see your overall Trust Score and verified badge on your public profile, but detailed line-item reasons remain private to you and platform administrators.',
        },
      },
    ],
  },
];
