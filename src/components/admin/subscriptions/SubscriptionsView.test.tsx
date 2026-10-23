import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getAdminSubscriptions, type AdminSubscriptions } from '../../../api/subscriptions.api';
import SubscriptionsView from './SubscriptionsView';
vi.mock('../../../api/subscriptions.api', () => ({ getAdminSubscriptions: vi.fn() }));
const data: AdminSubscriptions = { summary: { activeFreeProviders: 3, activeBasicProviders: 1, activeProProviders: 2, expiredProSubscriptions: 1, subscriptionRevenue: 0, testSubscriptionTotal: 298, isTestMode: true }, memberships: [{ id: 'p1', name: 'Test Provider', plan: 'BASIC', monthlyPrice: 99, status: 'CANCELLED', marketplaceAccess: true, startsAt: '2026-10-22T08:00:00Z', expiresAt: '2026-11-22T08:00:00Z', commissionRateBps: 800 }], payments: [], membershipsPagination: { page: 1, totalPages: 1, total: 1, limit: 20 }, pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } };
beforeEach(() => vi.resetAllMocks());
it('separates simulated totals and shows provider plan, status, expiry and fee', async () => {
  vi.mocked(getAdminSubscriptions).mockResolvedValue(data);
  render(<SubscriptionsView isDark={false} userId="admin-1" />);
  expect(await screen.findByText('Test Provider')).toBeVisible();
  expect(screen.getByText('Basic')).toBeVisible();
  expect(screen.getByText('8%')).toBeVisible();
  expect(screen.getByText('Cancelled, active until expiry')).toBeVisible();
  expect(screen.getByText(/Test amounts are excluded from membership revenue/)).toHaveTextContent('₱298.00');
  expect(screen.getByText('₱0.00')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Payments' }));
  expect(screen.getByText('No membership payments yet.')).toBeVisible();
});
it('renders request failure as an error and retries', async () => {
  vi.mocked(getAdminSubscriptions).mockRejectedValueOnce(new Error('Service unavailable')).mockResolvedValue(data);
  render(<SubscriptionsView isDark userId="admin-1" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Membership revenue')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
