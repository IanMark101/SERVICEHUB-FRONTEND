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
          'Pricing Transparency: Listings show a fixed price or an exact rate per hour, day, or project. For hourly and daily services, review the calculated total before booking.',
        ],
      },
    ],
  },
  {
    slug: 'creating-a-service-listing',
    title: 'How Providers Create and Publish Listings',
    category: 'services',
    description: 'A guide for providers on writing clear descriptions, choosing price types, setting queue limits, and publishing a listing.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['create listing', 'offer service', 'provider guide', 'price type', 'queue limit', 'publish listing'],
    relatedArticleSlugs: ['one-time-vs-session-based', 'how-the-queue-works'],
    sections: [
      {
        heading: 'Creating a New Service',
        steps: [
          'Go to your Provider Workspace and click "Offer Services".',
          'Select the official Category that best matches your service.',
          'Provide a clear, professional Title and detailed Description of what is included.',
          'Choose an exact Price Type (Fixed, Per Hour, Per Day, or Per Project) and enter the amount seekers will see before booking.',
          'Specify the Estimated Duration (e.g. 60 minutes). Set your shared paid waiting limit in Provider Activity; it applies across all your listings and accepted offers.',
          'Select the supported payment methods you accept: On-site Cash and/or GCash.',
          'Click Publish Listing. Your service becomes visible to customers if its details meet the service rules.',
        ],
        callout: {
          type: 'info',
          title: 'What happens after publishing',
          text: 'Your service appears in Seek Services after you publish it. You do not need admin approval. If the system asks you to fix a detail, make the change and try again. Admins can respond to reports and remove services that break the rules.',
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
    description: 'Learn how to temporarily pause your published service listing without losing its details or having to recreate it.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['pause service', 'active switch', 'availability toggle', 'temporary pause', 'service manager', 'hide listing'],
    relatedArticleSlugs: ['creating-a-service-listing', 'finding-and-browsing-services'],
    sections: [
      {
        heading: 'Why Use the Active / Paused Toggle?',
        paragraphs: [
          'If you need a temporary break (e.g. you are fully booked for the weekend, traveling, or sick), you do NOT need to delete your listing. Pause it and resume when you are available.',
          'Instead, navigate to "Service Manager" in your Provider Workspace and click the Active / Paused toggle switch on your listing card.',
        ],
        bullets: [
          'PAUSED STATE (⏸️): The switch turns grey and instantly hides your listing card from the public Seeker Marketplace in real time. Seekers cannot send direct bookings or join your queue while paused.',
          'ACTIVE STATE (🟢): Flipping the switch back to Active immediately restores your listing to the public marketplace once the update succeeds.',
          'PRESERVES DATA: Pausing preserves your listing description, pricing, photos, and ratings history so you never have to re-type anything.',
        ],
        callout: {
          type: 'tip',
          title: 'When to Delete vs. Pause',
          text: 'Only click "Delete" if you permanently stop offering that skill. For vacations, busy days, or equipment maintenance, always use "Paused" to preserve your listing.',
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
