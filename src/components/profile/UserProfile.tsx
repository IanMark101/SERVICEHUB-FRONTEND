"use client";
import React from 'react';
import { Award, MessageSquare, ShieldCheck, User } from 'lucide-react';
import { UserSession } from '../auth/LoginContainer';
import { useUserProfile } from '../../hooks/useUserProfile';

// Sub-components
import ProfileHeader, { getTrustBand } from './ProfileHeader';
import ProfileEditForm from './ProfileEditForm';
import PhonePasswordConfirmModal from './PhonePasswordConfirmModal';
import UserProfileTabs from './user-profile/UserProfileTabs';

interface UserProfileProps {
  targetUser: UserSession;
  isOwnProfile?: boolean;
  initialTab?: 'overview' | 'reviews' | 'trust' | 'verification' | 'settings';
  onProfileUpdated?: (updated: Partial<UserSession>) => void;
  onTriggerVerification?: () => void;
}

export default function UserProfile({
  targetUser,
  isOwnProfile = false,
  initialTab,
  onProfileUpdated,
}: UserProfileProps) {
  const profile = useUserProfile({ targetUser, isOwnProfile, initialTab, onProfileUpdated });
  const {
    isDark,
    displayName,
    usernameHandle,
    responseRate,
    trustScore,
    verStatus,
    avatarUrl,
    bio,
    facebookUrl,
    instagramUrl,
    websiteUrl,
    location,
    phone,
    role,
    createdAt,
    completedJobs,
    averageRating,
    reviews,
    activeTab,
    setActiveTab,
    showEdit,
    setShowEdit,
    editForm,
    setEditForm,
    saving,
    handleSaveProfile,
    hasActiveEngagements,
    phonePasswordModalOpen,
    setPhonePasswordModalOpen,
    phonePasswordError,
    handleShareProfile,
    cardBg,
    innerBg,
    labelText,
    headingText,
    inputClass,
  } = profile;

  const trustBand = getTrustBand(trustScore);

  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const accentColor = isProvider ? 'text-emerald-500' : isAdmin ? 'text-blue-500' : 'text-orange-500';
  const activeTabBg = isProvider ? 'bg-emerald-600 text-white shadow-sm' : isAdmin ? 'bg-blue-600 text-white shadow-sm' : 'bg-orange-600 text-white shadow-sm';

  return (
    <div className={`max-w-5xl mx-auto space-y-6 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* 🌟 Profile Hero Header */}
      <ProfileHeader
        displayName={displayName}
        usernameHandle={usernameHandle}
        avatarUrl={avatarUrl}
        role={role}
        verStatus={verStatus}
        location={location}
        bio={bio}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        websiteUrl={websiteUrl}
        trustScore={trustScore}
        createdAt={createdAt}
        completedJobs={completedJobs}
        averageRating={averageRating}
        responseRate={responseRate}
        isOwnProfile={isOwnProfile}
        showEdit={showEdit}
        setShowEdit={setShowEdit}
        handleShareProfile={handleShareProfile}
        isDark={isDark}
        cardBg={cardBg}
        innerBg={innerBg}
        labelText={labelText}
        headingText={headingText}
      />

      {/* ✏️ Profile Edit Drawer (Toggled from Hero Button) */}
      {isOwnProfile && showEdit && (
        <ProfileEditForm
          editForm={editForm}
          setEditForm={setEditForm}
          setShowEdit={setShowEdit}
          handleSaveProfile={handleSaveProfile}
          saving={saving}
          isDark={isDark}
          cardBg={cardBg}
          labelText={labelText}
          headingText={headingText}
          inputClass={inputClass}
          role={role}
          hasActiveEngagements={hasActiveEngagements}
        />
      )}

      {/* 📌 Clean Tabbed Navigation Bar */}
      <div className={`p-1.5 rounded-2xl border ${cardBg} flex items-center gap-1 overflow-x-auto shadow-sm`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? activeTabBg
              : `${labelText} hover:bg-slate-100 dark:hover:bg-neutral-800`
          }`}
        >
          <User size={15} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reviews'
              ? activeTabBg
              : `${labelText} hover:bg-slate-100 dark:hover:bg-neutral-800`
          }`}
        >
          <MessageSquare size={15} />
          <span>Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trust')}
          className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'trust'
              ? activeTabBg
              : `${labelText} hover:bg-slate-100 dark:hover:bg-neutral-800`
          }`}
        >
          <Award size={15} />
          <span>Trust History</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'verification'
              ? activeTabBg
              : `${labelText} hover:bg-slate-100 dark:hover:bg-neutral-800`
          }`}
        >
          <ShieldCheck size={15} />
          <span>{isOwnProfile ? 'Verification' : 'Verification Status'}</span>
          {verStatus === 'APPROVED' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      <UserProfileTabs
        model={{
          ...profile,
          targetUser,
          isOwnProfile,
          trustBand,
          isProvider,
          isAdmin,
          accentColor,
          activeTabBg
        }}
      />

      {/* Phone Password Confirmation Modal */}
      <PhonePasswordConfirmModal
        isOpen={phonePasswordModalOpen}
        onClose={() => setPhonePasswordModalOpen(false)}
        oldPhone={phone || targetUser?.phone || ''}
        newPhone={editForm.phone}
        onConfirm={(password) => handleSaveProfile(password)}
        isLoading={saving}
        error={phonePasswordError}
      />
    </div>
  );
}
