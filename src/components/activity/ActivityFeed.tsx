import { ArrowRight, Clock, CheckCircle, Warning, HandPalm, XCircle } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import type { ActivityGroup } from './activityPresentation';
import { activityGroupLabels, activityGroupOrder } from './activityPresentation';
import QueueActivityCard from './QueueActivityCard';
import type { BookingOutcome } from '../../lib/bookingOutcome';

export interface ActivityFeedEntry {
  id: string;
  group: ActivityGroup;
  title: string;
  participant: string;
  status: string;
  explanation: string;
  next: string;
  price: number;
  kind?: 'booking' | 'offer';
  outcome?: BookingOutcome | 'withdrawn' | 'not_selected';
  date?: string;
  payment?: string;
  queue?: string;
  action?: string;
  situationLabel?: string;
  openLabel?: string;
  queueOverview?: boolean;
  queuePosition?: number;
  queueEstimatedWait?: number;
  canStart?: boolean;
  startUnavailableReason?: string;
  startPending?: boolean;
  startBusy?: boolean;
}

const groupIcon = {
  your_turn: HandPalm,
  work_underway: Clock,
  waiting: Clock,
  under_review: Warning,
  history: CheckCircle,
};

const activeCardStyles = {
  seeker: {
    base: 'border-orange-300 bg-orange-100 focus-visible:outline-orange-600 dark:border-orange-800 dark:bg-orange-950/60',
    action: 'border-orange-300 bg-orange-200/60 focus-visible:outline-orange-600 dark:border-orange-700 dark:bg-orange-900/40',
    hover: 'hover:border-orange-400 hover:bg-orange-200/60 dark:hover:border-orange-600 dark:hover:bg-orange-900/40',
    badge: 'bg-orange-200 text-orange-900 dark:bg-orange-800/60 dark:text-orange-200',
    actionBadge: 'bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200',
    button: 'bg-orange-600 text-white group-hover:bg-orange-700',
  },
  provider: {
    base: 'border-emerald-300 bg-emerald-100 focus-visible:outline-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/60',
    action: 'border-emerald-300 bg-emerald-200/60 focus-visible:outline-emerald-600 dark:border-emerald-700 dark:bg-emerald-900/40',
    hover: 'hover:border-emerald-400 hover:bg-emerald-200/60 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/40',
    badge: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800/60 dark:text-emerald-200',
    actionBadge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200',
    button: 'bg-emerald-600 text-white group-hover:bg-emerald-700',
  },
};

