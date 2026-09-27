import { ArrowRight, Clock, CheckCircle, Warning, HandPalm } from '@phosphor-icons/react';
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
        return (
          <section key={group} aria-labelledby={`activity-${tone}-${group}`}>
            <h2 id={`activity-${tone}-${group}`} className="mb-2.5 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
              <Icon size={17} weight="regular" aria-hidden="true" className={group === 'your_turn' ? tone === 'seeker' ? 'text-orange-600' : 'text-emerald-600' : 'text-stone-500'} />
              {activityGroupLabels[group]}
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{items.length}</span>
            </h2>
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
                    {!history && <span className="mt-0.5 block text-xs leading-relaxed text-stone-600 dark:text-stone-300">{entry.explanation} <span className="font-medium">Next: {entry.next}</span></span>}
                    {!history && (entry.payment || entry.queue || entry.action) && (
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
          </section>
        );
      })}
    </div>
  );
}
