"use client";
import React from 'react';
import { UserSession } from './auth/LoginContainer';
import { useUserProfileState } from './profile/useUserProfileState';

// Hero Profile Components
import InstagramProfileHeader from './profile/InstagramProfileHeader';
import ProfileEditForm from './profile/ProfileEditForm';
import PlayStoreReviewsSection from './profile/PlayStoreReviewsSection';

interface UserProfileProps {
  targetUser: UserSession;
  isOwnProfile?: boolean;
  onProfileUpdated?: (updated: Partial<UserSession>) => void;
  onTriggerVerification?: () => void;
}

export default function UserProfile({
  targetUser,
  isOwnProfile = false,
  onProfileUpdated,
  onTriggerVerification
}: UserProfileProps) {
  const {
    isDark,
    displayName,
    usernameHandle,
    responseRate,
    trustScore,
    verStatus,
    avatarUrl,
    bio,
    location,
    role,
    createdAt,
    completedJobs,
    averageRating,
    reviews,
    showEdit,
    setShowEdit,
    editForm,
    setEditForm,
    saving,
    handleSaveProfile,
    handleShareProfile,
    cardBg,
    innerBg,
    labelText,
    headingText,
    inputClass,
  } = useUserProfileState({ targetUser, isOwnProfile, onProfileUpdated });

  return (
    <div className={`max-w-6xl mx-auto space-y-6 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* 🌟 Simple Profile Hero Section */}
      <InstagramProfileHeader
        displayName={displayName}
        usernameHandle={usernameHandle}
        avatarUrl={avatarUrl}
        role={role}
        verStatus={verStatus}
        location={location}
        bio={bio}
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

      {/* ✏️ Profile Edit Drawer (When Edit Profile button is clicked) */}
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
        />
      )}

      {/* ⭐ Google PlayStore-Style Interactive Ratings & Reviews Section */}
      <PlayStoreReviewsSection
        initialReviews={reviews.map((r: any) => ({
          id: r.id,
          authorName: r.author?.name || r.authorName || 'Verified Client',
          authorAvatar: r.author?.avatarUrl || r.authorAvatar,
          rating: r.rating || 5,
          comment: r.text || r.comment || '',
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          helpfulCount: 5,
        }))}
        isDark={isDark}
        cardBg={cardBg}
        innerBg={innerBg}
        labelText={labelText}
        headingText={headingText}
      />

    </div>
  );
}
