import type { JobEngagement } from '../../types';
import { getActivityPaymentCopy, getActivityQueueCopy } from './activityPresentation';
import ActivityFacts, { formatActivityDuration, type ActivityFact } from './ActivityFacts';

export default function ActivityBookingFacts({ booking, role }: { booking: JobEngagement; role: 'seeker' | 'provider' }) {
  const payment = getActivityPaymentCopy(booking);
  const queue = getActivityQueueCopy(booking);
  const participant = role === 'seeker' ? booking.providerName : booking.seekerName;
  const rows: ActivityFact[] = [
    { label: role === 'seeker' ? 'Provider' : 'Seeker', value: participant },
    { label: 'Agreed price', value: <strong>₱{booking.price}</strong> },
    { label: 'Estimated duration', value: formatActivityDuration(booking.estimatedDurationMins) },
    ...(booking.providerAvailability?.trim() ? [{ label: 'Provider availability', value: booking.providerAvailability }] : []),
    ...(booking.preferredSchedule?.trim() ? [{ label: 'Proposed schedule', value: booking.preferredSchedule }] : []),
    { label: 'Payment', value: payment.label, detail: payment.detail },
    { label: 'Queue', value: queue.label, detail: queue.detail },
  ];
  if (booking.status === 'queued' && typeof booking.queueEstimatedWait === 'number') {
    const minutes = booking.queueEstimatedWait;
    rows.push({
      label: 'Estimated wait',
      value: minutes === 0 ? 'Next when available' : `About ${minutes >= 60 ? `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}` : `${minutes} min`}`,
      detail: 'Based on jobs ahead; actual time may vary.',
    });
  }
  return <ActivityFacts title="Booking details" label="Booking facts" rows={rows} />;
}
