import { HelpArticle } from '../types/help.types';

export const SAFETY_ARTICLES: HelpArticle[] = [
  {
    slug: 'reporting-users-and-disputes',
    title: 'Reporting Users, Scams, and Filing Disputes',
    category: 'safety',
    description: 'Learn how to file a formal dispute report, what evidence is collected, and how administrators arbitrate fair outcomes.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['report', 'dispute', 'scam', 'arbitration', 'moderator', 'safety', 'no show'],
    relatedArticleSlugs: ['safe-marketplace-tips', 'why-messaging-is-transaction-bound', 'what-is-trust-score'],
    sections: [
      {
        heading: 'Reporting a service or request listing',
        paragraphs: [
          'Use the red flag on someone else’s listing to report a concern about its content. Choose a report reason, add your explanation, then select Send report. Reasons include misleading information, scams, inappropriate content, unsafe services, spam and other concerns.',
          'An admin reviews the selected reason and your explanation. Sending a report does not automatically remove the listing or change anyone’s Trust Score. For a problem with an actual booking, use its report controls in My Bookings.',
        ],
      },
      {
        heading: 'When to File a Report',
        paragraphs: [
          'If you encounter a problem during an active or completed booking (such as a provider no-show, incomplete service, inappropriate behavior, or payment dispute), you can file an official Report.',
        ],
      },
      {
        heading: 'Accepted Report Reasons',
        bullets: [
          'No-show: Provider or customer failed to arrive at the scheduled time without notice.',
          'Service quality concern: Service delivered was severely defective or failed agreed specifications.',
          'Incomplete service: Job was abandoned before finishing agreed scope.',
          'Suspected scam or fraud: Attempt to solicit off-platform payment scams or deceptive billing.',
          'Inappropriate or unsafe behavior: Harassment, abusive language, or disrespectful conduct.',
          'Pricing concern: Unagreed price increases demanding higher cash on-site.',
        ],
      },
      {
        heading: 'How Admins Arbitrate Disputes',
        paragraphs: [
          'When a report is filed, ServiceHub administrators receive the complete case file: reporter info, accused info, booking details, and recorded booking messages relevant to the decision. Service quality and incomplete-service reasons are available after work starts.',
        ],
        bullets: [
          'Warning: Formal caution recorded by the admin.',
          'Trust Deduction: A documented serious-misconduct decision can deduct 10 points when the admin selects that action. A report alone changes no points.',
          'Cancellation & Reversal: In Test Mode, eligible online cancellations record an explicit simulated reversal. This does not represent a real-money refund.',
          'Account Suspension / Ban: Immediate revocation of platform access for serious offenses.',
        ],
      },
    ],
  },
  {
    slug: 'safe-marketplace-tips',
    title: 'Safe Marketplace Tips for Local Members',
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
          'Check the Badge: Review the provider’s verification, Trust Score and completed-work reviews together. A score of 50 is the starting baseline and does not guarantee service quality.',
          'Keep Chat Inside ServiceHub: Keep all communication within the ServiceHub messaging tab. This ensures a timestamped record exists if any questions arise.',
          'Confirm Scope Before Work Begins: Re-verify the price and task requirements before work starts.',
          'Inspect Before Confirming: For both online and cash bookings, review the finished work against the agreed scope before clicking "Confirm Completion".',
        ],
      },
    ],
  },
];
