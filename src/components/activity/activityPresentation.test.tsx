import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../types';
import ActivityFeed, { type ActivityFeedEntry } from './ActivityFeed';
import ActivityBookingFacts from './ActivityBookingFacts';
import { getActivityPaymentCopy, getActivityQueueCopy, getBookingActivityGroup } from './activityPresentation';

const booking: JobEngagement = {
  id: 'one', title: 'House Cleaning', seekerId: 'johncarlo', seekerName: 'John Carlo', seekerAvatar: '',
  providerId: 'ian', providerName: 'Ian', providerAvatar: '', serviceId: 'service-1',
  price: 250, status: 'queued', paymentMethod: 'GCash', paymentStatus: 'PAID_HELD',
  queueStatus: 'WAITING', queuePosition: 2, createdAt: '2026-09-27T09:00:00.000Z', started: false,
};

describe('Activity presentation from authoritative booking state', () => {
  it('places the same queue booking under Waiting for the seeker and provider', () => {
    expect(getBookingActivityGroup(booking, 'seeker', 'johncarlo')).toBe('waiting');
    expect(getBookingActivityGroup(booking, 'provider', 'ian')).toBe('waiting');
    expect(getBookingActivityGroup({ ...booking, queuePosition: 1 }, 'provider', 'ian')).toBe('your_turn');
    expect(getBookingActivityGroup({ ...booking, status: 'in_progress', started: true }, 'provider', 'ian')).toBe('work_underway');
    expect(getBookingActivityGroup({ ...booking, status: 'awaiting_seeker_approval' }, 'seeker', 'johncarlo')).toBe('your_turn');
    expect(getBookingActivityGroup({ ...booking, status: 'awaiting_seeker_approval' }, 'provider', 'ian')).toBe('waiting');
  });

  it('separates disputes and Admin review from general waiting, and closes history', () => {
    expect(getBookingActivityGroup({ ...booking, status: 'disputed', paymentStatus: 'FROZEN_HELD' }, 'seeker')).toBe('under_review');
    expect(getBookingActivityGroup({ ...booking, cancellationRequests: [{ id: 'cancel-1', status: 'ESCALATED', requestedBy: 'johncarlo' }] }, 'provider')).toBe('under_review');
    expect(getBookingActivityGroup({ ...booking, status: 'completed' }, 'provider')).toBe('history');
    expect(getBookingActivityGroup({ ...booking, status: 'canceled' }, 'seeker')).toBe('history');
    expect(getActivityQueueCopy({ ...booking, status: 'disputed' }).label).toBe('Position #2 paused');
    expect(getActivityQueueCopy({ ...booking, status: 'canceled' }).label).toBe('Left the queue');
  });

  it('translates actual payment states instead of exposing internal enums or assuming a payout', () => {
    expect(getActivityPaymentCopy(booking).label).toBe('Payment confirmed');
    expect(getActivityPaymentCopy({ ...booking, status: 'disputed', paymentStatus: 'FROZEN_HELD' }).label).toBe('Funds temporarily held');
    expect(getActivityPaymentCopy({ ...booking, status: 'completed', paymentStatus: 'RELEASED' }).detail).toMatch(/does not mean a real provider payout/i);
    expect(getActivityPaymentCopy({ ...booking, paymentMethod: 'On-site Cash', paymentStatus: 'UNPAID' }).label).toBe('Pay on site');
    const { rerender } = render(<ActivityBookingFacts booking={booking} role="seeker" />);
    expect(screen.getByText('Payment confirmed')).toBeInTheDocument();
    expect(screen.getByText('Position #2')).toBeInTheDocument();
    expect(screen.queryByText(/PAID_HELD/)).not.toBeInTheDocument();
    rerender(<ActivityBookingFacts booking={{ ...booking, status: 'disputed', paymentStatus: 'FROZEN_HELD' }} role="provider" />);
    expect(screen.getByText('Funds temporarily held')).toBeInTheDocument();
    expect(screen.queryByText(/FROZEN_HELD/)).not.toBeInTheDocument();
  });

  it('renders an action-first single column overview and opens the selected booking', () => {
    const onOpen = vi.fn();
    const entries: ActivityFeedEntry[] = [
      { id: 'waiting', group: 'waiting', title: 'House Cleaning', participant: 'Seeker: John Carlo', status: 'Position #2', explanation: 'Waiting for earlier jobs', next: 'Provider starts when ready', price: 250, payment: 'Payment confirmed', queue: 'Position #2', action: 'None right now' },
      { id: 'action', group: 'your_turn', title: 'Faucet Repair', participant: 'Seeker: Lee', status: 'Ready to start', explanation: 'First in line', next: 'Start the job', price: 500 },
      { id: 'dispute', group: 'under_review', title: 'Tutoring', participant: 'Seeker: Ana', status: 'Admin review', explanation: 'Case is being reviewed', next: 'Await decision', price: 100 },
    ];
    render(<ActivityFeed entries={entries} tone="provider" onOpen={onOpen} />);
    const headings = screen.getAllByRole('heading').map((node) => node.textContent);
    expect(headings).toEqual(['Your Turn1', 'Waiting1', 'Under Review1']);
    expect(screen.getByText('Payment confirmed')).toBeInTheDocument();
    expect(screen.getByText('None right now')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Open booking Faucet Repair/ }));
    expect(onOpen).toHaveBeenCalledWith(entries[1]);
  });

  it.each(['seeker', 'provider'] as const)('distinguishes completed, canceled, and Admin review outcomes for the %s', (tone) => {
    const onOpen = vi.fn();
    const entries: ActivityFeedEntry[] = [
      { id: 'done', group: 'history', outcome: 'completed', title: 'Haircut', participant: 'Ian', status: 'This booking is complete', explanation: '', next: 'Leave a review', date: 'Sep 25, 2026', price: 250 },
      { id: 'closed', group: 'history', outcome: 'canceled', title: 'Cleaning', participant: 'John Carlo', status: 'This booking is closed', explanation: '', next: 'Find another service', date: 'Sep 26, 2026', price: 500 },
      { id: 'review', group: 'under_review', title: 'Tutoring', participant: 'Lee', status: 'Admin is reviewing this booking', explanation: 'A dispute is open', next: 'Await an Admin decision', price: 100 },
    ];
    render(<ActivityFeed entries={entries} tone={tone} onOpen={onOpen} />);
    const review = screen.getByRole('region', { name: 'Under Review 1' });
    const history = screen.getByRole('region', { name: 'History 2' });
    expect(review).toHaveTextContent('Under review');
    expect(review).toHaveTextContent('Await an Admin decision');
    expect(history).toHaveTextContent('Completed');
    expect(history).toHaveTextContent('Canceled');
    expect(history).toHaveTextContent('Sep 25, 2026');
    expect(history).toHaveTextContent('Sep 26, 2026');
    fireEvent.click(screen.getByRole('button', { name: /Open booking Cleaning/ }));
    expect(onOpen).toHaveBeenCalledWith(entries[1]);
  });
});
