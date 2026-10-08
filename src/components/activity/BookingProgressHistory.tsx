import type { BookingProgressEvent, JobEngagement } from '../../types';
import ActivityProgressTimes, { isActivityTimestamp as isTimestamp } from './ActivityProgressTimes';

type HistoryRow = {
  id: string;
  kind: string;
  label: string;
  actorRole?: BookingProgressEvent['actorRole'];
  occurredAt?: string;
  state: 'recorded' | 'missing' | 'pending';
};

const milestones = ['STARTED', 'WORK_MARKED_COMPLETE', 'COMPLETION_CONFIRMED'];
const labels: Record<string, string> = {
  CREATED: 'Booking created', STARTED: 'Work started',
  WORK_MARKED_COMPLETE: 'Work marked complete', COMPLETION_CONFIRMED: 'Completion confirmed',
  DECLINED: 'Booking declined', CANCELLATION_REQUESTED: 'Cancellation requested',
  CANCELLATION_APPROVED: 'Cancellation approved', CANCELLATION_DECLINED: 'Cancellation declined',
  CANCELLATION_ESCALATED: 'Cancellation sent for admin review', CANCELED: 'Booking canceled',
  COMPLETION_RECORDED: 'Completion recorded', CANCELLATION_RESOLVED: 'Cancellation resolved',
};

export function bookingProgressRows(booking: JobEngagement): HistoryRow[] {
  // Acceptance is already represented by the journey stages. Keep the time
  // history focused on work and decisions, including older booking records.
  const events = (booking.progressEvents || []).filter(event => event.kind !== 'ACCEPTED');
  const rows: HistoryRow[] = events.map(event => ({
    ...event,
    label: labels[event.kind] || 'Booking updated',
    state: isTimestamp(event.occurredAt) ? 'recorded' : 'missing',
  }));
  const createdAt = booking.bookingCreatedAt || (booking.completedServiceId ? undefined : booking.createdAt);
  rows.push({ id: 'created', kind: 'CREATED', label: labels.CREATED,
    occurredAt: createdAt, state: isTimestamp(createdAt) ? 'recorded' : 'missing' });

  // Preserve trustworthy existing dates for older bookings. updatedAt is never
  // used as a substitute for an acceptance, start, or completion action time.
  if (!events.some(event => event.kind === 'COMPLETION_CONFIRMED') && isTimestamp(booking.completionRecordedAt)) {
    rows.push({ id: 'legacy-completion', kind: 'COMPLETION_RECORDED', label: labels.COMPLETION_RECORDED,
      occurredAt: booking.completionRecordedAt, state: 'recorded' });
  }
  for (const request of booking.progressCancellationRequests || booking.cancellationRequests || []) {
    const requestEvents = events.filter(event => event.eventKey?.startsWith(`${request.id}:`));
    if (!requestEvents.some(event => event.kind === 'CANCELLATION_REQUESTED') && isTimestamp(request.createdAt)) {
      rows.push({ id: `${request.id}:legacy`, kind: 'CANCELLATION_REQUESTED', label: labels.CANCELLATION_REQUESTED,
        actorRole: request.requestedBy === booking.seekerId ? 'SEEKER' : 'PROVIDER', occurredAt: request.createdAt, state: 'recorded' });
    }
    if (!requestEvents.some(event => ['CANCELLATION_APPROVED', 'CANCELLATION_DECLINED'].includes(event.kind)) && isTimestamp(request.resolvedAt)
      && ['APPROVED', 'DECLINED', 'RESOLVED'].includes(request.status)) {
      rows.push({ id: `${request.id}:legacy-response`, kind: 'CANCELLATION_RESOLVED', label: labels.CANCELLATION_RESOLVED,
        occurredAt: request.resolvedAt, state: 'recorded' });
    }
  }
  rows.sort((a, b) => {
    const difference = (isTimestamp(a.occurredAt) ? Date.parse(a.occurredAt) : -Infinity)
      - (isTimestamp(b.occurredAt) ? Date.parse(b.occurredAt) : -Infinity);
    return difference || (a.kind === 'CREATED' ? -1 : b.kind === 'CREATED' ? 1 : 0);
  });

  const closed = booking.status === 'canceled' || ['DECLINED', 'CANCELED', 'REMOVED'].includes(booking.bookingStatus || '');
  const completed = booking.status === 'completed';
  const awaiting = booking.status === 'awaiting_seeker_approval';
  const started = booking.started === true || awaiting || completed
    || events.some(event => ['STARTED', 'WORK_MARKED_COMPLETE', 'COMPLETION_CONFIRMED'].includes(event.kind));
  const reached = [started, awaiting || completed, completed];
  milestones.forEach((kind, index) => {
    if (events.some(event => event.kind === kind)
      || (kind === 'COMPLETION_CONFIRMED' && rows.some(row => row.kind === 'COMPLETION_RECORDED'))) return;
    if (reached[index]) {
      const row: HistoryRow = { id: `missing-${kind}`, kind, label: labels[kind], state: 'missing' };
      // An unknown earlier time has no invented date or actor. Place it before
      // a later lifecycle milestone without changing known event order.
      const next = rows.findIndex(item => milestones.indexOf(item.kind) > index || item.kind === 'COMPLETION_RECORDED');
      if (next < 0) rows.push(row); else rows.splice(next, 0, row);
    } else if (!closed) {
      rows.push({ id: `pending-${kind}`, kind, label: labels[kind], state: 'pending' });
    }
  });
  return rows;
}

export default function BookingProgressHistory({ booking }: { booking: JobEngagement }) {
  const actor = (role?: BookingProgressEvent['actorRole']) => {
    if (role === 'SEEKER') return `Seeker · ${booking.seekerName}`;
    if (role === 'PROVIDER') return `Provider · ${booking.providerName}`;
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'SYSTEM') return 'ServiceHub';
    return undefined;
  };
  return <ActivityProgressTimes label="Booking progress times"
    rows={bookingProgressRows(booking).map(row => ({ ...row, actor: actor(row.actorRole) }))} />;
}
