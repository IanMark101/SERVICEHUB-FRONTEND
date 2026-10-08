import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProviderActivity from '../provider/ProviderActivity';
import SeekerActivity from '../seeker/SeekerActivity';
import type ProviderActivityList from '../provider/activity/ProviderActivityList';
import type SeekerActivityList from '../seeker/activity/SeekerActivityList';
import type ReviewModal from '../seeker/ReviewModal';
import type ProviderBookingCancellationModal from '../provider/activity/ProviderBookingCancellationModal';
import type ProviderCancellationDeclineModal from '../provider/activity/ProviderCancellationDeclineModal';
import type SeekerCancellationRequestModal from '../seeker/activity/SeekerCancellationRequestModal';
import type { ConfirmModalState } from '../ui/ConfirmModal';
import { apiCancelBooking, apiRespondCancellationRequest, apiEscalateCancellationRequest, apiEscalateCompletion, apiHideBooking } from '../../api/bookings.api';
import { apiSubmitReview, apiUpdateReview } from '../../api/reviews.api';
import { useApp } from '../../context/AppContext';
import { mapBookingToEngagement } from '../../context/mappers';

let providerModel: Parameters<typeof ProviderActivityList>[0]['model'];
let seekerModel: Parameters<typeof SeekerActivityList>[0]['model'];
let review: Parameters<typeof ReviewModal>[0];
let providerCancellation: Parameters<typeof ProviderBookingCancellationModal>[0];
let providerDecline: Parameters<typeof ProviderCancellationDeclineModal>[0];
let seekerCancellation: Parameters<typeof SeekerCancellationRequestModal>[0];
let confirmation: ConfirmModalState | null;
const toast = vi.hoisted(() => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => toast }));
vi.mock('../provider/activity/ProviderActivityList', () => ({ default: ({ model }: { model: typeof providerModel }) => { providerModel = model; return null; } }));
vi.mock('../seeker/activity/SeekerActivityList', () => ({ default: ({ model }: { model: typeof seekerModel }) => { seekerModel = model; return null; } }));
vi.mock('../provider/activity/ProviderWorkloadPanel', () => ({ default: () => null }));
vi.mock('../provider/activity/ProviderBookingCancellationModal', () => ({ default: (props: typeof providerCancellation) => { providerCancellation = props; return null; } }));
vi.mock('../provider/activity/ProviderCancellationDeclineModal', () => ({ default: (props: typeof providerDecline) => { providerDecline = props; return null; } }));
vi.mock('../seeker/activity/SeekerCancellationRequestModal', () => ({ default: (props: typeof seekerCancellation) => { seekerCancellation = props; return null; } }));
vi.mock('../seeker/activity/SeekerDisputeModal', () => ({ default: () => null }));
vi.mock('../seeker/ReviewModal', () => ({ default: (props: typeof review) => { review = props; return null; } }));
vi.mock('../ui/ConfirmModal', () => ({ default: ({ state }: { state: ConfirmModalState | null }) => { confirmation = state; return null; } }));
vi.mock('./SafetyReportModal', () => ({ default: () => null }));
vi.mock('../../api/bookings.api', async original => ({ ...await original<typeof import('../../api/bookings.api')>(),
  apiCancelBooking: vi.fn(), apiRespondCancellationRequest: vi.fn(), apiEscalateCancellationRequest: vi.fn(), apiEscalateCompletion: vi.fn(), apiHideBooking: vi.fn() }));
vi.mock('../../api/reviews.api', () => ({ apiSubmitReview: vi.fn(), apiUpdateReview: vi.fn() }));

const booking = { ...mapBookingToEngagement({ id: 'booking', seekerId: 'seeker', providerId: 'provider', status: 'ONGOING', started: true, agreedAmount: 500 }),
  completedServiceId: 'completion', cancellationRequests: [{ id: 'cancel', status: 'PENDING', requestedBy: 'seeker', responderId: 'provider' }] };
const refresh = vi.fn(() => new Promise<void>(() => {}));
const applyBookingAction = vi.fn();
const submitEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;

