import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../types';
import SeekerActivityItem, { type SeekerActivityItemModel } from '../seeker/activity/SeekerActivityItem';
import ProviderActivityItem, { type ProviderActivityItemModel } from '../provider/activity/ProviderActivityItem';
import { mapBookingToEngagement, mapOfferToBid } from '../../context/mappers';
import { countProviderActivityTab, filterProviderActivityItems } from '../provider/activity/providerActivity.utils';

const booking: JobEngagement = {
  id: 'booking-1', title: 'House Cleaning', seekerId: 'johncarlo', seekerName: 'John Carlo', seekerAvatar: '',
  providerId: 'ian', providerName: 'Ian', providerAvatar: '', serviceId: 'service-1',
  price: 250, status: 'queued', paymentMethod: 'GCash', paymentStatus: 'PAID_HELD', queuePaymentStatus: 'PAID_HELD', queuePosition: 1, queueStatus: 'WAITING',
  createdAt: '2026-09-27T09:00:00.000Z', started: false,
};

function seekerModel(overrides: Partial<SeekerActivityItemModel> = {}): SeekerActivityItemModel {
  return {
    isDark: false, highlightedBookingId: null, getCategoryForEngagement: () => 'House Cleaning',
    currentUserId: 'johncarlo', loadingItemId: null, loadingActionType: null,
    setReviewingEngagement: vi.fn(), handleDeleteClick: vi.fn(), router: { push: vi.fn() },
    setDisputingJob: vi.fn(), setConfirmModal: vi.fn(), handleConfirmJobCompletion: vi.fn(),
    handleEscalateClick: vi.fn(), handleCancelClick: vi.fn(), handleRespondCancellation: vi.fn(),
    handleRequestAgain: vi.fn(), openSafetyReport: vi.fn(), ...overrides,
  };
}

function providerModel(overrides: Partial<ProviderActivityItemModel> = {}): ProviderActivityItemModel {
  return {
    isDark: false, getRequestForBid: () => undefined, getCategoryForEngagement: () => 'House Cleaning',
    loadingItemId: null, loadingActionType: null, highlightedBookingId: null,
    handleCancelOffer: vi.fn(), handleApproveCancellation: vi.fn(), handleDeleteClick: vi.fn(),
    handleProviderStartJob: vi.fn(), handleRequestJobApproval: vi.fn(), handleCompletionEscalation: vi.fn(),
    handleProviderRemoveFromQueue: vi.fn(), handleEscalateCancellation: vi.fn(),
    router: { push: vi.fn() }, setRespondingReqId: vi.fn(), setDeclineNote: vi.fn(),
    setReviewingEngagement: vi.fn(), openSafetyReport: vi.fn(), resolvedProviderId: 'ian', user: null,
    ...overrides,
  };
}

