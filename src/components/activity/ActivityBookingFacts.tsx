import type { JobEngagement } from '../../types';
import { getActivityPaymentCopy, getActivityQueueCopy } from './activityPresentation';

export default function ActivityBookingFacts({ booking, role }: { booking: JobEngagement; role: 'seeker' | 'provider' }) {
  const payment = getActivityPaymentCopy(booking);
  const queue = getActivityQueueCopy(booking);
  const participant = role === 'seeker' ? booking.providerName : booking.seekerName;
  return (
    <section aria-label="Booking facts" className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/40 sm:p-5">
      <h3 className="text-sm font-bold text-ink dark:text-ink">Booking details</h3>
      <dl className="mt-3 divide-y divide-stone-200/80 dark:divide-neutral-700">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3 first:pt-0">
          <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">{role === 'seeker' ? 'Provider' : 'Seeker'}</dt>
          <dd className="min-w-0 text-right text-sm font-semibold text-ink dark:text-ink">{participant}</dd>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">Agreed price</dt>
          <dd className="text-right text-sm font-bold tabular-nums text-ink dark:text-ink">₱{booking.price}</dd>
        </div>
        {booking.providerAvailability?.trim() && <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">Provider availability</dt>
          <dd className="min-w-0 whitespace-pre-wrap break-words text-right text-sm font-semibold text-ink dark:text-ink">{booking.providerAvailability}</dd>
        </div>}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">Payment</dt>
          <dd className="min-w-0 text-right">
            <span className="block text-sm font-semibold text-ink dark:text-ink">{payment.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">{payment.detail}</span>
          </dd>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">Queue</dt>
          <dd className="min-w-0 text-right">
            <span className="block text-sm font-semibold text-ink dark:text-ink">{queue.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">{queue.detail}</span>
          </dd>
        </div>
        {booking.status === 'queued' && typeof booking.queueEstimatedWait === 'number' && (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 pt-3">
            <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">Estimated wait</dt>
            <dd className="min-w-0 text-right">
              <span className="block text-sm font-semibold text-ink dark:text-ink">{booking.queueEstimatedWait === 0 ? 'Next when available' : `About ${booking.queueEstimatedWait >= 60 ? `${Math.floor(booking.queueEstimatedWait / 60)} hr${booking.queueEstimatedWait % 60 ? ` ${booking.queueEstimatedWait % 60} min` : ''}` : `${booking.queueEstimatedWait} min`}`}</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">Based on jobs ahead; actual time may vary.</span>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
