import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { getSubscription } from '../../../api/subscriptions.api';
import PlanSummary from './PlanSummary';
vi.mock('../../../api/subscriptions.api', () => ({ getSubscription: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it('shows the authoritative current fee and grandfathered active count', async () => {
  vi.mocked(getSubscription).mockResolvedValue({ plan: 'FREE', commissionRateBps: 1000, activeListings: 8, activeListingLimit: 3 } as Awaited<ReturnType<typeof getSubscription>>);
  render(<PlanSummary userId="provider-1" />);
  expect(await screen.findByText('8 / 3')).toBeVisible();
  expect(screen.getByText('10%')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Upgrade to Pro' })).toHaveAttribute('href', '/subscription');
});
it('never shows a previous account’s late subscription response', async () => {
  let resolve!: (data: Awaited<ReturnType<typeof getSubscription>>) => void;
  vi.mocked(getSubscription).mockReturnValueOnce(new Promise(done => { resolve = done; })).mockResolvedValueOnce({ plan: 'FREE', commissionRateBps: 1000, activeListings: 0, activeListingLimit: 3 } as Awaited<ReturnType<typeof getSubscription>>);
  const { rerender } = render(<PlanSummary userId="provider-old" />);
  rerender(<PlanSummary userId="provider-new" />);
  await screen.findByText('0 / 3');
  resolve({ plan: 'PRO', commissionRateBps: 500, activeListings: 9, activeListingLimit: null } as Awaited<ReturnType<typeof getSubscription>>);
  await waitFor(() => expect(screen.getByText('0 / 3')).toBeVisible());
  expect(screen.queryByText('5%')).not.toBeInTheDocument();
});
