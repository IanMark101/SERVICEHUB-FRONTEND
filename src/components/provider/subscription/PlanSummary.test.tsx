import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getSubscription, type ProviderSubscription } from '../../../api/subscriptions.api';
import PlanSummary from './PlanSummary';
import { free, pro } from './membership-fixtures.test-support';
vi.mock('../../../api/subscriptions.api', () => ({ getSubscription: vi.fn(), startFreeProviderPlan: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
it('shows actual trial days, fee, usage, expiry and membership action', async () => {
  vi.mocked(getSubscription).mockResolvedValue(free);
  render(<PlanSummary userId="provider-1" />);
  expect(await screen.findByText('1 / 1')).toBeVisible();
  expect(screen.getByText('10%')).toBeVisible();
  expect(screen.getByText('28 days left')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Manage membership' })).toHaveAttribute('href', '/subscription');
});
it('never shows a previous account’s late subscription response', async () => {
  let resolve!: (data: ProviderSubscription) => void;
  vi.mocked(getSubscription).mockReturnValueOnce(new Promise(done => { resolve = done; })).mockResolvedValueOnce({ ...free, activeListings: 0 });
  const { rerender } = render(<PlanSummary userId="provider-old" />);
  rerender(<PlanSummary userId="provider-new" />);
  await screen.findByText('0 / 1'); resolve(pro);
  await waitFor(() => expect(screen.getByText('0 / 1')).toBeVisible());
  expect(screen.queryByText('5%')).not.toBeInTheDocument();
});
