"use client";
import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import UserProfile from '../../../components/UserProfile';
import VerificationUpload from '../../../components/VerificationUpload';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const { user, users, isDark } = useApp();
  const [showVerification, setShowVerification] = useState(false);

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

  const isOwnProfile = !targetId || targetId === user?.id;
  const isProvider = user?.role === 'provider';
  const needsVerification = isOwnProfile && isProvider && targetUser.verificationStatus !== 'APPROVED';

  return (
    <div className="space-y-6">
      <UserProfile targetUser={targetUser} />

      {/* Verification Banner — only shown to the provider on their own profile */}
      {isOwnProfile && isProvider && (
        <div>
          <button
            onClick={() => setShowVerification(prev => !prev)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-all ${
              isDark
                ? 'bg-[#1c1b18] border-neutral-800/70 text-[#f2efe9] hover:bg-neutral-800/40'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield size={16} className={needsVerification ? 'text-amber-500' : 'text-emerald-500'} />
              <span>
                {needsVerification
                  ? targetUser.verificationStatus === 'PENDING_REVIEW'
                    ? 'Verification Under Review — Admin is reviewing your documents'
                    : targetUser.verificationStatus === 'REJECTED'
                      ? 'Verification Rejected — Please resubmit documents'
                      : 'Identity Verification — Required to publish listings'
                  : '✅ Verified Provider — Your listings are eligible for approval'}
              </span>
            </div>
            {showVerification ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showVerification && needsVerification && (
            <div className="mt-3">
              <VerificationUpload isDark={isDark} onClose={() => setShowVerification(false)} />
            </div>
          )}
        </div>
      )}
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