beforeEach(() => {
  vi.clearAllMocks();
  confirmation = null;
  const data = { booking: { id: 'booking', status: 'CANCELED', paymentStatus: 'UNPAID' }, cancellationRequest: { id: 'cancel', status: 'APPROVED', requestedBy: 'seeker' } };
  vi.mocked(apiCancelBooking).mockResolvedValue({ success: true, data });
  vi.mocked(apiRespondCancellationRequest).mockResolvedValue({ success: true, data });
  vi.mocked(apiEscalateCancellationRequest).mockResolvedValue({ success: true, data: { id: 'cancel', bookingId: 'booking', status: 'ESCALATED', requestedBy: 'seeker' } });
  vi.mocked(apiEscalateCompletion).mockResolvedValue({ success: true, data: { id: 'escalation' } });
  vi.mocked(apiHideBooking).mockResolvedValue({ success: true });
  vi.mocked(apiSubmitReview).mockResolvedValue({ success: true, data: { id: 'review', authorId: 'provider', rating: 5 } });
  vi.mocked(apiUpdateReview).mockResolvedValue({ success: true, data: { id: 'review', authorId: 'provider', rating: 4 } });
});

function mount(role: 'provider' | 'seeker') {
  vi.mocked(useApp).mockReturnValue({ user: { id: role }, jobEngagements: [booking], bids: [], services: [], jobRequests: [], isDark: false,
    refreshEngagements: refresh, applyBookingAction, engagementsStatus: 'ready' } as unknown as ReturnType<typeof useApp>);
  render(role === 'provider' ? <ProviderActivity /> : <SeekerActivity />);
}

async function confirm() {
  expect(confirmation).not.toBeNull();
  await act(async () => { await confirmation!.onConfirm(); });
  expect(confirmation).toBeNull();
}

describe('All booking workroom mutation handlers', () => {
  it.each(['cancel', 'approve', 'decline', 'cancel_escalation', 'completion_escalation', 'hide', 'review', 'edit_review'] as const)('provider %s does not wait for or duplicate feed reads', async action => {
    mount('provider');
    if (action === 'cancel') {
      await act(async () => { await providerModel.handleProviderRemoveFromQueue('booking'); });
      act(() => providerCancellation.onChange('Cannot attend'));
      await act(async () => { await providerCancellation.onSubmit(); });
    } else if (action === 'approve') {
      await act(async () => { await providerModel.handleApproveCancellation('cancel'); });
      await confirm();
    } else if (action === 'decline') {
      act(() => { providerModel.setRespondingReqId('cancel'); providerModel.setDeclineNote('Work should continue'); });
      await act(async () => { await providerDecline.onSubmit(submitEvent); });
    } else if (action === 'hide') {
      act(() => providerModel.handleDeleteClick(booking)); await confirm();
    } else if (action === 'cancel_escalation') await act(async () => { await providerModel.handleEscalateCancellation('cancel'); });
    else if (action === 'completion_escalation') await act(async () => { await providerModel.handleCompletionEscalation('booking'); });
    else {
      act(() => providerModel.setReviewingEngagement(booking));
      await act(async () => { await review.onSubmit(5, 'Good work', [], action === 'edit_review' ? 'review' : undefined); });
    }
    expect(providerModel.loadingItemId).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    if (action !== 'completion_escalation') expect(applyBookingAction).toHaveBeenCalled();
  });

  it.each(['cancel', 'approve', 'cancel_escalation', 'hide', 'review', 'edit_review'] as const)('seeker %s does not wait for or duplicate feed reads', async action => {
    mount('seeker');
    if (action === 'cancel') {
      await act(async () => { await seekerModel.handleCancelClick(booking); });
      act(() => seekerCancellation.onReasonChange('Cannot attend'));
      await act(async () => { await seekerCancellation.onSubmit(submitEvent); });
    } else if (action === 'approve') await act(async () => { await seekerModel.handleRespondCancellation('cancel', true); });
    else if (action === 'cancel_escalation') {
      await act(async () => { await seekerModel.handleEscalateClick('cancel'); }); await confirm();
    } else if (action === 'hide') {
      act(() => seekerModel.handleDeleteClick(booking)); await confirm();
    } else {
      act(() => seekerModel.setReviewingEngagement(booking));
      await act(async () => { await review.onSubmit(5, 'Good work', [], action === 'edit_review' ? 'review' : undefined); });
    }
    expect(seekerModel.loadingItemId).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(applyBookingAction).toHaveBeenCalled();
  });
});
