import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapBookingToEngagement } from '../../../context/mappers';
import CompletionReviewAction from './CompletionReviewAction';

const deadline = '2026-10-16T10:00:00.000Z';
const booking = mapBookingToEngagement({ id: 'booking', status: 'AWAITING_CONFIRMATION',
  seekerId: 'seeker', providerId: 'provider', paymentMethod: 'GCash',
  completionReview: { availableAt: deadline, pending: false },
});

describe('Completion review availability', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-16T09:59:59Z')); });
  afterEach(() => vi.useRealTimers());

  it('prevents a premature GCash request and shows the deadline in Philippine time', () => {
    const onRequest = vi.fn();
    render(<CompletionReviewAction booking={booking} busy={false} submitting={false} onRequest={onRequest} />);
    const button = screen.getByRole('button', { name: 'Request Admin Review' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(/Oct 16, 2026.*6:00 PM.*Philippine time.*72-hour/);
    fireEvent.click(button); expect(onRequest).not.toHaveBeenCalled();
  });

  it('never renders routine admin review for cash, even if an older payload includes eligibility', () => {
    vi.setSystemTime(new Date('2026-10-20T10:00:00Z'));
    render(<CompletionReviewAction booking={{ ...booking, paymentMethod: 'On-site Cash' }} busy={false} submitting={false} onRequest={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('enables exactly at 72 hours without a page reload', () => {
    const onRequest = vi.fn();
    render(<CompletionReviewAction booking={booking} busy={false} submitting={false} onRequest={onRequest} />);
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByRole('button')).toBeDisabled();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('button')).toBeEnabled();
    fireEvent.click(screen.getByRole('button')); expect(onRequest).toHaveBeenCalledWith('booking');
  });

  it('keeps an existing review disabled even after the response period', () => {
    vi.setSystemTime(new Date('2026-10-20T10:00:00Z'));
    const onRequest = vi.fn();
    render(<CompletionReviewAction booking={{ ...booking, completionReview: { availableAt: deadline, pending: true } }} busy={false} submitting={false} onRequest={onRequest} />);
    expect(screen.getByRole('button', { name: 'Admin Review Requested' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button')); expect(onRequest).not.toHaveBeenCalled();
  });

  it('does not guess eligibility from booking creation when timing data is missing', () => {
    render(<CompletionReviewAction booking={{ ...booking, completionReview: undefined }} busy={false} submitting={false} onRequest={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/Refresh the booking/)).toBeVisible();
  });

  it('blocks repeat clicks during submission and rechecks time on tab focus', () => {
    const onRequest = vi.fn();
    const view = render(<CompletionReviewAction booking={booking} busy={false} submitting={false} onRequest={onRequest} />);
    vi.setSystemTime(new Date('2026-10-20T10:00:00Z'));
    act(() => window.dispatchEvent(new Event('focus')));
    expect(screen.getByRole('button')).toBeEnabled();
    view.rerender(<CompletionReviewAction booking={booking} busy submitting onRequest={onRequest} />);
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button')); expect(onRequest).not.toHaveBeenCalled();
  });
});
