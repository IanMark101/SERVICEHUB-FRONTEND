export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  trustScore: number;
  verificationStatus: string;
  emailVerified: boolean;
  isActive: boolean;
  moderationStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  suspendedUntil?: string | null;
  moderationReason?: string | null;
  postingSuspended: boolean;
  postingSuspendReason?: string | null;
  createdAt: string;
}

export interface AdminUserProfileData {
  user: AdminUserItem & { avatarUrl: string | null; bio: string | null; location: string | null;
    facebookUrl: string | null; instagramUrl: string | null; websiteUrl: string | null; deactivatedAt: string | null };
  activity: { completedAsProvider: number; completedAsSeeker: number; services: number; requests: number; bookings: number };
  ratings: { provider: { average: number | null; count: number }; seeker: { average: number | null; count: number } };
}
export type UserRecordKind = 'trust' | 'reviews' | 'moderation' | 'services' | 'requests' | 'bookings';
export interface AdminUserRecord {
  id: string; title: string; createdAt: string; description?: string | null; status?: string;
  delta?: number; scoreBefore?: number; scoreAfter?: number; actorName?: string;
  rating?: number; reviewContext?: string; moderationReason?: string | null; amount?: number; link?: string;
}
export interface AdminUserRecordsResponse {
  data: AdminUserRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function adminUsersReturnPath(value: string | null) {
  return value && /^\/admin\/(users|ban-appeals)(\?|$)/.test(value) ? value : '/admin/users';
}
