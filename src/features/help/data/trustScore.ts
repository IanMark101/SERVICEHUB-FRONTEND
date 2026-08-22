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
          '80 – 100 (High Trust / Green): Highly trusted community member with consistent positive reviews, approved residency, and zero unexcused cancellations.',
          '50 – 79 (Standard Trust / Amber): Regular standing. Default starting score for all new accounts is 50.',
          'Below 50 (Low Standing / Red): Accounts with multiple penalties, no-shows, or unresolved disputes. May face posting restrictions.',
          'Below 20: Automatically flagged for administrative moderation review.',
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
          '+2 Points: Successfully completing a service transaction with on-time delivery and confirmation.',
          '+1 Point: Receiving a 5-star customer review from a confirmed seeker.',
          '+1 Point (Seeker): Promptly confirming service completion within 24 hours of provider delivery.',
        ],
      },
      {
        heading: 'Actions that Deduct Trust Points (-)',
        bullets: [
          '-10 Points: Confirmed No-Show (failing to arrive for a scheduled booking without notice).',
          '-5 Points: Unjustified last-minute cancellation after a booking has already been accepted.',
          '-5 Points: Repeated listing rejections due to misleading or prohibited service descriptions.',
          '-10 Points: Upheld dispute or report filed against your account by a moderator.',
        ],
        example: {
          title: 'Example: Positive Reputation Growth',
          description: 'Juan registers with 50 points. He verifies his Cordova residency (+5 -> 55). He completes 5 plumbing jobs with 5-star ratings (+15 -> 70). He now appears as a High-Trust provider in local search results.',
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
