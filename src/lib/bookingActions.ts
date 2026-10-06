import type { JobEngagement } from '../types';

type BookingActionTarget = Pick<JobEngagement, 'id' | 'bookingId' | 'bookingStatus'>;

// Keep aligned with safety-report.service.ts. The display state groups WAITING
// with ACCEPTED, and DECLINED / REMOVED with CANCELED, so it cannot grant access.
const SAFETY_REPORT_STATUSES = new Set([
  'ACCEPTED', 'ONGOING', 'AWAITING_CONFIRMATION', 'UNDER_REVIEW',
  'DISPUTED', 'COMPLETED', 'CANCELED',
]);

export function getEngagementBookingId(engagement: BookingActionTarget): string | null {
  return engagement.bookingId === null ? null : engagement.bookingId ?? engagement.id;
}

export function getSafetyReportBlockReason(engagement: BookingActionTarget): string | null {
  if (!getEngagementBookingId(engagement)) {
    return 'This history record has no linked booking. A safety report needs a linked booking.';
  }
  if (!engagement.bookingStatus) {
    return 'The booking status could not be confirmed. Close this dialog and refresh Activity before trying again.';
  }
  if (!SAFETY_REPORT_STATUSES.has(engagement.bookingStatus)) {
    return 'Safety reports are available after a booking is accepted. Pending, declined, and removed bookings cannot be reported here.';
  }
  return null;
}

export function canReportBookingSafety(engagement: BookingActionTarget): boolean {
  return getSafetyReportBlockReason(engagement) === null;
}

export function canOpenBookingConversation(engagement: BookingActionTarget): boolean {
  // The messages contact endpoint excludes pending approvals and declined work.
  return Boolean(getEngagementBookingId(engagement) && engagement.bookingStatus
    && !['PENDING_APPROVAL', 'DECLINED'].includes(engagement.bookingStatus));
}
