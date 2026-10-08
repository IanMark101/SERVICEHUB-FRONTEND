"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { useRouteGuard } from '../../../hooks/useRouteGuard';
import type { UserSession } from '../../../components/auth/LoginContainer';
import UserProfile from '../../../components/profile/UserProfile';
import ProfilePageShell from '../../../components/profile/ProfilePageShell';
import ProfilePageSkeleton from '../../../components/profile/ProfilePageSkeleton';

type ProfileTab = 'overview' | 'reviews' | 'trust' | 'verification';
const PROFILE_TABS: ProfileTab[] = ['overview', 'reviews', 'trust', 'verification'];

export default function MarketplaceProfilePage() {
  const params = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const { user, users } = useApp();
  const { shouldRender } = useRouteGuard(['user']);
  const targetId = params.userId || '';
  const rawTab = searchParams.get('tab');
  const initialTab = PROFILE_TABS.includes(rawTab as ProfileTab) ? rawTab as ProfileTab : 'overview';
  const rawReviewRole = searchParams.get('reviewRole');
  const initialReviewContext = rawReviewRole === 'seeker' ? 'SEEKER' : rawReviewRole === 'provider' ? 'PROVIDER' : undefined;

  if (!shouldRender || !user || !targetId) {
    return <ProfilePageShell><ProfilePageSkeleton /></ProfilePageShell>;
  }

  const knownUser = users.find((candidate) => candidate.id === targetId);
  const targetUser: UserSession = targetId === user.id
    ? user
    : {
        id: targetId,
        email: knownUser?.email || '',
        firstName: knownUser?.firstName || '',
        lastName: knownUser?.lastName || '',
        role: knownUser?.role || 'seeker',
        avatarUrl: knownUser?.avatarUrl || '',
        bio: knownUser?.bio || '',
        phone: knownUser?.phone || '',
        location: knownUser?.location,
        trustScore: knownUser?.trustScore,
        verificationStatus: knownUser?.verificationStatus,
        emailVerified: knownUser?.emailVerified,
        isActive: knownUser?.isActive,
      };

  return (
    <ProfilePageShell>
      <UserProfile
        key={targetId}
        targetUser={targetUser}
        isOwnProfile={targetId === user.id}
        initialTab={initialTab}
        initialReviewContext={initialReviewContext}
        variant="marketplace"
      />
    </ProfilePageShell>
  );
}
