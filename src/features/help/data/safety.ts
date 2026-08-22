import { HelpArticle } from '../types/help.types';

export const SAFETY_ARTICLES: HelpArticle[] = [
  {
    slug: 'reporting-users-and-disputes',
    title: 'Reporting Users, Scams, and Filing Disputes',
    category: 'safety',
    description: 'Learn how to file a formal dispute report, what evidence is collected, and how administrators arbitrate fair outcomes.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['report', 'dispute', 'scam', 'arbitration', 'moderator', 'safety', 'no show'],
    relatedArticleSlugs: ['safe-marketplace-tips', 'why-messaging-is-transaction-bound', 'what-is-trust-score'],
    sections: [
      {
        heading: 'When to File a Report',
        paragraphs: [
          'If you encounter a problem during an active or completed booking (such as a provider no-show, incomplete service, inappropriate behavior, or payment dispute), you can file an official Report.',
        ],
      },
      {
        heading: 'Accepted Report Reasons',
        bullets: [
          'NO_SHOW: Provider or seeker failed to arrive at the scheduled time without notice.',
          'POOR_SERVICE_QUALITY: Service delivered was severely defective or failed agreed specifications.',
          'INCOMPLETE_SERVICE: Job was abandoned before finishing agreed scope.',
          'SCAM_OR_FRAUD: Attempt to solicit off-platform payment scams or deceptive billing.',
          'INAPPROPRIATE_BEHAVIOR: Harassment, abusive language, or disrespectful conduct.',
          'OVERPRICING: Unagreed price increases demanding higher cash on-site.',
        ],
      },
      {
        heading: 'How Admins Arbitrate Disputes',
        paragraphs: [
          'When a report is filed, Municipal Administrators receive the complete case file: reporter info, accused info, booking details, and complete untampered chat logs.',
        ],
        bullets: [
          'Warning: Formal caution recorded on the user\'s profile.',
          'Trust Deduction: -10 points deducted from the offending user\'s Trust Score.',
          'Cancellation & Refund: Escrowed funds returned to the seeker.',
          'Account Suspension / Ban: Immediate revocation of platform access for serious offenses.',
        ],
      },
    ],
  },
  {
    slug: 'safe-marketplace-tips',
    title: 'Safe Marketplace Tips for Cordova Residents',
    category: 'safety',
    description: 'Best practices for safe home service visits, clear communication, and community security.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['safety tips', 'home safety', 'best practices', 'secure booking', 'communication tips'],
    relatedArticleSlugs: ['reporting-users-and-disputes', 'why-verification-is-required'],
    sections: [
      {
        heading: 'Safety Recommendations',
        bullets: [
          'Check the Badge: Always confirm that a provider has the green "Verified Resident" badge and a strong Trust Score (50+) before booking.',
          'Keep Chat Inside ServiceHub: Keep all communication within the ServiceHub messaging tab. This ensures a timestamped record exists if any questions arise.',
          'Confirm Scope Before Work Begins: Re-verify the price and task requirements before work starts.',
          'Inspect Before Confirming: For both online and cash bookings, always inspect the finished work in person before clicking "Confirm Completion".',
        ],
      },
    ],
  },
];
