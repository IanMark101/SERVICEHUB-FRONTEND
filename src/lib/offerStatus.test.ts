import { describe, expect, it } from 'vitest';
import { mapOfferToBid } from '../context/mappers';
import { normalizeOfferStatus, offerSituation } from './offerStatus';
import { countProviderActivityTab, filterProviderActivityItems } from '../components/provider/activity/providerActivity.utils';

describe('authoritative offer states', () => {
  it.each([['PENDING', 'pending'], ['PENDING_PAYMENT', 'pending_payment'], ['ACCEPTED', 'accepted'], ['REJECTED', 'declined'], ['WITHDRAWN', 'withdrawn']])('preserves %s after a reload', (status, expected) => {
    expect(mapOfferToBid({ id: 'offer', requestId: 'request', status }).status).toBe(expected);
    expect(normalizeOfferStatus(expected)).toBe(expected);
  });
  it('does not allow withdrawal during checkout or a paused request', () => {
    expect(offerSituation({ status: 'pending_payment' }).canWithdraw).toBe(false);
    expect(offerSituation({ status: 'pending', requestStatus: 'CLOSED' }).canWithdraw).toBe(false);
    expect(offerSituation({ status: 'pending', requestStatus: 'PAYMENT_PENDING' }).canWithdraw).toBe(false);
    expect(offerSituation({ status: 'pending', requestStatus: 'OPEN' }).canWithdraw).toBe(true);
  });
  it('distinguishes an explicit decline from losing to another offer', () => {
    expect(offerSituation({ status: 'declined', decisionReason: 'DECLINED' }).title).toBe('Offer declined by seeker');
    expect(offerSituation({ status: 'declined', decisionReason: 'NOT_SELECTED' }).title).toBe('Another offer was selected');
  });
  it('retains declined and withdrawn offers in Activity without counting them as pending', () => {
    const offers = ['PENDING', 'PENDING_PAYMENT', 'REJECTED', 'WITHDRAWN'].map((status, index) => mapOfferToBid({ id: String(index), requestId: 'request', status, createdAt: '2026-10-02T09:00:00Z' }));
    expect(countProviderActivityTab('pending_offers', [], offers)).toBe(2);
    expect(countProviderActivityTab('closed_offers', [], offers)).toBe(2);
    expect(countProviderActivityTab('canceled', [], offers)).toBe(0);
    const base = { engagements: [], pendingBids: offers, jobRequests: [], services: [], searchQuery: '', sortBy: 'newest' as const };
    expect(filterProviderActivityItems({ ...base, activeTab: 'all' })).toHaveLength(4);
    expect(filterProviderActivityItems({ ...base, activeTab: 'pending_offers' })).toHaveLength(2);
    expect(filterProviderActivityItems({ ...base, activeTab: 'closed_offers' })).toHaveLength(2);
    expect(filterProviderActivityItems({ ...base, activeTab: 'canceled' })).toHaveLength(0);
  });
});
