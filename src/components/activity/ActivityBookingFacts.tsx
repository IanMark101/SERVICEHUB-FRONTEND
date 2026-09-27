import type { JobEngagement } from '../../types';
import { getActivityPaymentCopy, getActivityQueueCopy } from './activityPresentation';

export default function ActivityBookingFacts({ booking, role }: { booking: JobEngagement; role: 'seeker' | 'provider' }) {
  const payment = getActivityPaymentCopy(booking);
  const queue = getActivityQueueCopy(booking);
  const participant = role === 'seeker' ? booking.providerName : booking.seekerName;
  return (
    <section aria-label="Booking facts" className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/40 sm:p-5">
      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Booking details</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs font-medium text-stone-500 dark:text-stone-400">{role === 'seeker' ? 'Provider' : 'Seeker'}</dt><dd className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{participant}</dd></div>
        <div><dt className="text-xs font-medium text-stone-500 dark:text-stone-400">Agreed price</dt><dd className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">₱{booking.price}</dd></div>
        <div><dt className="text-xs font-medium text-stone-500 dark:text-stone-400">Payment</dt><dd className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{payment.label}</dd><dd className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">{payment.detail}</dd></div>
        <div><dt className="text-xs font-medium text-stone-500 dark:text-stone-400">Queue</dt><dd className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{queue.label}</dd><dd className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">{queue.detail}</dd></div>
      </dl>
    </section>
  );
}
