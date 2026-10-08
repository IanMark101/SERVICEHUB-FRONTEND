"use client";
import React from 'react';
import Link from 'next/link';
import { Award, MessageSquare, ShieldCheck, User, UserRoundX } from 'lucide-react';
import { UserSession } from '../auth/LoginContainer';
import { useUserProfile } from '../../hooks/useUserProfile';

// Sub-components
import ProfileHeader, { getTrustBand } from './ProfileHeader';
import ProfileEditForm from './ProfileEditForm';
import PhonePasswordConfirmModal from './PhonePasswordConfirmModal';
import UserProfileTabs from './user-profile/UserProfileTabs';
import WorkspaceTabs from '../ui/WorkspaceTabs';
import MarketplaceProfileOverview from './MarketplaceProfileOverview';
import ProfilePageSkeleton from './ProfilePageSkeleton';
import type { ProfileReviewContext } from '../../types/reviews';

interface UserProfileProps {
  targetUser: UserSession;
  isOwnProfile?: boolean;
  initialTab?: 'overview' | 'reviews' | 'trust' | 'verification' | 'settings';
  initialReviewContext?: ProfileReviewContext;
  onProfileUpdated?: (updated: Partial<UserSession>) => void;
  onTriggerVerification?: () => void;
  variant?: 'workspace' | 'marketplace';
}

export default function UserProfile({
  targetUser,
  isOwnProfile = false,
  initialTab,
  initialReviewContext,
  onProfileUpdated,
  variant = 'workspace',
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
    loading,
    profileLoadError,
  } = profile;

  const trustBand = getTrustBand(trustScore);

  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const accentColor = isProvider ? 'text-emerald-500' : isAdmin ? 'text-blue-500' : 'text-orange-500';
  const tabTone = isProvider ? 'provider' : isAdmin ? 'neutral' : 'seeker';

  if (loading && variant === 'marketplace') {
    return <ProfilePageSkeleton isOwnProfile={isOwnProfile} displayName={displayName} usernameHandle={usernameHandle} location={location} />;
  }

  if (profileLoadError && variant === 'marketplace') {
    return (
      <section className="mx-auto flex min-h-[24rem] max-w-2xl flex-col items-center justify-center rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] px-6 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-[color:var(--workspace-surface-muted)] text-[color:var(--workspace-muted)]" aria-hidden="true"><UserRoundX size={25} /></span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.035em] text-[color:var(--workspace-ink)]">Profile unavailable</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--workspace-muted)]">This marketplace profile could not be found or is not available right now.</p>
        <Link href="/seeker/seek-services" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[color:var(--workspace-ink)] px-4 text-sm font-semibold text-[color:var(--workspace-surface)]">Browse ServiceHub</Link>
      </section>
    );
  }

  return (
    <div className={`${variant === 'marketplace' ? 'mx-auto max-w-[1180px] space-y-5' : 'mx-auto max-w-5xl space-y-4'} transition-colors duration-200 ${isDark ? 'text-white' : 'text-ink'}`}>
      {profile.profileRefreshError && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] px-5 py-3 text-sm text-[color:var(--workspace-muted)]">
          <p>Couldn’t refresh this profile. Showing the last loaded details.</p>
          <button type="button" onClick={profile.retryProfile} className="min-h-11 px-3 font-semibold text-[color:var(--workspace-focus)]">Try again</button>
        </div>
      )}
      
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
        variant={variant}
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
        className={variant === 'marketplace' ? 'marketplace-profile-tabs' : ''}
        idPrefix="marketplace-profile"
        items={[
          { value: 'overview', label: 'Overview', icon: <User size={16} /> },
          { value: 'reviews', label: 'Reviews', count: profile.reviewCount, icon: <MessageSquare size={16} /> },
          { value: 'trust', label: 'Trust History', icon: <Award size={16} /> },
          {
            value: 'verification',
            label: isOwnProfile ? 'Verification' : 'Verification Status',
            icon: <ShieldCheck size={16} />,
          },
        ]}
      />

      <div
        role="tabpanel"
        id={`marketplace-profile-panel-${activeTab}`}
        aria-labelledby={`marketplace-profile-tab-${activeTab}`}
        tabIndex={0}
      >
        {variant === 'marketplace' && activeTab === 'overview' ? (
          <MarketplaceProfileOverview model={profile} />
        ) : variant === 'marketplace' && activeTab === 'verification' ? (
          <section className="profile-section">
            <h2 className="text-lg font-bold">Cordova residency</h2>
            <p className="mt-3 text-sm font-semibold">{verStatus === 'APPROVED' ? 'Verified Cordova resident' : 'Residency not yet verified'}</p>
            <p className="mt-2 text-sm text-[color:var(--workspace-muted)]">Only verification status is shared on this profile. Identity documents remain private.</p>
            {isOwnProfile && <Link href="/account/settings#verification" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[color:var(--workspace-focus)]">Manage your verification</Link>}
          </section>
        ) : (
          <UserProfileTabs
            model={{
              ...profile,
              targetUser,
              isOwnProfile,
              trustBand,
              isProvider,
              isAdmin,
              accentColor,
              initialReviewContext,
            }}
          />
        )}
      </div>

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
