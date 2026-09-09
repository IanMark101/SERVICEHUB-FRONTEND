import { HelpArticle } from '../types/help.types';

export const QUEUE_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-the-queue-works',
    title: 'How the Service Queue Works',
    category: 'queue',
    description: 'Learn how ServiceHub’s database-backed First-Come, First-Served queue limits online bookings and preserves service order.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['queue', 'fcfs', 'queue capacity', 'live queue', 'waitlist', 'first come first served'],
    relatedArticleSlugs: ['queue-positions-and-wait-times', 'queue-online-vs-cash'],
    sections: [
      {
        heading: 'Why the Queue Exists',
        paragraphs: [
          'Solo service providers (e.g. plumbers, tutors, electricians) can only handle a limited number of clients. In traditional apps, providers can receive too many requests at once, leading to delayed replies and missed commitments.',
          'ServiceHub Cordova uses a First-Come, First-Served (FCFS) queue for confirmed online bookings. Each service listing has a configurable waiting capacity, and the server assigns each eligible booking a visible position.',
        ],
        example: {
          title: 'Realistic Example: Math Tutoring Queue',
          description: 'Maria offers one-time math tutoring and sets her waiting capacity to 3 bookings. If two bookings are already ahead of yours, the system shows position #3 and an estimated wait based on the listing duration. The estimate is not a guaranteed appointment time.',
        },
      },
      {
        heading: 'Real-Time Position Updates',
        paragraphs: [
          'Whenever a customer ahead of you completes their service, your position automatically advances (e.g., from #3 to #2 to #1) via real-time WebSocket updates without needing to refresh the page.',
        ],
      },
    ],
  },
  {
    slug: 'queue-positions-and-wait-times',
    title: 'Understanding Queue Position, Capacity, and Wait Times',
    category: 'queue',
    description: 'How queue positions and estimated wait times are calculated from provider duration settings.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['queue position', 'estimated wait time', 'queue limit', 'full queue', 'wait time calculation'],
    relatedArticleSlugs: ['how-the-queue-works', 'queue-online-vs-cash'],
    sections: [
      {
        heading: 'Queue Status Indicators',
        bullets: [
          'Available Now (0 in queue): This listing has no queued online bookings. The provider still needs to start the work; this is not a guaranteed appointment or online presence indicator.',
          'Position #2 or #3 (Serving Ahead): Other customers are currently being served. Estimated wait time is computed as: (Position - 1) × Estimated Duration.',
          'Queue Full (At Capacity): The listing has reached its queue capacity (e.g., 3/3). Select "Notify Me" to request an in-app alert when capacity becomes available.',
        ],
      },
    ],
  },
  {
    slug: 'queue-online-vs-cash',
    title: 'Queue Behavior: Online Payments vs. Cash Bookings',
    category: 'queue',
    description: 'Understand why online paid bookings enter the verified FCFS queue while cash bookings use direct scheduling.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['gcash queue', 'cash queue', 'direct arrangement', 'queue gate', 'payment difference'],
    relatedArticleSlugs: ['how-the-queue-works', 'payment-methods-overview'],
    sections: [
      {
        heading: 'The Two Payment Pathways',
        paragraphs: [
          'ServiceHub maintains strict integrity in its queue system:',
        ],
        bullets: [
          'ONLINE PAYMENTS (GCash or Maya Test Mode): A booking enters the listing-specific FCFS queue only after signed webhook confirmation. The position is reserved in ServiceHub, while the provider starts only the first eligible booking.',
          'ON-SITE CASH: Cash bookings operate through "Direct Arrangement". The provider reviews your requested schedule and agrees on an appointment time directly in chat, without displacing online queue slots.',
        ],
        callout: {
          type: 'tip',
          title: 'Queue Integrity Rule',
          text: 'This separation ensures that providers cannot artificially inflate or manipulate the online verified queue with unpaid dummy entries.',
        },
      },
    ],
  },
];
