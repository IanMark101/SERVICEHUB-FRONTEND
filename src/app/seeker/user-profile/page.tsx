"use client";
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import UserProfile from '../../../components/UserProfile';
import VerificationUpload from '../../../components/VerificationUpload';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const verifyParam = searchParams.get('verify');
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
        role: 'seeker',
        avatarUrl: '',
        bio: '',
        phone: '',
      };
    }
  }

  useEffect(() => {
    if (verifyParam === 'true') {
      setShowVerification(true);
      setTimeout(() => {
        const el = document.getElementById('verification-section-anchor');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [verifyParam]);

  if (!targetUser) return null;

  const isOwnProfile = !targetId || targetId === user?.id;
  const needsVerification = isOwnProfile && targetUser.verificationStatus !== 'APPROVED';

  const handleTriggerVerification = () => {
    setShowVerification(true);
    setTimeout(() => {
      const el = document.getElementById('verification-section-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      <UserProfile
        targetUser={targetUser}
        isOwnProfile={isOwnProfile}
        onTriggerVerification={handleTriggerVerification}
      />

      {/* Verification Banner — only shown to seeker on their own profile */}
      {isOwnProfile && (
        <div id="verification-section-anchor" className="scroll-mt-6">
          <button
            onClick={() => setShowVerification(prev => !prev)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-all ${isDark
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
                      : 'Residency Verification — Required to book services'
                  : '✅ Verified Resident — You are eligible to book services'}
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
