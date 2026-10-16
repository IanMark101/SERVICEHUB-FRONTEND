import { HelpArticle } from '../types/help.types';

export const TRUST_SCORE_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-is-trust-score',
    title: 'What is Trust Score?',
    category: 'trust-reputation',
    description: 'Understand the reliability score, star ratings, and verification badge as separate measures.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['trust score', 'reputation', 'score', 'audit log', 'trust rating', 'points'],
    relatedArticleSlugs: ['how-trust-score-changes', 'viewing-trust-history', 'why-verification-is-required'],
    sections: [
      {
        heading: 'A Living Measure of Reliability',
        paragraphs: [
          'Trust Score is a 0-to-100 record of approved verification, eligible completed bookings, and documented administrator findings. Your Seeker and Provider workspaces share one score. Every account starts at a neutral baseline of 50.',
          'Star ratings describe satisfaction and do not change Trust Score. The verification badge indicates approved identity and residency documents. None of these measures guarantees workmanship or safety; consider them together with reviews and booking details.',
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
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['trust points', 'gain trust', 'lose trust', 'deduction', 'penalty', '5 star review'],
    relatedArticleSlugs: ['what-is-trust-score', 'viewing-trust-history'],
    sections: [
      {
        heading: 'Ways to Gain Trust Points (+)',
        bullets: [
          'Your first approved identity and residency verification adds 5 points once.',
          'An eligible completed booking adds 3 points to each eligible Seeker and Provider. Both identities must be approved, completion and payment settlement must be recorded, and no booking complaint can remain unresolved. A participant with an uncorrected fault penalty for that booking receives no reward.',
          'Only one completed booking between the same two accounts can earn points in a rolling 7-day period, including when they exchange workspace roles. The next reward is available after seven full days from their last rewarded completion, rather than at a calendar-week reset. Repeat bookings and reviews remain available.',
          'Payments, accepting bookings, and starting work do not award extra trust points by themselves.',
        ],
      },
      {
        heading: 'Actions that Deduct Trust Points (-)',
        bullets: [
          'An admin-confirmed finding of fault for cancelling started work deducts 5 points. Mutual cancellations and cancellations before work starts do not.',
          'A documented finding of serious misconduct with a trust deduction selected deducts 10 points. Admin must explain the violated rule and supporting evidence. A cancellation and report cannot stack trust penalties for the same booking and participant.',
          'Any star rating, including 1 or 5 stars, changes review feedback only. Filing a report or appeal does not change trust points.',
          'A listing that needs revision does not lower your trust score.',
        ],
        example: {
          title: 'Example: Positive Reputation Growth',
          description: 'Juan starts at 50, receives his first approved verification (+5), and completes an eligible booking (+3), reaching 58. A subsequent 1-star or 5-star review leaves his Trust Score at 58. His star average changes separately.',
        },
      },
    ],
  },
  {
    slug: 'viewing-trust-history',
    title: 'Viewing Your Trust Score History & Audit Trail',
    category: 'trust-reputation',
    description: 'Learn how to inspect the permanent, immutable log of every point gain and penalty on your account.',
    lastUpdated: 'October 2026',
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
          text: 'Other users can see your score and a sanitized history of event types. Private admin explanations and case details are limited to authorized participants and administrators.',
        },
      },
    ],
  },
  {
    slug: 'appealing-trust-penalties', title: 'Reviewing a Trust Penalty', category: 'trust-reputation',
    description: 'Understand recorded trust deductions and follow decisions on previously submitted cases.',
    lastUpdated: 'October 2026', readTimeMinutes: 3,
    keywords: ['appeal', 'penalty', 'unfair', 'correction', 'evidence'],
    relatedArticleSlugs: ['viewing-trust-history', 'how-trust-score-changes', 'how-reviews-and-ratings-work'],
    sections: [
      { heading: 'Review a recorded penalty', steps: [
        'Open your User Profile and choose Trust History.',
        'Find the recorded penalty and review its reason, date, and score before and after the deduction.',
        'Previously submitted cases remain available under Review disputes and trust appeals in the same tab.',
      ] },
      { heading: 'What the decision means', paragraphs: [
        'An appeal does not automatically hide a review or restore trust. If upheld, the original recorded deduction is reversed once, within the 0-to-100 boundaries. If rejected, the finding remains. The decision is recorded with a reason.',
        'Another active administrator must review an appeal against the original administrator’s finding when one is available. If only that administrator is available, the same-administrator decision is explicitly audit logged. One case is allowed per original penalty.',
        'Administrators can correct an eligible recorded event with a documented reason and password confirmation. They cannot enter arbitrary rewards or deductions through the correction form.',
      ] },
      { heading: 'Existing accounts', paragraphs: [
        'The policy keeps old events visible and records a policy adjustment removing earlier review-based points and duplicate booking penalties. Historical completion rewards remain recognized. New eligibility decisions use the current rolling 7-day account-pair limit; changing the window does not automatically award points for earlier skipped bookings.',
      ] },
    ],
  },
];
