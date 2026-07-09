export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
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
  verificationStatus?: 'UNVERIFIED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  emailVerified?: boolean;
  isActive?: boolean;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  title: string;
  category: string;
  description: string;
  price: number;
  queueSize: number;
  isPaused: boolean;
  proofOfSkillUrl: string; // Proof uploaded for verification
  rating: number;
  paymentMethods?: {
    cash: boolean;
    gcash: boolean;
    maya?: boolean;
  };
}

export interface JobRequest {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerAvatar: string;
  title: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  budget: number;
  description: string;
  status: 'open' | 'paused' | 'filled';
  createdAt: string;
}

export interface Bid {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface JobEngagement {
  id: string;
  title: string;
  seekerId: string;
  seekerName: string;
  seekerAvatar: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  serviceId: string | null; // null if matched from public bid
  price: number;
  status: 'pending_provider' | 'queued' | 'in_progress' | 'awaiting_seeker_approval' | 'completed' | 'disputed' | 'canceled';
  paymentMethod: 'GCash' | 'On-site Cash';
  createdAt: string;
  completedServiceId?: string;
  reviews?: any[];
  completedAt?: string;
  disputeReason?: string;
  started?: boolean;
  cancellationRequests?: any[];
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

export interface CategorySuggestion {
  id: string;
  name: string;
  description: string;
  suggestedBy: string; // Seeker name
  status: 'pending' | 'approved' | 'rejected';
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
