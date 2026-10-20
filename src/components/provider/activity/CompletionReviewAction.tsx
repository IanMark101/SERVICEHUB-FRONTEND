'use client';

import { useEffect, useId, useState } from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import type { JobEngagement } from '../../../types';
import { canRequestCompletionReview, completionReviewForBooking } from '../../../lib/completionReview';

const formatDate = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true,
});

export default function CompletionReviewAction({ booking, busy, submitting, onRequest }: {
  booking: JobEngagement; busy: boolean; submitting: boolean; onRequest: (id: string) => void;
}) {
  const descriptionId = useId();
  const [now, setNow] = useState(() => Date.now());
  const review = completionReviewForBooking(booking);
  const deadline = review ? Date.parse(review.availableAt) : NaN;
  const pending = !!review?.pending;
  const ready = canRequestCompletionReview(booking, now);

  useEffect(() => {
    if (pending || !Number.isFinite(deadline)) return;
    const update = () => setNow(Date.now());
    // Wake at the actual deadline, and recheck when returning from a background tab.
    const timer = deadline > now ? window.setTimeout(update, Math.min(deadline - now, 2_147_483_647)) : undefined;
    window.addEventListener('focus', update);
    return () => { window.clearTimeout(timer); window.removeEventListener('focus', update); };
  }, [deadline, now, pending]);

  const description = pending ? 'Your request is with an administrator. The customer can still confirm completion.'
    : !Number.isFinite(deadline) ? 'Refresh the booking to check when admin review becomes available.'
    : ready ? 'The 72-hour customer response period has ended. You can request admin review.'
    : `Available ${formatDate.format(deadline)} (Philippine time), after the 72-hour customer response period.`;

  if (booking.paymentMethod !== 'GCash') return null;

  return <div className="flex w-full flex-col items-start gap-2">
    <button type="button" disabled={busy || !ready} data-action="admin-review"
      aria-describedby={descriptionId}
      onClick={() => { if (canRequestCompletionReview(booking)) onRequest(booking.id); }}
      className="flex cursor-pointer items-center justify-center gap-1 rounded-xl px-3.5 py-1.5 font-extrabold transition-colors disabled:cursor-not-allowed">
      {submitting ? <><CircleNotch className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Submitting...</>
        : pending ? 'Admin Review Requested' : 'Request Admin Review'}
    </button>
    <p id={descriptionId} className="max-w-prose text-sm leading-relaxed text-ink-secondary dark:text-ink">{description}</p>
  </div>;
}
