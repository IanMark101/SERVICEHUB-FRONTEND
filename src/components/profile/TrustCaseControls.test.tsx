import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrustPenaltyAppealForm, TrustCasesPanel } from './TrustCaseControls';
import * as api from '../../api/trust.api';
import { apiGetAdminBookingMessages } from '../../api/admin.api';

vi.mock('../../context/AppContext', () => ({ useApp: () => ({ user: { id: 'recipient' } }) }));
vi.mock('../../hooks/useApiCacheRefresh', () => ({ useApiCacheRefresh: vi.fn() }));
vi.mock('../../api/admin.api', () => ({ apiGetAdminBookingMessages: vi.fn() }));
vi.mock('../../api/trust.api', () => ({ apiSubmitTrustCase: vi.fn(), apiListTrustCases: vi.fn(), apiRespondTrustCase: vi.fn(), apiDecideTrustCase: vi.fn() }));
beforeEach(() => { vi.resetAllMocks(); vi.mocked(api.apiListTrustCases).mockResolvedValue({ data: [], pagination: { totalPages: 1 } }); });

describe('review and trust appeal controls', () => {
  it('requires an explanation and submits only the selected penalty source', async () => {
    vi.mocked(api.apiSubmitTrustCase).mockResolvedValue({ success: true });
    render(<TrustPenaltyAppealForm trustEventId="event-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Appeal trust penalty' }));
    const button = screen.getByRole('button', { name: 'Submit for admin review' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'The booking messages document a mutual cancellation.' } });
    fireEvent.click(button);
    await waitFor(() => expect(api.apiSubmitTrustCase).toHaveBeenCalledWith({ trustEventId: 'event-1', description: 'The booking messages document a mutual cancellation.' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Case submitted');
  });
  it('retains the explanation after a failed submission and allows retry', async () => {
    vi.mocked(api.apiSubmitTrustCase).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ success: true });
    render(<TrustPenaltyAppealForm trustEventId="event-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Appeal trust penalty' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'The booking messages document a mutual cancellation.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit for admin review' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('The booking messages document a mutual cancellation.');
    fireEvent.click(screen.getByRole('button', { name: 'Submit for admin review' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Case submitted');
  });
  it('distinguishes a failed case load from an empty case list', async () => {
    vi.mocked(api.apiListTrustCases).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ data: [], pagination: { totalPages: 1 } });
    render(<TrustCasesPanel />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('No cases yet.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading cases' }));
    expect(await screen.findByText('No cases yet.')).toBeInTheDocument();
  });
  it('requires an admin explanation and specific policy category to uphold a review dispute', async () => {
    vi.mocked(api.apiListTrustCases).mockResolvedValue({ data: [{ id: 'case-1', userId: 'recipient', status: 'PENDING', user: { name: 'Recipient' }, description: 'Reported threats in the written review.', response: 'The author explains their experience.', review: { id: 'review-1', rating: 1, text: 'Original feedback', completedService: { bookingId: 'booking-1' } } }], pagination: { totalPages: 1 } });
    vi.mocked(api.apiDecideTrustCase).mockResolvedValue({ success: true });
    render(<TrustCasesPanel admin />);
    await screen.findByText('Reported threats in the written review.');
    expect(screen.getByRole('link', { name: 'Inspect booking cases' })).toHaveAttribute('href', '/admin/reports?booking=booking-1');
    vi.mocked(apiGetAdminBookingMessages).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ data: { messages: [{ id: 'message-1', sender: { name: 'Author' }, content: 'Original booking conversation.', createdAt: '2026-10-11T10:00:00Z' }] } });
    fireEvent.click(screen.getByRole('button', { name: 'View booking messages' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Retry messages' }));
    expect(await screen.findByText('Original booking conversation.')).toBeInTheDocument();
    expect(apiGetAdminBookingMessages).toHaveBeenCalledWith('booking-1');
    expect(screen.getByText(/Other participant’s explanation/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'true' } });
    fireEvent.change(screen.getByLabelText('Review policy violated'), { target: { value: 'HARASSMENT' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Threats documented in the review violate the published policy.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }));
    await waitFor(() => expect(api.apiDecideTrustCase).toHaveBeenCalledWith('case-1', { uphold: true, violation: 'HARASSMENT', reason: 'Threats documented in the review violate the published policy.' }));
  });
});
