import type { ReactNode } from 'react';
import { CalendarBlank, FolderSimple } from '@phosphor-icons/react';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import UserAvatar from '../ui/UserAvatar';

type ActivityRole = 'seeker' | 'provider';

export default function ActivityDetailLayout({
  id, role, isDark, title, category, date, closed = false, highlighted = false,
  participant, onOpenProfile, facts, journey, journeyLabel = 'Booking journey', journeyOpen = true, children,
}: {
  id: string;
  role: ActivityRole;
  isDark: boolean;
  title: string;
  category: string;
  date: string;
  closed?: boolean;
  highlighted?: boolean;
  participant: { name: string; avatar?: string; trustScore?: number };
  onOpenProfile?: () => void;
  facts: ReactNode;
  journey?: ReactNode;
  journeyLabel?: string;
  journeyOpen?: boolean;
  children: ReactNode;
}) {
  const counterpart = role === 'provider' ? 'seeker' : 'provider';
  const label = counterpart === 'seeker' ? 'Seeker' : 'Provider';
  const focus = role === 'provider' ? 'focus-visible:outline-emerald-500' : 'focus-visible:outline-orange-500';
  const accent = role === 'provider'
    ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-text dark:text-orange-400';
  const highlight = role === 'provider'
    ? 'border-emerald-500/60 bg-emerald-50/40 ring-2 ring-emerald-500/25 dark:bg-emerald-950/10'
    : 'border-orange-500/60 bg-orange-50/40 ring-2 ring-orange-500/25 dark:bg-orange-950/10';

  return (
    <div id={id} className={`workspace-card flex w-full flex-col space-y-5 rounded-2xl border p-5 transition-all duration-200 sm:p-7 ${closed
      ? 'border-stone-300 bg-white dark:border-neutral-700 dark:bg-charcoal-surface'
      : highlighted ? highlight : isDark
        ? 'bg-charcoal-surface border-neutral-800/80 hover:border-neutral-700'
        : 'bg-white border-slate-300 hover:shadow-md'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
        <span className={`inline-flex items-center gap-1 ${accent}`}><FolderSimple className="h-3.5 w-3.5" weight="duotone" aria-hidden="true" />{category}</span>
        <span className="inline-flex items-center gap-1 text-ink-subtle dark:text-ink-muted"><CalendarBlank className="h-3.5 w-3.5" weight="duotone" aria-hidden="true" />{date}</span>
      </div>
      <div className="space-y-2.5 border-b border-stone-200 pb-5 dark:border-neutral-700">
        <h3 className="break-words text-xl font-extrabold leading-snug tracking-tight text-ink dark:text-white sm:text-2xl">{title}</h3>
        <button type="button" onClick={onOpenProfile} disabled={!onOpenProfile}
          className={`group/profile flex max-w-full items-center gap-2.5 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default ${focus}`}
          aria-label={`View ${participant.name}'s profile`}>
          <UserAvatar src={participant.avatar} name={participant.name || label} alt="" size={30} role={counterpart} />
          <span className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] font-bold">
            <span className="text-ink-subtle dark:text-ink-muted">{label}:</span>
            <span className={`break-words text-ink-secondary transition-colors dark:text-white ${role === 'provider'
              ? 'group-hover/profile:text-emerald-600 dark:group-hover/profile:text-emerald-400'
              : 'group-hover/profile:text-brand-text dark:group-hover/profile:text-orange-400'}`}>{participant.name}</span>
            {typeof participant.trustScore === 'number' && <><span className="text-slate-300 dark:text-charcoal">•</span><TrustScoreBadge score={participant.trustScore} /></>}
          </span>
        </button>
      </div>
      <div className={`grid min-w-0 gap-5 ${facts ? 'xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)] xl:gap-7' : ''}`}>
        <div className="min-w-0 space-y-4">{children}</div>
        {facts && <aside className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:border-l xl:border-stone-200 xl:pl-7 dark:xl:border-neutral-700">{facts}</aside>}
        {journey && <details className="group min-w-0 self-start rounded-2xl border border-stone-200 px-4 py-3 dark:border-neutral-700 xl:col-start-1 xl:row-start-2" open={journeyOpen}>
          <summary className={`cursor-pointer text-xs font-bold text-ink-secondary focus-visible:outline-2 dark:text-ink ${focus}`}>{journeyLabel}</summary>
          {journey}
        </details>}
      </div>
    </div>
  );
}

export function ActivityDetailActions({ title = 'Booking actions', children }: { title?: string; children: ReactNode }) {
  return (
    <div aria-label={title} className="booking-actions flex flex-wrap items-center justify-start gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 dark:border-neutral-700 dark:bg-charcoal/30 sm:p-4 [&_button]:min-h-11">
      <p className="w-full text-xs font-bold text-ink-secondary dark:text-ink">{title}</p>
      <div className="booking-actions__row">{children}</div>
    </div>
  );
}
