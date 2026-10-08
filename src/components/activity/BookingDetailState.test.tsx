import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../types';
import BookingDetailState, { type ActivityLoadStatus } from './BookingDetailState';
import SeekerActivityList from '../seeker/activity/SeekerActivityList';
import ProviderActivityList from '../provider/activity/ProviderActivityList';

vi.mock('../seeker/activity/SeekerActivityItem', () => ({ default: ({ engagement }: { engagement: JobEngagement }) => <h2>{engagement.title}</h2> }));
vi.mock('../provider/activity/ProviderActivityItem', () => ({ default: ({ item }: { item: { data: JobEngagement } }) => <h2>{item.data.title}</h2> }));

const booking: JobEngagement = {
  id: 'booking-1', completedServiceId: 'completion-1', title: 'Outlet repair',
  seekerId: 'seeker-1', seekerName: 'Seeker', seekerAvatar: '', providerId: 'provider-1',
  providerName: 'Provider', providerAvatar: '', serviceId: null, price: 200,
  status: 'completed', paymentMethod: 'On-site Cash', createdAt: '2026-10-08T05:00:00.000Z',
};

function detail(role: 'seeker' | 'provider', status: ActivityLoadStatus, bookings: JobEngagement[] = [], id = booking.id, retry = vi.fn().mockResolvedValue(undefined), back = vi.fn()) {
  const common = { myEngagements: bookings, engagementsStatus: status, retryBooking: retry, isLoading: false,
    isDark: false, myOffers: [], paginatedItems: [], paginatedEngagements: [] };
  // The detail branch does not use overview filters, pagination, or booking actions.
  return role === 'seeker'
    ? <SeekerActivityList model={{ ...common, openBookingId: id, closeBooking: back } as unknown as ComponentProps<typeof SeekerActivityList>['model']} />
    : <ProviderActivityList model={{ ...common, openItemId: id, closeItem: back } as unknown as ComponentProps<typeof ProviderActivityList>['model']} />;
}

describe.each(['seeker', 'provider'] as const)('%s booking detail recovery', role => {
  it('waits for an initial fetch rather than declaring the booking unavailable', () => {
    const view = render(detail(role, 'loading'));
    expect(screen.getByRole('status', { name: 'Loading booking details' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Booking unavailable')).not.toBeInTheDocument();
    view.rerender(detail(role, 'ready', [booking]));
    expect(screen.getByRole('heading', { name: booking.title })).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Loading booking details' })).not.toBeInTheDocument();
  });

  it('opens a completed-service link using the canonical booking', () => {
    render(detail(role, 'ready', [booking], booking.completedServiceId!));
    expect(screen.getByRole('heading', { name: booking.title })).toBeInTheDocument();
    expect(screen.queryByText('Booking unavailable')).not.toBeInTheDocument();
  });

  it.each(['loading', 'error'] as const)('keeps existing booking details visible during a refresh in the %s state', status => {
    const view = render(detail(role, 'ready', [booking]));
    view.rerender(detail(role, status, [booking]));
    expect(screen.getByRole('heading', { name: booking.title })).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load this booking")).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Loading booking details' })).not.toBeInTheDocument();
  });

  it('offers a single retry action for a failed lookup and shows loading while retrying', async () => {
    let resolveRetry!: () => void;
    const retry = vi.fn(() => new Promise<void>(resolve => { resolveRetry = resolve; }));
    const view = render(detail(role, 'error', [], booking.id, retry));
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load this booking");
    expect(screen.queryByText('Booking unavailable')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status', { name: 'Loading booking details' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    await act(async () => { resolveRetry(); });
    view.rerender(detail(role, 'ready', [booking], booking.id, retry));
    expect(screen.getByRole('heading', { name: booking.title })).toBeInTheDocument();
  });

  it('shows an unavailable state only after a successful lookup and returns to Activity', () => {
    const back = vi.fn();
    render(detail(role, 'ready', [], booking.id, vi.fn().mockResolvedValue(undefined), back));
    expect(screen.getByRole('heading', { name: 'Booking unavailable' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Activity' }));
    expect(back).toHaveBeenCalledTimes(1);
  });
});

it('keeps a rejected retry recoverable without declaring a booking unavailable', async () => {
  render(<BookingDetailState role="seeker" status="error" onRetry={vi.fn().mockRejectedValue(new Error('Offline'))} onBack={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument());
  expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load this booking");
  expect(screen.queryByText('Booking unavailable')).not.toBeInTheDocument();
});
