import type { LocationPoint } from '../lib/location';

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'seeker' | 'provider';
  avatarUrl: string;
  bio: string;
  phone: string;
  rating: number; // Calculated average
  reviews: Review[];
  isVerified: boolean; // Provider verified
  proofOfResidencyUrl?: string; // Admin inspection
  proofOfSkillUrl?: string; // Admin inspection
  trustScore?: number;
  verificationStatus?: VerificationStatus;
  emailVerified?: boolean;
  isActive?: boolean;
  location?: string;
}

export interface ServiceListing {
  locationLabel?: string;
  distanceKm?: number;
  serviceLocation?: LocationPoint;
  coverageRadiusKm?: number | null;
  transportationFee?: number | null;
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  title: string;
  category: string;
  description: string;
  price: number;
  queueSize: number;
  queueLimit?: number;
  providerWaitingCount?: number;
  isPaused: boolean;
  proofOfSkillUrl: string; // Proof uploaded for verification
  rating: number;
  providerTrustScore?: number;
  providerVerificationStatus?: string;
  reviewCount?: number;
  // SESSION_BASED is retained only for decoding legacy server records. New
  // listings and bookings are reusable ONE_TIME engagements.
  serviceType?: 'ONE_TIME' | 'SESSION_BASED';
  // priceType controls how the price is displayed (e.g. ₱200 / session, ₱500 / project)
  priceType?: 'FIXED' | 'STARTS_AT' | 'PER_HOUR' | 'PER_SESSION' | 'PER_DAY' | 'PER_PROJECT' | 'CUSTOM';
  estimatedDurationMins?: number;
  status?: 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  adminNotes?: string | null;
  rejectionCount?: number;
  paymentMethods?: {
    cash: boolean;
    gcash: boolean;
  };
}


export interface PaymentMethods {
  cash: boolean;
  gcash: boolean;
}

export interface JobRequest {
  locationLabel?: string;
  distanceKm?: number;
  jobLocation?: LocationPoint;
  transportationFee?: number | null;
  id: string;
  targetProviderId?: string | null;
  targetServiceId?: string | null;
  preferredPaymentMethod?: 'GCash' | 'On-site Cash' | null;
  paymentMethods?: PaymentMethods | null;
  seekerId: string;
  seekerName: string;
  seekerAvatar: string;
  seekerTrustScore?: number;
  seekerVerificationStatus?: string;
  seekerRating?: number;
  seekerReviewCount?: number;
  title: string;
  category: string;
  urgency: string;
  budget: number;
  description: string;
  status: 'open' | 'paused' | 'filled' | 'canceled' | 'OPEN' | 'PAYMENT_PENDING' | 'IN_PROGRESS' | 'CANCELED' | 'CLOSED' | 'closed';
  createdAt: string;
  offersCount?: number;
  hasCompletedBooking?: boolean;
  hasActiveBooking?: boolean;
  hasAcceptedOffer?: boolean;
  hasPendingPaymentOffer?: boolean;
  canDelete?: boolean;
  canArchive?: boolean;
  archivedAt?: string | null;
  deleteBlockedReason?: string | null;
}

export interface Bid {
  id: string;
  requestId: string;
  seekerId?: string;
  seekerAvatar?: string;
  seekerTrustScore?: number;
  providerId: string;
  serviceId?: string;
  requestPaymentMethods?: PaymentMethods | null;
  requestPreferredPaymentMethod?: 'GCash' | 'On-site Cash' | null;
  estimatedDuration?: number;
  availability?: string;
  requestStatus?: string;
  decisionReason?: 'DECLINED' | 'NOT_SELECTED' | null;
  decisionAt?: string | null;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  price: number;
  message: string;
  status: 'pending' | 'pending_payment' | 'accepted' | 'declined' | 'withdrawn' | 'canceled' | 'PENDING' | 'PENDING_PAYMENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELED';
  createdAt: string;
  requestTitle?: string;
  seekerName?: string;
  category?: string;
}

export interface BookingProgressEvent {
  id: string;
  kind: string;
  eventKey?: string;
  actorRole: 'SEEKER' | 'PROVIDER' | 'ADMIN' | 'SYSTEM';
  occurredAt: string;
}

export interface JobEngagement {
  jobLocation?: LocationPoint;
  transportationFee?: number | null;
  id: string;
  title: string;
  category?: string;
  estimatedDurationMins?: number;
  seekerId: string;
  seekerName: string;
  seekerAvatar: string;
  seekerTrustScore?: number;
  seekerVerificationStatus?: string;
  seekerLocation?: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerTrustScore?: number;
  providerVerificationStatus?: string;
  providerLocation?: string;
  serviceId: string | null; // null if matched from public bid
  repostRequestId?: string; // Completed public request, including after Request Manager archive.
  price: number;
  quantity?: number;
  priceType?: ServiceListing['priceType'];
  status: 'pending_provider' | 'queued' | 'in_progress' | 'awaiting_seeker_approval' | 'completed' | 'disputed' | 'canceled';
  bookingStatus?: string; // Authoritative API state; preserves DECLINED / REMOVED within closed history.
  providerAvailability?: string;
  paymentMethod: 'GCash' | 'On-site Cash';
  paymentStatus?: string;
  createdAt: string;
  completedServiceId?: string;
  bookingCreatedAt?: string;
  completionRecordedAt?: string;
  progressEvents?: BookingProgressEvent[];
  progressCancellationRequests?: JobEngagement['cancellationRequests'];
  reviews?: Array<{
    id: string;
    authorId: string;
    rating?: number;
    comment?: string;
    text?: string;
    tags?: string[];
    createdAt?: string;
    editableUntil?: string;
  }>;
  completedAt?: string;
  disputeReason?: string;
  description?: string;
  preferredSchedule?: string;
  started?: boolean;
  cancellationRequests?: Array<{
    id: string;
    status: string;
    requestedBy: string;
    responderId?: string | null;
    createdAt?: string;
    resolvedAt?: string | null;
    reason?: string | null;
    responderNote?: string | null;
    providerNote?: string | null;
    adminNote?: string | null;
    adminId?: string | null;
    resolutionOutcome?: string | null;
  }>;
  queuePosition?: number;
  queueEstimatedWait?: number;
  queueStatus?: string;
  queuePaymentStatus?: string;
}

export interface Transaction {
  id: string;
  jobId: string;
  seekerId: string;
  providerId: string;
  amount: number;
  paymentMethod: 'GCash' | 'On-site Cash';
  serviceTitle: string;
  createdAt: string; // exact date (YYYY-MM-DD)
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  link?: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterUserId: string;
  reporterUserName: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
