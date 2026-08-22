import { HelpArticle } from '../types/help.types';

export const SERVICES_ARTICLES: HelpArticle[] = [
  {
    slug: 'finding-and-browsing-services',
    title: 'Finding and Filtering Services in Cordova',
    category: 'services',
    description: 'Learn how to find skilled local providers, filter by category or barangay, and inspect ratings.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['browse', 'search services', 'categories', 'filters', 'find provider', 'price'],
    relatedArticleSlugs: ['creating-a-service-listing', 'one-time-vs-session-based'],
    sections: [
      {
        heading: 'Browsing the Marketplace',
        paragraphs: [
          'In the Seeker Workspace under "Seek Services", you can explore all active offerings published by verified Cordova providers.',
        ],
        bullets: [
          'Category Filtering: Filter by Home Repairs, Tutoring, Electrical, Cleaning, Beauty & Wellness, IT Support, Event Services, and more.',
          'Keyword Search: Search directly for specific tasks like "aircon cleaning", "algebra tutor", or "grass cutter".',
          'Availability Toggle: Check "Available Now" to see providers currently open for bookings.',
          'Pricing Transparency: View exact rates (Fixed, Hourly, Per Session, or Starting At) with no hidden fees.',
        ],
      },
    ],
  },
  {
    slug: 'creating-a-service-listing',
    title: 'How Providers Create and Publish Listings',
    category: 'services',
    description: 'A guide for providers on writing clear descriptions, choosing price types, setting queue limits, and passing admin review.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['create listing', 'offer service', 'provider guide', 'price type', 'queue limit', 'admin review'],
    relatedArticleSlugs: ['one-time-vs-session-based', 'how-the-queue-works'],
    sections: [
      {
        heading: 'Creating a New Service',
        steps: [
          'Go to your Provider Workspace and click "Offer Services".',
          'Select the official Category that best matches your service.',
          'Provide a clear, professional Title and detailed Description of what is included.',
          'Choose your Price Type (Fixed, Starts At, Per Hour, Per Session, Per Day, Per Project, or Custom Quote).',
          'Specify the Estimated Duration (e.g. 60 minutes) and your simultaneous Queue Limit (e.g. 3 customers).',
          'Select accepted payment methods (On-site Cash and/or GCash).',
          'Submit your listing for administrator quality review.',
        ],
        callout: {
          type: 'info',
          title: 'Listing Review Gate',
          text: 'To protect consumers from misleading ads, new listings undergo a quick admin review before becoming public. Approved listings automatically switch to ACTIVE status.',
        },
      },
    ],
  },
  {
    slug: 'one-time-vs-session-based',
    title: 'One-Time vs. Session-Based Services',
    category: 'services',
    description: 'Understand the difference between single-job tasks and repeatable session appointments like tutoring or coaching.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['session based', 'one time', 'tutoring', 'coaching', 'recurring sessions'],
    relatedArticleSlugs: ['creating-a-service-listing', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'Two Distinct Service Types',
        bullets: [
          'ONE-TIME SERVICES: Tasks completed in a single engagement (e.g. plumbing leak repair, ceiling fan installation, yard cleanup). Once the task is finished and confirmed, the booking is closed.',
          'SESSION-BASED SERVICES: Services that occur in repeatable individual sessions (e.g. Math Tutoring, Fitness Coaching, Music Lessons). A single provider listing remains active while multiple bookings represent scheduled individual sessions.',
        ],
        example: {
          title: 'Example: Session Scheduling',
          description: 'A student can book a 1-hour session on Tuesday at 4:00 PM and book another session on Friday at 4:00 PM against the same tutoring listing without needing a monthly subscription.',
        },
      },
    ],
  },
];
