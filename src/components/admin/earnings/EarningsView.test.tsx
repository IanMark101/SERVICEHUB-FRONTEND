import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetPlatformEarnings, type PlatformEarnings } from '../../../api/earnings.api';
import EarningsView from './EarningsView';

vi.mock('../../../api/earnings.api', () => ({ apiGetPlatformEarnings: vi.fn() }));
const data: PlatformEarnings = {
  summary: { earnedTotal: 100, today: 100, week: 100, month: 100, pendingFees: 50 },
  period: { transactions: 2, paidTransactions: 2, earnedFees: 100, averageFee: 100 },
  range: { from: '2026-10-01', to: '2026-10-20', timezone: 'Asia/Manila' },
  trend: [{ date: '2026-10-19', amount: 0 }, { date: '2026-10-20', amount: 100 }],
  pagination: { page: 1, totalPages: 2, total: 13, limit: 12 },
  items: [{ id: 'fixture-payment-123456', bookingId: 'booking-1', reference: 'pi_fixture', serviceTitle: 'Laptop repair', customerName: 'Mariel', providerName: 'Ramon', amount: 1000, platformFeeAmount: 100, providerNetAmount: 900, commissionRateBps: 1000, status: 'earned', isTestMode: true, recordedAt: '2026-10-20T01:00:00Z', paidAt: '2026-10-19T01:00:00Z' }],
};
beforeEach(() => { vi.mocked(apiGetPlatformEarnings).mockReset().mockResolvedValue(data); });
describe('admin GCash earnings', () => {
  it('shows real server fee/share figures, distinguishes test payments and keeps references collapsed', async () => {
    render(<EarningsView isDark={false} userId="admin-1" />);
    expect(await screen.findByText('Laptop repair')).toBeInTheDocument();
    const history = screen.getByRole('region', { name: 'GCash payment history' });
    expect(within(history).getByText('₱1,000.00')).toBeInTheDocument();
    expect(within(history).getByText('₱900.00')).toBeInTheDocument();
    expect(within(history).getByText('10%')).toBeInTheDocument();
    expect(within(history).getByText('Test payment')).toBeInTheDocument();
    expect(within(history).getByText('Transaction ID')).not.toBeVisible();
    fireEvent.click(within(history).getByText('ENT-123456'));
    expect(within(history).getByText('pi_fixture')).toBeVisible();
    fireEvent.focus(screen.getByRole('button', { name: 'Oct 20: ₱100.00' }));
    expect(screen.getByRole('status')).toHaveTextContent('Oct 20: ₱100.00');
  });
  it('applies filters on submission and resets pagination', async () => {
    vi.mocked(apiGetPlatformEarnings).mockImplementation(async (_filters, page) => ({ ...data, pagination: { ...data.pagination, page } }));
    render(<EarningsView isDark={false} userId="admin-1" />);
    await screen.findByText('Laptop repair');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(apiGetPlatformEarnings).toHaveBeenLastCalledWith(expect.anything(), 2, expect.any(AbortSignal)));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apply filters' })).toBeEnabled());
    const calls = vi.mocked(apiGetPlatformEarnings).mock.calls.length;
    fireEvent.change(screen.getByRole('combobox', { name: /^History status/ }), { target: { value: 'refunded' } });
    expect(apiGetPlatformEarnings).toHaveBeenCalledTimes(calls);
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() => expect(apiGetPlatformEarnings).toHaveBeenLastCalledWith({ period: 'month', status: 'refunded' }, 1, expect.any(AbortSignal)));
  });
  it('validates custom dates without sending an invalid query', async () => {
    render(<EarningsView isDark userId="admin-1" />); await screen.findByText('Laptop repair');
    fireEvent.change(screen.getByRole('combobox', { name: /^Period/ }), { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-10-21' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-10-20' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Filter earnings' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a start and end date');
    expect(apiGetPlatformEarnings).toHaveBeenCalledTimes(1);
  });
  it('exposes empty and recoverable error states without invented amounts', async () => {
    vi.mocked(apiGetPlatformEarnings).mockRejectedValueOnce(new Error('Offline'));
    render(<EarningsView isDark={false} userId="admin-1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    expect(screen.queryByText('₱0.00')).not.toBeInTheDocument();
    vi.mocked(apiGetPlatformEarnings).mockResolvedValueOnce({ ...data, items: [], pagination: { ...data.pagination, total: 0 } });
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('No matching payments')).toBeInTheDocument();
  });
  it('never displays an obsolete account response after the admin changes', async () => {
    let resolveOld!: (value: PlatformEarnings) => void;
    vi.mocked(apiGetPlatformEarnings).mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve; }));
    const { rerender } = render(<EarningsView isDark={false} userId="old-admin" />);
    rerender(<EarningsView isDark={false} userId="new-admin" />);
    await screen.findByText('Laptop repair');
    await act(async () => resolveOld({ ...data, items: [{ ...data.items[0], serviceTitle: 'Obsolete private record' }] }));
    expect(screen.queryByText('Obsolete private record')).not.toBeInTheDocument();
  });
  it('does not request financial data for a signed-out account', () => {
    render(<EarningsView isDark={false} />);
    expect(apiGetPlatformEarnings).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Sign in as an administrator');
  });
});
