import type { JobEngagement } from '../../types';

type Role = 'seeker' | 'provider';
type Tone = 'action' | 'waiting' | 'active' | 'review' | 'finished';

export interface ActivitySituationContent {
  tone: Tone;
  label: string;
  title: string;
  detail: string;
  next: string;
}

export function getActivitySituation(
  booking: JobEngagement,
  role: Role,
  currentUserId?: string,
  activeJobId?: string,
): ActivitySituationContent {
  const cancellation = booking.status === 'completed' || booking.status === 'canceled' ? undefined : booking.cancellationRequests?.[0];
  if (cancellation?.status === 'PENDING') {
    const mine = cancellation.requestedBy === currentUserId;
    return mine
      ? { tone: 'waiting', label: 'Waiting on response', title: 'Cancellation requested', detail: `Your request is waiting for the ${role === 'seeker' ? 'provider' : 'seeker'} to respond.`, next: 'They can approve or decline it; work is not canceled yet.' }
      : { tone: 'action', label: 'Your decision needed', title: 'Review the cancellation request', detail: `The ${role === 'seeker' ? 'provider' : 'seeker'} has asked to cancel this booking.`, next: 'Choose Approve or Decline below. Until then, the booking remains open.' };
  }
  if (cancellation?.status === 'UNDER_REVIEW') {
    return { tone: 'review', label: 'Settlement in progress', title: 'Cancellation is being processed', detail: 'The cancellation decision is awaiting settlement or recovery.', next: 'The booking will update when processing finishes; use Retry approval if it is offered below.' };
  }
  if (cancellation?.status === 'ESCALATED') {
    return { tone: 'review', label: 'Admin review', title: 'Cancellation is under review', detail: 'An administrator is reviewing the declined cancellation request.', next: 'The booking will update after the administrator decides.' };
  }
  if (cancellation?.status === 'DECLINED' && cancellation.requestedBy === currentUserId) {
    return { tone: 'action', label: 'Decision available', title: 'Cancellation was declined', detail: `The ${role === 'seeker' ? 'provider' : 'seeker'} declined your request.`, next: 'You can escalate the decision to Admin using the action below.' };
  }

  if (booking.status === 'pending_provider') {
    return role === 'provider'
      ? { tone: 'action', label: 'Your decision needed', title: 'A direct request is waiting', detail: 'This onsite-cash booking needs your approval before work can begin.', next: 'Review and respond in Incoming Requests; accepting does not start the job.' }
      : { tone: 'waiting', label: 'Waiting on provider', title: 'Your request is awaiting approval', detail: 'The provider has not accepted this onsite-cash booking yet.', next: 'If accepted, you can coordinate the work and the provider can start it.' };
  }
  if (booking.status === 'queued') {
    const first = booking.queuePosition === 1;
    const position = booking.queuePosition ? `#${booking.queuePosition}` : 'pending';
    return role === 'provider'
      ? first
        ? activeJobId && activeJobId !== booking.id
          ? { tone: 'waiting', label: 'Another job active', title: 'First in this service queue', detail: 'GCash Test Mode payment is recorded, but you are already working on another booking.', next: 'Finish the current job before using Start for this one.' }
          : { tone: 'action', label: 'Ready to start', title: 'First in this service queue', detail: 'GCash Test Mode payment is recorded. This booking is eligible to start when you are available.', next: 'Use Start below; only one job may be active across your services.' }
        : { tone: 'waiting', label: 'Waiting in queue', title: `Position ${position} in this service queue`, detail: 'Earlier bookings for this listing are ahead of this seeker.', next: 'When this booking reaches first position, you may start it if no other job is active.' }
      : { tone: 'waiting', label: 'Waiting on provider', title: first ? 'First in this service queue' : `Position ${position} in this service queue`, detail: 'Your GCash Test Mode payment is recorded. The provider has not started your work.', next: first ? 'The provider can start this booking when available.' : 'Your position advances as earlier bookings in this listing leave the queue.' };
  }
  if (booking.status === 'in_progress') {
    if (!booking.started) {
      return role === 'provider'
        ? activeJobId && activeJobId !== booking.id
          ? { tone: 'waiting', label: 'Another job active', title: 'Booking accepted, work not started', detail: 'The booking is confirmed, but you are already working on another booking.', next: 'Finish the current job before starting this one.' }
          : { tone: 'action', label: 'Ready to start', title: 'Booking accepted, work not started', detail: 'The booking is confirmed, but Start Job has not been pressed.', next: 'Start the job when you are ready; only one job can be active at a time.' }
        : { tone: 'waiting', label: 'Waiting on provider', title: 'Booking accepted, work not started', detail: 'Your provider has accepted the booking.', next: 'The provider will start the job when ready. You can coordinate in Messages.' };
    }
    return role === 'provider'
      ? { tone: 'active', label: 'Work underway', title: 'This job is in progress', detail: 'You have started this booking.', next: 'When the work is done, use Mark Completed; the seeker will then review it.' }
      : { tone: 'active', label: 'Work underway', title: 'Your service is in progress', detail: 'The provider has started work on this booking.', next: 'After the provider marks it complete, you will confirm the work or report an issue.' };
  }
  if (booking.status === 'awaiting_seeker_approval') {
    return role === 'seeker'
      ? { tone: 'action', label: 'Your confirmation needed', title: 'Provider marked the work complete', detail: 'The booking is not final until you review the result.', next: 'Confirm completion if the work is done, or Report Issue if something is wrong.' }
      : { tone: 'waiting', label: 'Waiting on seeker', title: 'Work submitted for confirmation', detail: 'You marked the work complete. The seeker has not confirmed it yet.', next: 'The seeker can confirm or report an issue. Admin review may be requested after 72 hours.' };
  }
  if (booking.status === 'disputed') {
    return { tone: 'review', label: 'Admin review', title: 'This booking is under dispute', detail: 'The issue is being reviewed; completion and payment settlement are paused.', next: 'An administrator will decide the outcome. You can use Messages or Safety report as needed.' };
  }
  if (booking.status === 'completed') {
    return { tone: 'finished', label: 'Completed', title: 'This booking is complete', detail: 'The service has been confirmed and closed.', next: role === 'seeker' ? 'You can leave a review or request this service again.' : 'You can review the client and view your payment records.' };
  }
  return { tone: 'finished', label: 'Canceled', title: 'This booking is closed', detail: 'The booking will not move forward.', next: 'You can review its history or find another service.' };
}

export default function ActivitySituation({ booking, role, currentUserId, activeJobId }: { booking: JobEngagement; role: Role; currentUserId?: string; activeJobId?: string }) {
  const content = getActivitySituation(booking, role, currentUserId, activeJobId);
  const toneClasses: Record<Tone, string> = {
    action: role === 'provider'
      ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-100'
      : 'border-orange-200 bg-orange-50/80 text-orange-950 dark:border-orange-900/50 dark:bg-orange-950/25 dark:text-orange-100',
    waiting: 'border-stone-200 bg-stone-50 text-stone-900 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100',
    active: 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-100',
    review: 'border-amber-200 bg-amber-50/75 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100',
    finished: 'border-stone-200 bg-stone-50 text-stone-900 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100',
  };

  return (
    <section aria-label="Current booking situation" className={`rounded-xl border p-4 ${toneClasses[content.tone]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-base font-bold leading-snug tracking-tight">{content.title}</h4>
        <span className="rounded-full border border-current/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">{content.label}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed">{content.detail}</p>
      <p className="mt-3 border-t border-current/15 pt-2.5 text-xs leading-relaxed"><span className="font-bold">Next:</span> {content.next}</p>
    </section>
  );
}
