import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiCreateRequest, apiUpdateRequest, apiDeleteRequest } from '../api/requests.api';
import { useToast } from '../components/ui/Toast';
import { useSeekerActions } from './useSeekerActions';
import { apiRejectOffer } from '../api/offers.api';
import { apiBookDirectFromOffer, apiInitiatePayment } from '../api/bookings.api';
import { mapOfferToBid } from '../context/mappers';
import { clearGcashCheckout, readPendingGcashCheckout } from '../lib/paymentCheckout';

vi.mock('../api/requests.api', () => ({ apiCreateRequest: vi.fn(), apiUpdateRequest: vi.fn(), apiDeleteRequest: vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('../api/offers.api', () => ({ apiRejectOffer: vi.fn() }));
vi.mock('../api/bookings.api', () => ({ apiBookDirectFromOffer: vi.fn(), apiInitiatePayment: vi.fn() }));

const toastSuccess = vi.fn();
const toastError = vi.fn();
const syncRequests = vi.fn().mockResolvedValue(undefined);
const setJobRequests = vi.fn();
const setBids = vi.fn();
const syncBids = vi.fn().mockResolvedValue(undefined);
const syncEngagements = vi.fn();
const setJobEngagements = vi.fn();

function renderSeekerActions() {
  return renderHook(() => useSeekerActions({
    dbCategories: [{ id: 'category-cuid', name: 'Plumbing' }],
    syncRequests,
    jobRequests: [],
    bids: [],
    setJobRequests,
    setBids,
    syncEngagements,
    setJobEngagements,
    syncBids,
    syncNotifications: vi.fn(),
    syncTransactions: vi.fn(),
  } as unknown as Parameters<typeof useSeekerActions>[0]));
}

describe('useSeekerActions Post Request payload', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    syncRequests.mockResolvedValue(undefined);
    syncBids.mockResolvedValue(undefined);
    localStorage.clear();
    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess, error: toastError, info: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);
  });

  afterEach(() => {
    clearGcashCheckout('pi_custom_offer');
    vi.restoreAllMocks();
  });

  it('sends the exact selected category ID, controlled urgency, and budget to the API', async () => {
    vi.mocked(apiCreateRequest).mockResolvedValue({ success: true, data: { id: 'request-id' } });
    const { result } = renderSeekerActions();
    let posted: boolean | object = false;
    await act(async () => {
      posted = await result.current.postJobRequest(
        'seeker-id', 'Fix kitchen faucet leak', 'category-cuid', 'Flexible Schedule', 500,
        'The faucet leaks under the sink and needs repair.',
      );
    });

    expect(posted).toBe(true);
    expect(apiCreateRequest).toHaveBeenCalledWith({
      categoryId: 'category-cuid',
      title: 'Fix kitchen faucet leak',
      description: 'The faucet leaks under the sink and needs repair.',
      budgetMin: 500,
      budgetMax: 500,
      urgency: 'Flexible Schedule',
      paymentMethods: { cash: true, gcash: true },
    });
    // The API cache subscription refreshes the request feed independently.
    expect(syncRequests).not.toHaveBeenCalled();
  });

  it('does not claim success when the API rejects creation', async () => {
    vi.mocked(apiCreateRequest).mockRejectedValue(new Error('Validation failed'));
    const { result } = renderSeekerActions();
    let posted: boolean | object = true;
    await act(async () => {
      posted = await result.current.postJobRequest(
        'seeker-id', 'Fix kitchen faucet leak', 'category-cuid', 'Flexible Schedule', 500,
        'The faucet leaks under the sink and needs repair.',
      );
    });

    expect(posted).toBe(false);
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Failed to post request', 'Some details are missing or need changing. Check the form and try again.');
  });

  it('rejects a name or stale ID instead of silently assigning the first category', async () => {
    const { result } = renderSeekerActions();
    for (const category of ['Plumbing', 'retired-category-id']) {
      let posted: boolean | object = true;
      await act(async () => {
        posted = await result.current.postJobRequest(
          'seeker-id', 'Fix kitchen faucet leak', category, 'Flexible Schedule', 500,
          'The faucet leaks under the sink and needs repair.',
        );
      });
      expect(posted).toBe(false);
    }
    expect(apiCreateRequest).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Category Error', 'Please select a valid service category.');
  });

  it('passes the server moderation field back to the request form', async () => {
    vi.mocked(apiCreateRequest).mockRejectedValue({ isAxiosError: true, response: { status: 422, data: {
      code: 'CONTENT_REVISION_REQUIRED', field: 'title', error: 'Remove hateful or abusive language before publishing.',
    } } });
    const { result } = renderSeekerActions();
    const response = await result.current.postJobRequest('seeker-id', 'Unsafe title', 'category-cuid', 'Flexible Schedule', 500, 'Repair this pipe.');
    expect(response).toMatchObject({ success: false, field: 'title' });
    expect(toastError).toHaveBeenCalledWith('Please revise your request', expect.any(String));
  });

  it('preserves a cash-only selection in the API payload', async () => {
    vi.mocked(apiCreateRequest).mockResolvedValue({ success: true });
    const { result } = renderSeekerActions();
    await act(async () => { await result.current.postJobRequest('seeker-id', 'PIPE REPAIR', 'category-cuid', 'Flexible Schedule', 500, 'Repair the leaking pipe.', { cash: true, gcash: false }); });
    expect(apiCreateRequest).toHaveBeenCalledWith(expect.objectContaining({ paymentMethods: { cash: true, gcash: false } }));
  });

  it('does not report a saved toggle as failed when the public-board refresh fails', async () => {
    vi.mocked(apiUpdateRequest).mockResolvedValue({ success: true, data: { status: 'OPEN' } });
    syncRequests.mockRejectedValueOnce(new Error('Background refresh unavailable'));
    const { result } = renderSeekerActions();
    let changed = false;
    await act(async () => { changed = await result.current.toggleJobRequestStatus('request-id', 'CLOSED'); });
    expect(changed).toBe(true);
    expect(apiUpdateRequest).toHaveBeenCalledWith('request-id', { status: 'OPEN' });
    expect(toastError).not.toHaveBeenCalled();
  });

  it('returns confirmed edit values and updates context even when a background refresh fails', async () => {
    vi.mocked(apiUpdateRequest).mockResolvedValue({ success: true, data: { title: 'PIPE REPAI', budgetMax: '650.00', description: 'Confirmed repair details.' } });
    syncRequests.mockRejectedValueOnce(new Error('Public board unavailable'));
    const { result } = renderSeekerActions();
    const updated = await result.current.editJobRequest('request-id', 'pipe repai', 650, 'Confirmed repair details.');
    expect(updated).toEqual({ title: 'PIPE REPAI', budget: 650, description: 'Confirmed repair details.' });
    const applyUpdate = setJobRequests.mock.calls[0][0];
    expect(applyUpdate([{ id: 'request-id', title: 'PIPE REPAIR', category: 'Plumbing', offersCount: 3 }])).toEqual([
      { id: 'request-id', ...updated, category: 'Plumbing', offersCount: 3 },
    ]);
    expect(toastSuccess).toHaveBeenCalledWith('Request Updated', expect.any(String));
    expect(toastError).not.toHaveBeenCalled();
  });

  it('returns a failed edit without publishing a success toast or changing local data', async () => {
    vi.mocked(apiUpdateRequest).mockResolvedValue({ success: false, error: 'This request cannot be edited.' });
    const { result } = renderSeekerActions();
    expect(await result.current.editJobRequest('request-id', 'PIPE REPAI', 650, 'Repair details.')).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Update Failed', 'This request cannot be edited.');
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(setJobRequests).not.toHaveBeenCalled();
  });

  it('uses the saved search area without stale private directions or travel budget after switching to customer visits', async () => {
    vi.mocked(apiUpdateRequest).mockResolvedValue({ success: true, data: {
      id: 'request-id', title: 'LAPTOP REPAIR', description: 'Visit a workshop.', budgetMax: 1500,
      serviceLocationMode: 'SEEKER_VISITS', latitude: 10.3, longitude: 123.9,
      locationLabel: 'Cordova, Cebu', privateAddress: null, transportationFee: null,
    } });
    const { result } = renderSeekerActions();
    const updated = await result.current.editJobRequest('request-id', 'LAPTOP REPAIR', 1500, 'Visit a workshop.', undefined, { serviceLocationMode: 'SEEKER_VISITS' });
    expect(toastError).not.toHaveBeenCalled();
    const applyUpdate = setJobRequests.mock.calls[0][0];
    const saved = applyUpdate([{ id: 'request-id', jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cordova, Cebu', address: 'Old private home directions' }, transportationFee: 75 }])[0];
    expect(updated).toMatchObject({ serviceLocationMode: 'SEEKER_VISITS' });
    expect(saved.jobLocation).toEqual({ latitude: 10.3, longitude: 123.9, label: 'Cordova, Cebu' });
    expect(saved.transportationFee).toBeUndefined();
  });

  it.each(['REJECTED', 'WITHDRAWN'])('publishes the confirmed %s decision even if refresh fails', async status => {
    vi.mocked(apiRejectOffer).mockResolvedValue({ success: true, data: { id: 'offer-id', status } });
    syncBids.mockRejectedValueOnce(new Error('Refresh unavailable'));
    const { result } = renderSeekerActions();
    await result.current.declineBid('offer-id');
    const patch = setBids.mock.calls[0][0];
    expect(patch([{ id: 'offer-id', status: 'pending' }])[0].status).toBe(status === 'REJECTED' ? 'declined' : 'withdrawn');
    expect(toastError).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith(status === 'REJECTED' ? 'Offer declined' : 'Offer withdrawn', expect.any(String));
  });

  it('accepts a received Cash offer before the general request list loads and tolerates refresh failure', async () => {
    vi.mocked(apiBookDirectFromOffer).mockResolvedValue({ success: true, data: { id: 'booking-id' } });
    syncBids.mockRejectedValueOnce(new Error('Refresh unavailable'));
    const { result } = renderHook(() => useSeekerActions({ dbCategories: [], jobRequests: [], bids: [{ id: 'offer-id', requestId: 'request-id', seekerId: 'seeker-id' }], setBids, syncBids, syncRequests, syncEngagements: vi.fn().mockResolvedValue(undefined) } as unknown as Parameters<typeof useSeekerActions>[0]));
    await result.current.acceptBid('offer-id', 'On-site Cash');
    expect(apiBookDirectFromOffer).toHaveBeenCalledWith('offer-id');
    expect(toastError).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith('Offer accepted', 'You can now message the provider to arrange the work.');
  });

  function renderCustomGcashOffer() {
    const bid = mapOfferToBid({
      id: 'offer-id', requestId: 'request-id', serviceId: null, providerId: 'provider-id',
      offeredPrice: 2500, status: 'PENDING',
      request: { seekerId: 'seeker-id', title: 'LAPTOP FAN REPAIR', paymentMethods: { cash: false, gcash: true } },
    });
    return renderHook(() => useSeekerActions({
      dbCategories: [], jobRequests: [], bids: [bid], setBids, syncBids, syncRequests,
    } as unknown as Parameters<typeof useSeekerActions>[0]));
  }

  it('opens checkout for a GCash-only custom offer without needing a service listing or the request feed', async () => {
    const popup = { opener: window, document: { title: '', body: { textContent: '' } }, location: { replace: vi.fn() }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    vi.mocked(apiInitiatePayment).mockResolvedValue({ success: true, data: {
      paymentIntentId: 'pi_custom_offer', expectedAmount: 2500, redirectUrl: 'https://test-sources.paymongo.com/sources/custom-offer',
    } });
    const { result } = renderCustomGcashOffer();
    const checkout = await result.current.acceptBid('offer-id', 'GCash');
    expect(apiInitiatePayment).toHaveBeenCalledWith(expect.objectContaining({ offerId: 'offer-id', serviceId: undefined, paymentMethodType: 'gcash' }));
    expect(checkout).toMatchObject({ seekerId: 'seeker-id', offerId: 'offer-id', expectedAmount: 2500 });
    expect(checkout).not.toHaveProperty('serviceId');
    expect(readPendingGcashCheckout('seeker-id')).toEqual(checkout);
    expect(popup.opener).toBeNull();
    expect(popup.location.replace).toHaveBeenCalledWith('https://test-sources.paymongo.com/sources/custom-offer');
    expect(popup.close).not.toHaveBeenCalled();
    expect(apiBookDirectFromOffer).not.toHaveBeenCalled();
    expect(setBids).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it('closes the preparing tab and leaves the offer unchanged when GCash initiation fails', async () => {
    const popup = { opener: window, document: { title: '', body: { textContent: '' } }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    vi.mocked(apiInitiatePayment).mockRejectedValue(new Error('Validation failed'));
    const { result } = renderCustomGcashOffer();
    await expect(result.current.acceptBid('offer-id', 'GCash')).rejects.toThrow('Validation failed');
    expect(popup.close).toHaveBeenCalledOnce();
    expect(readPendingGcashCheckout('seeker-id')).toBeNull();
    expect(setBids).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Action Failed', expect.any(String));
  });

  it('keeps a usable checkout link when the browser blocks the payment tab', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.mocked(apiInitiatePayment).mockResolvedValue({ success: true, data: {
      paymentIntentId: 'pi_custom_offer', expectedAmount: 2500, redirectUrl: 'https://test-sources.paymongo.com/sources/custom-offer',
    } });
    const { result } = renderCustomGcashOffer();
    await result.current.acceptBid('offer-id', 'GCash');
    expect(readPendingGcashCheckout('seeker-id')).toMatchObject({ offerId: 'offer-id', redirectUrl: 'https://test-sources.paymongo.com/sources/custom-offer' });
    expect(setBids).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it.each(['rejection', 'unsuccessful response'])('returns false on delete %s without changing or refreshing any data', async failure => {
    if (failure === 'rejection') vi.mocked(apiDeleteRequest).mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { error: 'This request can’t be deleted while it has an active booking.' } } });
    else vi.mocked(apiDeleteRequest).mockResolvedValue({ success: false, error: 'Your request was not deleted.' });
    const { result } = renderSeekerActions();
    expect(await result.current.deleteJobRequest('request-id')).toBe(false);
    for (const fn of [setJobRequests, setBids, setJobEngagements, syncRequests, syncBids, syncEngagements, toastSuccess]) expect(fn).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Request not deleted', expect.any(String));
  });

  it('returns true only after deletion is confirmed, even if background reads fail', async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(apiDeleteRequest).mockReturnValue(new Promise(done => { resolve = done; }));
    syncRequests.mockRejectedValueOnce(new Error('Refresh unavailable'));
    syncBids.mockRejectedValueOnce(new Error('Refresh unavailable'));
    const { result } = renderSeekerActions();
    const deleting = result.current.deleteJobRequest('request-id');
    expect(setJobRequests).not.toHaveBeenCalled();
    expect(setBids).not.toHaveBeenCalled();
    resolve({ success: true });
    expect(await deleting).toBe(true);
    expect(setJobRequests.mock.calls[0][0]([{ id: 'request-id' }, { id: 'other' }])).toEqual([{ id: 'other' }]);
    expect(setBids.mock.calls[0][0]([{ requestId: 'request-id', status: 'pending' }, { requestId: 'other', status: 'accepted' }])).toEqual([
      { requestId: 'request-id', status: 'declined', requestStatus: 'CANCELED' }, { requestId: 'other', status: 'accepted' },
    ]);
    expect(setJobEngagements).not.toHaveBeenCalled();
    expect(syncEngagements).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith('Request Deleted', expect.any(String));
    expect(toastError).not.toHaveBeenCalled();
  });
});
