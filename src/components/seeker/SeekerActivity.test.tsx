import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import { apiRespondCancellationRequest } from '../../api/bookings.api';
import SeekerActivity from './SeekerActivity';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('../../api/bookings.api', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../api/bookings.api')>(),
  apiRespondCancellationRequest: vi.fn(),
}));
vi.mock('./activity/SeekerActivityList', () => ({ default: ({ model }: { model: {
  openBookingId: string | null;
  loadingItemId: string | null;
  handleRespondCancellation: (requestId: string, approve: boolean) => void;
} }) => <div data-testid="activity-view">
  {model.openBookingId ?? 'overview'}
  <button type="button" disabled={!!model.loadingItemId} onClick={() => model.handleRespondCancellation('cancel-1', true)}>Approve cancellation</button>
  <button type="button" disabled={!!model.loadingItemId} onClick={() => model.handleRespondCancellation('cancel-1', false)}>Decline cancellation</button>
</div> }));
vi.mock('./activity/SeekerCancellationRequestModal', () => ({ default: () => null }));
vi.mock('./activity/SeekerDisputeModal', () => ({ default: () => null }));
vi.mock('../activity/SafetyReportModal', () => ({ default: () => null }));
vi.mock('./RequestServiceModal', () => ({ default: () => null }));
vi.mock('./ReviewModal', () => ({ default: () => null }));
vi.mock('../ui/ConfirmModal', () => ({ default: () => null }));

const refreshEngagements = vi.fn();
const refreshAll = vi.fn();
const booking = {
  id: 'johncarlo-booking', seekerId: 'johncarlo', providerId: 'ian',
  status: 'awaiting_seeker_approval', title: 'House Cleaning',
};

function setEngagements(jobEngagements: unknown[]) {
  vi.mocked(useApp).mockReturnValue({
    jobEngagements, services: [], jobRequests: [], notifications: [],
    user: { id: 'johncarlo' }, isDark: false, refreshEngagements, refreshAll,
  } as unknown as ReturnType<typeof useApp>);
}

describe('Seeker Activity booking links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tab=action_required') as ReturnType<typeof useSearchParams>);
    vi.mocked(useToast).mockReturnValue({ success: vi.fn(), error: vi.fn(), info: vi.fn() } as unknown as ReturnType<typeof useToast>);
    setEngagements([booking]);
  });

  it('keeps a manual tab choice after a booking refresh without scrolling the page', async () => {
    const { rerender } = render(<SeekerActivity currentUserId="johncarlo" />);
    const actionTab = screen.getByRole('tab', { name: /Action Required/ });
    const allTab = screen.getByRole('tab', { name: /^All/ });
    await waitFor(() => expect(actionTab).toHaveAttribute('aria-selected', 'true'));

    fireEvent.click(allTab);
    setEngagements([{ ...booking }]);
    rerender(<SeekerActivity currentUserId="johncarlo" />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 350)); });

    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('opens a new booking link as a focused workroom instead of leaving overview tabs visible', async () => {
    const { rerender } = render(<SeekerActivity currentUserId="johncarlo" />);
    await waitFor(() => expect(screen.getByRole('tab', { name: /Action Required/ })).toHaveAttribute('aria-selected', 'true'));
    fireEvent.click(screen.getByRole('tab', { name: /^All/ }));

    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tab=waiting&booking=second-booking') as ReturnType<typeof useSearchParams>);
    setEngagements([booking, { ...booking, id: 'second-booking', status: 'queued' }]);
    rerender(<SeekerActivity currentUserId="johncarlo" />);

    await waitFor(() => expect(screen.getByTestId('activity-view')).toHaveTextContent('second-booking'));
    expect(screen.queryByRole('tab', { name: /In Queue/ })).not.toBeInTheDocument();
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('requires a reason before submitting a cancellation decline', async () => {
    vi.mocked(apiRespondCancellationRequest).mockResolvedValue({ success: true });
    render(<SeekerActivity currentUserId="johncarlo" />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline cancellation' }));
    expect(apiRespondCancellationRequest).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Decline cancellation request' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline request' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Work can continue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Decline request' }));
    await waitFor(() => expect(apiRespondCancellationRequest).toHaveBeenCalledWith('cancel-1', false, 'Work can continue'));
  });

  it('keeps cancellation approval busy until the API resolves', async () => {
    let resolveApproval!: (value: { success: boolean }) => void;
    vi.mocked(apiRespondCancellationRequest).mockImplementation(() => new Promise((resolve) => { resolveApproval = resolve; }));
    render(<SeekerActivity currentUserId="johncarlo" />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve cancellation' }));
    expect(screen.getByRole('button', { name: 'Approve cancellation' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decline cancellation' })).toBeDisabled();
    expect(apiRespondCancellationRequest).toHaveBeenCalledTimes(1);
    await act(async () => { resolveApproval({ success: true }); });
    await waitFor(() => expect(refreshEngagements).toHaveBeenCalled());
  });
});
