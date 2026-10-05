import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProviderWorkloadPanel from './ProviderWorkloadPanel';
import { apiGetProviderWorkload, apiSetProviderWorkloadCapacity } from '../../../api/bookings.api';

vi.mock('../../../api/bookings.api', () => ({ apiGetProviderWorkload: vi.fn(), apiSetProviderWorkloadCapacity: vi.fn() }));

const paidJob = (position: number, title: string) => ({
  id: `queue-${position}`, bookingId: `booking-${position}`, position,
  status: 'WAITING' as const, paymentStatus: 'PAID_HELD', estimatedWait: position === 1 ? 0 : 30,
  canStart: position === 1, startBlockedReason: null as string | null,
  booking: { status: 'ACCEPTED', started: false, paymentStatus: 'PAID_HELD', estimatedDurationMins: 45, seeker: { name: `Seeker ${position}` }, service: { title }, offer: null },
});

describe('Provider workload overview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data: {
      onlineQueueLimit: 3, paidJobs: [paidJob(1, 'Haircut'), paidJob(2, 'Plumbing')],
      cashJobs: [{ id: 'cash-1', status: 'ACCEPTED', started: false, seeker: { name: 'Cash Seeker' }, service: null, offer: { request: { title: 'Tutoring' } } }],
    } });
    vi.mocked(apiSetProviderWorkloadCapacity).mockResolvedValue({ success: true, data: { onlineQueueLimit: 2 } });
  });

  it('shows one next paid job across listings, separate cash arrangements, and a provider capacity', async () => {
    const onStart = vi.fn();
    const onOpen = vi.fn();
    render(<ProviderWorkloadPanel refreshKey="initial" onStart={onStart} onOpen={onOpen} isDark={false} />);
    expect(await screen.findByText('Your workload')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText(/Also waiting: #2 Plumbing/)).toBeInTheDocument();
    expect(screen.getByText(/Direct cash arrangements: 1/)).toBeInTheDocument();
    expect(screen.getByText('2 of 3 paid waiting places used')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start Job' }));
    expect(onStart).toHaveBeenCalledWith('booking-1');
    fireEvent.change(screen.getByLabelText('Paid waiting capacity'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(apiSetProviderWorkloadCapacity).toHaveBeenCalledWith(2));
  });

  it('does not offer another Start Job while a paid job is serving', async () => {
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data: {
      onlineQueueLimit: 3,
      paidJobs: [{ ...paidJob(1, 'Haircut'), status: 'SERVING' as const, canStart: false }, { ...paidJob(2, 'Plumbing'), status: 'WAITING' as const }],
      cashJobs: [],
    } });
    render(<ProviderWorkloadPanel refreshKey="initial" onStart={vi.fn()} onOpen={vi.fn()} isDark={false} />);
    expect(await screen.findByText('Plumbing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Job' })).toBeDisabled();
    expect(screen.getByText('Finish your current job before starting another one.')).toBeInTheDocument();
  });

  it('identifies a frozen active job as under review instead of ordinary progress', async () => {
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data: {
      onlineQueueLimit: 3,
      paidJobs: [{ ...paidJob(1, 'Haircut'), status: 'SERVING' as const, canStart: false,
        booking: { ...paidJob(1, 'Haircut').booking, status: 'UNDER_REVIEW' } }],
      cashJobs: [],
    } });
    render(<ProviderWorkloadPanel refreshKey="review" onStart={vi.fn()} onOpen={vi.fn()} isDark={false} />);
    expect(await screen.findByText(/Seeker 1 · Under review/)).toBeInTheDocument();
  });

  it('keeps a frozen first queue booking visible without offering an invalid start', async () => {
    const onStart = vi.fn();
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data: {
      onlineQueueLimit: 3,
      paidJobs: [{ ...paidJob(1, 'Haircut'), paymentStatus: 'FROZEN_HELD', canStart: false,
        startBlockedReason: 'This booking is on hold for review. Resolve the case before starting work.',
        booking: { ...paidJob(1, 'Haircut').booking, status: 'UNDER_REVIEW', paymentStatus: 'FROZEN_HELD' } }],
      cashJobs: [],
    } });
    render(<ProviderWorkloadPanel refreshKey="frozen" onStart={onStart} onOpen={vi.fn()} isDark={false} />);
    expect(await screen.findByText(/This booking is on hold for review/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Job' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Start Job' }));
    expect(onStart).not.toHaveBeenCalled();
  });

  it('shows start progress and blocks duplicate requests', async () => {
    render(<ProviderWorkloadPanel refreshKey="starting" onStart={vi.fn()} onOpen={vi.fn()} startingBookingId="booking-1" isDark={false} />);
    expect(await screen.findByRole('button', { name: 'Starting…' })).toBeDisabled();
  });
});
