import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../types';
import SeekerActivityItem, { type SeekerActivityItemModel } from '../seeker/activity/SeekerActivityItem';
import ProviderActivityItem, { type ProviderActivityItemModel } from '../provider/activity/ProviderActivityItem';
import { mapBookingToEngagement, mapCompletedServiceToEngagement } from '../../context/mappers';

const queued: JobEngagement = {
  id: 'queued-booking', title: 'Queued repair', seekerId: 'seeker-1', seekerName: 'Seeker', seekerAvatar: '',
  providerId: 'provider-1', providerName: 'Provider', providerAvatar: '', serviceId: 'service-1', price: 500,
  status: 'queued', bookingStatus: 'ACCEPTED', paymentMethod: 'GCash', createdAt: '2026-09-20', queuePosition: 2,
};

const fn = vi.fn();
const seekerModel = {
  isDark: false, highlightedBookingId: null, getCategoryForEngagement: () => 'Repair', currentUserId: 'seeker-1',
  loadingItemId: null, loadingActionType: null, setReviewingEngagement: fn, handleDeleteClick: fn,
  router: { push: fn }, setDisputingJob: fn, setConfirmModal: fn, handleConfirmJobCompletion: fn,
  handleEscalateClick: fn, handleCancelClick: fn, handleRespondCancellation: fn, handleRequestAgain: fn, openSafetyReport: fn,
} as unknown as SeekerActivityItemModel;

const providerModel = {
  isDark: false, getRequestForBid: () => undefined, getCategoryForEngagement: () => 'Repair', loadingItemId: null,
  loadingActionType: null, highlightedBookingId: null, handleCancelOffer: fn, handleApproveCancellation: fn,
  handleDeleteClick: fn, handleProviderStartJob: fn, handleRequestJobApproval: fn, handleCompletionEscalation: fn,
  handleProviderRemoveFromQueue: fn, handleEscalateCancellation: fn, router: { push: fn }, setRespondingReqId: fn,
  setDeclineNote: fn, setReviewingEngagement: fn, openSafetyReport: fn, user: null,
} as unknown as ProviderActivityItemModel;

function renderActivity(role: string, engagement: JobEngagement) {
  return role === 'seeker'
    ? render(<SeekerActivityItem engagement={engagement} model={seekerModel} />)
    : render(<ProviderActivityItem item={{ type: 'engagement', data: engagement }} model={providerModel} />);
}

describe('booking safety reporting actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is available to the seeker for an eligible queued booking', () => {
    render(<SeekerActivityItem engagement={queued} model={seekerModel} />);
    expect(screen.getByRole('button', { name: /Safety report/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Safety report/i }));
    expect(fn).toHaveBeenLastCalledWith(queued);
  });

  it('is available to the provider for an eligible queued booking', () => {
    render(<ProviderActivityItem item={{ type: 'engagement', data: queued }} model={providerModel} />);
    expect(screen.getByRole('button', { name: /Safety report/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Safety report/i }));
    expect(fn).toHaveBeenLastCalledWith(queued);
  });

  it.each(['seeker', 'provider'])('keeps settlement actions hidden for UNDER_REVIEW in the %s workspace', (role) => {
    const paused = mapBookingToEngagement({ id: 'under-review', seekerId: 'seeker-1', providerId: 'provider-1', status: 'UNDER_REVIEW', paymentMethod: 'GCash', started: true });
    if (role === 'seeker') render(<SeekerActivityItem engagement={paused} model={seekerModel} />);
    else render(<ProviderActivityItem item={{ type: 'engagement', data: paused }} model={providerModel} />);
    expect(screen.queryByRole('button', { name: /Start Job|Mark Completed|Confirm Completion|Cancel Booking|Request Cancellation|Request Admin Review/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Safety report/i })).toBeInTheDocument();
  });

  it.each(['seeker', 'provider'].flatMap(role => [
    'ACCEPTED', 'ONGOING', 'AWAITING_CONFIRMATION', 'UNDER_REVIEW', 'DISPUTED', 'COMPLETED', 'CANCELED',
  ].map(status => [role, status])))('allows %s to report a %s booking', (role, status) => {
    const engagement = mapBookingToEngagement({
      id: 'eligible-booking', seekerId: 'seeker-1', providerId: 'provider-1', status,
      queue: status === 'ACCEPTED' ? { status: 'WAITING', position: 2 } : null,
    });
    renderActivity(role, engagement);
    fireEvent.click(screen.getByRole('button', { name: 'Safety report' }));
    expect(fn).toHaveBeenLastCalledWith(engagement);
    if (status === 'ACCEPTED') expect(engagement.status).toBe('queued');
  });

  it.each(['seeker', 'provider'].flatMap(role => [
    'PENDING_APPROVAL', 'WAITING', 'DECLINED', 'REMOVED', 'QUEUED', 'UNKNOWN',
  ].map(status => [role, status])))('does not offer %s a report rejected for %s', (role, status) => {
    const engagement = mapBookingToEngagement({ id: 'ineligible-booking', seekerId: 'seeker-1', providerId: 'provider-1', status });
    renderActivity(role, engagement);
    expect(screen.queryByRole('button', { name: 'Safety report' })).not.toBeInTheDocument();
    if (['PENDING_APPROVAL', 'DECLINED'].includes(status)) {
      expect(screen.queryByRole('button', { name: 'Open Conversation' })).not.toBeInTheDocument();
    }
    expect(fn).not.toHaveBeenCalled();
  });

  it.each(['seeker', 'provider'])('keeps %s history visible without linking an unassociated completion to booking APIs', (role) => {
    const engagement = mapCompletedServiceToEngagement({
      id: 'legacy-completed-service', bookingId: null, seekerId: 'seeker-1', providerId: 'provider-1', finalPrice: 500,
    });
    renderActivity(role, engagement);
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Safety report' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open Conversation' })).not.toBeInTheDocument();
  });

  it.each(['seeker', 'provider'])('opens a %s conversation using the linked booking ID', (role) => {
    renderActivity(role, { ...queued, id: 'history-row', bookingId: 'linked-booking' });
    fireEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));
    expect(fn).toHaveBeenLastCalledWith(`/${role}/messages?booking=linked-booking`);
  });
});
