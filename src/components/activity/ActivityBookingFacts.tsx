import type { JobEngagement } from '../../types';
import { getActivityPaymentCopy, getActivityQueueCopy } from './activityPresentation';

export default function ActivityBookingFacts({ booking, role }: { booking: JobEngagement; role: 'seeker' | 'provider' }) {
  const payment = getActivityPaymentCopy(booking);
  const queue = getActivityQueueCopy(booking);
  const participant = role === 'seeker' ? booking.providerName : booking.seekerName;
  return (
    <section aria-label="Booking facts" className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/40 sm:p-5">
      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Booking details</h3>
      <dl className="mt-3 divide-y divide-stone-200/80 dark:divide-neutral-700">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3 first:pt-0">
          <dt className="text-xs font-medium text-stone-600 dark:text-stone-300">{role === 'seeker' ? 'Provider' : 'Seeker'}</dt>
          <dd className="min-w-0 text-right text-sm font-semibold text-stone-900 dark:text-stone-100">{participant}</dd>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-stone-600 dark:text-stone-300">Agreed price</dt>
          <dd className="text-right text-sm font-bold tabular-nums text-stone-900 dark:text-stone-100">₱{booking.price}</dd>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-stone-600 dark:text-stone-300">Payment</dt>
          <dd className="min-w-0 text-right">
            <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{payment.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-stone-600 dark:text-stone-300">{payment.detail}</span>
          </dd>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 pt-3">
          <dt className="text-xs font-medium text-stone-600 dark:text-stone-300">Queue</dt>
          <dd className="min-w-0 text-right">
            <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{queue.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-stone-600 dark:text-stone-300">{queue.detail}</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
