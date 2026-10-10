"use client";

import type { ReactNode } from 'react';
import { Award, CheckCircle, Clock, Edit3, ExternalLink, Globe, MapPin, ShieldCheck, Star } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

export function getTrustBand(score: number) {
  if (score >= 90) return { label: 'Highly Trusted', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 70) return { label: 'Trusted', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 50) return { label: 'Average', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' };
  return { label: 'Needs Attention', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
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
  isOwnProfile: boolean;
  showEdit: boolean;
  setShowEdit: (v: boolean | ((prev: boolean) => boolean)) => void;
  isDark: boolean;
  cardBg: string;
  innerBg: string;
  labelText: string;
  headingText: string;
  variant?: 'workspace' | 'marketplace';
}

function formatDisplayName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  if (!isAllUpper) return trimmed;
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2 && (word.endsWith('.') || word.length === 1)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
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
  isOwnProfile,
  showEdit,
  setShowEdit,
  labelText,
  headingText,
  variant = 'workspace',
}: ProfileHeaderProps) {
  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const roleTone = isProvider ? 'provider' : isAdmin ? 'admin' : 'seeker';
  const trustBand = getTrustBand(trustScore);
  const accentText = isProvider
    ? 'text-emerald-700 dark:text-emerald-300'
    : isAdmin
      ? 'text-[var(--admin-accent)]'
      : 'text-orange-700 dark:text-orange-300';

  const formattedName = formatDisplayName(displayName);

  if (variant === 'marketplace') {
    return (
      <section className={`marketplace-profile-hero workspace-profile-hero--${roleTone} relative p-5 sm:p-6 sm:pb-5`} aria-labelledby="profile-name">
        {/* Sleek Pill Edit Profile Button */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10">
            <button
              type="button"
              onClick={() => setShowEdit((value) => !value)}
              aria-expanded={showEdit}
              className="servicehub-dark-cta workspace-primary-button inline-flex min-h-8 sm:min-h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <Edit3 size={13} />
              <span>{showEdit ? 'Close editor' : 'Edit profile'}</span>
            </button>
          </div>
        )}

        {/* Centered Profile Hero Content */}
        <div className="flex flex-col items-center text-center">
          {/* Framed Circular Avatar & Verification Badge */}
          <div className="relative shrink-0 mb-3 sm:mb-3.5">
            <div className="rounded-full p-1.5 ring-4 ring-[color:var(--workspace-border)] border-2 border-[color:var(--workspace-border-strong)] bg-[color:var(--workspace-surface)] shadow-md transition-transform duration-300 hover:scale-[1.02]">
              <UserAvatar
                src={avatarUrl}
                name={displayName}
                alt={`${formattedName} profile picture`}
                size={160}
                role={roleTone}
                shape="circle"
              />
            </div>
            <span
              className={`absolute bottom-1 right-1 grid size-8 sm:size-9 place-items-center rounded-full border-[3px] border-[color:var(--workspace-surface)] text-white shadow-md ${verStatus === 'APPROVED' ? 'bg-emerald-600' : 'bg-amber-500'}`}
              title={verStatus === 'APPROVED' ? 'Identity and residency verified' : 'Residency not verified'}
            >
              {verStatus === 'APPROVED' ? <ShieldCheck size={16} /> : <Clock size={15} />}
            </span>
          </div>

          {/* Member Name & Verification Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <h1 id="profile-name" className={`break-words text-xl sm:text-2xl font-extrabold tracking-tight ${headingText}`}>
              {formattedName}
            </h1>
            {verStatus === 'APPROVED' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" /> Verified Resident
              </span>
            )}
          </div>

          {/* Unified Location, Handle & Member Since Row */}
          <div className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm ${labelText}`}>
            <span className="inline-flex items-center gap-1 font-medium text-[color:var(--workspace-ink)]">
              <MapPin size={14} className="text-rose-500 fill-rose-500 shrink-0" />
              {location || 'Location not provided'}
            </span>
            <span className="text-[color:var(--workspace-border-strong)]" aria-hidden="true">•</span>
            <span className="font-semibold text-[color:var(--workspace-ink)]">@{usernameHandle.replace(/^@/, '')}</span>
            {createdAt && (
              <>
                <span className="text-[color:var(--workspace-border-strong)] hidden sm:inline" aria-hidden="true">•</span>
                <span className="text-[color:var(--workspace-muted)] hidden sm:inline">
                  Member since {new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
                </span>
              </>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-2 max-w-[56ch] text-xs sm:text-sm leading-relaxed text-[color:var(--workspace-ink)] font-normal">
              {bio}
            </p>
          )}

          {/* Social Links */}
          {(facebookUrl || instagramUrl || websiteUrl) && (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              {facebookUrl && <SocialLink href={facebookUrl} icon={<ExternalLink size={11} />} label="Facebook" />}
              {instagramUrl && <SocialLink href={instagramUrl} icon={<ExternalLink size={11} />} label="Instagram" />}
              {websiteUrl && <SocialLink href={websiteUrl} icon={<Globe size={11} />} label="Website" />}
            </div>
          )}
        </div>

        {/* 3-Column Minimal Stat Counters Row - Perfectly Centered via 3-Column Grid */}
        <div className="mt-5 border-t border-[color:var(--workspace-border)] pt-4" aria-label="Marketplace reputation">
          <div className="mx-auto grid max-w-xl grid-cols-3 divide-x divide-[color:var(--workspace-border)] text-center">
            {/* Stat 1: Completed Bookings */}
            <div className="flex flex-col items-center justify-center px-2">
              <span className={`text-xl sm:text-2xl font-extrabold tabular-nums ${headingText}`}>
                {completedJobs.toLocaleString()}
              </span>
              <span className="mt-0.5 text-xs font-medium lowercase text-[color:var(--workspace-muted)]">
                {completedJobs === 1 ? 'booking' : 'bookings'}
              </span>
            </div>

            {/* Stat 2: Marketplace Rating */}
            <div className="flex flex-col items-center justify-center px-2">
              <span className={`flex items-center justify-center gap-1 text-xl sm:text-2xl font-extrabold tabular-nums ${headingText}`}>
                {averageRating > 0 ? (
                  <>
                    {averageRating.toFixed(1)}
                    <Star size={16} className="fill-amber-400 text-amber-500" />
                  </>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-[color:var(--workspace-muted)]">No ratings yet</span>
                )}
              </span>
              <span className="mt-0.5 text-xs font-medium lowercase text-[color:var(--workspace-muted)]">
                provider rating
              </span>
            </div>

            {/* Stat 3: Trust Standing */}
            <div className="flex flex-col items-center justify-center px-2">
              <span className={`flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-extrabold tabular-nums ${accentText}`}>
                <Award size={18} className="shrink-0" />
                {trustScore}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center justify-center gap-1 text-xs font-medium lowercase text-[color:var(--workspace-muted)]">
                <span>trust standing</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${trustBand.bg} ${trustBand.color}`}>
                  {trustBand.label}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`workspace-profile-hero workspace-profile-hero--${roleTone} relative p-5 sm:p-6 sm:pb-5`} aria-labelledby="profile-name">
      {isOwnProfile && (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10">
          <button
            type="button"
            onClick={() => setShowEdit((value) => !value)}
            aria-expanded={showEdit}
            className="servicehub-dark-cta workspace-primary-button inline-flex min-h-8 sm:min-h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Edit3 size={13} />
            <span>{showEdit ? 'Close form' : 'Edit profile'}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="relative shrink-0 mb-3 sm:mb-3.5">
          <div className="rounded-full p-1.5 ring-4 ring-[color:var(--workspace-border)] border-2 border-[color:var(--workspace-border-strong)] bg-[color:var(--workspace-surface)] shadow-md transition-transform duration-300 hover:scale-[1.02]">
            <UserAvatar src={avatarUrl} name={displayName} alt={`${formattedName} profile picture`} size={160} role={roleTone} shape="circle" />
          </div>
          <span
            className={`absolute bottom-1 right-1 grid size-8 sm:size-9 place-items-center rounded-full border-[3px] border-[color:var(--workspace-surface)] text-white shadow-md ${verStatus === 'APPROVED' ? 'bg-emerald-600' : 'bg-amber-500'}`}
            title={verStatus === 'APPROVED' ? 'Verified Local Member' : 'Residency Unverified'}
          >
            {verStatus === 'APPROVED' ? <ShieldCheck size={16} /> : <Clock size={15} />}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <h1 id="profile-name" className={`break-words text-xl sm:text-2xl font-extrabold tracking-tight ${headingText}`}>
            {formattedName}
          </h1>
          {verStatus === 'APPROVED' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" /> Verified Resident
            </span>
          )}
        </div>

        <div className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs sm:text-sm ${labelText}`}>
          <span className="inline-flex items-center gap-1 font-medium text-[color:var(--workspace-ink)]">
            <MapPin size={14} className="text-rose-500 fill-rose-500 shrink-0" />
            <span>{location || 'Location not provided'}</span>
          </span>
          <span className="h-3 w-px bg-[color:var(--workspace-border-strong)]" aria-hidden="true" />
          <span className="font-semibold text-[color:var(--workspace-ink)]">@{usernameHandle.replace(/^@/, '')}</span>
          {createdAt && (
            <>
              <span className="h-3 w-px bg-[color:var(--workspace-border-strong)] hidden sm:block" aria-hidden="true" />
              <span className="text-[color:var(--workspace-muted)] hidden sm:inline">
                Member since {new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
              </span>
            </>
          )}
        </div>

        {bio && (
          <p className="mt-2 max-w-[58ch] text-xs sm:text-sm leading-relaxed text-[color:var(--workspace-muted)]">
            {bio}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          {facebookUrl && <SocialLink href={facebookUrl} icon={<ExternalLink size={12} />} label="Facebook" />}
          {instagramUrl && <SocialLink href={instagramUrl} icon={<ExternalLink size={12} />} label="Instagram" />}
          {websiteUrl && <SocialLink href={websiteUrl} icon={<Globe size={12} />} label="Website" />}
        </div>
      </div>

      <div className="mt-5 border-t border-[color:var(--workspace-border)] pt-4" aria-label="Profile reputation summary">
        <div className="mx-auto grid max-w-xl grid-cols-3 divide-x divide-[color:var(--workspace-border)] text-center">
          <div className="flex flex-col items-center justify-center px-2">
            <span className={`text-xl sm:text-2xl font-extrabold tabular-nums ${headingText}`}>
              {completedJobs}
            </span>
            <span className="mt-0.5 text-xs font-medium lowercase text-[color:var(--workspace-muted)]">bookings</span>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <span className={`flex items-center justify-center gap-1 text-xl sm:text-2xl font-extrabold tabular-nums ${headingText}`}>
              {averageRating > 0 ? (
                <>
                  {averageRating.toFixed(1)} <Star size={15} className="fill-amber-400 text-amber-500" />
                </>
              ) : (
                <span className="text-xs sm:text-sm font-semibold text-[color:var(--workspace-muted)]">No ratings yet</span>
              )}
            </span>
            <span className="mt-0.5 text-xs font-medium lowercase text-[color:var(--workspace-muted)]">provider rating</span>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <span className={`flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-extrabold tabular-nums ${accentText}`}>
              <Award size={17} /> {trustScore}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold text-[color:var(--workspace-muted)]">({trustBand.label})</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const safeHref = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-6 items-center gap-1 rounded-full border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--workspace-muted)] transition-all hover:border-[color:var(--workspace-border-strong)] hover:bg-[color:var(--workspace-surface)] hover:text-[color:var(--workspace-ink)] active:scale-[0.98]"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
