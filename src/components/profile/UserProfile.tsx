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
import WorkspaceTabs from '../ui/WorkspaceTabs';

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
  const tabTone = isProvider ? 'provider' : isAdmin ? 'neutral' : 'seeker';

  return (
    <div className={`max-w-5xl mx-auto space-y-4 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
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
        isOwnProfile={isOwnProfile}
        showEdit={showEdit}
        setShowEdit={setShowEdit}
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

      <WorkspaceTabs
        activeValue={activeTab}
        onChange={setActiveTab}
        ariaLabel="Profile sections"
        tone={tabTone}
        items={[
          { value: 'overview', label: 'Overview', icon: <User size={16} /> },
          { value: 'reviews', label: 'Reviews', count: reviews.length, icon: <MessageSquare size={16} /> },
          { value: 'trust', label: 'Trust History', icon: <Award size={16} /> },
          {
            value: 'verification',
            label: isOwnProfile ? 'Verification' : 'Verification Status',
            icon: <ShieldCheck size={16} />,
          },
        ]}
      />

      <UserProfileTabs
        model={{
          ...profile,
          targetUser,
          isOwnProfile,
          trustBand,
          isProvider,
          isAdmin,
          accentColor
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
