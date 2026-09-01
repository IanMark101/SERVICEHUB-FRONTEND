export interface TopProvider {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string | null;
  trustScore: number;
  verificationStatus: string;
  completedJobs: number;
  avgRating: number | null;
  reviewCount: number;
  primaryService: string | null;
}

export interface CommunityStatsData {
  totalCompleted: number;
  verifiedUsers: number;
  activeProviders: number;
  activeListings: number;
}

export interface RecentCategory {
  id: string;
  name: string;
  description: string;
  reviewedAt: string;
}

export interface RecentService {
  id: string;
  title: string;
  description: string;
  price: string | number;
  priceType: 'FIXED' | 'STARTS_AT' | 'PER_HOUR' | 'PER_SESSION';
  serviceType: 'ONE_TIME' | 'SESSION_BASED';
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
    avatarUrl: string | null;
    trustScore: number;
    verificationStatus: string;
  };
}

export interface CommunityAnnouncement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  author: {
    name: string;
  };
}

export interface CommunityHubData {
  leaderboard: TopProvider[];
  stats: CommunityStatsData;
  recentCategories: RecentCategory[];
  announcements: CommunityAnnouncement[];
  leaderboardPeriod: {
    start: string;
    end: string;
  };
}
