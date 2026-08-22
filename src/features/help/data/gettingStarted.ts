import { HelpArticle } from '../types/help.types';

export const GETTING_STARTED_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-is-servicehub-cordova',
    title: 'What is ServiceHub Cordova?',
    category: 'getting-started',
    description: 'Learn about the purpose, coverage area, and core mission of ServiceHub Cordova.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['servicehub', 'cordova', 'hyperlocal', 'barangay', 'marketplace', 'cebu', 'community'],
    relatedArticleSlugs: ['seeker-vs-provider', 'why-verification-is-required', 'what-is-trust-score'],
    sections: [
      {
        heading: 'A Hyperlocal Marketplace Built for Cordova',
        paragraphs: [
          'ServiceHub Cordova is a community-focused online marketplace tailored exclusively for the Municipality of Cordova, Cebu Province. Unlike generic classified ad platforms or nationwide apps, ServiceHub ensures that every service transaction happens locally between verified residents and trusted local service providers.',
          'Whether you need quick plumbing repairs in Poblacion, math tutoring in Day-as, motorcycle maintenance in Gabi, or event catering in Catarman, ServiceHub connects you directly with neighbors who have proven skills and verified community standing.',
        ],
      },
      {
        heading: 'All 13 Barangays Covered',
        paragraphs: [
          'ServiceHub actively serves all 13 recognized barangays of Cordova:',
        ],
        bullets: [
          'Alegria & Bangbang',
          'Buagsong & Catarman',
          'Cogon & Dapitan',
          'Day-as & Gabi',
          'Gilutongan (Island Barangay)',
          'Ibabao & Pilipog',
          'Poblacion & San Miguel',
        ],
        callout: {
          type: 'info',
          title: 'Hyperlocal Proximity',
          text: 'Because providers and seekers are both in Cordova, response times are faster, travel costs are lower, and community accountability remains high.',
        },
      },
      {
        heading: 'Key Safety & Quality Guarantees',
        bullets: [
          'Residency & Identity Verification to eliminate anonymous scammers.',
          'Dynamic Trust Score system to promote punctual, respectful, and high-quality service.',
          'Escrow-protected GCash and On-site Cash payment options.',
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
    relatedArticleSlugs: ['what-is-servicehub-cordova', 'navigating-the-platform', 'creating-an-account'],
    sections: [
      {
        heading: 'Two Perspectives in One Account',
        paragraphs: [
          'On ServiceHub Cordova, you do not need separate accounts to hire help and offer your own skills. Every registered user can participate as both a Service Seeker and a Service Provider.',
        ],
      },
      {
        heading: 'Service Seeker Role (Hiring Help)',
        paragraphs: [
          'When you are in the Seeker Workspace (accented in signature warm orange):',
        ],
        bullets: [
          'Browse and filter available service listings published by Cordova providers.',
          'Directly book a provider or join their live service queue.',
          'Post custom job requests specifying your budget and urgency when you cannot find an existing listing.',
          'Review incoming price bids and select the provider of your choice.',
          'Confirm job completion and release payments.',
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
    description: 'A step-by-step guide to registering your ServiceHub Cordova account and setting up your profile.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['register', 'signup', 'account', 'email verification', 'profile setup'],
    relatedArticleSlugs: ['why-verification-is-required', 'what-is-trust-score'],
    sections: [
      {
        heading: 'How to Register',
        steps: [
          'Click "Get Started" or "Sign Up" on the ServiceHub homepage.',
          'Fill in your full name, valid email address, mobile phone number, and select your Cordova barangay.',
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
