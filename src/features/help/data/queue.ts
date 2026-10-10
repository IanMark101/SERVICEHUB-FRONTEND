import { HelpArticle } from '../types/help.types';

export const QUEUE_ARTICLES: HelpArticle[] = [
  {
    slug: 'how-the-queue-works',
    title: 'How the Provider Work Queue Works',
    category: 'queue',
    description: 'Learn how one provider-wide First-Come, First-Served queue orders online-paid bookings.',
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
          'ServiceHub uses one First-Come, First-Served (FCFS) paid queue per provider. Bookings from all their service listings and accepted custom offers share the provider’s waiting capacity and a visible position.',
        ],
        example: {
          title: 'Realistic Example: Maria’s Work Queue',
          description: 'Maria accepts tutoring and plumbing jobs and allows 3 paid bookings to wait. If two paid jobs are already ahead of yours, you see position #3. The estimated wait adds the expected durations of jobs ahead; it is not a guaranteed appointment time.',
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
    description: 'How provider-wide positions and approximate waits are calculated from the jobs ahead.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['queue position', 'estimated wait time', 'queue limit', 'full queue', 'wait time calculation'],
    relatedArticleSlugs: ['how-the-queue-works', 'queue-online-vs-cash'],
    sections: [
      {
        heading: 'Queue Status Indicators',
        bullets: [
          'No paid jobs waiting: This provider has an open paid waiting place. The provider still needs to start the work; this is not an appointment or online-presence promise.',
          'Position #2 or #3: Earlier paid bookings with this provider are ahead. Estimated wait adds their job-specific expected durations, including a current job where applicable.',
          'Queue full: The provider has reached their paid waiting capacity (e.g., 3/3). Select "Notify Me" on a listing to request an alert when a place opens.',
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
          'ONLINE PAYMENTS (GCash Test Mode): A booking enters the provider-wide FCFS queue only after verified payment confirmation. The position is reserved in ServiceHub, but work starts only when the provider clicks Start Job for the first eligible booking.',
          'ON-SITE CASH: Cash bookings use a direct arrangement and do not take a numbered paid place. The provider coordinates timing in chat and cannot start new cash work while paid jobs are waiting.',
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
