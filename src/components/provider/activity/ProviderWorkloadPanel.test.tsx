import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetProviderWorkload } from '../../../api/bookings.api';
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
});
