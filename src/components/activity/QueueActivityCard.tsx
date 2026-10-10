import { ArrowRight, CheckCircle, Play } from '@phosphor-icons/react';
import type { ActivityFeedEntry } from './ActivityFeed';
import overview from './activity-overview.module.css';

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
    <article data-activity-card="queue" className={`${overview.card} min-w-0 rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-700 dark:bg-charcoal-surface`} aria-label={`${entry.title} queue booking`}>
      <div className={overview.layout}>
        <div className={overview.identity}>
          <h3 className="text-sm font-bold text-ink dark:text-ink sm:text-base">{entry.title}</h3>
          <p className="mt-1 text-xs text-ink-muted dark:text-ink-secondary">{entry.participant}</p>
          <div className="mt-3 flex flex-col gap-1 text-xs text-ink-secondary dark:text-ink">
            <span>Queue position <strong className="font-bold tabular-nums">{entry.queuePosition ? `#${entry.queuePosition}` : 'Pending'}</strong></span>
            {typeof entry.queueEstimatedWait === 'number' && entry.queueEstimatedWait > 0 && <span className="text-ink-muted dark:text-ink-secondary" title="Based on jobs ahead; actual time may vary">Estimated wait · About {entry.queueEstimatedWait >= 60 ? `${Math.floor(entry.queueEstimatedWait / 60)} hr${entry.queueEstimatedWait % 60 ? ` ${entry.queueEstimatedWait % 60} min` : ''}` : `${entry.queueEstimatedWait} min`}</span>}
          </div>
        </div>
        <div className={overview.summary}>
          <h4 className={`self-start rounded-full px-2.5 py-1 text-[11px] font-bold ${provider ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200'}`}>{headline}</h4>
          <p className="text-xs leading-relaxed text-ink-secondary dark:text-ink">{meaning}</p>
          <div className="space-y-1 text-xs text-ink-muted dark:text-ink-secondary">
            <p><strong className="font-semibold text-ink dark:text-ink">Payment</strong> · {entry.payment || 'Status updating'}</p>
            {!provider && <p className="flex items-center gap-1.5"><CheckCircle size={15} aria-hidden="true" /> No action needed now</p>}
            {provider && !first && <p>Start Job is available at position #1</p>}
          </div>
        </div>
        <strong className={`${overview.price} text-base tabular-nums text-ink dark:text-ink`}>₱{entry.price.toLocaleString('en-PH', { maximumFractionDigits: 2 })}</strong>
        <div className={overview.actions}>
          {provider && first && (
            <button
              type="button"
              onClick={onStart}
              disabled={!ready || !onStart || entry.startPending || entry.startBusy}
              aria-label={`Start Job: ${entry.title}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-ink-muted dark:disabled:bg-charcoal dark:disabled:text-ink-secondary"
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold">
                <Play size={17} weight="fill" aria-hidden="true" /> {entry.startPending ? 'Starting...' : 'Start Job'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${provider ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-50 focus-visible:outline-emerald-600 dark:border-emerald-800 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-950/40' : 'border-orange-200 text-orange-800 hover:bg-orange-50 focus-visible:outline-orange-600 dark:border-orange-800 dark:bg-transparent dark:text-orange-300 dark:hover:bg-orange-950/40'}`}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold">
              Booking details <ArrowRight size={17} aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
