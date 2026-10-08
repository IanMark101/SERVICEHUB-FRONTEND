import { HelpArticle } from '../types/help.types';

export const TRUST_SCORE_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-is-trust-score',
    title: 'What is Trust Score?',
    category: 'trust-reputation',
    description: 'Understand ServiceHub Cordova’s 0-100 reputation metric and how it protects community members.',
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
          '90-100 (Highly Trusted): The highest trust-score band.',
          '70-89 (Trusted): A strong trust-score standing.',
          '50-69 (Average): The standard starting band. New accounts start at 50.',
          'Below 50 (Needs Attention): Review your trust history to see what lowered your score.',
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
          'Your first approved Cordova residency verification increases your score once.',
          'As a provider, completing work that the seeker confirms increases your score. An admin can also confirm completion after reviewing a case.',
          'Receiving a positive review for completed work can increase your score, whether you were the seeker or provider.',
          'Payments, accepting bookings, and starting work do not award extra trust points by themselves.',
        ],
      },
      {
        heading: 'Actions that Deduct Trust Points (-)',
        bullets: [
          'An admin finding that you were at fault for cancelling started work can lower your score. Mutual cancellations and cancellations before work starts do not.',
          'Receiving a low review rating for completed work can lower your score.',
          'An admin can deduct trust after confirming a report against you. Filing a report does not penalize either participant by itself.',
          'A listing that needs revision does not lower your trust score.',
        ],
        example: {
          title: 'Example: Positive Reputation Growth',
          description: 'Juan starts with a score of 50. His first residency approval, confirmed completed jobs, and positive reviews from service seekers increase his score. His Trust History shows each recorded change.',
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
