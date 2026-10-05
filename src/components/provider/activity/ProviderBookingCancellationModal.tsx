import type { JobEngagement } from '../../../types';
import ReasonModal from '../../ui/ReasonModal';

interface ProviderBookingCancellationModalProps {
  booking: JobEngagement | null;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
}

export default function ProviderBookingCancellationModal({
  booking, value, onChange, onClose, onSubmit, isSubmitting,
}: ProviderBookingCancellationModalProps) {
  if (!booking) return null;

  // Booking.started is the same authoritative distinction used by the
  // cancellation endpoint: pre-start is immediate; started needs review.
  const immediate = !booking.started;
  const preStartConsequence = booking.status === 'queued'
    ? 'Canceling will immediately remove this booking from your paid work queue and notify the seeker.'
    : 'Canceling will immediately close this booking and notify the seeker.';
  const paymentConsequence = booking.paymentMethod === 'GCash'
    ? 'The existing GCash refund handling will apply.'
    : 'ServiceHub has not collected on-site cash, so there is no platform refund.';

  return (
    <ReasonModal
      isOpen
      title={immediate ? 'Cancel this booking?' : 'Request cancellation'}
      description={immediate
        ? `This service has not started. ${preStartConsequence} ${paymentConsequence}`
        : 'Work has already started. Your request will go to the seeker for review. The booking will not be canceled just by sending this request.'}
      label={immediate ? 'Reason for cancellation' : 'Reason for request'}
      value={value}
      onChange={onChange}
      onClose={onClose}
      onSubmit={onSubmit}
      confirmText={immediate ? 'Cancel Booking' : 'Request Cancellation'}
      cancelText="Keep Booking"
      submittingText={immediate ? 'Canceling...' : 'Sending request...'}
      validText={immediate ? 'Reason ready. Booking will be canceled.' : 'Reason ready. Request will be sent.'}
      variant="danger"
      isSubmitting={isSubmitting}
    />
  );
}
