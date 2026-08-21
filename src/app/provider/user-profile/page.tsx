"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import UserProfile from '../../../components/profile/UserProfile';

function ProfileContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const tabParam = searchParams.get('tab') as any;
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
        role: dbUser.role as any,
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
