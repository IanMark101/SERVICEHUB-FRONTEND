import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiStartJob, apiCompleteJob, apiConfirmCompletion, apiRespondDirectRequest, apiBookDirect, apiBookDirectFromOffer, apiInitiatePayment, apiConfirmOnlineBooking, apiDisputeJob } from '../api/bookings.api';
import { apiCreateRequest } from '../api/requests.api';
import { useProviderActions } from './useProviderActions';
import { useSeekerActions } from './useSeekerActions';
import { GCASH_CHECKOUT_EVENT, readGcashCheckout } from '../lib/paymentCheckout';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => toast }));
vi.mock('../api/bookings.api', async importOriginal => ({
  ...await importOriginal<typeof import('../api/bookings.api')>(),
  apiStartJob: vi.fn(), apiCompleteJob: vi.fn(), apiConfirmCompletion: vi.fn(), apiRespondDirectRequest: vi.fn(),
  apiBookDirect: vi.fn(), apiBookDirectFromOffer: vi.fn(), apiInitiatePayment: vi.fn(), apiConfirmOnlineBooking: vi.fn(), apiDisputeJob: vi.fn(),
}));
vi.mock('../api/requests.api', async importOriginal => ({ ...await importOriginal<typeof import('../api/requests.api')>(), apiCreateRequest: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.spyOn(window, 'open').mockReturnValue(null);
});

describe('Committed booking actions', () => {
  it.each(['listing', 'offer'])('hands %s GCash checkout to the modal and external tab without navigating ServiceHub', async source => {
    const close = vi.fn();
    const replace = vi.fn();
    const popup = { opener: window, document: { title: '', body: { textContent: '' } }, location: { replace }, close };
    vi.mocked(window.open).mockReturnValue(popup as unknown as Window);
    let resolvePayment!: (value: unknown) => void;
    vi.mocked(apiInitiatePayment).mockReturnValue(new Promise(resolve => { resolvePayment = resolve; }));
    const setBids = vi.fn();
    const deps = { services: [{ id: 'service', title: 'House cleaning', providerName: 'Ian' }],
      jobRequests: [{ id: 'request', title: 'Clean the house', seekerId: 'seeker' }],
      bids: [{ id: 'offer', requestId: 'request', serviceId: 'service', providerName: 'Ian' }], setBids };
    const changed = vi.fn();
    window.addEventListener(GCASH_CHECKOUT_EVENT, changed);
    const previousUrl = window.location.href;
    const { result } = renderHook(() => useSeekerActions(deps as unknown as Parameters<typeof useSeekerActions>[0]));
    const pending = source === 'listing' ? result.current.bookProviderDirectly('seeker', 'service', 500, 'Details', 'GCash', 3) : result.current.acceptBid('offer', 'GCash');
    expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(popup.opener).toBeNull();
    expect(replace).not.toHaveBeenCalled();
    resolvePayment({ success: true, data: { paymentIntentId: 'pi_modal', redirectUrl: 'https://test-sources.paymongo.com/sources/checkout', expectedAmount: 1500 } });
    await pending;
    expect(replace).toHaveBeenCalledWith('https://test-sources.paymongo.com/sources/checkout');
    expect(window.location.href).toBe(previousUrl);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(readGcashCheckout('seeker', 'pi_modal')).toMatchObject({ providerName: 'Ian', expectedAmount: 1500 });
    expect(apiConfirmOnlineBooking).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(setBids).not.toHaveBeenCalled();
    window.removeEventListener(GCASH_CHECKOUT_EVENT, changed);
  });

  it('closes the reserved checkout tab and keeps ServiceHub in place after initiation fails', async () => {
    const close = vi.fn();
    const popup = { document: { body: {} }, close };
    vi.mocked(window.open).mockReturnValue(popup as unknown as Window);
    vi.mocked(apiInitiatePayment).mockRejectedValue(new Error('Checkout unavailable'));
    const { result } = renderHook(() => useSeekerActions({ services: [] } as unknown as Parameters<typeof useSeekerActions>[0]));
    await expect(result.current.bookProviderDirectly('seeker', 'service', 500, 'Details', 'GCash')).rejects.toThrow('Checkout unavailable');
    expect(close).toHaveBeenCalledTimes(1);
    expect(readGcashCheckout('seeker', 'pi_modal')).toBeNull();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it.each(['accept', 'decline', 'start', 'mark', 'confirm'] as const)('%s finishes without waiting for unrelated reads', async action => {
    const applyBookingAction = vi.fn();
    const slowRead = vi.fn(() => new Promise<void>(() => {}));
    const deps = { applyBookingAction, syncEngagements: slowRead, syncNotifications: slowRead, syncTransactions: slowRead };
    const serverState = { id: 'booking', status: action === 'decline' ? 'DECLINED' : action === 'accept' ? 'ACCEPTED' : action === 'start' ? 'ONGOING' : action === 'mark' ? 'AWAITING_CONFIRMATION' : 'COMPLETED' };
    const endpoint = action === 'accept' || action === 'decline' ? apiRespondDirectRequest : action === 'start' ? apiStartJob : action === 'mark' ? apiCompleteJob : apiConfirmCompletion;
    vi.mocked(endpoint).mockResolvedValue({ success: true, data: serverState });
    const { result } = renderHook(() => ({
      provider: useProviderActions(deps as unknown as Parameters<typeof useProviderActions>[0]),
      seeker: useSeekerActions(deps as unknown as Parameters<typeof useSeekerActions>[0]),
    }));
    const run = action === 'accept' || action === 'decline' ? (id: string) => result.current.provider.respondToDirectBooking(id, action === 'accept') : action === 'start' ? result.current.provider.providerStartJob
      : action === 'mark' ? result.current.provider.requestJobApproval : result.current.seeker.confirmJobCompletion;
    // A stuck background read cannot prolong an already acknowledged mutation.
    await run('booking');
    expect(applyBookingAction).toHaveBeenCalledWith(serverState);
    expect(slowRead).not.toHaveBeenCalled();
    expect(toast.success.mock.calls.length + toast.info.mock.calls.length).toBe(1);
  });

  it.each(['cash_request', 'online_booking', 'cash_offer', 'online_offer', 'dispute', 'repost'] as const)('%s completes on the committed response even if feed reads hang', async action => {
    const slowRead = vi.fn(() => new Promise<void>(() => {}));
    const applyBookingAction = vi.fn();
    const setBids = vi.fn();
    const deps = { jobRequests: [{ id: 'request', seekerId: 'seeker' }], bids: [{ id: 'offer', requestId: 'request', serviceId: 'service' }], dbCategories: [{ id: 'category' }],
      syncEngagements: slowRead, syncNotifications: slowRead, syncTransactions: slowRead, syncRequests: slowRead, syncBids: slowRead, applyBookingAction, setBids };
    vi.mocked(apiBookDirect).mockResolvedValue({ success: true, data: { id: 'request' } });
    vi.mocked(apiBookDirectFromOffer).mockResolvedValue({ success: true, data: { id: 'booking' } });
    vi.mocked(apiInitiatePayment).mockResolvedValue({ success: true, data: { paymentIntentId: 'intent' } });
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'SUCCEEDED' } });
    vi.mocked(apiDisputeJob).mockResolvedValue({ success: true, data: { id: 'report', booking: { id: 'booking', status: 'DISPUTED' } } });
    vi.mocked(apiCreateRequest).mockResolvedValue({ success: true, data: { id: 'request' } });
    const { result } = renderHook(() => useSeekerActions(deps as unknown as Parameters<typeof useSeekerActions>[0]));
    if (action.endsWith('offer')) await result.current.acceptBid('offer', action === 'online_offer' ? 'GCash' : 'On-site Cash');
    else if (action === 'dispute') await result.current.disputeJob('booking', 'INCOMPLETE_SERVICE');
    else if (action === 'repost') expect(await result.current.postJobRequest('seeker', 'Job', 'category', 'Flexible Schedule', 500, 'Details')).toBe(true);
    else await result.current.bookProviderDirectly('seeker', 'service', 500, 'Details', action === 'online_booking' ? 'GCash' : 'On-site Cash');
    expect(slowRead).not.toHaveBeenCalled();
    // Online initiation opens the status dialog; only its owned-attempt check
    // can confirm payment and claim that the booking exists.
    expect(toast.success).toHaveBeenCalledTimes(action.startsWith('online') ? 0 : 1);
    if (action === 'cash_offer') expect(setBids).toHaveBeenCalled();
    if (action === 'online_offer') expect(setBids).not.toHaveBeenCalled();
    if (action === 'dispute') expect(applyBookingAction).toHaveBeenCalledWith(expect.objectContaining({ booking: { id: 'booking', status: 'DISPUTED' } }));
  });

  it('keeps the old booking state while the server decides, and after a rejected start', async () => {
    const applyBookingAction = vi.fn();
    let reject!: (reason: unknown) => void;
    vi.mocked(apiStartJob).mockReturnValue(new Promise((_, fail) => { reject = fail; }));
    const { result } = renderHook(() => useProviderActions({ applyBookingAction } as unknown as Parameters<typeof useProviderActions>[0]));
    const pending = result.current.providerStartJob('booking');
    const assertion = expect(pending).rejects.toThrow('Another job is ongoing');
    expect(applyBookingAction).not.toHaveBeenCalled();
    reject(new Error('Another job is ongoing'));
    await assertion;
    expect(applyBookingAction).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
