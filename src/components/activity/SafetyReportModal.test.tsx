import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SafetyReportModal from './SafetyReportModal';
import { apiSubmitSafetyReport, apiUploadBookingEvidence } from '../../api/bookings.api';

vi.mock('../../api/bookings.api', () => ({
  apiSubmitSafetyReport: vi.fn(),
  apiUploadBookingEvidence: vi.fn(),
}));

const bookingA = { id: 'booking-a', title: 'Booking A', providerName: 'Provider A', seekerName: 'Seeker A' };
const bookingB = { id: 'booking-b', title: 'Booking B', providerName: 'Provider B', seekerName: 'Seeker B' };

describe('SafetyReportModal', () => {
  beforeEach(() => {
    vi.mocked(apiUploadBookingEvidence).mockResolvedValue({ data: { storageKey: 'evidence/a' } } as never);
    vi.mocked(apiSubmitSafetyReport).mockResolvedValue({ success: true, data: { created: true } } as never);
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

  it.each(['provider', 'seeker'] as const)('closes a committed %s report even if the parent refresh never finishes', async targetRole => {
    const onClose = vi.fn();
    const onSubmitted = vi.fn(() => new Promise<void>(() => {}));
    render(<SafetyReportModal engagement={bookingA} targetRole={targetRole} isDark={false} onClose={onClose} onSubmitted={onSubmitted} />);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A valid report description.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit private report' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmitted).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(['provider', 'seeker'] as const)('keeps the dropdown open when the %s report parent refreshes', (targetRole) => {
    const previousClose = vi.fn();
    const currentClose = vi.fn();
    const view = render(<SafetyReportModal engagement={bookingA} targetRole={targetRole} isDark={false} onClose={previousClose} onSubmitted={vi.fn()} />);
    const category = screen.getByRole('combobox', { name: 'Concern category' });
    fireEvent.click(category);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    view.rerender(<SafetyReportModal engagement={{ ...bookingA }} targetRole={targetRole} isDark={false} onClose={currentClose} onSubmitted={vi.fn()} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(category).toHaveFocus();
    fireEvent.keyDown(category, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(currentClose).not.toHaveBeenCalled();
    fireEvent.keyDown(category, { key: 'Escape' });
    expect(currentClose).toHaveBeenCalledTimes(1);
    expect(previousClose).not.toHaveBeenCalled();
  });

  it.each(['provider', 'seeker'] as const)('limits the %s report to pre-work concerns until work starts', (targetRole) => {
    const props = { targetRole, isDark: false, onClose: vi.fn(), onSubmitted: vi.fn() };
    const view = render(<SafetyReportModal {...props} engagement={{ ...bookingA, started: false }} />);
    const category = screen.getByRole('combobox', { name: 'Concern category' });
    expect(within(category).queryByRole('option', { name: 'Service quality concern' })).not.toBeInTheDocument();
    expect(within(category).queryByRole('option', { name: 'Incomplete service' })).not.toBeInTheDocument();
    expect(within(category).getByRole('option', { name: 'Suspected scam or fraud' })).toBeInTheDocument();
    expect(within(category).getByRole('option', { name: 'Pricing concern' })).toBeInTheDocument();

    view.rerender(<SafetyReportModal {...props} engagement={{ ...bookingA, started: true }} />);
    expect(within(category).getByRole('option', { name: 'Service quality concern' })).toBeInTheDocument();
    expect(within(category).getByRole('option', { name: 'Incomplete service' })).toBeInTheDocument();
  });

  it.each(['provider', 'seeker'] as const)('does not submit an unavailable work category after the %s booking refreshes', async (targetRole) => {
    const props = { targetRole, isDark: false, onClose: vi.fn(), onSubmitted: vi.fn() };
    const view = render(<SafetyReportModal {...props} engagement={{ ...bookingA, started: true }} />);
    fireEvent.change(screen.getByLabelText('Concern category'), { target: { value: 'POOR_SERVICE_QUALITY' } });
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed safety concern.' } });
    view.rerender(<SafetyReportModal {...props} engagement={{ ...bookingA, started: false }} />);
    expect(screen.getByLabelText('Concern category')).toHaveValue('INAPPROPRIATE_BEHAVIOR');
    fireEvent.click(screen.getByRole('button', { name: 'Submit private report' }));
    await waitFor(() => expect(apiSubmitSafetyReport).toHaveBeenCalledWith(bookingA.id, {
      reason: 'INAPPROPRIATE_BEHAVIOR', description: 'A detailed safety concern.', evidenceStorageKey: undefined,
    }));
  });

  it('protects a pending submission from Escape and restores the trigger when closed', async () => {
    let rejectReport!: (error: Error) => void;
    vi.mocked(apiSubmitSafetyReport).mockReturnValueOnce(new Promise((_, reject) => { rejectReport = reject; }));
    const onClose = vi.fn();
    const props = { targetRole: 'provider' as const, isDark: false, onClose, onSubmitted: vi.fn() };
    const view = render(<><button>Open safety report</button><SafetyReportModal {...props} engagement={null} /></>);
    const trigger = screen.getByRole('button', { name: 'Open safety report' });
    trigger.focus();
    view.rerender(<><button>Open safety report</button><SafetyReportModal {...props} engagement={bookingA} /></>);
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/i }), { target: { value: 'A detailed safety concern.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit private report' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => { rejectReport(new Error('Please try again.')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again.');
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    view.rerender(<><button>Open safety report</button><SafetyReportModal {...props} engagement={null} /></>);
    expect(trigger).toHaveFocus();
  });
});
