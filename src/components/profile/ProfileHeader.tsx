"use client";

import type { ReactNode } from 'react';
import { Award, CheckCircle, Clock, Edit3, Globe, MapPin, ShieldCheck, Star } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

const FacebookIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

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
  isDark,
  labelText,
  headingText,
}: ProfileHeaderProps) {
  const isProvider = role === 'provider';
  const isAdmin = role === 'admin';
  const roleTone = isProvider ? 'provider' : isAdmin ? 'admin' : 'seeker';
  const trustBand = getTrustBand(trustScore);
  const accentText = isProvider
    ? 'text-emerald-700 dark:text-emerald-300'
    : isAdmin
      ? 'text-slate-700 dark:text-neutral-200'
      : 'text-orange-700 dark:text-orange-300';

  return (
    <section className={`workspace-profile-hero workspace-profile-hero--${roleTone} p-5 sm:p-6`} aria-labelledby="profile-name">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative mx-auto shrink-0 md:mx-0">
          <div className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] p-1.5">
            <UserAvatar src={avatarUrl} name={displayName} alt={`${displayName} profile picture`} size={112} role={roleTone} shape="soft" />
          </div>
          <span
            className={`absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-[color:var(--workspace-surface)] text-white shadow-sm ${verStatus === 'APPROVED' ? 'bg-emerald-600' : 'bg-amber-500'}`}
            title={verStatus === 'APPROVED' ? 'Verified Cordova Resident' : 'Residency Unverified'}
          >
            {verStatus === 'APPROVED' ? <ShieldCheck size={16} /> : <Clock size={15} />}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-5 text-center md:text-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 id="profile-name" className={`text-2xl font-extrabold tracking-[-0.035em] sm:text-[1.75rem] ${headingText}`}>{displayName}</h1>
                {verStatus === 'APPROVED' && <CheckCircle size={19} className="shrink-0 text-emerald-600" aria-label="Verified resident" />}
              </div>
              <div className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm md:justify-start ${labelText}`}>
                <span className="font-medium">{usernameHandle}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} className={accentText} />{location ? `${location}, Cordova` : 'Cordova, Cebu'}</span>
              </div>
            </div>

            {isOwnProfile && (
              <button type="button" onClick={() => setShowEdit((value) => !value)} className="servicehub-dark-cta workspace-primary-button mx-auto inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold md:mx-0">
                <Edit3 size={15} />
                {showEdit ? 'Close form' : 'Edit profile'}
              </button>
            )}
          </div>

          <p className={`max-w-3xl text-sm leading-6 ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
            {bio || (isProvider ? 'Professional service specialist based in Cordova, Cebu. Ready to help with home maintenance, repairs, and installations.' : 'Active member on ServiceHub Cordova. Looking for reliable local service providers.')}
          </p>

          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] sm:grid-cols-4">
            <Metric value={completedJobs} label="Completed" headingText={headingText} labelText={labelText} />
            <Metric value={<>{averageRating.toFixed(1)} <Star size={14} className="fill-amber-400 text-amber-500" /></>} label="Rating" headingText={headingText} labelText={labelText} divided />
            <Metric value={<><Award size={15} /> {trustScore}</>} label="Trust score" headingText={accentText} labelText={labelText} divided topBorder />
            <div className="border-l border-t border-[color:var(--workspace-border)] px-3 py-3 text-left sm:border-t-0 sm:px-4">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${trustBand.bg} ${trustBand.color}`}>{trustBand.label}</div>
              <div className={`mt-1 text-xs font-medium ${labelText}`}>Trust band</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            {facebookUrl && <SocialLink href={facebookUrl} icon={<FacebookIcon />} label="Facebook" />}
            {instagramUrl && <SocialLink href={instagramUrl} icon={<InstagramIcon />} label="Instagram" />}
            {websiteUrl && <SocialLink href={websiteUrl} icon={<Globe size={14} />} label="Website" />}
            {createdAt && <span className={`px-1 text-xs ${labelText}`}>Member since {new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label, headingText, labelText, divided = false, topBorder = false }: { value: ReactNode; label: string; headingText: string; labelText: string; divided?: boolean; topBorder?: boolean }) {
  return (
    <div className={`${divided ? 'border-l' : ''} ${topBorder ? 'border-t sm:border-t-0' : ''} border-[color:var(--workspace-border)] px-3 py-3 text-left sm:px-4`}>
      <div className={`flex items-center gap-1.5 text-lg font-extrabold tabular-nums ${headingText}`}>{value}</div>
      <div className={`mt-0.5 text-xs font-medium ${labelText}`}>{label}</div>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const safeHref = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a href={safeHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface)] px-3 text-xs font-semibold text-[color:var(--workspace-muted)] transition-colors hover:border-[color:var(--workspace-focus)] hover:text-[color:var(--workspace-ink)]">
      {icon}{label}
    </a>
  );
}
