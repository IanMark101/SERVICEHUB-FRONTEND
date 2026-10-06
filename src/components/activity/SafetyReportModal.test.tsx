import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SafetyReportModal from './SafetyReportModal';
import { apiSubmitSafetyReport, apiUploadBookingEvidence } from '../../api/bookings.api';

vi.mock('../../api/bookings.api', () => ({
  apiSubmitSafetyReport: vi.fn(),
  apiUploadBookingEvidence: vi.fn(),
}));

const bookingA = { id: 'booking-a', bookingStatus: 'ACCEPTED', title: 'Booking A', providerName: 'Provider A', seekerName: 'Seeker A' };
const bookingB = { id: 'booking-b', bookingStatus: 'ONGOING', title: 'Booking B', providerName: 'Provider B', seekerName: 'Seeker B' };

describe('SafetyReportModal draft isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiUploadBookingEvidence).mockResolvedValue({ data: { storageKey: 'evidence/a' } } as never);
    vi.mocked(apiSubmitSafetyReport).mockResolvedValue({ data: { created: true } } as never);
  });

  it('clears description, category, evidence, and errors when the booking target changes', async () => {
    vi.mocked(apiUploadBookingEvidence).mockRejectedValueOnce(new Error('upload failed'));
    const view = render(<SafetyReportModal engagement={bookingA} targetRole="provider" isDark={false} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Concern category'), { target: { value: 'SCAM_OR_FRAUD' } });
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed incident for booking A.' } });
    fireEvent.change(screen.getByLabelText(/Private evidence image/), { target: { files: [new File(['a'], 'booking-a.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit private report' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('upload failed');

    view.rerender(<SafetyReportModal engagement={bookingB} targetRole="provider" isDark={false} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: /What happened/i })).toHaveValue(''));
    expect(screen.getByLabelText('Concern category')).toHaveValue('INAPPROPRIATE_BEHAVIOR');
    expect(screen.getByText(/JPEG, PNG, or WebP/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears the successful draft before a later booking opens', async () => {
    const onClose = vi.fn();
    const view = render(<SafetyReportModal engagement={bookingA} targetRole="provider" isDark={false} onClose={onClose} onSubmitted={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A valid report description.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit private report' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    view.rerender(<SafetyReportModal engagement={null} targetRole="provider" isDark={false} onClose={onClose} onSubmitted={vi.fn()} />);
    view.rerender(<SafetyReportModal engagement={bookingB} targetRole="provider" isDark={false} onClose={onClose} onSubmitted={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /What happened/i })).toHaveValue('');
  });

  it.each(['WAITING', 'PENDING_APPROVAL', 'DECLINED', 'REMOVED', undefined])('blocks submission and evidence uploads for %s', (bookingStatus) => {
    render(<SafetyReportModal engagement={{ ...bookingA, bookingStatus }} targetRole="provider" isDark={false} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed safety concern.' } });
    fireEvent.change(screen.getByLabelText(/Private evidence image/), { target: { files: [new File(['a'], 'evidence.png', { type: 'image/png' })] } });
    const submitButton = screen.getByRole('button', { name: 'Submit private report' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(bookingStatus ? /after a booking is accepted/ : /refresh Activity/);
    fireEvent.submit(submitButton.closest('form')!);
    expect(apiUploadBookingEvidence).not.toHaveBeenCalled();
    expect(apiSubmitSafetyReport).not.toHaveBeenCalled();
  });

  it('does not send a completed-service ID to the booking report endpoint', () => {
    render(<SafetyReportModal engagement={{ ...bookingA, bookingId: null, bookingStatus: 'COMPLETED' }} targetRole="provider" isDark={false} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed safety concern.' } });
    const submitButton = screen.getByRole('button', { name: 'Submit private report' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/no linked booking/);
    fireEvent.submit(submitButton.closest('form')!);
    expect(apiSubmitSafetyReport).not.toHaveBeenCalled();
  });

  it('rechecks a changed booking status without discarding the draft', () => {
    const props = { targetRole: 'provider' as const, isDark: false, onClose: vi.fn(), onSubmitted: vi.fn() };
    const view = render(<SafetyReportModal engagement={bookingA} {...props} />);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed safety concern.' } });
    expect(screen.getByRole('button', { name: 'Submit private report' })).toBeEnabled();
    view.rerender(<SafetyReportModal engagement={{ ...bookingA, bookingStatus: 'REMOVED' }} {...props} />);
    expect(screen.getByRole('textbox', { name: /What happened/i })).toHaveValue('A detailed safety concern.');
    expect(screen.getByRole('button', { name: 'Submit private report' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/removed bookings/);
    expect(apiSubmitSafetyReport).not.toHaveBeenCalled();
  });

  it('uploads evidence and reports against the linked booking rather than the history row', async () => {
    const onSubmitted = vi.fn();
    render(<SafetyReportModal engagement={{ ...bookingA, id: 'history-row', bookingId: 'linked-booking', bookingStatus: 'COMPLETED' }} targetRole="seeker" isDark={false} onClose={vi.fn()} onSubmitted={onSubmitted} />);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed safety concern.' } });
    fireEvent.change(screen.getByLabelText(/Private evidence image/), { target: { files: [new File(['a'], 'evidence.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit private report' }));
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(true));
    expect(apiUploadBookingEvidence).toHaveBeenCalledWith('linked-booking', expect.stringContaining('data:image/png;base64,'));
    expect(apiSubmitSafetyReport).toHaveBeenCalledWith('linked-booking', {
      reason: 'INAPPROPRIATE_BEHAVIOR', description: 'A detailed safety concern.', evidenceStorageKey: 'evidence/a',
    });
  });
});
