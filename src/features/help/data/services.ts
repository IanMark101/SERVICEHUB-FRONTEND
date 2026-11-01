import { HelpArticle } from '../types/help.types';

export const SERVICES_ARTICLES: HelpArticle[] = [
  {
    slug: 'finding-and-browsing-services',
    title: 'Finding and Filtering Nearby Services',
    category: 'services',
    description: 'Learn how to find skilled local providers, search by keyword, filter active listings, and compare trust information.',
    lastUpdated: 'October 22, 2026',
    readTimeMinutes: 3,
    keywords: ['browse', 'search services', 'categories', 'filters', 'find provider', 'price'],
    relatedArticleSlugs: ['creating-a-service-listing', 'one-time-vs-session-based'],
    sections: [
      {
        heading: 'Choose a search area and radius',
        steps: [
          'Open Change location in Find Services or Find Work. Start typing a city or barangay and select a matching suggestion. You can also use Search, your device location or a map pin.',
          'Confirm the new pin, then choose a preset or custom radius from 0.5 to 30 km, in steps of 0.1 km. The circle previews the search area.',
          'Select Apply location. Eligible physical listings inside the radius appear; online listings can appear regardless of radius. Cancel keeps your current results.',
        ],
        paragraphs: [
          'Your profile area, nearby-search location and actual service address are separate. Public listing pins normally show approximate areas. Exact service addresses and private directions are shared with booking participants.',
          'Distance is straight-line distance, not driving time. Water crossings, bridges, roads, and travel charges may affect a real trip. Search a wider area or choose a different center when no results appear.',
          'Older records without coordinates stay in their owner’s manager and booking history. Owners can add a location in Edit to include an open listing or request in nearby discovery.',
        ],
      },
      {
        heading: 'Browsing the Marketplace',
        paragraphs: [
          'In the Customer Workspace under "Find Services", you can explore all active offerings published by verified nearby providers.',
        ],
        bullets: [
          'Category Filtering: Browse active categories from the administrator-managed marketplace catalog. Other Services appears last in both workspaces for tasks outside the named categories.',
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
    lastUpdated: 'October 22, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['create listing', 'offer service', 'provider guide', 'price type', 'queue limit', 'publish listing'],
    relatedArticleSlugs: ['one-time-vs-session-based', 'how-the-queue-works'],
    sections: [
      {
        heading: 'Creating a New Service',
        steps: [
          'Go to your Provider Workspace and click "List a Service".',
          'Select the Category that best matches your service. If none fits, choose Other Services and describe the specific work in your title and description.',
          'Provide a clear, professional Title and detailed Description of what is included.',
          'Choose an exact Price Type (Fixed, Per Hour, Per Day, or Per Project) and enter the amount customers will see before booking.',
          'Specify the Estimated Duration (e.g. 60 minutes). Set your shared paid waiting limit in My Bookings; it applies across all your listings and accepted offers.',
          'Select the supported payment methods you accept: On-site Cash and/or GCash.',
          'Choose the Work location. Physical services need one Map location for nearby discovery; Online services do not. Add the Business address if customers can visit your workplace.',
          'Click Publish Listing. An active Free trial allows 1 listing; Basic allows 3; Pro allows unlimited listings. Your service becomes visible when membership is active and its details meet the service rules.',
        ],
        callout: {
          type: 'info',
          title: 'What happens after publishing',
          text: 'Your service appears in Find Services after you publish it. You do not need admin approval. If the system asks you to fix a detail, make the change and try again. Admins can respond to reports and remove services that break the rules.',
        },
      },
      {
        heading: 'Map location and service address',
        paragraphs: [
          'The Map location helps nearby Customers find a physical service. It is not an automatic travel limit or the exact address for a booking. Search radius is chosen separately when browsing.',
          'Work location offers At your place, At customer’s place, Either location or Online, depending on the workspace. If the Customer visits the Provider, the Business address is shared privately after booking. If the Provider visits the Customer, the Customer supplies the service address during booking; a map pin is optional when written directions are provided.',
          'Where a transportation fee applies, it is added once when the Provider travels to the Customer. No travel fee applies to Online work or a visit to the Provider. An offer on a custom request quotes one final amount including travel, so travel is not added a second time.',
        ],
      },
    ],
  },
  {
    slug: 'one-time-vs-session-based',
    title: 'Reusable Listings and Repeat Requests',
    category: 'services',
    description: 'Learn how one provider listing supports multiple independent bookings, including repeat tutoring requests.',
    lastUpdated: 'October 22, 2026',
    readTimeMinutes: 2,
    keywords: ['request again', 'one time', 'tutoring', 'repeat provider', 'reusable listing'],
    relatedArticleSlugs: ['creating-a-service-listing', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'One Consistent Booking Model',
        bullets: [
          'Every booking represents one independent engagement, whether it is plumbing, cleaning, tutoring, coaching, or another local service.',
          'The provider listing remains reusable. After a booking is completed, declined, or canceled, the customer may request the same provider through that listing again.',
          'Cash requests require the provider to accept or decline. A preferred schedule is only a proposal and does not automatically reserve the provider.',
          'Providers should pause a listing whenever they are not accepting new requests. ServiceHub also prevents a provider from starting two jobs at the same time.',
        ],
        example: {
          title: 'Example: Requesting a Tutor Again',
          description: 'After Tuesday’s tutoring booking is completed, the customer selects Request Again, proposes Friday afternoon, and sends a new booking. The tutor accepts only if available.',
        },
      },
    ],
  },
  {
    slug: 'pausing-and-managing-service-availability',
    title: 'Pausing Service Listings vs. Deleting (The Open/Closed Switch)',
    category: 'services',
    description: 'Learn how to temporarily pause your published service listing without losing its details or having to recreate it.',
    lastUpdated: 'October 22, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['pause service', 'active switch', 'availability toggle', 'temporary pause', 'service manager', 'hide listing'],
    relatedArticleSlugs: ['creating-a-service-listing', 'finding-and-browsing-services'],
    sections: [
      {
        heading: 'Why Use the Active / Paused Toggle?',
        paragraphs: [
          'If you need a temporary break (e.g. you are fully booked for the weekend, traveling, or sick), you do NOT need to delete your listing. Pause it and resume when you are available.',
          'Instead, navigate to "My Services" in your Provider Workspace and click the Active / Paused toggle switch on your listing card.',
        ],
        bullets: [
          'PAUSED STATE (⏸️): The switch turns grey and instantly hides your listing card from the public Customer Marketplace in real time. Customers cannot send direct bookings or join your queue while paused.',
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
        heading: 'What pausing changes',
        paragraphs: [
          'A paused listing cannot receive new direct bookings. Existing bookings and recorded reviews stay available, and pausing does not change Trust Score. Resuming requires an active membership and space within your plan: 1 listing on Free, 3 on Basic, or unlimited on Pro.',
        ],
      },
    ],
  },
];