export default function ActivityFeed({ entries, tone, onOpen, onStart, empty }: {
  entries: ActivityFeedEntry[];
  tone: 'seeker' | 'provider';
  onOpen: (entry: ActivityFeedEntry) => void;
  onStart?: (entry: ActivityFeedEntry) => void;
  empty?: ReactNode;
}) {
  if (entries.length === 0) return <>{empty}</>;
  const styles = activeCardStyles[tone];
  return (
    <div aria-label={`${tone} activity`} className="space-y-7">
      {activityGroupOrder.map((group) => {
        const items = entries.filter((entry) => entry.group === group);
        if (!items.length) return null;
        const Icon = groupIcon[group];
        const history = group === 'history';
        const underReview = group === 'under_review';
        return (
          <section key={group} aria-labelledby={`activity-${tone}-${group}`}>
            <h2 id={`activity-${tone}-${group}`} className="mb-3 flex items-center gap-2 text-sm font-bold text-ink dark:text-ink">
              <Icon size={17} weight="regular" aria-hidden="true" className={group === 'your_turn' ? tone === 'seeker' ? 'text-orange-600' : 'text-emerald-600' : underReview ? 'text-amber-700 dark:text-amber-400' : 'text-ink-muted'} />
              {activityGroupLabels[group]}
              <span className="text-xs font-medium text-ink-muted dark:text-ink-muted">{items.length}</span>
            </h2>
            {history || underReview ? (
              <div className="space-y-2.5">
                {items.map((entry) => {
                  const closed = entry.outcome !== 'completed';
                  const OutcomeIcon = underReview ? Warning : closed ? XCircle : CheckCircle;
                  const outcomeLabels = { completed: 'Completed', canceled: 'Canceled', declined: entry.kind === 'offer' ? 'Offer declined' : 'Declined', removed: 'Removed', withdrawn: 'Withdrawn', not_selected: 'Not selected' };
                  const outcomeLabel = underReview ? 'Under review' : entry.outcome ? outcomeLabels[entry.outcome] : entry.situationLabel || 'Closed';
                  const outcomeTone = underReview
                    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'
                    : closed
                      ? 'border-stone-300 bg-stone-100 text-ink-secondary dark:border-neutral-600 dark:bg-charcoal dark:text-ink'
                      : tone === 'seeker'
                        ? 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300';
                  const outcomeEdge = underReview
                    ? 'border-l-[3px] border-l-amber-500 dark:border-l-amber-500'
                    : closed
                      ? 'border-l-[3px] border-l-stone-400 dark:border-l-neutral-500'
                      : tone === 'seeker'
                        ? 'border-l-[3px] border-l-orange-500 dark:border-l-orange-500'
                        : 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-500';
                  return (
                    <button
                      key={`${entry.kind || 'booking'}-${entry.id}`}
                      type="button"
                      onClick={() => onOpen(entry)}
                      aria-label={`Open ${entry.kind === 'offer' ? 'offer' : 'booking'} ${entry.title}: ${entry.status}`}
                      className={`group flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:items-center sm:gap-4 sm:p-5 dark:bg-charcoal-surface ${underReview ? 'border-amber-200/80 focus-visible:outline-amber-600 dark:border-amber-900/50' : 'border-stone-200 focus-visible:outline-stone-700 dark:border-neutral-700'} ${outcomeEdge}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${outcomeTone}`}>
                        <OutcomeIcon size={20} weight="duotone" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate text-sm font-bold text-ink dark:text-ink sm:text-base">{entry.title}</span>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${outcomeTone}`}>{outcomeLabel}</span>
                        </span>
                        <span className="mt-1 block text-xs text-ink-muted dark:text-ink-secondary">
                          {entry.participant}{entry.date && <span className="before:mx-2 before:text-ink-subtle before:content-['·']">{entry.date}</span>}
                        </span>
                        {underReview && <span className="mt-1.5 block text-xs leading-relaxed text-ink-secondary dark:text-ink">{entry.status}. {entry.next}</span>}
                      </span>
                      <span className="ml-auto flex shrink-0 flex-col items-end gap-1.5 self-center pl-1 sm:min-w-28 sm:self-stretch sm:justify-center sm:gap-2 sm:border-l sm:border-stone-200 sm:pl-5 dark:sm:border-neutral-700">
                        <span className="text-sm font-bold tabular-nums text-ink dark:text-ink">₱{entry.price}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${closed && !underReview ? 'text-ink-secondary dark:text-ink' : tone === 'seeker' ? 'text-orange-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          Details <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((entry) => entry.queueOverview ? (
                  <QueueActivityCard
                    key={`${entry.kind || 'booking'}-${entry.id}`}
                    entry={entry}
                    tone={tone}
                    onOpen={() => onOpen(entry)}
                    onStart={onStart ? () => onStart(entry) : undefined}
                  />
                ) : (
                  <button
                    key={`${entry.kind || 'booking'}-${entry.id}`}
                    type="button"
                    onClick={() => onOpen(entry)}
                    className={`group w-full rounded-2xl border p-5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-6 ${styles.hover} ${group === 'your_turn' ? styles.action : styles.base}`}
                    aria-label={`Open ${entry.kind === 'offer' ? 'offer' : 'booking'} ${entry.title}: ${entry.status}`}
                  >
                    <span className="flex flex-col gap-5">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                          <span className="min-w-0 flex-1 break-words text-base font-bold text-ink dark:text-ink">{entry.title}</span>
                          <span className="shrink-0 text-lg font-bold tabular-nums text-ink dark:text-ink">₱{entry.price}</span>
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted dark:text-ink-secondary">{entry.participant}</span>

                        <span className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                          {entry.situationLabel && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${group === 'your_turn' ? styles.actionBadge : styles.badge}`}>{entry.situationLabel}</span>}
                          <span className="text-lg font-bold leading-snug text-ink dark:text-ink">{entry.status}</span>
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink-secondary dark:text-ink">{entry.explanation}</span>

                        <span className="mt-5 grid gap-3 border-t border-stone-200/80 pt-4 text-sm sm:grid-cols-2 dark:border-neutral-700">
                          <span className="block min-w-0"><strong className="block text-xs font-bold text-ink dark:text-ink">Your action</strong><span className="mt-1 block leading-relaxed text-ink-secondary dark:text-ink">{entry.action || 'No action needed now'}</span></span>
                          <span className="block min-w-0"><strong className="block text-xs font-bold text-ink dark:text-ink">What happens next</strong><span className="mt-1 block leading-relaxed text-ink-secondary dark:text-ink">{entry.next}</span></span>
                        </span>

                        {(entry.payment || entry.queue) && (
                          <span className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">
                            {entry.payment && <span><strong className="font-semibold text-ink dark:text-ink">Payment</strong> · {entry.payment}</span>}
                            {entry.queue && <span><strong className="font-semibold text-ink dark:text-ink">Queue</strong> · {entry.queue}</span>}
                          </span>
                        )}
                      </span>
                      <span className={`inline-flex min-h-11 w-full self-end shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors sm:w-auto ${styles.button}`}>
                        {entry.openLabel || 'View booking'} <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
