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
    ...(booking.transportationFee ? [{ label: 'Transportation', value: `₱${booking.transportationFee.toLocaleString()}`, detail: 'Included once in the agreed price.' }] : []),
    ...(booking.jobLocation ? [{ label: 'Job location', value: <><span className="block">{booking.jobLocation.label}</span><a className="font-semibold" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${booking.jobLocation.latitude}&mlon=${booking.jobLocation.longitude}#map=17/${booking.jobLocation.latitude}/${booking.jobLocation.longitude}`}>View agreed job pin</a></>, detail: booking.jobLocation.address }] : []),
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
