import { HelpArticle } from '../types/help.types';

export const SERVICES_ARTICLES: HelpArticle[] = [
  {
    slug: 'finding-and-browsing-services',
    title: 'Finding and Filtering Services in Cordova',
    category: 'services',
    description: 'Learn how to find skilled local providers, search by keyword, filter active listings, and compare trust information.',
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
          'Category Filtering: Browse the active, administrator-approved categories currently available in the marketplace.',
          'Keyword Search: Search directly for specific tasks like "aircon cleaning", "algebra tutor", or "grass cutter".',
          'Availability Toggle: Check "Available Now" to see providers currently open for bookings.',
          'Pricing Transparency: Fixed listings show the exact direct-booking amount; variable pricing requires a provider quotation.',
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
          'Choose your Price Type (Fixed, Starts At, Per Hour, Per Day, Per Project, or Custom Quote).',
          'Specify the Estimated Duration (e.g. 60 minutes) and your waiting Queue Limit (e.g. 3 customers).',
          'Select the supported payment methods you accept: On-site Cash, GCash, and/or Maya.',
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
    title: 'Reusable Listings and Repeat Requests',
    category: 'services',
    description: 'Learn how one provider listing supports multiple independent bookings, including repeat tutoring requests.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['request again', 'one time', 'tutoring', 'repeat provider', 'reusable listing'],
    relatedArticleSlugs: ['creating-a-service-listing', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'One Consistent Booking Model',
        bullets: [
          'Every booking represents one independent engagement, whether it is plumbing, cleaning, tutoring, coaching, or another local service.',
          'The provider listing remains reusable. After a booking is completed, declined, or canceled, the seeker may request the same provider through that listing again.',
          'Cash requests require the provider to accept or decline. A preferred schedule is only a proposal and does not automatically reserve the provider.',
          'Providers should pause a listing whenever they are not accepting new requests. ServiceHub also prevents a provider from starting two jobs at the same time.',
        ],
        example: {
          title: 'Example: Requesting a Tutor Again',
          description: 'After Tuesday’s tutoring booking is completed, the seeker selects Request Again, proposes Friday afternoon, and sends a new booking. The tutor accepts only if available.',
        },
      },
    ],
  },
  {
    slug: 'pausing-and-managing-service-availability',
    title: 'Pausing Service Listings vs. Deleting (The Open/Closed Switch)',
    category: 'services',
    description: 'Learn how to temporarily pause your approved service listing without losing admin verification or having to recreate it.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['pause service', 'active switch', 'availability toggle', 'temporary pause', 'service manager', 'hide listing'],
    relatedArticleSlugs: ['creating-a-service-listing', 'finding-and-browsing-services'],
    sections: [
      {
        heading: 'Why Use the Active / Paused Toggle?',
        paragraphs: [
          'In ServiceHub Cordova, every service listing undergoes official municipal admin review. If you need a temporary break (e.g. you are fully booked for the weekend, traveling, or sick), you do NOT need to delete your listing.',
          'Instead, navigate to "Service Manager" in your Provider Workspace and click the Active / Paused toggle switch on your listing card.',
        ],
        bullets: [
          'PAUSED STATE (⏸️): The switch turns grey and instantly hides your listing card from the public Seeker Marketplace in real time. Seekers cannot send direct bookings or join your queue while paused.',
          'ACTIVE STATE (🟢): Flipping the switch back to Active immediately restores your listing to the public marketplace with 0 delay and NO re-review required from administrators.',
          'PRESERVES DATA: Pausing preserves your listing description, pricing, photos, and ratings history so you never have to re-type anything.',
        ],
        callout: {
          type: 'tip',
          title: 'When to Delete vs. Pause',
          text: 'Only click "Delete" if you permanently stop offering that skill. For vacations, busy days, or equipment maintenance, always use "Paused" to protect your approved listing.',
        },
      },
      {
        heading: 'How Real-Time Hiding Protects Your Trust Score',
        paragraphs: [
          'When your listing is paused, seekers browsing the marketplace will not see your card. This prevents seekers from sending bookings that you would otherwise have to decline, protecting your response rate and customer satisfaction.',
        ],
      },
    ],
  },
];
