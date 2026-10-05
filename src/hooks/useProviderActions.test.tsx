import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiCreateService, apiToggleServiceAvailability } from '../api/services.api';
import { apiGetMyOffers, apiSubmitOffer } from '../api/offers.api';
import { useToast } from '../components/ui/Toast';
import { useProviderActions } from './useProviderActions';

vi.mock('../api/services.api', () => ({ apiCreateService: vi.fn(), apiToggleServiceAvailability: vi.fn() }));
vi.mock('../api/offers.api', () => ({ apiSubmitOffer: vi.fn(), apiGetMyOffers: vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: vi.fn() }));

const toastError = vi.fn();
const toastSuccess = vi.fn();
const toastInfo = vi.fn();
const setServices = vi.fn();
const setBids = vi.fn();

function renderProviderActions() {
  return renderHook(() => useProviderActions({
    services: [],
    jobRequests: [],
    dbCategories: [{ id: 'category-cuid', name: 'Plumbing' }],
    setServices,
    setBids,
    syncEngagements: vi.fn(),
    syncNotifications: vi.fn(),
  } as unknown as Parameters<typeof useProviderActions>[0]));
}

describe('useProviderActions category identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess, error: toastError, info: toastInfo,
    } as unknown as ReturnType<typeof useToast>);
  });

  it.each([true, false])('uses clear feedback when service availability becomes %s', async available => {
    vi.mocked(apiToggleServiceAvailability).mockResolvedValue({ success: true, data: { isAvailable: available, status: available ? 'ACTIVE' : 'INACTIVE' } });
    const { result } = renderProviderActions();
    expect(await result.current.toggleServiceListingStatus('listing-id')).toEqual({ success: true });
    expect(available ? toastSuccess : toastInfo).toHaveBeenCalledWith(available ? 'Service active' : 'Service paused', available ? 'Seekers can now find and book your service.' : 'New bookings are paused. Existing bookings are unchanged.');
  });

  it('persists the selected active Admin category ID', async () => {
    vi.mocked(apiCreateService).mockResolvedValue({ success: true, data: { id: 'listing-id', category: { name: 'Plumbing' } } });
    const { result } = renderProviderActions();
    await act(async () => {
      await result.current.createServiceListing('provider-id', 'Pipe repair', 'category-cuid', 500, 'Repair pipes', { cash: true, gcash: false });
    });
    expect(apiCreateService).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'category-cuid' }));
  });

  it('shows the authoritative published state for a clean listing', async () => {
    vi.mocked(apiCreateService).mockResolvedValue({ success: true, data: {
      id: 'published-id', status: 'ACTIVE', isAvailable: true, category: { name: 'Plumbing' },
    } });
    const { result } = renderProviderActions();
    await act(async () => { await result.current.createServiceListing('provider-id', 'Pipe repair', 'category-cuid', 500, 'Repair pipes', { cash: true, gcash: false }); });
    expect(toastSuccess).toHaveBeenCalledWith('Listing Published', expect.stringContaining('visible'));
    expect(toastInfo).not.toHaveBeenCalled();
  });

  it('directs an unpublished legacy response to Service Manager without promising visibility', async () => {
    vi.mocked(apiCreateService).mockResolvedValue({ success: true, data: {
      id: 'flagged-id', status: 'PENDING_REVIEW', isAvailable: false, category: { name: 'Plumbing' },
    } });
    const { result } = renderProviderActions();
    await act(async () => { await result.current.createServiceListing('provider-id', 'Pipe repair', 'category-cuid', 500, 'Repair pipes', { cash: true, gcash: false }); });
    expect(toastInfo).toHaveBeenCalledWith('Listing needs attention', expect.stringContaining('Service Manager'));
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('rejects a legacy name or retired ID instead of assigning the first category', async () => {
    const { result } = renderProviderActions();
    for (const category of ['Plumbing', 'retired-category-id']) {
      await act(async () => {
        const response = await result.current.createServiceListing('provider-id', 'Pipe repair', category, 500, 'Repair pipes', { cash: true, gcash: false });
        expect(response?.success).toBe(false);
      });
    }
    expect(apiCreateService).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Category Required', 'Please select a valid service category.');
  });

  it('passes the server moderation field back to the listing form', async () => {
    vi.mocked(apiCreateService).mockRejectedValue({ isAxiosError: true, response: { status: 422, data: {
      code: 'CONTENT_REVISION_REQUIRED', field: 'title', error: 'Remove hateful or abusive language before publishing.',
    } } });
    const { result } = renderProviderActions();
    const response = await result.current.createServiceListing('provider-id', 'Unsafe title', 'category-cuid', 500, 'Repair pipes', { cash: true, gcash: false });
    expect(response).toMatchObject({ success: false, field: 'title' });
    expect(toastError).toHaveBeenCalledWith('Check your service details', expect.any(String));
  });

  it('submits the provider-selected listing ID for a matching request', async () => {
    vi.mocked(apiSubmitOffer).mockResolvedValue({ success: true, data: { id: 'offer-id', createdAt: new Date().toISOString() } });
    const { result } = renderProviderActions();
    const sent = await result.current.submitBid('request-id', 'provider-id', 'selected-listing-id', 350, 90, 'I can repair this pipe.');
    expect(sent).toBe(true);
    expect(apiSubmitOffer).toHaveBeenCalledWith({
      requestId: 'request-id', serviceId: 'selected-listing-id', offeredPrice: 350,
      estimatedDuration: 90, message: 'I can repair this pipe.',
    });
  });

  it('sends custom availability without requiring a listing', async () => {
    vi.mocked(apiSubmitOffer).mockResolvedValue({ success: true, data: { id: 'custom-offer', status: 'PENDING' } });
    const { result } = renderProviderActions();
    expect(await result.current.submitBid('request-id', 'provider-id', undefined, 150, 60, 'Repair the door.', 'Saturday')).toBe(true);
    expect(apiSubmitOffer).toHaveBeenCalledWith({ requestId: 'request-id', offeredPrice: 150, estimatedDuration: 60, message: 'Repair the door.', availability: 'Saturday' });
  });

  it('prevents simultaneous submissions even before a render updates loading state', async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(apiSubmitOffer).mockImplementation(() => new Promise(done => { resolve = done; }));
    const { result } = renderProviderActions();
    const pending = result.current.submitBid('request-id', 'provider-id', undefined, 150, 60, 'Repair the door.');
    expect(await result.current.submitBid('request-id', 'provider-id', undefined, 150, 60, 'Repair the door.')).toBe(false);
    resolve({ success: true, data: { id: 'one-offer', status: 'PENDING' } });
    expect(await pending).toBe(true);
    expect(apiSubmitOffer).toHaveBeenCalledTimes(1);
  });

  it('recovers a confirmed matching offer after the response is lost', async () => {
    vi.mocked(apiSubmitOffer).mockRejectedValue(new Error('Network error'));
    vi.mocked(apiGetMyOffers).mockResolvedValue({ success: true, data: [{ id: 'committed-offer', requestId: 'request-id', providerId: 'provider-id', serviceId: null, offeredPrice: '150.00', estimatedDuration: 60, message: 'Repair the door.', status: 'PENDING' }] });
    const { result } = renderProviderActions();
    expect(await result.current.submitBid('request-id', 'provider-id', undefined, 150, 60, 'Repair the door.')).toBe(true);
    expect(toastError).not.toHaveBeenCalled();
    const patch = setBids.mock.calls[0][0];
    expect(patch([{ id: 'committed-offer' }])).toHaveLength(1);
  });

  it('does not claim success for a different stored offer', async () => {
    vi.mocked(apiSubmitOffer).mockRejectedValue(new Error('Network error'));
    vi.mocked(apiGetMyOffers).mockResolvedValue({ success: true, data: [{ id: 'different', requestId: 'request-id', providerId: 'provider-id', offeredPrice: 600, status: 'PENDING' }] });
    const { result } = renderProviderActions();
    expect(await result.current.submitBid('request-id', 'provider-id', undefined, 150, 60, 'Repair the door.')).toBe(false);
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });

  it('shows the server eligibility reason without trying submission recovery', async () => {
    vi.mocked(apiSubmitOffer).mockRejectedValue({ isAxiosError: true, response: { status: 403, data: { code: 'REQUEST_RESERVED', error: 'This request is reserved for another provider.' } } });
    const { result } = renderProviderActions();
    expect(await result.current.submitBid('request-id', 'provider-id', undefined, 150, 60, 'Repair the door.')).toBe(false);
    expect(toastError).toHaveBeenCalledWith('Cannot send offer', 'This request is reserved for another provider.');
    expect(apiGetMyOffers).not.toHaveBeenCalled();
  });
});
