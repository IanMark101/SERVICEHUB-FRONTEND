"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Star,
  ShieldCheck,
  Award,
  Settings,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Bell,
  Moon,
  Sun,
  Trash2,
  Shield,
  MessageSquare,
  TrendingUp,
  Check,
} from 'lucide-react';

const FacebookIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
import { UserSession } from '../auth/LoginContainer';
import { useUserProfile } from '../../hooks/useUserProfile';

// Sub-components
import ProfileHeader, { getTrustBand } from './ProfileHeader';
import ProfileEditForm from './ProfileEditForm';
import ProfileReviewsSection from './ProfileReviewsSection';
import VerificationUpload from './VerificationUpload';
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
    toggleTheme,
    displayName,
    usernameHandle,
    responseRate,
    trustScore,
    trustHistory,
    trustHistoryLoading,
    isViewerVerified,
    verStatus,
    avatarUrl,
    bio,
    facebookUrl,
    instagramUrl,
    websiteUrl,
    location,
    phone,
    email,
    role,
    availability,
    languages,
    createdAt,
    completedJobs,
    averageRating,
    ratingDistribution,
    reviews,
    displayCategories,
    userServices,
    userRequests,
    userBids,
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
    pwForm,
    setPwForm,
    pwSaving,
    handleChangePassword,
    emailNotifications,
    setEmailNotifications,
    pushNotifications,
    setPushNotifications,
    publicProfileVisible,
    setPublicProfileVisible,
    cardBg,
    innerBg,
    labelText,
    headingText,
    inputClass,
  } = profile;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
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
