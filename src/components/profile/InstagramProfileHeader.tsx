"use client";
import React from 'react';
import { ShieldCheck, MapPin, Edit3, Share2, Star, CheckCircle, Clock, Award } from 'lucide-react';

export function getTrustBand(score: number) {
  if (score >= 90) return { label: 'Highly Trusted', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 70) return { label: 'Trusted', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 50) return { label: 'Average', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  return { label: 'Needs Attention', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' };
}

interface InstagramProfileHeaderProps {
  displayName: string;
  usernameHandle: string;
  avatarUrl: string;
  role: string;
  verStatus: string;
  location: string;
  bio: string;
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

export default function InstagramProfileHeader({
  displayName,
  usernameHandle,
  avatarUrl,
  role,
  verStatus,
  location,
  bio,
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
}: InstagramProfileHeaderProps) {
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
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                alt={displayName}
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
          <div className="space-y-1">
            <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              {bio || (isProvider ? 'Professional service specialist based in Cordova, Cebu. Ready to help with home maintenance, repairs, and installations.' : 'Active member on ServiceHub Cordova. Looking for reliable local service providers.')}
            </p>
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
