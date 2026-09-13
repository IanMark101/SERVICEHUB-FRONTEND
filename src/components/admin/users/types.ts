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
