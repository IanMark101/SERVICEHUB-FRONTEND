import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../../types';
import ProviderBookingCancellationModal from './ProviderBookingCancellationModal';

vi.mock('../../../context/AppContext', () => ({ useApp: () => ({ isDark: false }) }));

const queuedBooking: JobEngagement = {
  id: 'booking-1', title: 'House Cleaning', seekerId: 'johncarlo', seekerName: 'John Carlo', seekerAvatar: '',
  providerId: 'ian', providerName: 'Ian', providerAvatar: '', serviceId: 'service-1',
  price: 250, status: 'queued', paymentMethod: 'GCash', paymentStatus: 'PAID_HELD',
  queuePosition: 1, createdAt: '2026-09-27T09:00:00.000Z', started: false,
};

function renderModal(booking: JobEngagement, value = '') {
  const callbacks = { onChange: vi.fn(), onClose: vi.fn(), onSubmit: vi.fn() };
  render(<ProviderBookingCancellationModal booking={booking} value={value} {...callbacks} isSubmitting={false} />);
  return callbacks;
}

describe('Provider booking cancellation wording', () => {
  it('treats a queued GCash booking as immediate cancellation and requires a reason', () => {
    const callbacks = renderModal(queuedBooking, 'No');
    expect(screen.getByRole('heading', { name: 'Cancel this booking?' })).toBeInTheDocument();
    expect(screen.getByText(/remove this booking from your paid work queue and notify the seeker/)).toBeInTheDocument();
    expect(screen.getByText(/existing GCash refund handling will apply/)).toBeInTheDocument();
    expect(screen.queryByText(/request will go to the seeker for review/)).not.toBeInTheDocument();
    const confirm = screen.getByRole('button', { name: 'Cancel Booking' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason for cancellation' }), { target: { value: 'Not available' } });
    expect(callbacks.onChange).toHaveBeenCalledWith('Not available');
    expect(confirm).toBeDisabled();
    expect(screen.getByText('Enter at least 3 characters.')).toBeInTheDocument();
  });

  it('submits a valid queued cancellation and allows keeping the booking', () => {
    const callbacks = renderModal(queuedBooking, 'Unable to perform the service');
    expect(screen.getByText('Reason ready. Booking will be canceled.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Booking' }));
    expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Keep Booking' }));
    expect(callbacks.onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps accepted on-site cash pre-start cancellation immediate without claiming a queue refund', () => {
    renderModal({ ...queuedBooking, status: 'in_progress', paymentMethod: 'On-site Cash', started: false });
    expect(screen.getByRole('heading', { name: 'Cancel this booking?' })).toBeInTheDocument();
    expect(screen.getByText(/immediately close this booking and notify the seeker/)).toBeInTheDocument();
    expect(screen.getByText(/no platform refund/)).toBeInTheDocument();
    expect(screen.queryByText(/remove this booking from your paid work queue/)).not.toBeInTheDocument();
  });

  it('keeps started work as a cancellation request awaiting seeker review', () => {
    const callbacks = renderModal({ ...queuedBooking, status: 'in_progress', started: true }, 'Work cannot continue');
    expect(screen.getByRole('heading', { name: 'Request cancellation' })).toBeInTheDocument();
    expect(screen.getByText(/request will go to the seeker for review/)).toBeInTheDocument();
    expect(screen.getByText(/will not be canceled just by sending this request/)).toBeInTheDocument();
    expect(screen.getByText('Reason ready. Request will be sent.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel Booking' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Request Cancellation' }));
    expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
  });
});
