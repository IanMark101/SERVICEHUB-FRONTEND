import { HelpArticle } from '../types/help.types';

export const VERIFICATION_ARTICLES: HelpArticle[] = [
  {
    slug: 'why-verification-is-required',
    title: 'Why Residency Verification is Required',
    category: 'verification',
    description: 'Learn why identity and residency verification is the cornerstone of trust and safety on ServiceHub.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['verification', 'residency', 'safety', 'barangay id', 'limited mode', 'why verify'],
    relatedArticleSlugs: ['how-to-submit-verification', 'what-is-limited-mode', 'verification-statuses-explained'],
    sections: [
      {
        heading: 'Trust across local communities',
        paragraphs: [
          'Every member account must verify its email and submit identity or residency documents for administrator review before posting services or requests, booking, or sending and accepting offers. One approved account can use both Seeker and Provider workspaces.',
          'Submitting a document does not verify your account automatically. The administrator reviews its contents and decides whether the proof is sufficient. Documents can come from different communities and cities; approval is not tied to one municipality.',
          'A map pin is not proof of identity or residency. Choosing a new search location does not approve an account or change its verification status.',
        ],
      },
      {
        heading: 'Key Benefits of Verification',
        bullets: [
          'Adds administrator review of identity and residency proof before marketplace transactions.',
          'Builds instant trust between neighbors hiring each other for home repairs, tutoring, childcare, or maintenance.',
          'Awards you an official "Verified" checkmark badge on your public profile.',
          'Gives your account an immediate one-time +5 point boost to your Trust Score upon approval.',
          'Unlocks marketplace participation including creating bookings, submitting offers, and publishing service listings, subject to the other account and transaction rules.',
        ],
        callout: {
          type: 'info',
          title: 'Administrator Review',
          text: 'Every document submission is reviewed by a ServiceHub administrator. Verification files are access-controlled and are never shown publicly to marketplace users.',
        },
      },
    ],
  },
  {
    slug: 'how-to-submit-verification',
    title: 'How to Submit Residency Documents',
    category: 'verification',
    description: 'Submit document photos privately for administrator review and approval.',
    lastUpdated: 'October 2026',
    readTimeMinutes: 3,
    keywords: ['submit documents', 'upload id', 'barangay certificate', 'proof of residency', 'valid id'],
    relatedArticleSlugs: ['verification-statuses-explained', 'what-is-limited-mode'],
    sections: [
      {
        heading: 'Documents for Administrator Review',
        paragraphs: [
          'Submit one or two clear document photos using Government-Issued ID, Barangay ID, or Proof of Residence. These categories help organize your submission; the administrator decides whether the contents establish your identity and current residence.',
          'Supported uploads are JPG/JPEG, PNG or WebP images up to 5 MB each. Uploading a file does not grant verification. Examples of relevant proof include:',
        ],
        bullets: [
          'Barangay Clearance or Barangay Residency Certificate (issued by your local barangay).',
          'Barangay ID with your home address.',
          'Philippine National ID (PhilID) showing your residence.',
          'Government-issued ID (Driver’s License, Voter’s ID, Postal ID, SSS/UMID, or Passport) paired with proof of billing/address.',
        ],
      },
      {
        heading: 'Step-by-Step Submission Guide',
        steps: [
          'Verify your email, then open the Verification tab on your profile.',
          'Choose the document category and upload a clear document photo from your device.',
          'Read and acknowledge the current verification privacy notice.',
          'Click "Submit for Verification". Your account remains restricted while the administrator reviews it.',
          'Check the decision. Approval enables verification-gated marketplace actions; rejection includes feedback so you can resubmit.',
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
          'UNVERIFIED: You have registered an account but have not yet submitted proof of residency. Your account operates in Limited Mode.',
          'PENDING_REVIEW: Your documents have been received by the ServiceHub admin team and are currently in the audit queue. Reviews are processed in First-Come, First-Served order.',
          'APPROVED: Your residency has been verified. You receive the Verified Badge, +5 Trust Score points, and full marketplace access.',
          'REJECTED: Your submitted documents could not be verified (e.g., blurry image, name mismatch, or unverifiable address). Admin feedback will explain why, and you may resubmit immediately.',
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
    description: 'Learn what actions unverified accounts can and cannot perform on ServiceHub.',
    lastUpdated: 'August 2026',
    readTimeMinutes: 3,
    popular: true,
    keywords: ['limited mode', 'restrictions', 'unverified account', 'permission denied'],
    relatedArticleSlugs: ['why-verification-is-required', 'how-to-submit-verification'],
    sections: [
      {
        heading: 'Understanding Limited Mode',
        paragraphs: [
          'Accounts that are UNVERIFIED, PENDING_REVIEW or REJECTED remain in Limited Mode until administrator approval. The server enforces the verification gate for new marketplace interactions.',
        ],
      },
      {
        heading: 'What You CAN Do in Limited Mode',
        bullets: [
          'Browse public service listings around your chosen search location.',
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
          'Submitting offers to seeker requests.',
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
