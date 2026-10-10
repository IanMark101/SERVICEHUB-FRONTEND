"use client";

import { formatRequestUrgency } from '../../../lib/requestUrgency';
import {
  User,
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import ProfileReviewsSection from '../ProfileReviewsSection';
import TrustHistorySection from '../TrustHistorySection';
import VerificationUpload from '../VerificationUpload';
import type { useUserProfile } from '../../../hooks/useUserProfile';
import type { UserSession } from '../../auth/LoginContainer';
import type { getTrustBand } from '../ProfileHeader';
import type { ProfileReviewContext } from '../../../types/reviews';

interface UserProfileTabsModel extends ReturnType<typeof useUserProfile> {
  targetUser: UserSession;
  isOwnProfile: boolean;
  trustBand: ReturnType<typeof getTrustBand>;
  isProvider: boolean;
  isAdmin: boolean;
  accentColor: string;
  initialReviewContext?: ProfileReviewContext;
}

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

export default function UserProfileTabs({ model }: { model: UserProfileTabsModel }) {
  const {
    activeTab, isDark, cardBg, innerBg, labelText, headingText,
    displayName, usernameHandle, trustScore, trustHistory,
    trustHistoryLoading, trustHistoryError, retryTrustHistory, isViewerVerified, verStatus, bio, facebookUrl,
    instagramUrl, websiteUrl, location, role, availability,
    languages, createdAt, completedJobs, averageRating,
    reviews, reviewStats, displayCategories, userServices, userRequests,
    isOwnProfile, trustBand, accentColor, initialReviewContext
  } = model;

  return (
    <>
      {/* ------------------- TAB CONTENT SECTIONS ------------------- */}

      {/* TAB 1: OVERVIEW (Identity & Professional Info ONLY) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Info Card */}
          <div className={`${cardBg} rounded-2xl p-5 sm:p-6 border space-y-4`}>
            <h3 className={`flex items-center gap-2 text-base font-bold ${headingText}`}>
              <User size={17} className={accentColor} /> Identity Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Full Name</span>
                <span className={`font-bold ${headingText}`}>{displayName}</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Username</span>
                <span className={`font-bold ${headingText}`}>{usernameHandle}</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Location</span>
                <span className={`font-bold flex items-center gap-1 ${headingText}`}>
                  <MapPin size={13} className="text-rose-500" />
                  {location || 'Location not provided'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Member Since</span>
                <span className={`font-bold flex items-center gap-1 ${headingText}`}>
                  <Calendar size={13} className="text-emerald-500" />
                  {createdAt ? new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'Recently'}
                </span>
              </div>

              <div className="py-2 space-y-1">
                <span className={`block font-semibold ${labelText}`}>Bio & Description</span>
                <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-ink-secondary'}`}>
                  {bio || 'No bio specified.'}
                </p>
              </div>

              {(facebookUrl || instagramUrl || websiteUrl) && (
                <div className="space-y-1.5 border-t border-[color:var(--workspace-border)] py-2">
                  <span className={`block font-semibold ${labelText}`}>Social Media & Links</span>
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {facebookUrl && (
                      <a
                        href={facebookUrl.startsWith('http') ? facebookUrl : `https://${facebookUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                      >
                        <FacebookIcon size={13} /> Facebook
                      </a>
                    )}
                    {instagramUrl && (
                      <a
                        href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors"
                      >
                        <InstagramIcon size={13} /> Instagram
                      </a>
                    )}
                    {websiteUrl && (
                      <a
                        href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Globe size={13} /> Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Details Card */}
          <div className={`${cardBg} rounded-2xl p-5 sm:p-6 border space-y-4`}>
            <h3 className={`flex items-center gap-2 text-base font-bold ${headingText}`}>
              <Briefcase size={17} className={accentColor} /> Professional Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Completed Bookings</span>
                <span className={`font-extrabold ${headingText}`}>{completedJobs} verified</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Provider rating</span>
                <span className="font-extrabold text-amber-500 flex items-center gap-1">
                  {averageRating > 0 ? (
                    <><Star size={14} className="fill-amber-400 text-amber-400" />{averageRating.toFixed(1)} / 5.0</>
                  ) : <span className={labelText}>No provider ratings yet</span>}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--workspace-border)] py-2">
                <span className={labelText}>Trust Score</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${trustBand.bg} ${trustBand.color}`}>
                  {trustScore} · {trustBand.label}
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
          <div className={`${cardBg} rounded-2xl p-5 sm:p-6 border space-y-4 md:col-span-2`}>
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center justify-between ${headingText}`}>
              <span className="flex items-center gap-2">
                <TrendingUp size={17} className={accentColor} />
                {role === 'provider' ? 'Published Service Offerings' : 'Posted Service Requests'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${innerBg} ${labelText}`}>
                {role === 'provider' ? userServices.length : userRequests.length} total
              </span>
            </h3>

            {/* Provider Activity */}
            {role === 'provider' ? (
              <div className="space-y-3">
                {userServices.length === 0 ? (
                  <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-1`}>
                    <p className={`text-xs font-semibold ${headingText}`}>No published service offerings yet.</p>
                    <p className={`text-[11px] ${labelText}`}>When this provider publishes a service listing, it will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userServices.map((srv) => (
                      <div key={srv.id} className={`p-3.5 rounded-2xl border ${innerBg} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {srv.category}
                          </span>
                          <span className={`text-xs font-black ${headingText}`}>₱{srv.price}</span>
                        </div>
                        <h4 className={`uppercase font-bold text-xs ${headingText} line-clamp-1`}>{srv.title}</h4>
                        <p className={`text-[11px] ${labelText} line-clamp-2`}>{srv.description}</p>
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
                    <p className={`text-[11px] ${labelText}`}>When this user posts a service request or seeks assistance on ServiceHub, their active requests will post here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userRequests.map((req) => (
                      <div key={req.id} className={`p-3.5 rounded-2xl border ${innerBg} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-orange-500/10 text-brand-text border border-orange-500/20">
                            {req.category}
                          </span>
                          <span className={`text-xs font-black ${headingText}`}>₱{req.budget}</span>
                        </div>
                        <h4 className={`uppercase font-bold text-xs ${headingText} line-clamp-1`}>{req.title}</h4>
                        <p className={`text-[11px] ${labelText} line-clamp-2`}>{req.description}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/40 dark:border-neutral-800">
                          <span className={labelText}>Urgency: {formatRequestUrgency(req.urgency)}</span>
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
        <ProfileReviewsSection
          initialReviewContext={initialReviewContext}
          key={model.targetUser.id}
          reviewStats={reviewStats}
          initialReviews={reviews.map((r) => ({
            id: r.id,
            authorName: r.author?.name || r.authorName || 'Booking participant',
            authorAvatar: r.author?.avatarUrl || r.authorAvatar,
            rating: r.rating,
            reviewContext: r.reviewContext,
            comment: r.text || r.comment || '',
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          }))}
          isDark={isDark}
          cardBg={cardBg}
          innerBg={innerBg}
          labelText={labelText}
          headingText={headingText}
          isOwnProfile={isOwnProfile}
          isVerified={isViewerVerified}
          canReview={isViewerVerified && !isOwnProfile && completedJobs > 0}
          reviewActivityHref={role === 'provider' ? '/provider/activity' : '/seeker/activity'}
        />
      )}

      {/* TAB 3: TRUST HISTORY (Explains how Trust Score was earned) */}
      {activeTab === 'trust' && <TrustHistorySection events={trustHistory} loading={trustHistoryLoading} error={trustHistoryError} onRetry={retryTrustHistory} score={trustScore} band={trustBand} isDark={isDark} />}

      {/* TAB 4: VERIFICATION (Residency Verification) */}
      {activeTab === 'verification' && (
        <div className={`${cardBg} rounded-2xl p-5 sm:p-6 border space-y-6 shadow-sm`}>
          <div className="border-b border-slate-200/80 dark:border-neutral-800 pb-4">
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
              <ShieldCheck size={18} className={verStatus === 'APPROVED' ? "text-emerald-500" : "text-amber-500"} />
              {isOwnProfile ? 'Residency & Identity Verification' : `${displayName}'s Verification Status`}
            </h3>
            <p className={`text-xs ${labelText} mt-0.5`}>
              {isOwnProfile
                ? 'Verify your official residency to unlock trusted provider and seeker status.'
                : `Official identity and residency credentials for ${displayName}.`}
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
                  {isOwnProfile ? 'You are a verified ServiceHub member!' : `${displayName} is a verified ServiceHub member!`}
                </h4>
                <p className={`text-xs ${labelText} max-w-md mx-auto leading-relaxed`}>
                  {isOwnProfile
                    ? 'Your PhilSys ID and Barangay Residency documents have been officially reviewed and verified by ServiceHub administrators.'
                    : `${displayName}'s PhilSys ID and Barangay Residency documents have been officially reviewed and verified by ServiceHub administrators.`}
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
                  {isOwnProfile ? 'Verification Documents Submitted' : 'Verification Under Review'}
                </h4>
                <p className={`text-xs ${labelText} max-w-md mx-auto leading-relaxed`}>
                  {isOwnProfile
                    ? 'Your document photos are currently being reviewed by ServiceHub administrators. Estimated review time: 24 to 48 hours.'
                    : `${displayName} has submitted residency documents and is currently awaiting administrative review.`}
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
                    {isOwnProfile ? 'VERIFICATION REJECTED' : 'UNVERIFIED RESIDENT'}
                  </span>
                  <h4 className={`text-base font-extrabold ${headingText} pt-2`}>
                    {isOwnProfile ? 'Document Photo Issues Detected' : 'Residency Verification Incomplete'}
                  </h4>
                  <p className={`text-xs ${isOwnProfile ? 'text-rose-500 font-medium' : labelText} max-w-md mx-auto leading-relaxed`}>
                    {isOwnProfile
                      ? 'Reason: Uploaded photos were unreadable or incomplete. Please upload a clear photo of your government ID or Barangay certificate.'
                      : `${displayName} has not yet completed identity and residency verification. Keep all bookings and communication inside ServiceHub for protection.`}
                  </p>
                </div>
              </div>

              {/* Resubmission Uploader ONLY FOR OWN PROFILE */}
              {isOwnProfile && <VerificationUpload isDark={isDark} />}
            </div>
          )}

          {/* 4. UNVERIFIED / NOT SUBMITTED STATUS */}
          {(verStatus === 'UNVERIFIED' || verStatus === 'NOT_SUBMITTED' || !verStatus) && (
            <div className="space-y-6">
              {isOwnProfile ? (
                <>
                  <div className={`p-5 rounded-2xl border ${innerBg} space-y-2 text-xs`}>
                    <div className="flex items-center gap-2 font-bold text-amber-500">
                      <AlertTriangle size={16} /> Residency Verification Requirements:
                    </div>
                    <p className={`${labelText} leading-relaxed`}>
                      Upload clear photos of official documents (PhilSys ID, Driver&apos;s License, Barangay Certificate, or Utility Bill) to verify your identity and current address.
                    </p>
                  </div>
                  <VerificationUpload isDark={isDark} />
                </>
              ) : (
                <div className={`p-6 rounded-2xl border ${innerBg} text-center space-y-3`}>
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                    <AlertTriangle size={36} />
                  </div>
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                      UNVERIFIED RESIDENT
                    </span>
                    <h4 className={`text-base font-extrabold ${headingText} pt-2`}>
                      Residency Verification Incomplete
                    </h4>
                    <p className={`text-xs ${labelText} max-w-md mx-auto leading-relaxed`}>
                      {displayName} has not yet completed identity and residency verification. Exercise standard precautions when arranging services, and keep all agreements and payments inside ServiceHub.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
