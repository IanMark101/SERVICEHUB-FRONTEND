"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import UserProfile from '../../../components/UserProfile';
import { UserSession } from '../../../components/auth/LoginContainer';

function ProfileContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
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
    }
  }

  if (!targetUser) return null;

  return <UserProfile targetUser={targetUser} />;
}

export default function SeekerUserProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
