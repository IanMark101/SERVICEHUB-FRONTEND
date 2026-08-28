"use client";
import React from 'react';
import { ShieldCheck, MapPin, Edit3, Share2, Star, CheckCircle, Clock, Award, Globe } from 'lucide-react';

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

export function getTrustBand(score: number) {
  if (score >= 90) return { label: 'Highly Trusted', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 70) return { label: 'Trusted', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 50) return { label: 'Average', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  return { label: 'Needs Attention', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' };
}

interface ProfileHeaderProps {
  displayName: string;
  usernameHandle: string;
  avatarUrl: string;
  role: string;
  verStatus: string;
  location: string;
  bio: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  trustScore: number;
  createdAt?: string;
  completedJobs: number;
  averageRating: number;
  responseRate: string;
  isOwnProfile: boolean;
  showEdit: boolean;
  setShowEdit: (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowSettingsModal?: (v: boolean) => void;
  handleShareProfile: () => void;
  isDark: boolean;
  cardBg: string;
  innerBg: string;
  labelText: string;
  headingText: string;
}

export default function ProfileHeader({
  displayName,
  usernameHandle,
  avatarUrl,
  role,
  verStatus,
  location,
  bio,
  facebookUrl,
  instagramUrl,
  websiteUrl,
  trustScore,
  createdAt,
  completedJobs,
  averageRating,
  responseRate,
  isOwnProfile,
  showEdit,
  setShowEdit,
  setShowSettingsModal,
  handleShareProfile,
  isDark,
  cardBg,
  innerBg,
  labelText,
  headingText,
}: ProfileHeaderProps) {
  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const trustBand = getTrustBand(trustScore);

  // Role accents
  const borderRing = isProvider
    ? 'from-emerald-500 via-teal-400 to-cyan-500'
    : isAdmin
    ? 'from-blue-500 via-indigo-400 to-purple-500'
    : 'from-orange-500 via-amber-400 to-yellow-500';

  const badgeBg = isProvider
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    : isAdmin
    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    : 'bg-orange-500/10 text-orange-500 border-orange-500/20';

  return (
    <div className={`${cardBg} rounded-[28px] p-6 sm:p-8 border shadow-sm transition-all relative overflow-hidden`}>
      {/* Subtle top ambient glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-15 bg-gradient-to-br ${borderRing}`} />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
        
        {/* Large Circular Avatar with Instagram-style gradient story ring */}
        <div className="relative flex-shrink-0 group">
          <div className={`p-1 rounded-full bg-gradient-to-tr ${borderRing} shadow-lg transition-transform duration-300 group-hover:scale-105`}>
            <div className="p-1 bg-white dark:bg-[#22211e] rounded-full">
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random`}
                alt={displayName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random`;
                }}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover"
              />
            </div>
          </div>

          {verStatus === 'APPROVED' ? (
            <div
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#22211e]"
              title="Verified Cordova Resident"
            >
              <ShieldCheck size={20} />
            </div>
          ) : (
            <div
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#22211e]"
              title="Residency Unverified"
            >
              <Clock size={18} />
            </div>
          )}
        </div>

        {/* User Identity Details & Marketplace Counters */}
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          
          {/* Header Row: Username, Verification, Role & Trust Score Badge */}
          <div className="flex flex-col sm:flex-row items-center md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${headingText}`}>
                  {displayName}
                </h1>
                {verStatus === 'APPROVED' && (
                  <span title="Verified Resident">
                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${trustBand.bg} ${trustBand.color} flex items-center gap-1`}>
                  <Award size={13} /> Trust: {trustScore} ({trustBand.label})
                </span>
              </div>
              <p className={`text-xs font-semibold mt-1 ${labelText}`}>
                {usernameHandle} • <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-rose-500" /> {location ? `${location}, Cordova` : 'Cordova, Cebu'}</span>
              </p>
            </div>

            {/* CTAs Below Bio / Header */}
            {isOwnProfile && (
              <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => setShowEdit(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 ${
                    isProvider ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  <Edit3 size={14} />
                  <span>{showEdit ? 'Close Form' : 'Edit Profile'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 3 Marketplace Metric Counters Row */}
          <div className={`grid grid-cols-3 gap-3 p-3.5 rounded-2xl border text-center ${innerBg}`}>
            <div>
              <div className={`text-base sm:text-lg font-black ${headingText}`}>
                {completedJobs}
              </div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${labelText}`}>
                Completed
              </div>
            </div>

            <div className="border-x border-neutral-200 dark:border-neutral-800">
              <div className="text-base sm:text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                <span>{averageRating.toFixed(1)}</span>
                <Star size={14} className="fill-amber-400 text-amber-400" />
              </div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${labelText}`}>
                Rating
              </div>
            </div>

            <div>
              <div className="text-base sm:text-lg font-black text-emerald-500 flex items-center justify-center gap-1">
                <Award size={16} />
                <span>{trustScore}</span>
              </div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${labelText}`}>
                Trust Score
              </div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="space-y-2">
            <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              {bio || (isProvider ? 'Professional service specialist based in Cordova, Cebu. Ready to help with home maintenance, repairs, and installations.' : 'Active member on ServiceHub Cordova. Looking for reliable local service providers.')}
            </p>

            {/* 🌐 Social Media & Web Links Pills */}
            {(facebookUrl || instagramUrl || websiteUrl) && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {facebookUrl && (
                  <a
                    href={facebookUrl.startsWith('http') ? facebookUrl : `https://${facebookUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                  >
                    <FacebookIcon size={13} />
                    <span>Facebook</span>
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border border-pink-500/20 transition-all"
                  >
                    <InstagramIcon size={13} />
                    <span>Instagram</span>
                  </a>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                  </a>
                )}
              </div>
            )}

            {createdAt && (
              <p className={`text-[11px] font-medium ${labelText}`}>
                Member since {new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
