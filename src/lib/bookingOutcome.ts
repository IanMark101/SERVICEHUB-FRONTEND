import type { JobEngagement } from '../types';

export type BookingOutcome = 'completed' | 'canceled' | 'declined' | 'removed';

export const bookingOutcomeLabels: Record<BookingOutcome, string> = {
  completed: 'Completed', canceled: 'Canceled', declined: 'Declined', removed: 'Removed',
};

export function getBookingOutcome(booking: JobEngagement): BookingOutcome | undefined {
  if (booking.bookingStatus) {
    const outcomes: Record<string, BookingOutcome> = { COMPLETED: 'completed', CANCELED: 'canceled', DECLINED: 'declined', REMOVED: 'removed' };
    return outcomes[booking.bookingStatus];
  }
  return booking.status === 'completed' || booking.status === 'canceled' ? booking.status : undefined;
}
