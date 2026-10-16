import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrustHistorySection from './TrustHistorySection';
import { getTrustBand } from './ProfileHeader';
import UserProfileTabs from './user-profile/UserProfileTabs';
import { api } from '../../lib/api/axios';

vi.mock('../../lib/api/axios', () => ({ api: { get: vi.fn() } }));

const props = { events: [], score: 65, band: getTrustBand(65), isDark: false, loading: false, error: false, onRetry: vi.fn() };

describe('public trust timeline', () => {
  it('keeps the owner trust tab focused on score events without fetching review or appeal cases', async () => {
    const model = {
      activeTab: 'trust', isOwnProfile: true, isDark: false,
      trustScore: 65, trustBand: getTrustBand(65),
      trustHistoryLoading: false, trustHistoryError: false, retryTrustHistory: vi.fn(),
      trustHistory: [{ id: 'penalty', delta: -5, reason: 'Recorded admin finding', scoreBefore: 70, scoreAfter: 65, createdAt: '2026-10-07T05:00:00Z' }],
    } satisfies Partial<Parameters<typeof UserProfileTabs>[0]['model']>;
    // Other tab fields are unused while rendering only the trust tab.
    render(<UserProfileTabs model={model as unknown as Parameters<typeof UserProfileTabs>[0]['model']} />);
    const history = screen.getByRole('region', { name: 'Trust history' });
    expect(within(history).getByText('Recorded admin finding')).toBeInTheDocument();
    expect(within(history).getByText('Score: 70 → 65')).toBeInTheDocument();
    expect(within(history).getByRole('link', { name: 'How trust scores work' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Review disputes and trust appeals' })).not.toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(api.get).not.toHaveBeenCalled();
  });

  it('distinguishes loading, failed fetch, and a truly empty log with an actionable retry', () => {
    const { rerender } = render(<TrustHistorySection {...props} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading trust history');
    expect(screen.queryByText(/No trust score changes/)).not.toBeInTheDocument();
    rerender(<TrustHistorySection {...props} error />);
    expect(screen.getByRole('alert')).toHaveTextContent('could not load');
    expect(screen.queryByText(/No trust score changes/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).toHaveBeenCalledOnce();
    rerender(<TrustHistorySection {...props} />);
    expect(screen.getByText(/No trust score changes/)).toBeInTheDocument();
  });

  it('shows reasons, actual deltas, before/after scores and Philippine action times', () => {
    render(<TrustHistorySection {...props} events={[
      { id: 'increase', delta: 5, reason: 'Residency and identity verified', scoreBefore: 50, scoreAfter: 55, createdAt: '2026-10-07T05:00:00Z' },
      { id: 'zero', delta: 0, reason: 'Review contribution adjusted', scoreBefore: 100, scoreAfter: 100, createdAt: '2026-10-07T06:00:00Z' },
    ]} />);
    expect(screen.getByText('Residency and identity verified')).toBeInTheDocument();
    expect(screen.getByText('Score: 50 → 55')).toBeInTheDocument();
    expect(screen.getByLabelText('+5 trust points')).toBeInTheDocument();
    expect(screen.getByLabelText('0 trust points')).toBeInTheDocument();
    expect(screen.getByText(/1:00 PM · Philippine time/)).toBeInTheDocument();
    expect(screen.queryByText('Penalty')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'How trust scores work' })).toHaveAttribute('href', '/help/trust-reputation/what-is-trust-score');
  });

  it('keeps recorded events visible when a background refresh fails', () => {
    render(<TrustHistorySection {...props} error events={[
      { id: 'existing', delta: 5, reason: 'Completed booking', scoreBefore: 50, scoreAfter: 55, createdAt: '2026-10-07T05:00:00Z' },
    ]} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Showing the last loaded changes');
    expect(screen.getByText('Completed booking')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByText(/No trust score changes/)).not.toBeInTheDocument();
  });
});
