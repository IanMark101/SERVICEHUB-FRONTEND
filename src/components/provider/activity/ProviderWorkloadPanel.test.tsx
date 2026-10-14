import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetProviderWorkload, apiSetProviderWorkloadCapacity } from '../../../api/bookings.api';
import ProviderWorkloadPanel from './ProviderWorkloadPanel';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';

vi.mock('../../../api/bookings.api', () => ({ apiGetProviderWorkload: vi.fn(), apiSetProviderWorkloadCapacity: vi.fn() }));
vi.mock('../../../hooks/useApiCacheRefresh', () => ({ useApiCacheRefresh: vi.fn() }));

describe('Provider workload availability', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('does not reload workload when an action starts loading, but still refreshes on a booking change', async () => {
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data: {
      onlineQueueLimit: 5, paidJobs: [], cashJobs: [],
    } });
    const props = { isDark: false, onOpen: vi.fn(), onStart: vi.fn() };
    const { rerender } = render(<ProviderWorkloadPanel {...props} />);
    expect(await screen.findByText('0 paid waiting')).toBeVisible();
    rerender(<ProviderWorkloadPanel {...props} startingBookingId="booking" />);
    rerender(<ProviderWorkloadPanel {...props} startingBookingId={null} />);
    expect(apiGetProviderWorkload).toHaveBeenCalledTimes(1);
    const refresh = vi.mocked(useApiCacheRefresh).mock.calls.at(-1)![1];
    await act(async () => { await refresh({ tags: ['bookings'], reason: 'socket' }); });
    expect(apiGetProviderWorkload).toHaveBeenCalledTimes(2);
  });

  it('does not present an unavailable workload as zero jobs or expose the raw database error', async () => {
    vi.mocked(apiGetProviderWorkload).mockRejectedValue({ isAxiosError: true,
      response: { status: 503, data: { code: 'DATABASE_QUOTA_EXCEEDED', error: 'Invalid prisma.refreshToken.findUnique()' } } });
    render(<ProviderWorkloadPanel isDark={false} onOpen={vi.fn()} onStart={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('ServiceHub is temporarily unavailable. Please try again later.');
    expect(screen.getByText('Workload unavailable')).toBeVisible();
    expect(screen.queryByText('0 paid waiting')).not.toBeInTheDocument();
    expect(screen.queryByText(/prisma/)).not.toBeInTheDocument();
    expect(screen.queryByText('No job in progress.')).not.toBeInTheDocument();
  });
  it('preserves payment order, authoritative start restrictions and cash bookings outside paid capacity', async () => {
    const job = { status: 'WAITING', started: false, paymentStatus: 'PAID', seeker: { name: 'John' }, service: { title: 'Laptop repair' } };
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data: { onlineQueueLimit: 5,
      paidJobs: [{ id: 'q1', bookingId: 'b1', position: 1, status: 'WAITING', paymentStatus: 'PAID', estimatedWait: 0, canStart: false, startBlockedReason: 'Booking is under review.', booking: job }, { id: 'q2', bookingId: 'b2', position: 2, status: 'WAITING', paymentStatus: 'PAID', estimatedWait: 60, canStart: false, startBlockedReason: 'An earlier paid job must start first.', booking: { ...job, service: { title: 'Printer repair' } } }],
      cashJobs: [{ id: 'cash', status: 'ACCEPTED', started: false, seeker: { name: 'Ian' }, service: { title: 'Cash repair' } }],
    } });
    const open = vi.fn(), start = vi.fn();
    render(<ProviderWorkloadPanel isDark={false} onOpen={open} onStart={start} />);
    expect(await screen.findByText('2 paid waiting')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start Job' })).toBeDisabled();
    expect(screen.getByText('Booking is under review.')).toBeVisible();
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual([expect.stringContaining('Laptop repair'), expect.stringContaining('Printer repair'), expect.stringContaining('Cash repair')]);
    fireEvent.click(screen.getAllByRole('button', { name: 'View booking details' })[1]); expect(open).toHaveBeenCalledWith('b2'); expect(start).not.toHaveBeenCalled();
  });
  it('starts the eligible next booking and updates the existing provider capacity API', async () => {
    const data = { onlineQueueLimit: 5, cashJobs: [], paidJobs: [{ id: 'q1', bookingId: 'b1', position: 1, status: 'WAITING' as const, paymentStatus: 'PAID', estimatedWait: 0, canStart: true, startBlockedReason: null, booking: { status: 'WAITING', started: false, paymentStatus: 'PAID', seeker: { name: 'John' }, service: { title: 'Laptop repair' } } }] };
    vi.mocked(apiGetProviderWorkload).mockResolvedValue({ success: true, data });
    vi.mocked(apiSetProviderWorkloadCapacity).mockResolvedValue({ success: true });
    const start = vi.fn(); render(<ProviderWorkloadPanel isDark={false} onOpen={vi.fn()} onStart={start} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start Job' })); expect(start).toHaveBeenCalledWith('b1');
    fireEvent.change(screen.getByLabelText('Paid waiting capacity'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(apiSetProviderWorkloadCapacity).toHaveBeenCalledWith(7));
  });
});
