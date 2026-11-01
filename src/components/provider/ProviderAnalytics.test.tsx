import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { apiGetProviderAnalytics } from '../../api/transactions.api';
import ProviderAnalytics from './ProviderAnalytics';
vi.mock('../../api/transactions.api', () => ({ apiGetProviderAnalytics: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
it('explains paid insights without blocking history for Free or expired members', async () => {
  vi.mocked(apiGetProviderAnalytics).mockResolvedValue({ level: 'BASIC', days: 30, summary: null, daily: null });
  render(<ProviderAnalytics userId="provider-1" isDark={false} />);
  expect(await screen.findByText('Your booking history stays available.')).toBeVisible();
  expect(screen.queryByText('Recorded earnings')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View plans' })).toHaveAttribute('href', '/subscription');
});
it('renders server earnings and explicitly labels recorded Test amounts', async () => {
  vi.mocked(apiGetProviderAnalytics).mockResolvedValue({ level: 'FULL', days: 30, summary: { earned: 920, cash: 0, gcash: 920, fees: 80, completed: 1, averagePerBooking: 920 }, daily: [{ day: '2026-10-22', completed: 1, earned: 920 }] });
  render(<ProviderAnalytics userId="provider-1" isDark />);
  expect(await screen.findByText('Recorded earnings')).toBeVisible();
  expect(screen.getByText('₱80.00')).toBeVisible();
  expect(screen.getByText(/may include Test Mode payments/)).toBeVisible();
  fireEvent.click(screen.getByText('Daily breakdown'));
  expect(screen.getByText('2026-10-22')).toBeVisible();
});
it('allows retry after analytics failure', async () => {
  vi.mocked(apiGetProviderAnalytics).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ level: 'BASIC', days: 30, summary: null, daily: null });
  render(<ProviderAnalytics userId="provider-1" isDark={false} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Your booking history stays available.')).toBeVisible();
});
