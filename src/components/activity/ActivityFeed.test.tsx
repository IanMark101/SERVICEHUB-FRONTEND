import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ActivityFeed, { type ActivityFeedEntry } from './ActivityFeed';

const queued: ActivityFeedEntry = {
  id: 'booking-1', group: 'waiting', title: 'House Cleaning', participant: 'Provider: Ian',
  status: "First in this provider's paid queue", explanation: 'The provider has not started your work.',
  next: 'The provider can start this booking when available.', action: 'No action needed now',
  situationLabel: 'Waiting on provider', openLabel: 'View queue',
  payment: 'Payment confirmed', queue: 'Position #1', price: 250,
  queueOverview: true, queuePosition: 1,
};

describe('Activity overview', () => {
  it.each(['seeker', 'provider'] as const)('keeps the %s work underway card tinted at rest and on hover', (tone) => {
    const entry = { ...queued, group: 'work_underway' as const, queueOverview: false, status: 'Work is underway' };
    const onOpen = vi.fn();
    render(<ActivityFeed entries={[entry]} tone={tone} onOpen={onOpen} />);
    const card = screen.getByRole('button', { name: 'Open booking House Cleaning: Work is underway' });
    const color = tone === 'provider' ? 'emerald' : 'orange';
    expect(card).toHaveClass(`bg-${color}-100`, `hover:bg-${color}-200/60`, `dark:bg-${color}-950/60`, `dark:hover:bg-${color}-900/40`);
    expect(card).not.toHaveClass('bg-white');
    fireEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith(entry);
  });

  it.each(['seeker', 'provider'] as const)('never infers completed from terminal history for %s', (tone) => {
    render(<ActivityFeed entries={[
      { ...queued, id: 'cancel', group: 'history', outcome: 'canceled', status: 'This booking was canceled' },
      { ...queued, id: 'withdraw', kind: 'offer', group: 'history', outcome: 'withdrawn', status: 'Offer withdrawn' },
      { ...queued, id: 'decline', kind: 'offer', group: 'history', outcome: 'declined', status: 'Offer declined by seeker' },
      { ...queued, id: 'unknown', kind: 'offer', group: 'history', situationLabel: 'Closed', status: 'Offer closed' },
    ]} tone={tone} onOpen={vi.fn()} />);
    expect(screen.getByText('Canceled')).toHaveClass('bg-stone-100');
    expect(screen.getByText('Withdrawn')).toBeInTheDocument();
    expect(screen.getByText('Offer declined')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });
  it('shows the seeker payment-secured queue state without suggesting an action', () => {
    const onOpen = vi.fn();
    render(<ActivityFeed entries={[queued]} tone="seeker" onOpen={onOpen} />);

    const booking = screen.getByRole('article', { name: 'House Cleaning queue booking' });
    expect(within(booking).getByText('Waiting for provider to start')).toBeInTheDocument();
    expect(within(booking).getByText(/booking is secured/)).toBeInTheDocument();
    expect(within(booking).getByText('No action needed now')).toBeInTheDocument();
    expect(within(booking).getByText('The provider can start this booking when available.')).toBeInTheDocument();
    expect(within(booking).getByText('Payment confirmed')).toBeInTheDocument();
    expect(within(booking).getByText('#1')).toBeInTheDocument();
    expect(within(booking).queryByRole('button', { name: /Start Job/ })).not.toBeInTheDocument();
    fireEvent.click(within(booking).getByRole('button', { name: 'Booking details' }));
    expect(onOpen).toHaveBeenCalledWith(queued);
  });

  it('makes eligible provider Start Job the primary action and keeps workroom navigation', () => {
    const onOpen = vi.fn();
    const onStart = vi.fn();
    const providerEntry: ActivityFeedEntry = {
      ...queued, group: 'your_turn', participant: 'Seeker: John',
      action: 'Ready to start', situationLabel: 'Ready to start', canStart: true,
      next: 'Only one job may be active across your services.',
    };
    render(<ActivityFeed entries={[providerEntry]} tone="provider" onOpen={onOpen} onStart={onStart} />);

    const booking = screen.getByRole('article', { name: 'House Cleaning queue booking' });
    expect(within(booking).getByText('Ready to start')).toBeInTheDocument();
    expect(within(booking).getByText('#1')).toBeInTheDocument();
    expect(within(booking).getByText('Payment confirmed')).toBeInTheDocument();
    fireEvent.click(within(booking).getByRole('button', { name: 'Start Job: House Cleaning' }));
    expect(onStart).toHaveBeenCalledWith(providerEntry);
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(within(booking).getByRole('button', { name: 'Booking details' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('does not offer Start Job for position #2 and explains the wait to both roles', () => {
    const second = { ...queued, id: 'second', queuePosition: 2, queue: 'Position #2' };
    const { rerender } = render(<ActivityFeed entries={[second]} tone="seeker" onOpen={vi.fn()} />);
    expect(screen.getByText('Waiting in the provider’s work queue')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    rerender(<ActivityFeed entries={[{ ...second, participant: 'Seeker: John' }]} tone="provider" onOpen={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('Waiting for your turn')).toBeInTheDocument();
    expect(screen.getByText('Start Job is available at position #1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start Job/ })).not.toBeInTheDocument();
  });

  it('disables provider Start Job while another job is active or this one is starting', () => {
    const onStart = vi.fn();
    const blocked = { ...queued, group: 'waiting' as const, participant: 'Seeker: John', canStart: false, startUnavailableReason: 'Finish your current job before starting another booking.' };
    const { rerender } = render(<ActivityFeed entries={[blocked]} tone="provider" onOpen={vi.fn()} onStart={onStart} />);
    expect(screen.getByText('First in line, start unavailable')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Start Job: House Cleaning' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onStart).not.toHaveBeenCalled();
    rerender(<ActivityFeed entries={[{ ...blocked, canStart: true, startPending: true }]} tone="provider" onOpen={vi.fn()} onStart={onStart} />);
    expect(screen.getByRole('button', { name: 'Start Job: House Cleaning' })).toBeDisabled();
    expect(screen.getByText('Starting...')).toBeInTheDocument();
  });

  it('keeps completed and canceled history compact', () => {
    render(<ActivityFeed entries={[
      { ...queued, id: 'complete', group: 'history', outcome: 'completed' },
      { ...queued, id: 'cancel', group: 'history', outcome: 'canceled' },
    ]} tone="seeker" onOpen={vi.fn()} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Canceled')).toBeInTheDocument();
    expect(screen.queryByText('What happens next')).not.toBeInTheDocument();
  });
});
