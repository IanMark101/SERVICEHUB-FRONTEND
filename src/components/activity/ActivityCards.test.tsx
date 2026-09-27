import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../types';
import SeekerActivityItem, { type SeekerActivityItemModel } from '../seeker/activity/SeekerActivityItem';
import ProviderActivityItem, { type ProviderActivityItemModel } from '../provider/activity/ProviderActivityItem';

const booking: JobEngagement = {
  id: 'booking-1', title: 'House Cleaning', seekerId: 'johncarlo', seekerName: 'John Carlo', seekerAvatar: '',
  providerId: 'ian', providerName: 'Ian', providerAvatar: '', serviceId: 'service-1',
  price: 250, status: 'queued', paymentMethod: 'GCash', queuePosition: 1,
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
  it('keeps the seeker queue state and journey visible without a completion action', () => {
    render(<SeekerActivityItem engagement={booking} model={seekerModel()} />);
    expect(screen.getByText('First in this service queue')).toBeInTheDocument();
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

  it('only enables provider Start for first position and preserves Remove', () => {
    const model = providerModel();
    const { rerender } = render(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, queuePosition: 2 } }} model={model} />);
    expect(screen.getByRole('button', { name: 'Waiting' })).toBeDisabled();
    rerender(<ProviderActivityItem item={{ type: 'engagement', data: booking }} model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(model.handleProviderStartJob).toHaveBeenCalledWith('booking-1');
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('disables another Start Job while the provider already has work underway', () => {
    const model = providerModel({ activeJobId: 'another-booking' });
    const { rerender } = render(<ProviderActivityItem item={{ type: 'engagement', data: booking }} model={model} />);
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute('title', 'Finish your current job before starting another');
    rerender(<ProviderActivityItem item={{ type: 'engagement', data: { ...booking, status: 'in_progress', paymentMethod: 'On-site Cash', started: false } }} model={model} />);
    expect(screen.getByRole('button', { name: 'Start Job' })).toBeDisabled();
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
    expect(screen.getByText(/there is no booking yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Offer' }));
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
});
