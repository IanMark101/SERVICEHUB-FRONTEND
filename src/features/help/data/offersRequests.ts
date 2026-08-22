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
          'Go to "Service Requests" (Incoming Offers) in your Seeker Workspace.',
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
];
