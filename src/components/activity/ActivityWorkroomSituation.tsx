import type { JobEngagement } from '../../types';
import { getActivitySituation } from './ActivitySituation';

function actionCopy(booking: JobEngagement, role: 'seeker' | 'provider', currentUserId?: string, activeJobId?: string): string {
  const cancellation = booking.cancellationRequests?.[0];
  if (cancellation?.status === 'PENDING' && cancellation.requestedBy !== currentUserId) return 'Approve or decline the cancellation request below.';
  if (cancellation?.status === 'DECLINED' && cancellation.requestedBy === currentUserId) return 'You can escalate the declined cancellation request to Admin below.';
  if (cancellation?.status === 'UNDER_REVIEW' || cancellation?.status === 'ESCALATED' || booking.status === 'disputed') return 'No decision is required while this case is being reviewed.';
  if (role === 'provider' && booking.status === 'pending_provider') return 'Open Incoming Requests to accept or decline this booking.';
  if (role === 'provider' && activeJobId && activeJobId !== booking.id && (booking.status === 'queued' || booking.status === 'in_progress' && !booking.started)) return 'No action until your current job finishes. This booking will remain waiting.';
  if (role === 'provider' && (booking.status === 'queued' && booking.queuePosition === 1 || booking.status === 'in_progress' && !booking.started)) return 'Start this job below when you are ready and no other job is active.';
  if (role === 'provider' && booking.status === 'in_progress' && booking.started) return 'Continue the work. Use Mark Work Finished when the service is done.';
  if (role === 'seeker' && booking.status === 'awaiting_seeker_approval') return 'Confirm Completion or Report Issue below.';
  return 'No required action right now.';
}

export default function ActivityWorkroomSituation({ booking, role, currentUserId, activeJobId }: {
  booking: JobEngagement;
  role: 'seeker' | 'provider';
  currentUserId?: string;
  activeJobId?: string;
}) {
  const situation = getActivitySituation(booking, role, currentUserId, activeJobId);
  const needsAction = situation.tone === 'action';
  const action = actionCopy(booking, role, currentUserId, activeJobId);
  const emphasis = role === 'seeker'
    ? 'border-orange-200 bg-orange-50/70 dark:border-orange-900/50 dark:bg-orange-950/20'
    : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20';
  return (
    <div className="space-y-3">
      <section aria-label="What is happening now" className={`rounded-2xl border p-4 sm:p-5 ${emphasis}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-300">Now</p>
          <span className="rounded-full border border-stone-300 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-stone-200">{situation.label}</span>
        </div>
        <h2 className="mt-2 text-lg font-bold leading-snug text-stone-950 dark:text-stone-50">{situation.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">{situation.detail}</p>
      </section>
      <section aria-label="Your action" className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/40 sm:p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-300">Your action</h3>
        <p className="mt-1.5 text-sm font-semibold text-stone-900 dark:text-stone-100">
          {action}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
          {needsAction ? 'Messages and Safety report are also available if you need help.' : 'Optional booking actions, Messages, and Safety report remain available below.'}
        </p>
      </section>
      <section aria-label="What happens next" className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/40 sm:p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-300">Next</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-800 dark:text-stone-100">{situation.next}</p>
      </section>
    </div>
  );
}
