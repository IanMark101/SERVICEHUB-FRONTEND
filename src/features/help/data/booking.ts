import { HelpArticle } from '../types/help.types';

export const BOOKING_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-direct-booking-works',
    title: 'How Direct Booking Works (Flow A)',
    category: 'bookings',
    description: 'Learn how to book an existing service listing directly, from submission to provider confirmation.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['direct booking', 'book service', 'flow a', 'cash booking', 'online booking', 'hire'],
    relatedArticleSlugs: ['booking-lifecycle-explained', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'Direct Booking Steps',
        paragraphs: [
          'Direct Booking is used when a provider already has a public listing that matches your needs (e.g., "Aircon Cleaning - ₱500").',
        ],
        steps: [
          'Locate the service card on the "Seek Services" marketplace page.',
          'Click "Request Service" on the listing.',
          'Choose your preferred payment method (GCash or On-site Cash).',
          'For session-based services, optionally select your preferred date and time.',
          'Add a short description of the problem or task details.',
          'Submit your booking request.',
        ],
        example: {
          title: 'Realistic Example',
          description: 'Juan needs his refrigerator repaired. He finds Maria\'s Appliance Repair listing, selects "On-site Cash", writes "Refrigerator not cooling in Brgy. Gabi", and submits the request. Maria receives an instant notification.',
        },
      },
    ],
  },
  {
    slug: 'booking-lifecycle-explained',
    title: 'The Booking Lifecycle Explained',
    category: 'bookings',
    description: 'A complete overview of the statuses a booking transitions through from pending to completed.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['booking status', 'lifecycle', 'pending', 'ongoing', 'awaiting confirmation', 'completed'],
    relatedArticleSlugs: ['how-direct-booking-works', 'confirming-and-completing-service'],
    sections: [
      {
        heading: 'The 5 Key Stages',
        bullets: [
          '1. PENDING APPROVAL / WAITING: The seeker has submitted the request. The provider reviews the schedule and scope.',
          '2. ACCEPTED: The provider accepts the booking. Chat messaging unlocks immediately for direct coordination.',
          '3. ONGOING: The provider has arrived on-site or started performing the agreed work.',
          '4. AWAITING CONFIRMATION: The provider marks the work as finished. The seeker receives an action-required prompt to inspect the result.',
          '5. COMPLETED: The seeker confirms satisfactory completion. Escrowed funds (if GCash) are released to the provider\'s wallet, and review options unlock.',
        ],
        callout: {
          type: 'important',
          title: 'Completion Gate',
          text: 'Completed service records and reviews are only created after the seeker confirms completion. Providers cannot unilaterally close a transaction.',
        },
      },
    ],
  },
  {
    slug: 'confirming-and-completing-service',
    title: 'Confirming Service Completion & Releasing Payment',
    category: 'bookings',
    description: 'Learn how seekers confirm satisfactory work, release escrowed funds, and leave reviews.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['completion', 'confirm work', 'release payment', 'finish booking', 'satisfaction'],
    relatedArticleSlugs: ['booking-lifecycle-explained', 'how-escrow-works'],
    sections: [
      {
        heading: 'Finalizing the Engagement',
        steps: [
          'When the provider finishes the service, you will receive an in-app notification: "Work Completed - Awaiting Your Confirmation".',
          'Open your Seeker Activity tracker or open the booking in your chat drawer.',
          'Inspect the completed work in person.',
          'Click the green "Confirm Completion" button.',
          'If paid via GCash, funds held in escrow are released immediately to the provider. If paid via Cash, hand the agreed cash amount to the provider.',
          'You will be prompted to leave an optional 1–5 star rating and feedback tags.',
        ],
      },
    ],
  },
];
