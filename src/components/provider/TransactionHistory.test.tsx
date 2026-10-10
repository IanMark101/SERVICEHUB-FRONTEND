import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { apiGetProviderPaymentRecords, type ProviderPaymentRecords } from '../../api/transactions.api';
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import TransactionHistory from './TransactionHistory';

vi.mock('next/navigation', () => ({ useSearchParams: vi.fn() }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../api/transactions.api', () => ({ apiGetProviderPaymentRecords: vi.fn() }));
vi.mock('../../hooks/useApiCacheRefresh', () => ({ useApiCacheRefresh: vi.fn() }));

const completed = {
  id: 'booking-1', bookingId: 'booking-1', serviceTitle: 'House Cleaning', seekerName: 'Test seeker',
  paymentMethod: 'On-site Cash', outcome: 'completed' as const, paymentStatus: 'CASH_CONFIRMED',
  amount: 250, earnedAmount: 250, recordedAt: '2026-10-09T17:00:00.000Z',
};
const refunded = {
  ...completed, id: 'booking-2', bookingId: 'booking-2', serviceTitle: 'Aircon Cleaning',
  paymentMethod: 'GCash', outcome: 'refunded' as const, paymentStatus: 'REFUNDED', amount: 1500, earnedAmount: 0,
};
function response(overrides: Partial<ProviderPaymentRecords> = {}): ProviderPaymentRecords {
  return {
    items: [completed, refunded], summary: { earnedTotal: 1000, cashTotal: 250, onlineTotal: 750, completedCount: 2 },
    pagination: { page: 1, limit: 8, total: 2, totalPages: 1 }, linkedRecordFound: false, ...overrides,
  };
}
function pending<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
async function loaded() { await screen.findByText('House Cleaning'); }

describe('Provider payment records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
    vi.mocked(useApp).mockReturnValue({ isDark: false } as ReturnType<typeof useApp>);
    vi.mocked(apiGetProviderPaymentRecords).mockResolvedValue(response());
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  afterEach(cleanup);

  it('uses the API lifetime total, including older completed cash/test bookings rather than summing visible amounts', async () => {
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    expect(screen.getByText('₱1,000.00')).toBeVisible();
    expect(screen.getAllByText('₱250.00')).toHaveLength(2);
    expect(screen.getByText('₱750.00')).toBeVisible();
    expect(screen.getByText('2 completed bookings')).toBeVisible();
    expect(screen.getByText(/not an available balance or a payout/)).toBeVisible();
    expect(apiGetProviderPaymentRecords).toHaveBeenCalledWith({ page: 1, limit: 8, status: 'all' }, expect.any(AbortSignal));
  });

  it('shows a refund as zero provider earnings and identifies the amount returned to the seeker', async () => {
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    const row = screen.getByText('Aircon Cleaning').closest('tr')!;
    expect(within(row).getByText('₱0.00')).toBeVisible();
    expect(within(row).getByText('₱1,500.00 returned to seeker')).toBeVisible();
    expect(within(row).getByText('Refunded')).toBeVisible();
    expect(row.querySelector('[data-earned]')).toHaveAttribute('data-earned', 'false');
    expect(screen.queryByText('+ ₱1500')).not.toBeInTheDocument();
  });

  it('links actual booking IDs to the matching provider Activity tab', async () => {
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    expect(screen.getByRole('link', { name: 'View booking: House Cleaning' })).toHaveAttribute('href', '/provider/provider-activity?tab=completed&booking=booking-1');
    expect(screen.getByRole('link', { name: 'View booking: Aircon Cleaning' })).toHaveAttribute('href', '/provider/provider-activity?tab=canceled&booking=booking-2');
  });

  it('displays dates in Philippine time and sends date filtering to the server without changing lifetime totals', async () => {
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    expect(screen.getAllByText('Oct 10, 2026')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Recorded date'), { target: { value: '2026-10-10' } });
    await waitFor(() => expect(apiGetProviderPaymentRecords).toHaveBeenLastCalledWith({ page: 1, limit: 8, status: 'all', date: '2026-10-10' }, expect.any(AbortSignal)));
    await loaded();
    expect(screen.getByText('₱1,000.00')).toBeVisible();
  });

  it('filters by status and clears both filters', async () => {
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    fireEvent.change(screen.getByLabelText('Booking status'), { target: { value: 'refunded' } });
    await waitFor(() => expect(apiGetProviderPaymentRecords).toHaveBeenLastCalledWith({ page: 1, limit: 8, status: 'refunded' }, expect.any(AbortSignal)));
    await screen.findByRole('button', { name: 'Clear filters' });
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(apiGetProviderPaymentRecords).toHaveBeenLastCalledWith({ page: 1, limit: 8, status: 'all' }, expect.any(AbortSignal)));
  });

  it('uses server pagination to reach older records and keeps the complete lifetime total', async () => {
    vi.mocked(apiGetProviderPaymentRecords).mockResolvedValueOnce(response({ pagination: { page: 1, limit: 8, total: 9, totalPages: 2 } }))
      .mockResolvedValueOnce(response({ items: [{ ...completed, serviceTitle: 'Older booking' }], pagination: { page: 2, limit: 8, total: 9, totalPages: 2 } }));
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await screen.findByText('Older booking');
    expect(apiGetProviderPaymentRecords).toHaveBeenLastCalledWith({ page: 2, limit: 8, status: 'all' }, expect.any(AbortSignal));
    expect(screen.getByText('Page 2 of 2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByText('₱1,000.00')).toBeVisible();
  });

  it('follows an older linked booking through the API and lets the user leave its page without scrolling', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('booking=booking-1') as ReturnType<typeof useSearchParams>);
    vi.mocked(apiGetProviderPaymentRecords).mockResolvedValue(response({ linkedRecordFound: true, pagination: { page: 2, limit: 8, total: 9, totalPages: 2 } }));
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    expect(screen.getByText('Linked booking')).toBeVisible();
    expect(apiGetProviderPaymentRecords).toHaveBeenCalledWith({ page: 1, limit: 8, status: 'all', booking: 'booking-1' }, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await waitFor(() => expect(apiGetProviderPaymentRecords).toHaveBeenLastCalledWith({ page: 1, limit: 8, status: 'all' }, expect.any(AbortSignal)));
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does not present a zero total or confirmed empty history before the first response', () => {
    vi.mocked(apiGetProviderPaymentRecords).mockReturnValue(pending<ProviderPaymentRecords>().promise);
    render(<TransactionHistory currentUserId="provider" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading payment records');
    expect(screen.queryByText('₱0.00')).not.toBeInTheDocument();
    expect(screen.queryByText('No previous bookings yet')).not.toBeInTheDocument();
  });

  it('reports an initial API failure and supports retry without claiming empty history', async () => {
    vi.mocked(apiGetProviderPaymentRecords).mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce(response());
    render(<TransactionHistory currentUserId="provider" />);
    await screen.findByRole('alert');
    expect(screen.queryByText('No previous bookings yet')).not.toBeInTheDocument();
    expect(screen.queryByText('₱0.00')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await loaded();
  });

  it('keeps known data during a failed background refresh', async () => {
    vi.mocked(apiGetProviderPaymentRecords).mockResolvedValueOnce(response()).mockRejectedValueOnce(new Error('Unavailable'));
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your last loaded records are still shown');
    expect(screen.getByText('House Cleaning')).toBeVisible();
    expect(screen.getByText('₱1,000.00')).toBeVisible();
  });

  it('keeps a confirmed empty result visible during refresh', async () => {
    vi.mocked(apiGetProviderPaymentRecords).mockResolvedValueOnce(response({ items: [], summary: { earnedTotal: 0, cashTotal: 0, onlineTotal: 0, completedCount: 0 }, pagination: { page: 1, limit: 8, total: 0, totalPages: 1 } }))
      .mockReturnValueOnce(pending<ProviderPaymentRecords>().promise);
    render(<TransactionHistory currentUserId="provider" />);
    await screen.findByText('No previous bookings yet');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await screen.findByRole('button', { name: 'Updating...' });
    expect(screen.getByText('No previous bookings yet')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('ignores a superseded response after the user changes filters', async () => {
    const older = pending<ProviderPaymentRecords>();
    vi.mocked(apiGetProviderPaymentRecords).mockReturnValueOnce(older.promise).mockResolvedValueOnce(response({ items: [refunded] }));
    render(<TransactionHistory currentUserId="provider" />);
    fireEvent.change(screen.getByLabelText('Booking status'), { target: { value: 'refunded' } });
    await screen.findByText('Aircon Cleaning');
    await act(async () => { older.resolve(response()); });
    expect(screen.queryByText('House Cleaning')).not.toBeInTheDocument();
  });

  it('does not expose the previous account history when the current member changes', async () => {
    const { rerender } = render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    vi.mocked(apiGetProviderPaymentRecords).mockReturnValue(pending<ProviderPaymentRecords>().promise);
    rerender(<TransactionHistory currentUserId="another-provider" />);
    expect(screen.queryByText('House Cleaning')).not.toBeInTheDocument();
  });

  it('does not request records for a missing account or use a hardcoded member', () => {
    render(<TransactionHistory />);
    expect(apiGetProviderPaymentRecords).not.toHaveBeenCalled();
    expect(screen.getByText('Sign in to view your records')).toBeVisible();
  });

  it('updates after booking/transaction invalidation using the mounted read-only loader', async () => {
    render(<TransactionHistory currentUserId="provider" />);
    await loaded();
    const refresh = vi.mocked(useApiCacheRefresh).mock.calls.at(-1)![1];
    await act(async () => { await refresh({ tags: ['bookings'], reason: 'mutation' } as Parameters<typeof refresh>[0]); });
    await waitFor(() => expect(apiGetProviderPaymentRecords).toHaveBeenCalledTimes(2));
  });
});
