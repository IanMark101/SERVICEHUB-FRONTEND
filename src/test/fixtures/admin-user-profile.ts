import type { AdminUserProfileData } from '@/components/admin/users/types';
export const adminProfileFixture: AdminUserProfileData = {
  user: { id: 'member-1', name: 'Alex Reyes', email: 'alex@example.test', phone: '09123456789', role: 'user',
    trustScore: 79, verificationStatus: 'APPROVED', emailVerified: true, isActive: true, moderationStatus: 'ACTIVE',
    postingSuspended: false, createdAt: '2026-09-01T08:00:00Z', avatarUrl: null, bio: 'Home maintenance services in Cordova.',
    location: 'Cordova, Cebu', facebookUrl: null, instagramUrl: null, websiteUrl: null, deactivatedAt: null },
  activity: { completedAsProvider: 3, completedAsSeeker: 1, services: 2, requests: 1, bookings: 4 },
  ratings: { provider: { average: 4.7, count: 3 }, seeker: { average: 5, count: 1 } },
};
