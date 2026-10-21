import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getAdminSubscriptions } from '../../../api/subscriptions.api';
import SubscriptionsView from './SubscriptionsView';
vi.mock('../../../api/subscriptions.api', () => ({ getAdminSubscriptions: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it('distinguishes simulated totals from real revenue and shows pending refunds plainly', async () => {
  vi.mocked(getAdminSubscriptions).mockResolvedValue({ summary: { activeProProviders: 2, expiredProSubscriptions: 1, subscriptionRevenue: 0, testSubscriptionTotal: 199, isTestMode: true }, payments: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } });
  render(<SubscriptionsView isDark={false} userId="admin-1" />);
  expect(await screen.findByText('Test subscription total')).toBeVisible();
  expect(screen.getByText('₱199.00')).toBeVisible();
  expect(screen.getByText(/No real money is transferred/)).toBeVisible();
  expect(screen.getByText('No subscription payments yet.')).toBeVisible();
});
it('renders request failure as an error and retries', async () => {
  vi.mocked(getAdminSubscriptions).mockRejectedValueOnce(new Error('Service unavailable')).mockResolvedValue({ summary: { activeProProviders: 0, expiredProSubscriptions: 0, subscriptionRevenue: 0, testSubscriptionTotal: 0, isTestMode: false }, payments: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } });
  render(<SubscriptionsView isDark userId="admin-1" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Subscription revenue')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
