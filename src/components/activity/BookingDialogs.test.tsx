import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SeekerCancellationRequestModal from '../seeker/activity/SeekerCancellationRequestModal';
import ProviderCancellationDeclineModal from '../provider/activity/ProviderCancellationDeclineModal';
import ReasonModal from '../ui/ReasonModal';
import type { JobEngagement } from '../../types';

vi.mock('../../context/AppContext', () => ({ useApp: () => ({ isDark: false }) }));
const booking = { id: 'booking-1', title: 'AIRCON FIX', status: 'in_progress', started: true } as JobEngagement;

describe('Booking decision dialogs', () => {
  it('rejects whitespace and short cancellation explanations even on form submission', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const props = { engagement: booking, reason: '  ', isDark: false, isSubmitting: false, isActionDisabled: false, onReasonChange: vi.fn(), onClose: vi.fn(), onSubmit };
    const view = render(<SeekerCancellationRequestModal {...props} />);
    expect(screen.getByRole('textbox', { name: 'Reason for Cancellation' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Submit Request' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: 'Submit Request' }).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
    view.rerender(<SeekerCancellationRequestModal {...props} reason="Plans have changed." />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('requires a provider explanation and prevents closing or submitting while processing', () => {
    const onSubmit = vi.fn(), onClose = vi.fn();
    const props = { requestId: 'cancel-1', declineNote: '', isDark: true, isSubmitting: false, isActionDisabled: false, onDeclineNoteChange: vi.fn(), onClose, onSubmit };
    const view = render(<ProviderCancellationDeclineModal {...props} />);
    expect(screen.getByRole('button', { name: 'Decline Request' })).toBeDisabled();
    view.rerender(<ProviderCancellationDeclineModal {...props} declineNote="Work has started." isSubmitting />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Declining...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.submit(screen.getByRole('button', { name: 'Declining...' }).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('contains keyboard focus and supports Escape in a shared reason dialog', () => {
    const onClose = vi.fn();
    render(<ReasonModal isOpen title="Decline cancellation" description="Explain why the booking should continue." value="Work has started." onChange={vi.fn()} onClose={onClose} onSubmit={vi.fn()} />);
    const submit = screen.getByRole('button', { name: 'Submit' });
    submit.focus();
    fireEvent.keyDown(submit, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