describe('Activity card actions with the new hierarchy', () => {
  it('keeps declined offers out of Canceled bookings and opens the actual canceled booking', () => {
    const canceled = { ...booking, status: 'canceled' as const };
    const offer = mapOfferToBid({ id: 'offer', requestId: 'request', status: 'REJECTED' });
    const args = { engagements: [canceled], pendingBids: [offer], services: [], jobRequests: [], searchQuery: '', sortBy: 'newest' as const };
    expect(countProviderActivityTab('canceled', [canceled], [offer])).toBe(1);
    const items = filterProviderActivityItems({ ...args, activeTab: 'canceled' });
    expect(items).toEqual([{ type: 'engagement', data: canceled }]);
    render(<ProviderActivityItem item={items[0]} model={providerModel()} />);
    expect(screen.getByText('Booking details')).toBeInTheDocument();
    expect(screen.getByText('Booking journey').closest('details')).toHaveAttribute('open');
    expect(screen.queryByText('Offer details')).not.toBeInTheDocument();
    expect(filterProviderActivityItems({ ...args, activeTab: 'closed_offers' })).toEqual([{ type: 'bid', data: offer }]);
  });

  it('renders a real mapped offer photo, category, duration, and times even when its request is absent', () => {
    const bid = mapOfferToBid({ id: 'offer', requestId: 'closed-request', providerId: 'provider',
      provider: { name: 'John' }, status: 'REJECTED', decisionReason: 'DECLINED', offeredPrice: 250,
      estimatedDuration: 90, availability: 'Saturday morning', createdAt: '2026-10-02T02:30:00.000Z',
      decisionAt: '2026-10-03T05:15:00.000Z', request: { title: 'Outlet repair', seekerId: 'ian',
        seeker: { name: 'Ian', avatarUrl: '/ian-avatar.png', trustScore: 82 }, category: { name: 'Electrical repair' } } });
    render(<ProviderActivityItem item={{ type: 'bid', data: bid }} model={providerModel()} />);
    const profileImage = screen.getByRole('button', { name: "View Ian's profile" }).querySelector('img');
    expect(new URL(profileImage!.getAttribute('src')!, 'http://localhost:3000').pathname).toBe('/ian-avatar.png');
    expect(screen.getByText('Trust 82/100')).toBeInTheDocument();
    expect(screen.getByText('Electrical repair')).toHaveClass('text-emerald-600');
    expect(screen.getByText('1 hr 30 min')).toBeInTheDocument();
    expect(screen.getByText('Saturday morning')).toBeInTheDocument();
    expect(screen.getByText('10:30 AM').closest('time')).toHaveAttribute('datetime', bid.createdAt);
    expect(screen.getByText('1:15 PM').closest('time')).toHaveAttribute('datetime', bid.decisionAt!);
    expect(screen.getByText('Offer journey').closest('details')).toHaveAttribute('open');
  });

  it.each(['provider', 'seeker'] as const)('shows the historical category, duration, and actual booking times for %s', role => {
    const mapped = mapBookingToEngagement({ id: 'historical', status: 'CANCELED', seekerId: 'ian', providerId: 'john',
      seeker: { name: 'Ian', avatarUrl: '/ian-avatar.png' }, provider: { name: 'John' },
      estimatedDurationMins: 45, createdAt: '2026-10-02T02:30:00.000Z',
      offer: { id: 'offer', requestId: 'archived-request', request: { title: 'Outlet repair', category: { name: 'Electrical repair' } } },
      progressEvents: [{ id: 'cancel', kind: 'CANCELED', actorRole: 'SEEKER', occurredAt: '2026-10-03T05:15:00.000Z' }] });
    if (role === 'provider') render(<ProviderActivityItem item={{ type: 'engagement', data: mapped }} model={providerModel({ getCategoryForEngagement: () => 'General' })} />);
    else render(<SeekerActivityItem engagement={mapped} model={seekerModel({ getCategoryForEngagement: () => 'General' })} />);
    expect(screen.getByText('Electrical repair')).toHaveClass(role === 'provider' ? 'text-emerald-600' : 'text-orange-600');
    expect(screen.queryByText('General')).not.toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
    expect(screen.getByText('Booking details')).toBeInTheDocument();
    expect(screen.getByText('1:15 PM')).toBeInTheDocument();
    expect(screen.getByText('Booking journey').closest('details')).toHaveAttribute('open');
  });

  it.each(['seeker', 'provider'] as const)('uses the shared canceled booking layout and correct counterpart for %s', (role) => {
    const canceled = { ...booking, status: 'canceled' as const, paymentMethod: 'On-site Cash' as const };
    const model = role === 'provider' ? providerModel() : seekerModel();
    const view = role === 'provider'
      ? render(<ProviderActivityItem item={{ type: 'engagement', data: canceled }} model={model as ProviderActivityItemModel} />)
      : render(<SeekerActivityItem engagement={canceled} model={model as SeekerActivityItemModel} />);
    const name = role === 'provider' ? 'John Carlo' : 'Ian';
    const profile = screen.getByRole('button', { name: `View ${name}'s profile` });
    expect(within(profile).getByText(role === 'provider' ? 'Seeker:' : 'Provider:')).toBeInTheDocument();
    expect(within(profile).getByRole('img', { name: `${name} avatar` })).toBeInTheDocument();
    expect(screen.queryByText('Client:')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'What is happening now' }).parentElement).toHaveClass('border-stone-300');
    const facts = screen.getByRole('region', { name: 'Booking facts' });
    expect(facts.closest('aside')).toHaveClass('xl:col-start-2');
    expect(view.container.querySelector('details')).toHaveAttribute('open');
    expect(view.container.querySelector('.workspace-card')).toHaveClass('rounded-2xl');
    fireEvent.click(profile);
    expect(model.router.push).toHaveBeenCalledWith(role === 'provider' ? '/profile/johncarlo' : '/profile/ian');
  });

  it('uses the same detail structure for a declined offer without inventing a booking', () => {
    const model = providerModel();
    const view = render(<ProviderActivityItem item={{ type: 'bid', data: {
      id: 'declined-offer', requestId: 'archived-request', seekerId: 'johncarlo', providerId: 'ian',
      providerName: 'Ian', providerAvatar: '', providerRating: 0, price: 250, message: 'Available tomorrow',
      status: 'declined', decisionReason: 'DECLINED', createdAt: booking.createdAt,
      requestTitle: booking.title, seekerName: booking.seekerName, category: 'House Cleaning',
    } }} model={model} />);
    expect(screen.getByRole('heading', { name: 'Offer declined by seeker' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Your action' })).toHaveTextContent('No action needed for this offer.');
    expect(screen.getByRole('region', { name: 'What happens next' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Offer facts' }).closest('aside')).toHaveClass('xl:col-start-2');
    expect(screen.getByText('No booking created')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Withdraw Offer' })).not.toBeInTheDocument();
    expect(screen.queryByText('Booking journey')).not.toBeInTheDocument();
    expect(screen.getByText('Offer journey').closest('details')).toHaveAttribute('open');
    expect(screen.queryByText('Client:')).not.toBeInTheDocument();
    expect(view.container.querySelector('.workspace-card')).toHaveClass('rounded-2xl');
    expect(view.container.querySelector('.text-orange-500')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: `View ${booking.seekerName}'s profile` }));
    expect(model.router.push).toHaveBeenCalledWith('/profile/johncarlo');
  });

  it('uses provider green for an open offer and prevents a second withdrawal while busy', () => {
    render(<ProviderActivityItem item={{ type: 'bid', data: {
      id: 'pending-offer', requestId: 'request-1', seekerId: 'johncarlo', providerId: 'ian',
      providerName: 'Ian', providerAvatar: '', providerRating: 0, price: 250, message: '',
      status: 'pending', createdAt: booking.createdAt, requestTitle: booking.title, seekerName: booking.seekerName,
    } }} model={providerModel({ loadingItemId: 'pending-offer', loadingActionType: 'cancel_offer' })} />);
    expect(screen.getByRole('region', { name: 'What is happening now' }).parentElement).toHaveClass('border-emerald-200');
    expect(screen.getByText('₱250')).toHaveClass('text-emerald-700');
    expect(screen.getByRole('button', { name: 'Cancelling...' })).toBeDisabled();
  });

  it('can copy a completed public request into a fresh draft from Activity', () => {
    const model = seekerModel();
    render(<SeekerActivityItem engagement={{ ...booking, status: 'completed', bookingStatus: 'COMPLETED', serviceId: null, repostRequestId: 'archived-request' }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Repost request' }));
    expect(model.router.push).toHaveBeenCalledWith('/seeker/post-request?repost=archived-request');
    expect(model.handleRequestAgain).not.toHaveBeenCalled();
  });

  it('keeps the existing Request Again action for completed service-listing bookings', () => {
    const model = seekerModel();
    const completed = { ...booking, status: 'completed' as const, bookingStatus: 'COMPLETED' };
    render(<SeekerActivityItem engagement={completed} model={model} />);
    expect(screen.queryByRole('button', { name: 'Repost request' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Request Again' }));
    expect(model.handleRequestAgain).toHaveBeenCalledWith(completed);
  });
  it.each(['seeker', 'provider'] as const)('renders canceled %s workroom state and details in gray without completion copy', (role) => {
    const canceled = { ...booking, status: 'canceled' as const, bookingStatus: 'CANCELED', providerAvailability: 'Monday', completedServiceId: undefined, cancellationRequests: [{ id: 'old-cancel', status: 'DECLINED' as const, requestedBy: 'johncarlo' }] };
    if (role === 'seeker') render(<SeekerActivityItem engagement={canceled} model={seekerModel()} />);
    else render(<ProviderActivityItem item={{ type: 'engagement', data: canceled }} model={providerModel()} />);
    expect(screen.getAllByText('Canceled').length).toBeGreaterThan(0);
    expect(screen.getByText('This booking was canceled')).toBeInTheDocument();
    expect(screen.getByText('This engagement ended without completion.')).toBeInTheDocument();
    expect(screen.getByLabelText('What is happening now').parentElement).toHaveClass('border-stone-300');
    expect(screen.getByText('Provider availability')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('This booking is complete')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete Transaction' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Escalate to Admin' })).not.toBeInTheDocument();
  });
  it('offers cancellation approval without promising a platform refund for cash', () => {
    const model = providerModel();
    render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'in_progress', paymentMethod: 'On-site Cash', cancellationRequests: [{ id: 'cancel-1', status: 'PENDING', requestedBy: 'johncarlo', reason: 'My plans have changed.' }] } }} model={model} />);
    expect(screen.queryByRole('button', { name: 'Approve & Refund' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve Cancellation' }));
    expect(model.handleApproveCancellation).toHaveBeenCalledWith('cancel-1');
    fireEvent.click(screen.getByRole('button', { name: 'Decline Request' }));
    expect(model.setRespondingReqId).toHaveBeenCalledWith('cancel-1');
    expect(model.setDeclineNote).toHaveBeenCalledWith('');
  });

  it('opens the seeker decline flow without immediately submitting a decision', () => {
    const model = seekerModel();
    render(<SeekerActivityItem engagement={{ ...booking, cancellationRequests: [{ id: 'cancel-1', status: 'PENDING', requestedBy: 'ian', reason: 'Unable to attend.' }] }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(model.handleRespondCancellation).toHaveBeenCalledWith('cancel-1', false);
  });

  it('prioritizes completion over an old declined cancellation while keeping escalation available', () => {
    const model = seekerModel();
    render(<SeekerActivityItem engagement={{ ...booking, status: 'awaiting_seeker_approval', paymentMethod: 'On-site Cash', cancellationRequests: [{ id: 'cancel-1', status: 'DECLINED', requestedBy: 'johncarlo', responderNote: 'Work has already started.' }] }} model={model} />);
    expect(screen.getByText('Provider marked the work finished')).toBeInTheDocument();
    expect(screen.queryByText('Cancellation was declined')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Escalate to Admin' }));
    expect(model.handleEscalateClick).toHaveBeenCalledWith('cancel-1');
    fireEvent.click(screen.getByRole('button', { name: 'Complete Transaction' }));
    expect(model.setConfirmModal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Complete Transaction' }));
  });

  it('keeps a provider admin-review action in dark mode and shows submission progress', () => {
    const model = providerModel({ isDark: true });
    const view = render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'awaiting_seeker_approval' } }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Request Admin Review' }));
    expect(model.handleCompletionEscalation).toHaveBeenCalledWith('booking-1');
    view.rerender(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'awaiting_seeker_approval' } }} model={providerModel({ isDark: true, loadingItemId: booking.id, loadingActionType: 'completion_escalation' })} />);
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });

  it('offers settlement retry only to the cancellation recipient', () => {
    const engagement = { ...booking, cancellationRequests: [{ id: 'cancel-1', status: 'UNDER_REVIEW', requestedBy: 'ian' }] };
    const view = render(<SeekerActivityItem engagement={engagement} model={seekerModel()} />);
    expect(screen.getByRole('button', { name: 'Retry approval' })).toBeInTheDocument();
    view.rerender(<ProviderActivityItem item={{ type: 'engagement', data: engagement }} model={providerModel()} />);
    expect(screen.queryByRole('button', { name: 'Retry approval' })).not.toBeInTheDocument();
  });

  it('keeps the seeker queue state and journey visible without a completion action', () => {
    render(<SeekerActivityItem engagement={booking} model={seekerModel()} />);
    expect(screen.getByText("First in this provider's paid queue")).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Booking journey' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm Completion' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel Booking' })).toBeInTheDocument();
  });

  it('keeps seeker completion and dispute actions while explaining the decision', () => {
    const model = seekerModel();
    render(<SeekerActivityItem engagement={{ ...booking, status: 'awaiting_seeker_approval' }} model={model} />);
    expect(screen.getByText('Provider marked the work finished')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Report Issue' }));
    expect(model.setDisputingJob).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Completion' }));
    expect(model.setConfirmModal).toHaveBeenCalled();
  });

  it('lets the seeker respond to an incoming cancellation request', () => {
    const model = seekerModel();
    render(<SeekerActivityItem engagement={{ ...booking, cancellationRequests: [{ id: 'cancel-1', status: 'PENDING', requestedBy: 'ian' }] }} model={model} />);
    expect(screen.getByText('Review the cancellation request')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(model.handleRespondCancellation).toHaveBeenCalledWith('cancel-1', true);
  });

  it('shows approval progress and prevents a second cancellation decision', () => {
    const model = seekerModel({ loadingItemId: 'cancel-1', loadingActionType: 'approve_cancellation' });
    render(<SeekerActivityItem engagement={{ ...booking, cancellationRequests: [{ id: 'cancel-1', status: 'PENDING', requestedBy: 'ian' }] }} model={model} />);
    expect(screen.getByRole('button', { name: 'Approving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/eligible refund/);
  });

  it('blocks starting frozen paid work from the booking detail', () => {
    const model = providerModel();
    render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, paymentStatus: 'FROZEN_HELD' } }} model={model} />);
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
    expect(screen.getByText(/GCash payment is not ready for work/)).toBeInTheDocument();
  });

  it('also blocks a frozen queue payment when the booking record still says held', () => {
    render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, queuePaymentStatus: 'FROZEN_HELD' } }} model={providerModel()} />);
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  it('only enables provider Start for first position and preserves Remove', () => {
    const model = providerModel();
    const { rerender } = render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, queuePosition: 2 } }} model={model} />);
    expect(screen.getByRole('button', { name: 'Waiting' })).toBeDisabled();
    rerender(<ProviderActivityItem item={{ type: 'engagement', data: booking }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(model.handleProviderStartJob).toHaveBeenCalledWith('booking-1');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Booking' }));
    expect(model.handleProviderRemoveFromQueue).toHaveBeenCalledWith('booking-1');
  });

  it('disables another Start Job while the provider already has work underway', () => {
    const model = providerModel({ activeJobId: 'another-booking' });
    const { rerender } = render(<ProviderActivityItem item={{ type: 'engagement', data: booking }} model={model} />);
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute('title', 'Finish your current job before starting another one.');
    rerender(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'in_progress', paymentMethod: 'On-site Cash', started: false } }} model={model} />);
    expect(screen.getByRole('button', { name: 'Start Job' })).toBeDisabled();
  });

  it('disables a cash Start Job while paid bookings are waiting', () => {
    render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'in_progress', paymentMethod: 'On-site Cash', queuePosition: undefined } }} model={providerModel({ paidWaiting: true })} />);
    expect(screen.getByRole('button', { name: 'Start Job' })).toBeDisabled();
    expect(screen.getByText(/paid bookings are waiting/i)).toBeInTheDocument();
  });

  it('keeps provider completion and cash-approval navigation available', () => {
    const model = providerModel();
    const { rerender } = render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'in_progress', started: true } }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Work Finished' }));
    expect(model.handleRequestJobApproval).toHaveBeenCalledWith('booking-1');
    rerender(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'pending_provider', paymentMethod: 'On-site Cash' } }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
    expect(model.router.push).toHaveBeenCalledWith('/provider/incoming-requests');
  });

  it('keeps provider offers distinct from bookings and lets the provider cancel the offer', () => {
    const model = providerModel();
    const offer = {
      id: 'offer-1', requestId: 'request-1', providerId: 'ian', providerName: 'Ian', providerAvatar: '',
      providerRating: 0, price: 250, message: 'Available tomorrow', status: 'pending' as const,
      createdAt: '2026-09-27T09:00:00.000Z', requestTitle: 'House Cleaning', seekerName: 'John Carlo',
    };
    render(<ProviderActivityItem item={{ type: 'bid', data: offer }} model={model} />);
    expect(screen.getByText('Offer sent to seeker')).toBeInTheDocument();
    expect(screen.getByText(/no booking exists yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw Offer' }));
    expect(model.handleCancelOffer).toHaveBeenCalledWith('offer-1');
  });

  it('keeps completion history actions and safety reporting accessible', () => {
    const model = seekerModel();
    render(<SeekerActivityItem engagement={{ ...booking, status: 'completed' }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Leave Review' }));
    expect(model.setReviewingEngagement).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Request Again' }));
    expect(model.handleRequestAgain).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Safety report' }));
    expect(model.openSafetyReport).toHaveBeenCalled();
  });

  it.each(['seeker', 'provider'] as const)('keeps the %s active workroom status, action, next step, payment, queue, and journey distinct', (role) => {
    const view = role === 'seeker'
      ? render(<SeekerActivityItem engagement={booking} model={seekerModel()} />)
      : render(<ProviderActivityItem item={{ type: 'engagement', data: booking }} model={providerModel()} />);
    expect(screen.getByRole('region', { name: 'What is happening now' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Your action' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'What happens next' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Booking facts' })).toBeInTheDocument();
    expect(screen.getByText('Payment confirmed')).toBeInTheDocument();
    expect(screen.getByText('Position #1')).toBeInTheDocument();
    const journey = screen.getByRole('list', { name: 'Booking journey' });
    const facts = screen.getByRole('region', { name: 'Booking facts' });
    expect(facts.closest('aside')).not.toContainElement(journey);
    expect(journey.closest('details')?.parentElement).toBe(facts.closest('aside')?.parentElement);
    expect(journey.closest('details')).toHaveClass('xl:col-start-1');
    expect(facts.closest('aside')).toHaveClass('xl:col-start-2');
    expect(view.container.querySelector('[class*="xl:grid-cols-"]')).toBeTruthy();
    expect(view.container.querySelector('.workspace-card')).toHaveClass('rounded-2xl');
  });

  it('keeps canceled booking history distinct from a booking awaiting Admin review', () => {
    const { rerender } = render(<SeekerActivityItem engagement={{ ...booking, status: 'canceled' }} model={seekerModel()} />);
    expect(screen.getByText('No action needed for this booking.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Safety report' })).toBeInTheDocument();
    rerender(<SeekerActivityItem engagement={{ ...booking, status: 'disputed', paymentStatus: 'FROZEN_HELD' }} model={seekerModel()} />);
    expect(screen.getByText('Funds temporarily held')).toBeInTheDocument();
    expect(screen.queryByText('No action needed for this booking.')).not.toBeInTheDocument();
  });
});
