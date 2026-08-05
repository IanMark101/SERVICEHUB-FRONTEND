"use client";
import React, { useState } from 'react';
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
import { UserSession } from '../auth/LoginContainer';
import { useUserProfileState } from './useUserProfileState';

// Sub-components
import InstagramProfileHeader, { getTrustBand } from './InstagramProfileHeader';
import ProfileEditForm from './ProfileEditForm';
import PlayStoreReviewsSection from './PlayStoreReviewsSection';
import VerificationUpload from './VerificationUpload';

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
}: UserProfileProps) {
  const {
    isDark,
    toggleTheme,
    displayName,
    usernameHandle,
    responseRate,
    trustScore,
    trustHistory,
    verStatus,
    avatarUrl,
    bio,
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
  } = useUserProfileState({ targetUser, isOwnProfile, onProfileUpdated });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const trustBand = getTrustBand(trustScore);

  return (
    <div className={`max-w-5xl mx-auto space-y-6 transition-colors duration-200 ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
      
      {/* 🌟 Profile Hero Header */}
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
        />
      )}

      {/* 📌 Clean Tabbed Navigation Bar */}
      <div className={`p-1.5 rounded-2xl border ${cardBg} flex items-center gap-1 overflow-x-auto shadow-sm`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
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
              ? 'bg-emerald-600 text-white shadow-sm'
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
              ? 'bg-emerald-600 text-white shadow-sm'
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
              ? 'bg-emerald-600 text-white shadow-sm'
              : `${labelText} hover:bg-slate-100 dark:hover:bg-neutral-800`
          }`}
        >
          <ShieldCheck size={15} />
          <span>Verification</span>
          {verStatus === 'APPROVED' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* ------------------- TAB CONTENT SECTIONS ------------------- */}

      {/* TAB 1: OVERVIEW (Identity & Professional Info ONLY) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Info Card */}
          <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
              <User size={17} className="text-emerald-500" /> Identity Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Full Name</span>
                <span className={`font-bold ${headingText}`}>{displayName}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Username</span>
                <span className={`font-bold ${headingText}`}>{usernameHandle}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Location</span>
                <span className={`font-bold flex items-center gap-1 ${headingText}`}>
                  <MapPin size={13} className="text-rose-500" />
                  {location ? `${location}, Cordova` : 'Cordova, Cebu'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Member Since</span>
                <span className={`font-bold flex items-center gap-1 ${headingText}`}>
                  <Calendar size={13} className="text-emerald-500" />
                  {createdAt ? new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'Recently'}
                </span>
              </div>

              <div className="py-2 space-y-1">
                <span className={`block font-semibold ${labelText}`}>Bio & Description</span>
                <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  {bio || 'No bio specified.'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Details Card */}
          <div className={`${cardBg} rounded-[24px] p-6 border space-y-4`}>
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
              <Briefcase size={17} className="text-emerald-500" /> Professional Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Completed Bookings</span>
                <span className={`font-extrabold ${headingText}`}>{completedJobs} verified</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Average Client Rating</span>
                <span className="font-extrabold text-amber-500 flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {averageRating.toFixed(1)} / 5.0
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                <span className={labelText}>Trust Score</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${trustBand.bg} ${trustBand.color}`}>
                  {trustScore} — {trustBand.label}
                </span>
              </div>

              {role === 'provider' && (
                <>
                  <div className="py-2 border-b border-slate-200/60 dark:border-neutral-800 space-y-2">
                    <span className={labelText}>Service Categories</span>
                    {displayCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {displayCategories.map((cat: string) => (
                          <span key={cat} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${innerBg} ${headingText}`}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-[11px] italic ${labelText}`}>No active service listings published yet</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-neutral-800">
                    <span className={labelText}>Availability</span>
                    <span className={`font-semibold flex items-center gap-1 ${headingText}`}>
                      <Clock size={13} className="text-amber-500" />
                      {availability || 'Not specified'}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between py-2">
                <span className={labelText}>Languages</span>
                <span className={`font-semibold flex items-center gap-1 ${headingText}`}>
                  <Globe size={13} className="text-teal-500" />
                  {languages || 'English, Cebuano, Tagalog'}
                </span>
              </div>
            </div>
          </div>

          {/* 🚀 Posted Marketplace Activity Card */}
          <div className={`${cardBg} rounded-[24px] p-6 border space-y-4 md:col-span-2`}>
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center justify-between ${headingText}`}>
              <span className="flex items-center gap-2">
                <TrendingUp size={17} className="text-emerald-500" />
                {role === 'provider' ? 'Published Service Offerings & Bids' : 'Posted Service Requests'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${innerBg} ${labelText}`}>
                {role === 'provider' ? userServices.length + userBids.length : userRequests.length} total
              </span>
            </h3>

            {/* Provider Activity */}
            {role === 'provider' ? (
              <div className="space-y-3">
                {userServices.length === 0 && userBids.length === 0 ? (
                  <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-1`}>
                    <p className={`text-xs font-semibold ${headingText}`}>No published service offerings or bids yet.</p>
                    <p className={`text-[11px] ${labelText}`}>When this provider publishes a service listing or submits an offer to a seeker request, it will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userServices.map((srv: any) => (
                      <div key={srv.id} className={`p-3.5 rounded-2xl border ${innerBg} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {srv.category}
                          </span>
                          <span className={`text-xs font-black ${headingText}`}>₱{srv.price}</span>
                        </div>
                        <h4 className={`font-bold text-xs ${headingText} line-clamp-1`}>{srv.title}</h4>
                        <p className={`text-[11px] ${labelText} line-clamp-2`}>{srv.description}</p>
                      </div>
                    ))}

                    {userBids.map((bid: any) => (
                      <div key={bid.id} className={`p-3.5 rounded-2xl border ${innerBg} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Submitted Offer
                          </span>
                          <span className={`text-xs font-black ${headingText}`}>₱{bid.price}</span>
                        </div>
                        <h4 className={`font-bold text-xs ${headingText} line-clamp-1`}>{bid.message || 'Custom Service Offer'}</h4>
                        <p className={`text-[11px] ${labelText}`}>Status: <strong className="uppercase">{bid.status || 'PENDING'}</strong></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Seeker Activity */
              <div className="space-y-3">
                {userRequests.length === 0 ? (
                  <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-1`}>
                    <p className={`text-xs font-semibold ${headingText}`}>No service requests posted yet.</p>
                    <p className={`text-[11px] ${labelText}`}>When this user posts a service request or seeks assistance on ServiceHub Cordova, their active requests will post here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userRequests.map((req: any) => (
                      <div key={req.id} className={`p-3.5 rounded-2xl border ${innerBg} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-orange-500/10 text-orange-500 border border-orange-500/20">
                            {req.category}
                          </span>
                          <span className={`text-xs font-black ${headingText}`}>₱{req.budget}</span>
                        </div>
                        <h4 className={`font-bold text-xs ${headingText} line-clamp-1`}>{req.title}</h4>
                        <p className={`text-[11px] ${labelText} line-clamp-2`}>{req.description}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/40 dark:border-neutral-800">
                          <span className={labelText}>Urgency: {req.urgency || 'Normal'}</span>
                          <span className="font-extrabold text-emerald-500 uppercase">{req.status || 'OPEN'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REVIEWS (Reviews & Ratings ONLY) */}
      {activeTab === 'reviews' && (
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
          isOwnProfile={isOwnProfile}
        />
      )}

      {/* TAB 3: TRUST HISTORY (Explains how Trust Score was earned) */}
      {activeTab === 'trust' && (
        <div className={`${cardBg} rounded-[28px] p-6 sm:p-7 border space-y-6 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-neutral-800 pb-4">
            <div>
              <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
                <Award size={18} className="text-emerald-500" /> Trust Score Breakdown & History
              </h3>
              <p className={`text-xs ${labelText} mt-0.5`}>
                Chronological audit of how this account earned its trust score in Cordova.
              </p>
            </div>

            <div className={`px-4 py-2 rounded-2xl border ${innerBg} flex items-center gap-3 self-start sm:self-auto`}>
              <span className={`text-2xl font-black ${trustBand.color}`}>{trustScore}</span>
              <div className="text-left">
                <span className={`block text-[11px] font-extrabold uppercase tracking-wider ${trustBand.color}`}>
                  {trustBand.label}
                </span>
                <span className={`text-[10px] ${labelText}`}>Maximum: 100 pts</span>
              </div>
            </div>
          </div>

          {/* Trust Timeline Events */}
          <div className="space-y-4">
            {trustHistory.map((item: any, idx: number) => (
              <div key={idx} className={`p-4 rounded-2xl border ${innerBg} flex items-start justify-between gap-4 transition-all hover:scale-[1.005]`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    item.type === 'positive' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {item.delta}
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs ${headingText}`}>{item.label}</h4>
                    <p className={`text-[10px] ${labelText} mt-0.5`}>{item.date}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.type === 'positive' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.type === 'positive' ? 'Score Gain' : 'Penalty'}
                </span>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-2xl border ${innerBg} text-xs text-slate-500 dark:text-neutral-400 space-y-1`}>
            <p className="font-bold flex items-center gap-1 text-emerald-500">
              <TrendingUp size={14} /> How to increase your Trust Score:
            </p>
            <p className="text-[11px] leading-relaxed">
              Complete official Cordova residency verification (+25 pts), fulfill service bookings reliably (+5 pts each), and maintain 5-star client ratings (+2 pts each).
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION (Residency Verification ONLY) */}
      {activeTab === 'verification' && (
        <div className={`${cardBg} rounded-[28px] p-6 sm:p-7 border space-y-6 shadow-sm`}>
          <div className="border-b border-slate-200/80 dark:border-neutral-800 pb-4">
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
              <ShieldCheck size={18} className="text-emerald-500" /> Residency & Identity Verification
            </h3>
            <p className={`text-xs ${labelText} mt-0.5`}>
              Verify your official Cordova residency to unlock trusted provider and seeker status.
            </p>
          </div>

          {/* 1. APPROVED STATUS */}
          {verStatus === 'APPROVED' && (
            <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-3`}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                  APPROVED VERIFIED RESIDENT
                </span>
                <h4 className={`text-base font-extrabold ${headingText} pt-2`}>
                  You are a Verified Resident of Cordova!
                </h4>
                <p className={`text-xs ${labelText} max-w-md mx-auto leading-relaxed`}>
                  Your PhilSys ID and Barangay Residency documents have been officially reviewed and verified by Cordova Marketplace Administrators.
                </p>
              </div>
            </div>
          )}

          {/* 2. PENDING STATUS */}
          {(verStatus === 'PENDING' || verStatus === 'PENDING_REVIEW') && (
            <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-3`}>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                <Clock size={36} />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                  UNDER REVIEW
                </span>
                <h4 className={`text-base font-extrabold ${headingText} pt-2`}>
                  Verification Documents Submitted
                </h4>
                <p className={`text-xs ${labelText} max-w-md mx-auto leading-relaxed`}>
                  Your document photos are currently being reviewed by Cordova Administrators. Estimated review time: <strong className="text-amber-500">24 – 48 hours</strong>.
                </p>
              </div>
            </div>
          )}

          {/* 3. REJECTED STATUS */}
          {verStatus === 'REJECTED' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-3`}>
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
                  <XCircle size={36} />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                    VERIFICATION REJECTED
                  </span>
                  <h4 className={`text-base font-extrabold ${headingText} pt-2`}>
                    Document Photo Issues Detected
                  </h4>
                  <p className={`text-xs text-rose-500 max-w-md mx-auto leading-relaxed font-medium`}>
                    Reason: Uploaded photos were unreadable or incomplete. Please upload a clear photo of your government ID or Barangay certificate.
                  </p>
                </div>
              </div>

              {/* Resubmission Uploader */}
              {isOwnProfile && <VerificationUpload isDark={isDark} />}
            </div>
          )}

          {/* 4. UNVERIFIED STATUS */}
          {(verStatus === 'UNVERIFIED' || verStatus === 'NOT_SUBMITTED') && (
            <div className="space-y-6">
              <div className={`p-5 rounded-2xl border ${innerBg} space-y-2 text-xs`}>
                <div className="flex items-center gap-2 font-bold text-amber-500">
                  <AlertTriangle size={16} /> Residency Verification Requirements:
                </div>
                <p className={`${labelText} leading-relaxed`}>
                  Upload clear photos of official documents (PhilSys ID, Driver's License, Barangay Certificate, or Utility Bill) to verify your Cordova address.
                </p>
              </div>

              {/* Document Uploader */}
              {isOwnProfile && <VerificationUpload isDark={isDark} />}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
