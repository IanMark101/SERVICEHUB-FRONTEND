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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-0">
        <div className="min-w-0 lg:pr-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] p-1.5">
                <UserAvatar src={avatarUrl} name={displayName} alt={`${displayName} profile picture`} size={104} role={roleTone} shape="soft" />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-[color:var(--workspace-surface)] text-white shadow-sm ${verStatus === 'APPROVED' ? 'bg-emerald-600' : 'bg-amber-500'}`}
                title={verStatus === 'APPROVED' ? 'Verified Cordova Resident' : 'Residency Unverified'}
              >
                {verStatus === 'APPROVED' ? <ShieldCheck size={16} /> : <Clock size={15} />}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 id="profile-name" className={`min-w-0 break-words text-2xl font-extrabold tracking-[-0.035em] sm:text-[1.75rem] ${headingText}`}>{displayName}</h1>
                {verStatus === 'APPROVED' && <CheckCircle size={19} className="shrink-0 text-emerald-600" aria-label="Verified resident" />}
              </div>

              <div className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm sm:justify-start ${labelText}`}>
                <span className="min-w-0 break-all font-medium">{usernameHandle}</span>
                <span className="h-3 w-px bg-[color:var(--workspace-border-strong)]" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} className={accentText} />{location ? `${location}, Cordova` : 'Cordova, Cebu'}</span>
              </div>

              <p className="mt-4 max-w-[62ch] text-sm leading-6 text-[color:var(--workspace-muted)]">
                {bio || (isProvider ? 'Professional service specialist based in Cordova, Cebu. Ready to help with home maintenance, repairs, and installations.' : 'Active member on ServiceHub Cordova. Looking for reliable local service providers.')}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {facebookUrl && <SocialLink href={facebookUrl} icon={<ExternalLink size={14} />} label="Facebook" />}
                {instagramUrl && <SocialLink href={instagramUrl} icon={<ExternalLink size={14} />} label="Instagram" />}
                {websiteUrl && <SocialLink href={websiteUrl} icon={<Globe size={14} />} label="Website" />}
              </div>

              {createdAt && (
                <p className={`mt-3 text-xs ${labelText}`}>
                  Member since {new Date(createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="border-t border-[color:var(--workspace-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-label="Profile reputation summary">
          {isOwnProfile && (
            <button type="button" onClick={() => setShowEdit((value) => !value)} aria-expanded={showEdit} className="servicehub-dark-cta workspace-primary-button inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold">
              <Edit3 size={15} />
              {showEdit ? 'Close form' : 'Edit profile'}
            </button>
          )}

          <dl className={`${isOwnProfile ? 'mt-5' : ''} grid grid-cols-3 lg:grid-cols-1`}>
            <ProfileStat value={completedJobs} label="Completed bookings" headingText={headingText} labelText={labelText} />
            <ProfileStat value={<>{averageRating.toFixed(1)} <Star size={14} className="fill-amber-400 text-amber-500" /></>} label="Average rating" headingText={headingText} labelText={labelText} divided />
            <ProfileStat value={<><Award size={15} /> {trustScore}</>} label="Trust score" detail={trustBand.label} headingText={accentText} labelText={labelText} divided />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function ProfileStat({ value, label, detail, headingText, labelText, divided = false }: { value: ReactNode; label: string; detail?: string; headingText: string; labelText: string; divided?: boolean }) {
  return (
    <div className={`${divided ? 'border-l lg:border-l-0 lg:border-t' : ''} border-[color:var(--workspace-border)] px-3 py-2.5 text-left lg:px-0 lg:py-4`}>
      <dt className={`text-[11px] font-medium ${labelText}`}>{label}</dt>
      <dd className={`mt-1 flex items-center gap-1.5 text-lg font-extrabold tabular-nums ${headingText}`}>{value}</dd>
      {detail && <p className={`mt-0.5 text-[10px] font-semibold ${headingText}`}>{detail}</p>}
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
