import type { ApiBooking } from '../context/mappers';
import { mapBookingToEngagement } from '../context/mappers';
import type { BookingProgressEvent, JobEngagement } from '../types';

/** The mutation response contains committed state, rather than a predicted UI state. */
export type BookingActionResult = Partial<ApiBooking> & {
  id: string;
  bookingId?: string;
  booking?: Partial<ApiBooking>;
  completedAt?: string;
  progressEvent?: BookingProgressEvent | null;
  cancellationRequest?: NonNullable<JobEngagement['cancellationRequests']>[number];
  review?: NonNullable<JobEngagement['reviews']>[number];
  hidden?: boolean;
};

export function mergeBookingAction(current: JobEngagement[], result: BookingActionResult): JobEngagement[] {
  const booking = result.booking || result;
  if (!booking.id) return current;
  if (result.hidden) return current.filter(item => item.id !== booking.id);
  if (!booking.status && !result.review && !result.cancellationRequest && !result.progressEvent) return current;
  return current.map(previous => {
    if (previous.id !== booking.id) return previous;
    const progress = result.progressEvent;
    const progressEvents = progress
      ? [...(previous.progressEvents || []).filter(event => event.id !== progress.id), progress]
      : previous.progressEvents;
    const finished = ['AWAITING_CONFIRMATION', 'COMPLETED'].includes(booking.status!);
    return {
      ...previous,
      status: booking.status ? mapBookingToEngagement({
        ...booking,
        queue: booking.queue ?? (previous.queueStatus ? { status: previous.queueStatus } : null),
      } as ApiBooking).status : previous.status,
      bookingStatus: booking.status ?? previous.bookingStatus,
      started: booking.started ?? previous.started,
      paymentStatus: booking.paymentStatus ?? previous.paymentStatus,
      progressEvents,
      ...(result.cancellationRequest ? {
        cancellationRequests: [result.cancellationRequest, ...(previous.cancellationRequests || []).filter(item => item.id !== result.cancellationRequest!.id)],
        progressCancellationRequests: [result.cancellationRequest, ...(previous.progressCancellationRequests || previous.cancellationRequests || []).filter(item => item.id !== result.cancellationRequest!.id)],
      } : {}),
      ...(result.review ? { reviews: [...(previous.reviews || []).filter(item => item.id !== result.review!.id), result.review] } : {}),
      ...(previous.queueStatus ? {
        queueStatus: booking.status === 'CANCELED' ? 'CANCELLED' : booking.status === 'ONGOING' ? 'SERVING' : finished ? 'DONE' : previous.queueStatus,
        queuePaymentStatus: booking.paymentStatus ?? previous.queuePaymentStatus,
      } : {}),
      ...(result.bookingId && booking.status === 'COMPLETED' ? {
        completedServiceId: result.id,
        completedAt: result.completedAt,
        completionRecordedAt: result.completedAt,
      } : {}),
    };
  });
}
