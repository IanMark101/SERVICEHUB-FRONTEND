import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { JobEngagement } from '../../types';
import BookingProgressHistory, { bookingProgressRows } from './BookingProgressHistory';
import { mapEngagements, type ApiBooking } from '../../context/mappers';

const booking: JobEngagement = {
  id: 'booking-1', title: 'Outlet repair', seekerId: 'seeker-1', seekerName: 'Ian', seekerAvatar: '',
  providerId: 'provider-1', providerName: 'John', providerAvatar: '', serviceId: null,
  price: 200, paymentMethod: 'On-site Cash', status: 'completed', bookingStatus: 'COMPLETED', started: true,
  createdAt: '2026-10-06T04:30:00.000Z', progressEvents: [
    { id: 'accept', kind: 'ACCEPTED', actorRole: 'PROVIDER', occurredAt: '2026-10-06T04:45:00.000Z' },
    { id: 'start', kind: 'STARTED', actorRole: 'PROVIDER', occurredAt: '2026-10-06T05:00:00.000Z' },
    { id: 'done', kind: 'WORK_MARKED_COMPLETE', actorRole: 'PROVIDER', occurredAt: '2026-10-06T07:05:00.000Z' },
    { id: 'confirm', kind: 'COMPLETION_CONFIRMED', actorRole: 'SEEKER', occurredAt: '2026-10-06T07:12:00.000Z' },
  ],
};

describe('Booking progress times on Activity cards', () => {
  it('shows separate actual provider and seeker times in Philippine time, with full dates', () => {
    render(<BookingProgressHistory booking={booking} />);
    expect(screen.getByText('1:00 PM').closest('time')).toHaveAttribute('datetime', '2026-10-06T05:00:00.000Z');
    expect(screen.getByText('3:05 PM')).toBeInTheDocument();
    expect(screen.getByText('3:12 PM')).toBeInTheDocument();
    expect(screen.getAllByText('Oct 6, 2026')).toHaveLength(5);
    expect(within(screen.getByText('Booking created').closest('li')!).queryByText(/Seeker|Provider/)).not.toBeInTheDocument();
    expect(within(screen.getByText('Work marked complete').closest('li')!).getByText('Provider · John')).toBeInTheDocument();
    expect(within(screen.getByText('Completion confirmed').closest('li')!).getByText('Seeker · Ian')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });

  it('keeps unperformed actions pending on an accepted booking', () => {
    render(<BookingProgressHistory booking={{ ...booking, status: 'in_progress', bookingStatus: 'ACCEPTED', started: false, progressEvents: booking.progressEvents!.slice(0, 1) }} />);
    expect(screen.getAllByText('Pending')).toHaveLength(3);
    expect(screen.queryByText('1:00 PM')).not.toBeInTheDocument();
  });

  it('never borrows updatedAt or a date-only value for missing historical action times', () => {
    const old = mapEngagements([{ id: 'old', seekerId: 's', providerId: 'p', status: 'ONGOING', started: true,
      createdAt: '2026-10-06', updatedAt: '2026-10-06T10:00:00.000Z' }], []);
    render(<BookingProgressHistory booking={old[0]} />);
    expect(screen.getAllByText('Time not recorded')).toHaveLength(3);
    expect(screen.queryByText('6:00 PM')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
  });

  it('retains full action times and booking creation when completed records replace active records', () => {
    const source: ApiBooking = { ...booking, status: 'COMPLETED' };
    const mapped = mapEngagements([source], [{ id: 'completed-1', bookingId: booking.id,
      seekerId: booking.seekerId, providerId: booking.providerId, completedAt: '2026-10-06T07:12:00.000Z' }])[0];
    expect(mapped.progressEvents).toEqual(booking.progressEvents);
    expect(mapped.bookingCreatedAt).toBe(booking.createdAt);
    expect(bookingProgressRows(mapped).filter(row => row.state === 'recorded')).toHaveLength(5);
  });

  it('shows cancellation decisions between work actions in chronological order, preserving repeated completion', () => {
    const events = [...booking.progressEvents!,
      { id: 'request', kind: 'CANCELLATION_REQUESTED', actorRole: 'SEEKER' as const, occurredAt: '2026-10-06T06:00:00.000Z' },
      { id: 'decline', kind: 'CANCELLATION_DECLINED', actorRole: 'PROVIDER' as const, occurredAt: '2026-10-06T06:05:00.000Z' },
      { id: 'done-again', kind: 'WORK_MARKED_COMPLETE', actorRole: 'PROVIDER' as const, occurredAt: '2026-10-06T07:10:00.000Z' },
    ];
    expect(bookingProgressRows({ ...booking, progressEvents: events }).map(row => row.kind)).toEqual([
      'CREATED', 'ACCEPTED', 'STARTED', 'CANCELLATION_REQUESTED', 'CANCELLATION_DECLINED',
      'WORK_MARKED_COMPLETE', 'WORK_MARKED_COMPLETE', 'COMPLETION_CONFIRMED',
    ]);
  });

  it('labels automatic payment acceptance honestly and does not append pending milestones after cancellation', () => {
    const rows = bookingProgressRows({ ...booking, status: 'canceled', bookingStatus: 'CANCELED', started: false,
      progressEvents: [
        { id: 'automatic', kind: 'ACCEPTED', actorRole: 'SYSTEM', occurredAt: '2026-10-06T04:45:00.000Z' },
        { id: 'cancel', kind: 'CANCELED', actorRole: 'SEEKER', occurredAt: '2026-10-06T04:50:00.000Z' },
      ] });
    expect(rows.find(row => row.kind === 'ACCEPTED')?.label).toBe('Booking confirmed after payment');
    expect(rows.some(row => row.state === 'pending')).toBe(false);
    expect(rows.some(row => row.kind === 'WORK_MARKED_COMPLETE')).toBe(false);
  });

  it('retains an older request alongside newly recorded cancellations without duplicating the new request', () => {
    const rows = bookingProgressRows({ ...booking, cancellationRequests: [
      { id: 'old', requestedBy: 'seeker-1', status: 'DECLINED', createdAt: '2026-10-06T06:00:00.000Z', resolvedAt: '2026-10-06T06:05:00.000Z' },
      { id: 'new', requestedBy: 'provider-1', status: 'PENDING', createdAt: '2026-10-06T06:10:00.000Z' },
    ], progressEvents: [...booking.progressEvents!, { id: 'new-event', eventKey: 'new:requested', kind: 'CANCELLATION_REQUESTED', actorRole: 'PROVIDER', occurredAt: '2026-10-06T06:10:00.000Z' }] });
    expect(rows.filter(row => row.kind === 'CANCELLATION_REQUESTED')).toHaveLength(2);
    expect(rows.filter(row => row.kind === 'CANCELLATION_RESOLVED')).toHaveLength(1);
  });
});
