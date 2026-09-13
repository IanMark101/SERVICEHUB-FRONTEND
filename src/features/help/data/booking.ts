import { HelpArticle } from '../types/help.types';

export const BOOKING_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-direct-booking-works',
    title: 'How Direct Booking Works (Flow A)',
    category: 'bookings',
    description: 'Learn how direct listings use either provider-approved cash requests or verified online Test Mode bookings.',
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
          'Click "Book Service" on the listing.',
          'Choose an available payment method shown by the listing: On-site Cash or GCash.',
          'Add a short description of the problem or task details.',
          'For On-site Cash, optionally propose a preferred schedule and submit the request. The schedule is not reserved until the provider accepts.',
          'For GCash, complete PayMongo Test Mode checkout. A signed backend webhook creates the accepted queue booking; the provider does not accept it a second time.',
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
        heading: 'From Request to Completion',
        bullets: [
          '1. PENDING APPROVAL (On-site Cash): The seeker submits a proposed schedule and scope. The provider must accept or decline it.',
          '2. ACCEPTED / WAITING: An accepted cash request becomes ACCEPTED. A successful GCash Test Mode webhook creates an accepted booking in the listing-specific queue without another provider-acceptance step. Accepting a provider offer is also the provider’s commitment.',
          '3. ONGOING: The provider starts the first eligible booking for the chosen listing. Chat is already available for the accepted transaction.',
          '4. AWAITING CONFIRMATION: The provider marks the work as finished. The seeker receives an action-required prompt to inspect the result.',
          '5. COMPLETED: The seeker confirms satisfactory completion. Online payment becomes RELEASED in ServiceHub’s internal ledger; cash becomes CASH_CONFIRMED, and review options unlock.',
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
    description: 'Learn how seekers confirm satisfactory work, finalize payment status, and leave reviews.',
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
          'For a PayMongo Test Mode payment, ServiceHub records RELEASED in its internal ledger. For cash, pay the agreed amount directly to the provider and ServiceHub records CASH_CONFIRMED.',
          'You will be prompted to leave an optional 1–5 star rating and feedback tags.',
        ],
      },
    ],
  },
];
