import { HelpArticle } from '../types/help.types';

export const OFFERS_REQUESTS_ARTICLES: HelpArticle[] = [
  {
    slug: 'posting-a-job-request',
    title: 'Posting a Custom Job Request (Flow B)',
    category: 'offers-requests',
    description: 'How to publish a custom task when you cannot find an existing service listing in the marketplace.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    keywords: ['post request', 'custom job', 'flow b', 'offers', 'service request', 'budget'],
    relatedArticleSlugs: ['receiving-and-accepting-offers', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'When to Use Flow B (Job Requests)',
        paragraphs: [
          'If you need a specific or customized service (e.g. "Install 3 custom wooden shelves"), post a Service Request with its actual job location. Eligible providers can discover it using their chosen search area, radius and category.',
        ],
        steps: [
          'In your Seeker Workspace, click "Post Request".',
          'Select the appropriate Category. If no named category fits, choose Other Services near the top of the dropdown.',
          'Provide a clear title and description of your task.',
          'Set your Budget Range (Minimum and Maximum budget in Philippine Pesos).',
          'Choose when help is needed: ASAP / Today, Needs Tomorrow, Next 1-2 Days, This Week, or Flexible Schedule.',
          'Select the actual job location, then click "Post Request" to publish it to Browse Service Requests.',
        ],
      },
      {
        heading: 'Actual job location and travel budget',
        paragraphs: [
          'Choose one pin for where the work will take place. Requests do not need their own radius: providers choose a search radius in Browse Service Requests to find nearby job locations. Add private address details or directions if needed. Your profile area and marketplace search location do not replace this job pin.',
          'Optional additional travel budget tells providers your travel allowance above the service budget. It is not automatically charged. Compare each offer’s final total including travel. Location and travel budget cannot change while active offers exist; post a new request if those terms need to change.',
        ],
      },
    ],
  },
  {
    slug: 'receiving-and-accepting-offers',
    title: 'Receiving and Accepting Provider Offers',
    category: 'offers-requests',
    description: 'Compare provider prices, estimated duration and trust history, then accept an offer with your chosen payment method.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['incoming offers', 'bids', 'accept bid', 'provider offers', 'price comparison'],
    relatedArticleSlugs: ['posting-a-job-request', 'how-direct-booking-works'],
    sections: [
      {
        heading: 'Reviewing Incoming Offers',
        paragraphs: [
          'Providers who discover your open request can submit an offer with a final price, estimated duration, availability and an introductory message. A compatible service listing is optional.',
        ],
        steps: [
          'Go to "Offers Received" in your Seeker Workspace.',
          'Compare offers side-by-side, checking the final price including travel, Trust Score, and reviews from completed work.',
          'When you find the best offer, click "Accept Offer".',
          'Choose an available payment method: On-site Cash or GCash.',
          'For cash, accepting the offer creates the booking. For GCash, the booking is created only after ServiceHub verifies the Test Mode payment with PayMongo. Chat then unlocks for the participants.',
        ],
        callout: {
          type: 'info',
          title: 'Offer Acceptance Rule',
          text: 'Cash acceptance closes the other offers when the booking is created. GCash selection keeps the other offers available until payment succeeds; failed or expired payment reopens the selected offer. The provider does not need to accept the booking again.',
        },
      },
    ],
  },
  {
    slug: 'pausing-seeker-job-requests',
    title: 'Pausing a Job Request While Reviewing Offers',
    category: 'offers-requests',
    description: 'How seekers can pause open task requests to stop incoming quotes while reviewing existing applicant proposals.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 2,
    keywords: ['pause request', 'stop bids', 'request manager', 'close job request', 'stop offers'],
    relatedArticleSlugs: ['posting-a-job-request', 'receiving-and-accepting-offers'],
    sections: [
      {
        heading: 'Why Pause an Open Request?',
        paragraphs: [
          'An open request can receive multiple offers from providers who discover its job location.',
          'If you have already received 3-4 strong offers, you can pause your request to prevent other providers from spending time submitting new proposals.',
        ],
        steps: [
          'Navigate to "Request Manager" in your Seeker Workspace.',
          'Find your open job request card.',
          'Click the Active / Paused switch to toggle it to Paused (⏸️).',
        ],
        bullets: [
          'INSTANT HIDING: Pausing immediately hides the job from the Providers\' "Browse Service Requests" feed in real time.',
          'BLOCKS NEW OFFERS: Providers can no longer submit new offers on paused requests.',
          'SAVES EXISTING OFFERS: Previous provider offers remain accessible in "Offers Received".',
          'RE-OPENING: If none of the existing applicants fit your schedule or budget, you can toggle the switch back to Active (🟢) at any time to resume accepting new quotes.',
        ],
      },
    ],
  },
];
