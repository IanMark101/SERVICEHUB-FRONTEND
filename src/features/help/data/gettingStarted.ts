import { HelpArticle } from '../types/help.types';

export const GETTING_STARTED_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-is-servicehub',
    title: 'What is ServiceHub?',
    category: 'getting-started',
    description: 'A service marketplace where customers and providers discover nearby services and work by location, radius and category.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['servicehub', 'nearby', 'location', 'radius', 'marketplace', 'services', 'offers'],
    relatedArticleSlugs: ['seeker-vs-provider', 'why-verification-is-required', 'what-is-trust-score'],
    sections: [
      {
        heading: 'A service marketplace built around proximity',
        paragraphs: [
          'ServiceHub connects Customers and Providers across communities and cities. Choose a search location and radius to find nearby services or work opportunities. Physical listings are matched by location, filters and account eligibility; online listings do not need to be nearby.',
          'There are two ways to hire: browse a provider’s published service and book it, or post your own request and choose a provider’s offer. Both continue through booking, payment, Activity, messaging, completion and reviews.',
        ],
      },
      {
        heading: 'Choose a search area and radius',
        steps: [
          'Open Change location in Find Services or Find Work. Start typing at least three letters of a city or barangay. Matching places appear as you type; select one, or use the arrow keys and Enter. You can also use device location or select a map pin.',
          'Review the new pin and select Use this location or Switch location. Keep current location cancels a proposed change.',
          'Choose a preset or custom radius between 0.5 and 30 km, in increments of 0.1 km. The circle previews the search area.',
          'Select Apply location. Eligible physical listings inside that radius appear; online listings remain available regardless of radius. Changing the draft or selecting Cancel keeps your current results.',
        ],
        paragraphs: [
          'The location dialog shows listing markers for the visible map area. Select a marker and View listing to read its details. The discovery list uses your confirmed search location, radius and filters.',
          'For example, typing "cordov" can suggest "Cordova, Cebu". If suggestions are unavailable, use Search or choose a map pin. Typing alone does not apply a new search location.',
          'Hold Ctrl (Command on Mac) while scrolling to zoom around your pointer. You can also use the zoom buttons or pinch on a phone. Panning and zooming keep your chosen location unchanged. Back to selected location returns to your pin; full screen gives you more room.',
          'Your profile area, nearby-search location and service address serve different purposes. Search preferences are saved per account and workspace on this device. Public listing pins show general areas unless the owner explicitly shares an exact pin; service addresses and private directions are shared with booking participants.',
          'Distance is straight-line distance, not driving time. Water crossings, bridges, roads, and travel charges may affect a real trip. Search a wider area or choose a different center when no results appear.',
          'Older records without coordinates stay in their owner’s manager and booking history. Owners can add a location in Edit to include an open listing or request in nearby discovery.',
        ],
      },
      {
        heading: 'Verification and Transaction Safeguards',
        bullets: [
          'Identity and residency verification to support accountable marketplace participation.',
          'Dynamic Trust Score system to promote punctual, respectful, and high-quality service.',
          'Eligible GCash checkout through PayMongo Test Mode, plus direct On-site Cash arrangements.',
          'Transaction-bound chat logs for security and fair dispute resolution.',
        ],
      },
    ],
  },
  {
    slug: 'seeker-vs-provider',
    title: 'Customer vs. Provider Roles Explained',
    category: 'getting-started',
    description: 'Understand how a single ServiceHub account lets you effortlessly switch between hiring and offering services.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['customer', 'seeker', 'provider', 'roles', 'switch role', 'workspace', 'hiring', 'offering'],
    relatedArticleSlugs: ['what-is-servicehub', 'navigating-the-platform', 'creating-an-account'],
    sections: [
      {
        heading: 'Two Perspectives in One Account',
        paragraphs: [
          'On ServiceHub, you do not need separate accounts to hire help and offer your own skills. Every registered user can participate as both a Customer and a Service Provider.',
        ],
      },
      {
        heading: 'Customer Role (Hiring Help)',
        paragraphs: [
          'When you are in the Customer Workspace (accented in signature warm orange):',
        ],
        bullets: [
          'Browse and filter available service listings published by nearby providers.',
          'Directly book a provider; confirmed GCash payment joins that provider’s paid work queue.',
          'Post custom job requests specifying your budget and urgency when you cannot find an existing listing.',
          'Review incoming offers and select the provider of your choice.',
          'Confirm job completion and update the Test Mode payment record.',
        ],
      },
      {
        heading: 'Service Provider Role (Offering Services)',
        paragraphs: [
          'When you are in the Provider Workspace (accented in fresh emerald green):',
        ],
        bullets: [
          'Publish detailed service listings (e.g. Aircon Repair, Home Cleaning, Academic Tutoring).',
          'Manage your live queue and set customer capacity limits.',
          'Browse open customer requests on the job board and submit competitive price offers.',
          'Manage incoming customer bookings, track ongoing jobs, and view earnings history.',
        ],
        callout: {
          type: 'tip',
          title: 'Switching Roles',
          text: 'You can switch between Customer and Provider anytime by clicking the role switcher in the sidebar navigation.',
        },
      },
    ],
  },
  {
    slug: 'creating-an-account',
    title: 'Creating an Account & First Steps',
    category: 'getting-started',
    description: 'A step-by-step guide to registering your ServiceHub account and setting up your profile.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['register', 'signup', 'account', 'email verification', 'profile setup'],
    relatedArticleSlugs: ['why-verification-is-required', 'what-is-trust-score'],
    sections: [
      {
        heading: 'How to Register',
        steps: [
          'Click "Get Started" or "Sign Up" on the ServiceHub homepage.',
          'Fill in your full name, valid email address, mobile phone number, and enter your city or municipality and barangay.',
          'Create a password with at least 8 characters, including uppercase and lowercase letters, a number and a special character.',
          'You can also register quickly using "Continue with Google".',
          'Check your inbox for a verification link to confirm your email address.',
        ],
      },
      {
        heading: 'Starting Trust Score',
        paragraphs: [
          'Every new account starts at a neutral Trust Score of 50 out of 100. Approved verification and eligible completed bookings can add points. Star ratings reflect satisfaction and do not change Trust Score.',
        ],
        callout: {
          type: 'important',
          title: 'Next Step: Residency Verification',
          text: 'While you can browse services immediately, you will need to submit a quick residency verification before booking or listing services.',
        },
      },
    ],
  },
  {
    slug: 'navigating-the-platform',
    title: 'Navigating the Platform & Workspaces',
    category: 'getting-started',
    description: 'Learn your way around the sidebar, top header, notifications dropdown, and theme switcher.',
    lastUpdated: 'October 21, 2026',
    readTimeMinutes: 2,
    keywords: ['navigation', 'sidebar', 'header', 'dark mode', 'theme', 'search bar'],
    relatedArticleSlugs: ['seeker-vs-provider', 'understanding-notifications'],
    sections: [
      {
        heading: 'The ServiceHub Layout',
        paragraphs: [
          'ServiceHub is structured to keep all tools within one or two clicks:',
        ],
        bullets: [
          'Customer sidebar: Find Services, Post Request, Offers, My Requests, Saved and My Bookings.',
          'Provider sidebar: Find Work, List a Service, Requests, My Services, Saved, My Bookings, Job Queue, Payment Records and Subscription.',
          'Top header: Search for people, read messages and notifications, switch between Light and Dark mode, and open your profile.',
          'My Bookings: Follow progress and complete the actions waiting for you. Subscription opens its own page; use the top-right close button to return.',
        ],
        example: {
          title: 'Example: Toggling Dark Mode',
          description: 'Click the Sun/Moon icon in the top header to instantly switch between high-contrast Dark Mode and clean Light Mode.',
        },
      },
    ],
  },
];
