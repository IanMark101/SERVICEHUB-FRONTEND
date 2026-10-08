import type { JobEngagement } from '../../types';
import { getActivitySituation } from './ActivitySituation';
import ActivityDetailSituation from './ActivityDetailSituation';

function actionCopy(booking: JobEngagement, role: 'seeker' | 'provider', currentUserId?: string, activeJobId?: string, paidWaiting?: boolean): string {
  const cancellation = booking.cancellationRequests?.[0];
  if (cancellation?.status === 'PENDING' && cancellation.requestedBy !== currentUserId) return 'Approve or decline the cancellation request below.';
  if (cancellation?.status === 'DECLINED' && cancellation.requestedBy === currentUserId && booking.status !== 'awaiting_seeker_approval') return 'You can escalate the declined cancellation request to Admin below.';
  if (cancellation?.status === 'UNDER_REVIEW' || cancellation?.status === 'ESCALATED' || booking.status === 'disputed') return 'No decision is required while this case is being reviewed.';
  if (role === 'provider' && booking.status === 'pending_provider') return 'Open Incoming Requests to accept or decline this booking.';
  if (role === 'provider' && booking.paymentMethod === 'On-site Cash' && booking.status === 'in_progress' && !booking.started && paidWaiting) return 'No action yet. Start the paid jobs ahead before this cash arrangement.';
  if (role === 'provider' && activeJobId && activeJobId !== booking.id && (booking.status === 'queued' || booking.status === 'in_progress' && !booking.started)) return 'No action until your current job finishes. This booking will remain waiting.';
  if (role === 'provider' && (booking.status === 'queued' && booking.queuePosition === 1 || booking.status === 'in_progress' && !booking.started)) return 'Start this job below when you are ready and no other job is active.';
  if (role === 'provider' && booking.status === 'in_progress' && booking.started) return 'Continue the work. Use Mark Work Finished when the service is done.';
  if (role === 'seeker' && booking.status === 'awaiting_seeker_approval') return 'Confirm Completion or Report Issue below.';
  return 'No required action right now.';
}

export default function ActivityWorkroomSituation({ booking, role, currentUserId, activeJobId, paidWaiting }: {
  booking: JobEngagement;
  role: 'seeker' | 'provider';
  currentUserId?: string;
  activeJobId?: string;
  paidWaiting?: boolean;
}) {
  const situation = getActivitySituation(booking, role, currentUserId, activeJobId, paidWaiting);
  const isHistory = booking.status === 'completed' || booking.status === 'canceled';
  return <ActivityDetailSituation situation={situation} role={role} closed={booking.status === 'canceled'}
    action={isHistory ? 'No action needed for this booking.' : actionCopy(booking, role, currentUserId, activeJobId, paidWaiting)} />;
}
