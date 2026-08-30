import { HelpArticle } from '../types/help.types';

export const OFFERS_REQUESTS_ARTICLES: HelpArticle[] = [
  {
    slug: 'posting-a-job-request',
    title: 'Posting a Custom Job Request (Flow B)',
    category: 'offers-requests',
    description: 'How to publish a custom task when you cannot find an existing service listing in the marketplace.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['post request', 'custom job', 'flow b', 'bidding', 'service request', 'budget'],
    relatedArticleSlugs: ['receiving-and-accepting-offers', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'When to Use Flow B (Job Requests)',
        paragraphs: [
          'If you need a specific or customized service that is not listed in the marketplace (e.g. "Install 3 custom wooden shelves in Brgy. Pilipog"), you can broadcast a Service Request to all verified providers in that category.',
        ],
        steps: [
          'In your Seeker Workspace, click "Post Request".',
          'Select the appropriate Category.',
          'Provide a clear title and description of your task.',
          'Set your Budget Range (Minimum and Maximum budget in Philippine Pesos).',
          'Select the Urgency Level (Low, Medium, or High).',
          'Click "Post Request" to publish it to the local job board.',
        ],
      },
    ],
  },
  {
    slug: 'receiving-and-accepting-offers',
    title: 'Receiving Provider Bids & Accepting an Offer',
    category: 'offers-requests',
    description: 'How to compare bids from competing providers, negotiate terms, and award the contract.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['incoming offers', 'bids', 'accept bid', 'provider offers', 'price comparison'],
    relatedArticleSlugs: ['posting-a-job-request', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'Reviewing Incoming Bids',
        paragraphs: [
          'Providers in Cordova will review your open request and submit competitive bids including their offered price, estimated completion time, and an introductory message.',
        ],
        steps: [
          'Go to "Incoming Offers" in your Seeker Workspace.',
          'Compare the provider bids side-by-side, checking their offered price, Trust Score, and past customer reviews.',
          'When you find the best offer, click "Accept Offer".',
          'Choose your payment method (GCash or On-site Cash).',
          'Accepting the offer immediately creates an active Booking contract and unlocks the chat conversation.',
        ],
        callout: {
          type: 'info',
          title: 'Offer Acceptance Rule',
          text: 'Accepting one offer automatically notifies other bidders that the job has been awarded.',
        },
      },
    ],
  },
  {
    slug: 'pausing-seeker-job-requests',
    title: 'Pausing a Job Request When You Have Enough Bids',
    category: 'offers-requests',
    description: 'How seekers can pause open task requests to stop incoming quotes while reviewing existing applicant proposals.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    keywords: ['pause request', 'stop bids', 'request manager', 'close job request', 'stop offers'],
    relatedArticleSlugs: ['posting-a-job-request', 'receiving-and-accepting-offers'],
    sections: [
      {
        heading: 'Why Pause an Open Request?',
        paragraphs: [
          'When you publish a task in Cordova (e.g. "Install 2 Ceiling Fans"), you may receive multiple competitive bids within the first few hours.',
          'If you have already received 3–4 strong offers, you can pause your request to prevent other providers from spending time submitting new proposals.',
        ],
        steps: [
          'Navigate to "Request Manager" in your Seeker Workspace.',
          'Find your open job request card.',
          'Click the Active / Paused switch to toggle it to Paused (⏸️).',
        ],
        bullets: [
          'INSTANT HIDING: Pausing immediately hides the job from the Providers\' "Browse Jobs" feed in real time.',
          'BLOCKS NEW BIDS: Providers can no longer submit new quotes on paused requests.',
          'SAVES EXISTING PROPOSALS: All previous bids and provider quotes remain saved and accessible for your review in "Incoming Offers".',
          'RE-OPENING: If none of the existing applicants fit your schedule or budget, you can toggle the switch back to Active (🟢) at any time to resume accepting new quotes.',
        ],
      },
    ],
  },
];
