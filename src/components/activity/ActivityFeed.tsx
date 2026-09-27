import { ArrowRight, Clock, CheckCircle, Warning, HandPalm, XCircle } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import type { ActivityGroup } from './activityPresentation';
import { activityGroupLabels, activityGroupOrder } from './activityPresentation';

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
  outcome?: 'completed' | 'canceled';
  date?: string;
  payment?: string;
  queue?: string;
  action?: string;
}

const groupIcon = {
  your_turn: HandPalm,
  work_underway: Clock,
  waiting: Clock,
  under_review: Warning,
  history: CheckCircle,
};

export default function ActivityFeed({ entries, tone, onOpen, empty }: {
  entries: ActivityFeedEntry[];
  tone: 'seeker' | 'provider';
  onOpen: (entry: ActivityFeedEntry) => void;
  empty?: ReactNode;
}) {
  if (entries.length === 0) return <>{empty}</>;
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
            <h2 id={`activity-${tone}-${group}`} className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
              <Icon size={17} weight="regular" aria-hidden="true" className={group === 'your_turn' ? tone === 'seeker' ? 'text-orange-600' : 'text-emerald-600' : underReview ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'} />
              {activityGroupLabels[group]}
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{items.length}</span>
            </h2>
            {history || underReview ? (
              <div className="space-y-2.5">
                {items.map((entry) => {
                  const canceled = entry.outcome === 'canceled';
                  const OutcomeIcon = underReview ? Warning : canceled ? XCircle : CheckCircle;
                  const outcomeLabel = underReview ? 'Under review' : canceled ? 'Canceled' : 'Completed';
                  const outcomeTone = underReview
                    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'
                    : canceled
                      ? 'border-stone-300 bg-stone-100 text-stone-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-stone-200'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300';
                  const outcomeEdge = underReview
                    ? 'border-l-[3px] border-l-amber-500 dark:border-l-amber-500'
                    : canceled
                      ? 'border-l-[3px] border-l-stone-400 dark:border-l-neutral-500'
                      : 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-500';
                  return (
                    <button
                      key={`${entry.kind || 'booking'}-${entry.id}`}
                      type="button"
                      onClick={() => onOpen(entry)}
                      aria-label={`Open ${entry.kind === 'offer' ? 'offer' : 'booking'} ${entry.title}: ${entry.status}`}
                      className={`group flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:items-center sm:gap-4 sm:p-5 dark:bg-[#22211e] ${underReview ? 'border-amber-200/80 focus-visible:outline-amber-600 dark:border-amber-900/50' : 'border-stone-200 focus-visible:outline-stone-700 dark:border-neutral-700'} ${outcomeEdge}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${outcomeTone}`}>
                        <OutcomeIcon size={20} weight="duotone" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate text-sm font-bold text-stone-950 dark:text-stone-50 sm:text-base">{entry.title}</span>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${outcomeTone}`}>{outcomeLabel}</span>
                        </span>
                        <span className="mt-1 block text-xs text-stone-600 dark:text-stone-300">
                          {entry.participant}{entry.date && <span className="before:mx-2 before:text-stone-400 before:content-['·']">{entry.date}</span>}
                        </span>
                        {underReview && <span className="mt-1.5 block text-xs leading-relaxed text-stone-700 dark:text-stone-200">{entry.status}. {entry.next}</span>}
                      </span>
                      <span className="ml-auto flex shrink-0 flex-col items-end gap-1.5 self-center pl-1 sm:min-w-28 sm:self-stretch sm:justify-center sm:gap-2 sm:border-l sm:border-stone-200 sm:pl-5 dark:sm:border-neutral-700">
                        <span className="text-sm font-bold tabular-nums text-stone-900 dark:text-stone-100">₱{entry.price}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${tone === 'seeker' ? 'text-orange-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          Details <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-neutral-700 dark:bg-[#22211e]">
                {items.map((entry, index) => (
                  <button
                    key={`${entry.kind || 'booking'}-${entry.id}`}
                    type="button"
                    onClick={() => onOpen(entry)}
                    className={`group flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 dark:hover:bg-neutral-800/60 ${index > 0 ? 'border-t border-stone-100 dark:border-neutral-700/70' : ''} ${group === 'your_turn' ? tone === 'seeker' ? 'bg-orange-50/45 dark:bg-orange-950/10' : 'bg-emerald-50/45 dark:bg-emerald-950/10' : ''}`}
                    aria-label={`Open ${entry.kind === 'offer' ? 'offer' : 'booking'} ${entry.title}: ${entry.status}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-bold text-stone-950 dark:text-stone-50">{entry.title}</span>
                        <span className="text-xs text-stone-600 dark:text-stone-300">{entry.participant}</span>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">₱{entry.price}</span>
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-stone-800 dark:text-stone-100">{entry.status}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-stone-600 dark:text-stone-300">{entry.explanation} <span className="font-medium">Next: {entry.next}</span></span>
                      {(entry.payment || entry.queue || entry.action) && (
                        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                          {entry.payment && <span><strong className="font-semibold text-stone-800 dark:text-stone-100">Payment:</strong> {entry.payment}</span>}
                          {entry.queue && <span><strong className="font-semibold text-stone-800 dark:text-stone-100">Queue:</strong> {entry.queue}</span>}
                          {entry.action && <span><strong className="font-semibold text-stone-800 dark:text-stone-100">Your action:</strong> {entry.action}</span>}
                        </span>
                      )}
                    </span>
                    <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-bold ${tone === 'seeker' ? 'text-orange-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      Open <ArrowRight size={15} aria-hidden="true" />
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
