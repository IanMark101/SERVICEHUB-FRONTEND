import { HelpArticle } from '../types/help.types';

export const NOTIFICATIONS_ARTICLES: HelpArticle[] = [
  {
    slug: 'understanding-notifications',
    title: 'Understanding Real-Time Notifications & Deep Links',
    category: 'notifications',
    description: 'Learn how in-app alerts keep you informed about booking changes, messages, verification status, and queue advances.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['notifications', 'alerts', 'bell icon', 'deep links', 'real-time updates'],
    relatedArticleSlugs: ['navigating-the-platform', 'tracking-your-activity'],
    sections: [
      {
        heading: 'The In-App Notification Bell',
        paragraphs: [
          'The bell icon in the top header provides instantaneous notifications for all important account and transaction events.',
        ],
      },
      {
        heading: 'Common Notification Types',
        bullets: [
          '📁 Verification Updates: Alerts when your residency documents are submitted, approved, or rejected with admin notes.',
          '📋 Booking Updates: Prompts when a provider accepts, arrives, or completes your booking.',
          '💬 Message Alerts: Unread chat alerts with direct links to the relevant booking conversation.',
          '⏳ Queue Advances: Live updates when your position moves up in an active queue.',
          '🏷️ Category Suggestion Approvals: Announcements when a community-requested category becomes official.',
        ],
        callout: {
          type: 'tip',
          title: 'Direct Navigation',
          text: 'Clicking any notification automatically routes you to the exact page or modal needed to take action.',
        },
      },
    ],
  },
];
