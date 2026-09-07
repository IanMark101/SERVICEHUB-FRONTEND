"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import UserProfile from '../../../components/profile/UserProfile';

type ProfileTab = 'overview' | 'reviews' | 'trust' | 'verification' | 'settings';
const PROFILE_TABS: ProfileTab[] = ['overview', 'reviews', 'trust', 'verification', 'settings'];

function ProfileContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const rawTab = searchParams.get('tab');
  const tabParam = PROFILE_TABS.includes(rawTab as ProfileTab) ? rawTab as ProfileTab : undefined;
  const { user, users } = useApp();

  let targetUser = user;

  if (targetId && targetId !== user?.id) {
    const dbUser = users.find(u => u.id === targetId);
    if (dbUser) {
      targetUser = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        avatarUrl: dbUser.avatarUrl,
        bio: dbUser.bio,
        phone: dbUser.phone,
        trustScore: dbUser.trustScore,
        verificationStatus: dbUser.verificationStatus,
        emailVerified: dbUser.emailVerified
      };
    } else {
      targetUser = {
        id: targetId,
        email: '',
        firstName: '',
        lastName: '',
        role: 'provider',
        avatarUrl: '',
        bio: '',
        phone: '',
      };
    }
  }

  if (!targetUser) return null;

  const isOwnProfile = !targetId || targetId === user?.id;

  return (
    <div>
      <UserProfile
        key={targetId || user?.id || 'profile'}
        targetUser={targetUser}
        isOwnProfile={isOwnProfile}
        initialTab={tabParam || undefined}
      />
    </div>
  );
}

export default function ProviderUserProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
