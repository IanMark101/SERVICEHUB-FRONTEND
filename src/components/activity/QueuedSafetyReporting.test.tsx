import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobEngagement } from '../../types';
import SeekerActivityItem, { type SeekerActivityItemModel } from '../seeker/activity/SeekerActivityItem';
import ProviderActivityItem, { type ProviderActivityItemModel } from '../provider/activity/ProviderActivityItem';

const queued: JobEngagement = {
  id: 'queued-booking', title: 'Queued repair', seekerId: 'seeker-1', seekerName: 'Seeker', seekerAvatar: '',
  providerId: 'provider-1', providerName: 'Provider', providerAvatar: '', serviceId: 'service-1', price: 500,
  status: 'queued', paymentMethod: 'GCash', createdAt: '2026-09-20', queuePosition: 2,
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

describe('queued safety reporting actions', () => {
  it('is available to the seeker for an eligible queued booking', () => {
    render(<SeekerActivityItem engagement={queued} model={seekerModel} />);
    expect(screen.getByRole('button', { name: /Safety report/i })).toBeInTheDocument();
  });

  it('is available to the provider for an eligible queued booking', () => {
    render(<ProviderActivityItem item={{ type: 'engagement', data: queued }} model={providerModel} />);
    expect(screen.getByRole('button', { name: /Safety report/i })).toBeInTheDocument();
  });
});
