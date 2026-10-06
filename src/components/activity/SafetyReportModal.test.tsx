import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SafetyReportModal from './SafetyReportModal';
import { apiSubmitSafetyReport, apiUploadBookingEvidence } from '../../api/bookings.api';

vi.mock('../../api/bookings.api', () => ({
  apiSubmitSafetyReport: vi.fn(),
  apiUploadBookingEvidence: vi.fn(),
}));

const bookingA = { id: 'booking-a', title: 'Booking A', providerName: 'Provider A', seekerName: 'Seeker A' };
const bookingB = { id: 'booking-b', title: 'Booking B', providerName: 'Provider B', seekerName: 'Seeker B' };

describe('SafetyReportModal draft isolation', () => {
  beforeEach(() => {
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
});
