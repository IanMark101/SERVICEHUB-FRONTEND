import { HelpArticle } from '../types/help.types';

export const GETTING_STARTED_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-is-servicehub',
    title: 'What is ServiceHub?',
    category: 'getting-started',
    description: 'A service marketplace where seekers and providers discover nearby services and work by location, radius and category.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['servicehub', 'nearby', 'location', 'radius', 'marketplace', 'services', 'offers'],
    relatedArticleSlugs: ['seeker-vs-provider', 'why-verification-is-required', 'what-is-trust-score'],
    sections: [
      {
        heading: 'A service marketplace built around proximity',
        paragraphs: [
          'ServiceHub connects seekers and providers across communities and cities. Choose a search location and radius to find nearby services or work opportunities. Eligibility depends on distance, service coverage and account requirements rather than membership in one municipality.',
          'There are two ways to hire: browse a provider’s published service and book it, or post your own request and choose a provider’s offer. Both continue through booking, payment, Activity, messaging, completion and reviews.',
        ],
      },
      {
        heading: 'Choose a search area and radius',
        steps: [
          'Open Change location in Seek Services or Browse Service Requests. Search a city or barangay, use device location, or select a map pin.',
          'Choose 1, 2, 5, 10, 15, 20, or 30 km. The circle previews the search area.',
          'Select Apply location. Only eligible services or requests inside that radius appear. Changing the draft or selecting Cancel keeps your current results.',
        ],
        paragraphs: [
          'Profile area, marketplace search location, actual job location, and listing coverage are separate. Search preferences are saved per account and workspace on this device. Discovery cards show general areas and approximate distances; exact job pins and private directions are shared with booking participants.',
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
    title: 'Seeker vs. Provider Roles Explained',
    category: 'getting-started',
    description: 'Understand how a single ServiceHub account lets you effortlessly switch between hiring and offering services.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['seeker', 'provider', 'roles', 'switch role', 'workspace', 'hiring', 'offering'],
    relatedArticleSlugs: ['what-is-servicehub', 'navigating-the-platform', 'creating-an-account'],
    sections: [
      {
        heading: 'Two Perspectives in One Account',
        paragraphs: [
          'On ServiceHub, you do not need separate accounts to hire help and offer your own skills. Every registered user can participate as both a Service Seeker and a Service Provider.',
        ],
      },
      {
        heading: 'Service Seeker Role (Hiring Help)',
        paragraphs: [
          'When you are in the Seeker Workspace (accented in signature warm orange):',
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
          'Browse open seeker requests on the job board and submit competitive price offers.',
          'Manage incoming customer bookings, track ongoing jobs, and view earnings history.',
        ],
        callout: {
          type: 'tip',
          title: 'Switching Roles',
          text: 'You can switch between Seeker and Provider anytime by clicking the role switcher in the sidebar navigation.',
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
          'Create a strong password (minimum 8 characters with a mix of letters and numbers).',
          'You can also register quickly using "Continue with Google".',
          'Check your inbox for a verification link to confirm your email address.',
        ],
      },
      {
        heading: 'Starting Trust Score',
        paragraphs: [
          'Every brand new account starts with a baseline Trust Score of 50 out of 100. This score reflects a clean slate and increases as you complete jobs, earn positive reviews, and verify your residency.',
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
    lastUpdated: 'August 2026',
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
          'Left Sidebar: Quick access to your role-specific workspaces (Seek Services, Post Request, Service Manager, Activity Tracker, Earnings).',
          'Top Header: Global search bar to lookup users or services, notification bell for real-time alerts, theme toggle (Dark/Light mode), and user profile menu.',
          'Activity Center: Keeps live tabs on ongoing bookings, pending approvals, and action-required items.',
        ],
        example: {
          title: 'Example: Toggling Dark Mode',
          description: 'Click the Sun/Moon icon in the top header to instantly switch between high-contrast Dark Mode and clean Light Mode.',
        },
      },
    ],
  },
];
