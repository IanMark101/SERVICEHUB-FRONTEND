import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiCreateRequest, apiUpdateRequest, apiDeleteRequest } from '../api/requests.api';
import { useToast } from '../components/ui/Toast';
import { useSeekerActions } from './useSeekerActions';
import { apiRejectOffer } from '../api/offers.api';
import { apiBookDirectFromOffer } from '../api/bookings.api';

vi.mock('../api/requests.api', () => ({ apiCreateRequest: vi.fn(), apiUpdateRequest: vi.fn(), apiDeleteRequest: vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('../api/offers.api', () => ({ apiRejectOffer: vi.fn() }));
vi.mock('../api/bookings.api', () => ({ apiBookDirectFromOffer: vi.fn() }));

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
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess, error: toastError, info: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);
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
    expect(toastError).toHaveBeenCalledWith('Failed to post request', 'Validation failed');
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
