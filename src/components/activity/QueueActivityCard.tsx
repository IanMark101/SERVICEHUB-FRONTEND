import { ArrowRight, CheckCircle, Clock, Play } from '@phosphor-icons/react';
import type { ActivityFeedEntry } from './ActivityFeed';

interface QueueActivityCardProps {
  entry: ActivityFeedEntry;
  tone: 'seeker' | 'provider';
  onOpen: () => void;
  onStart?: () => void;
}

export default function QueueActivityCard({ entry, tone, onOpen, onStart }: QueueActivityCardProps) {
  const provider = tone === 'provider';
  const first = entry.queuePosition === 1;
  const ready = provider && first && entry.canStart;
  const blocked = provider && first && !entry.canStart;
  const paymentConfirmed = entry.payment === 'Payment confirmed';
  const headline = provider
    ? ready ? 'Ready to start' : blocked ? 'First in line, start unavailable' : 'Waiting for your turn'
    : first ? 'Waiting for provider to start' : 'Waiting in the provider’s work queue';
  const meaning = provider
    ? ready ? 'This is the next paid job for your workload. You can begin the work now.'
      : blocked ? entry.startUnavailableReason || 'You can start this booking when your current job is finished.'
        : 'Earlier paid jobs are ahead. Start becomes available when this booking reaches first position.'
    : paymentConfirmed
      ? first ? 'Your GCash payment is confirmed and your booking is secured. Work has not started yet.'
        : 'Your GCash payment is confirmed and your booking is secured. Other paid jobs are ahead.'
      : 'Your booking is in the queue. Check the payment status shown here for the latest result.';

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#22211e]" aria-label={`${entry.title} queue booking`}>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(230px,290px)]">
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-ink dark:text-ink">{entry.title}</h3>
              <p className="mt-0.5 text-xs text-ink-muted dark:text-ink-secondary">{entry.participant}</p>
            </div>
            <strong className="shrink-0 text-base tabular-nums text-ink dark:text-ink">₱{entry.price}</strong>
          </div>

          <div className="mt-5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${provider ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'}`}>
                {ready ? <Play size={19} weight="fill" aria-hidden="true" /> : <Clock size={19} weight="duotone" aria-hidden="true" />}
              </span>
              <h4 className="text-lg font-bold leading-snug text-ink dark:text-ink">{headline}</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-ink">{meaning}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {provider && first && (
              <button
                type="button"
                onClick={onStart}
                disabled={!ready || !onStart || entry.startPending || entry.startBusy}
                aria-label={`Start Job: ${entry.title}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-ink-muted dark:disabled:bg-neutral-700 dark:disabled:text-ink-secondary"
              >
                <Play size={17} weight="fill" aria-hidden="true" /> {entry.startPending ? 'Starting...' : 'Start Job'}
              </button>
            )}
            {!provider && (
              <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-secondary dark:text-ink">
                <CheckCircle size={19} weight="duotone" className="text-orange-700 dark:text-orange-400" aria-hidden="true" /> No action needed now
              </span>
            )}
            {provider && !first && <span className="text-sm font-semibold text-ink-secondary dark:text-ink">Start Job is available at position #1</span>}
          </div>

          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">
            <strong className="font-bold text-ink dark:text-ink">Next:</strong> {entry.next}
          </p>
        </div>

        <div className="flex flex-col border-t border-stone-200 bg-stone-50/70 p-5 sm:p-6 lg:border-l lg:border-t-0 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            <div>
              <span className="block text-xs font-semibold text-ink-muted dark:text-ink-secondary">Queue position</span>
              <span className={`mt-1 block text-3xl font-bold leading-none tabular-nums ${provider ? 'text-emerald-800 dark:text-emerald-300' : 'text-orange-800 dark:text-orange-300'}`}>
                {entry.queuePosition ? `#${entry.queuePosition}` : 'Pending'}
              </span>
              <span className="mt-1 block text-xs text-ink-muted dark:text-ink-secondary">Across this provider’s paid jobs</span>
            </div>
            {typeof entry.queueEstimatedWait === 'number' && entry.queueEstimatedWait > 0 && (
              <div>
                <span className="block text-xs font-semibold text-ink-muted dark:text-ink-secondary">Estimated wait</span>
                <span className="mt-1 block text-sm font-bold text-ink dark:text-ink">About {entry.queueEstimatedWait >= 60 ? `${Math.floor(entry.queueEstimatedWait / 60)} hr${entry.queueEstimatedWait % 60 ? ` ${entry.queueEstimatedWait % 60} min` : ''}` : `${entry.queueEstimatedWait} min`}</span>
                <span className="mt-1 block text-xs text-ink-muted dark:text-ink-secondary">Based on jobs ahead; actual time may vary</span>
              </div>
            )}
            <div>
              <span className="block text-xs font-semibold text-ink-muted dark:text-ink-secondary">GCash payment</span>
              <span className="mt-1 block text-sm font-bold text-ink dark:text-ink">{entry.payment || 'Status updating'}</span>
              {paymentConfirmed && <span className="mt-1 block text-xs text-ink-muted dark:text-ink-secondary">No further payment needed</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 lg:mt-auto ${provider ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-50 focus-visible:outline-emerald-600 dark:border-emerald-800 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-950/40' : 'border-orange-200 text-orange-800 hover:bg-orange-50 focus-visible:outline-orange-600 dark:border-orange-800 dark:bg-transparent dark:text-orange-300 dark:hover:bg-orange-950/40'}`}
          >
            Booking details <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
