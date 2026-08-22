import { HelpArticle } from '../types/help.types';

export const VERIFICATION_ARTICLES: HelpArticle[] = [
  {
    slug: 'why-verification-is-required',
    title: 'Why Residency Verification is Required',
    category: 'verification',
    description: 'Learn why Cordova resident verification is the cornerstone of trust and safety on ServiceHub.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['verification', 'residency', 'safety', 'barangay id', 'limited mode', 'why verify'],
    relatedArticleSlugs: ['how-to-submit-verification', 'what-is-limited-mode', 'verification-statuses-explained'],
    sections: [
      {
        heading: 'Protecting the Cordova Community',
        paragraphs: [
          'ServiceHub Cordova is designed specifically for local residents. Requiring identity and residency proof guarantees that all service providers entering homes or businesses and all seekers booking services are legitimate members of our community.',
        ],
      },
      {
        heading: 'Key Benefits of Verification',
        bullets: [
          'Eliminates anonymous scams, fake accounts, and fly-by-night operators.',
          'Builds instant trust between neighbors hiring each other for home repairs, tutoring, childcare, or maintenance.',
          'Awards you an official "Verified" checkmark badge on your public profile.',
          'Gives your account an immediate one-time +5 point boost to your Trust Score upon approval.',
          'Unlocks full marketplace participation including creating bookings, submitting bids, and publishing service listings.',
        ],
        callout: {
          type: 'info',
          title: 'Admin Verification Guarantee',
          text: 'Every document submitted is audited by human Municipal Administrators. Your documents are securely encrypted and never shown publicly to other users.',
        },
      },
    ],
  },
  {
    slug: 'how-to-submit-verification',
    title: 'How to Submit Cordova Residency Documents',
    category: 'verification',
    description: 'Step-by-step instructions for submitting accepted government IDs and barangay residency proofs.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    keywords: ['submit documents', 'upload id', 'barangay certificate', 'proof of residency', 'valid id'],
    relatedArticleSlugs: ['verification-statuses-explained', 'what-is-limited-mode'],
    sections: [
      {
        heading: 'Accepted Verification Documents',
        paragraphs: [
          'You must upload at least one clear photo or scan of an accepted document:',
        ],
        bullets: [
          'Barangay Clearance or Barangay Residency Certificate (issued by any of the 13 Cordova barangays).',
          'Barangay ID with your Cordova home address.',
          'Philippine National ID (PhilID) showing Cordova residence.',
          'Government-issued ID (Driver’s License, Voter’s ID, Postal ID, SSS/UMID, or Passport) paired with proof of billing/address.',
          'Optional for Providers: Professional/Technical Skill Certificate (e.g. TESDA certificate, PRC license, trade certification).',
        ],
      },
      {
        heading: 'Step-by-Step Submission Guide',
        steps: [
          'Go to your User Profile page or click the "Verify Account" banner.',
          'Click the "Residency Verification" tab.',
          'Select your document type from the dropdown.',
          'Upload a clean, legible photo of your document (ensure your name, address, and photo are in focus).',
          'Review the information and click "Submit Verification for Audit".',
        ],
        callout: {
          type: 'tip',
          title: 'Fast Approval Tip',
          text: 'Ensure the photo is well-lit with all four corners of the ID visible. Blurry or cropped images will be rejected by administrators.',
        },
      },
    ],
  },
  {
    slug: 'verification-statuses-explained',
    title: 'Verification Statuses Explained',
    category: 'verification',
    description: 'Understand the difference between UNVERIFIED, PENDING_REVIEW, APPROVED, and REJECTED statuses.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 2,
    popular: true,
    keywords: ['status', 'unverified', 'pending review', 'approved', 'rejected'],
    relatedArticleSlugs: ['what-is-limited-mode', 'why-verification-is-required'],
    sections: [
      {
        heading: 'Status Definitions',
        bullets: [
          'UNVERIFIED: You have registered an account but have not yet submitted proof of Cordova residency. Your account operates in Limited Mode.',
          'PENDING_REVIEW: Your documents have been received by the Municipal Admin team and are currently in the audit queue. Reviews are processed in First-Come, First-Served order.',
          'APPROVED: Your residency has been verified. You receive the Verified Badge, +5 Trust Score points, and full marketplace access.',
          'REJECTED: Your submitted documents could not be verified (e.g., blurry image, name mismatch, or non-Cordova address). Admin feedback will explain why, and you may resubmit immediately.',
        ],
        example: {
          title: 'Example: Resubmission after Rejection',
          description: 'If rejected because of a glare on your ID photo, simply snap a new clear photo in natural light and upload it on your profile page.',
        },
      },
    ],
  },
  {
    slug: 'what-is-limited-mode',
    title: 'What is Limited Mode?',
    category: 'verification',
    description: 'Learn what actions unverified accounts can and cannot perform on ServiceHub Cordova.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['limited mode', 'restrictions', 'unverified account', 'permission denied'],
    relatedArticleSlugs: ['why-verification-is-required', 'how-to-submit-verification'],
    sections: [
      {
        heading: 'Understanding Limited Mode',
        paragraphs: [
          'To prevent fraudulent activity and protect the Cordova marketplace, accounts with UNVERIFIED status are placed in Limited Mode. This is enforced directly by the system server.',
        ],
      },
      {
        heading: 'What You CAN Do in Limited Mode',
        bullets: [
          'Browse all public service listings across Cordova.',
          'Search for providers, read descriptions, and view pricing.',
          'Read public reviews and explore category offerings.',
          'Customize your user profile details and bio.',
          'Submit your residency verification documents.',
        ],
      },
      {
        heading: 'What is RESTRICTED until Verified',
        bullets: [
          'Booking a service or joining a live provider queue.',
          'Posting custom job requests on the community board.',
          'Submitting price bids/offers to seeker requests.',
          'Publishing active service listings as a provider.',
          'Sending direct messages or starting transaction chats.',
        ],
        callout: {
          type: 'warning',
          title: 'Server-Enforced Access Gate',
          text: 'If you attempt to book or publish a service while unverified, a friendly dialog will guide you directly to the Verification Submission form.',
        },
      },
    ],
  },
];
