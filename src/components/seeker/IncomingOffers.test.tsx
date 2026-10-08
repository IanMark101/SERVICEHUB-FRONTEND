import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import IncomingOffers from './IncomingOffers';
import { mapOfferToBid } from '../../context/mappers';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: () => ({ canTransact: true }) }));
vi.mock('../ui/TransactionBlockedModal', () => ({ default: () => null }));
vi.mock('../ui/PaginationBar', () => ({ default: () => null }));

describe('payment selected when requesting a listing', () => {
  it('keeps both payment choices and allows closing without accepting', async () => {
    const acceptBid = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApp).mockReturnValue({
      isDark: false, users: [], services: [], acceptBid, declineBid: vi.fn(),
      jobRequests: [{ id: 'request-1', seekerId: 'seeker-1', title: 'Door repair', paymentMethods: { cash: true, gcash: true } }],
      bids: [{ id: 'offer-1', requestId: 'request-1', status: 'pending', providerId: 'provider-1', providerName: 'Ian', providerRating: 0, price: 250, message: 'I can fix the door.', createdAt: '2026-10-07' }],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept Offer' }));
    expect(screen.getByRole('dialog', { name: 'Select Payment Method' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'On-site Cash' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GCash' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(acceptBid).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Accept Offer' }));
    fireEvent.click(screen.getByRole('button', { name: 'GCash' }));
    await waitFor(() => expect(acceptBid).toHaveBeenCalledWith('offer-1', 'GCash'));
  });

  it('renders each provider\'s saved availability and preserves it after refreshed API mapping', () => {
    const offers = ['Monday', 'Tuesday afternoon'].map((availability, index) => ({
      id: `offer-${index}`, requestId: 'request-1', providerId: `provider-${index}`, provider: { name: `Provider ${index}` },
      offeredPrice: 150, estimatedDuration: 60, availability, message: 'I can fix your door.', status: 'PENDING',
      request: { seekerId: 'seeker-1', status: 'OPEN', title: 'Door repair' },
    }));
    const app = { isDark: false, users: [], services: [], jobRequests: [], acceptBid: vi.fn(), declineBid: vi.fn(), bids: offers.map(mapOfferToBid) };
    vi.mocked(useApp).mockReturnValue(app as unknown as ReturnType<typeof useApp>);
    const { rerender } = render(<IncomingOffers currentUserId="seeker-1" />);
    expect(screen.getByText('Available: Monday')).toBeInTheDocument();
    expect(screen.getByText('Available: Tuesday afternoon')).toBeInTheDocument();
    vi.mocked(useApp).mockReturnValue({ ...app, bids: JSON.parse(JSON.stringify(offers)).map(mapOfferToBid) } as unknown as ReturnType<typeof useApp>);
    rerender(<IncomingOffers currentUserId="seeker-1" />);
    expect(screen.getByText('Available: Monday')).toBeInTheDocument();
    expect(screen.getByText('Available: Tuesday afternoon')).toBeInTheDocument();
  });
  it.each([{ cash: true, gcash: false }, { cash: false, gcash: true }])('restricts public offer acceptance to selected request methods: %j', async (paymentMethods) => {
    const acceptBid = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApp).mockReturnValue({
      isDark: false, users: [], services: [], acceptBid, declineBid: vi.fn(),
      jobRequests: [{ id: 'request-1', seekerId: 'seeker-1', title: 'Pipe repair', paymentMethods }],
      bids: [{ id: 'offer-1', requestId: 'request-1', status: 'pending', providerId: 'provider-1', providerName: 'Provider', providerAvatar: '', providerRating: 0, price: 500, message: 'I can repair it.', createdAt: '2026-09-29' }],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept Offer' }));
    const chosen = paymentMethods.cash ? 'On-site Cash' : 'GCash';
    const unchecked = paymentMethods.cash ? 'GCash' : 'On-site Cash';
    expect(screen.queryByRole('button', { name: unchecked })).not.toBeInTheDocument();
    expect(acceptBid).not.toHaveBeenCalled();
    if (paymentMethods.cash) {
      expect(screen.getByRole('dialog', { name: 'Confirm offer' })).toHaveTextContent('Agreed price');
      expect(screen.queryByText('Select Payment Method')).not.toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: paymentMethods.cash ? 'Confirm booking' : chosen }));
    await waitFor(() => expect(acceptBid).toHaveBeenCalledWith('offer-1', chosen));
  });

  it('uses the received offer preferences while the request list is still loading', () => {
    vi.mocked(useApp).mockReturnValue({
      isDark: false, users: [], services: [], acceptBid: vi.fn(), declineBid: vi.fn(), jobRequests: [],
      bids: [{ id: 'offer-1', requestId: 'request-1', seekerId: 'seeker-1', requestTitle: 'Pipe repair', requestPaymentMethods: { cash: true, gcash: false }, status: 'pending', providerId: 'provider-1', providerName: 'Provider', providerAvatar: '', providerRating: 0, price: 500, message: 'I can repair it.', createdAt: '2026-09-29' }],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept Offer' }));
    expect(screen.getByRole('button', { name: 'Confirm booking' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('On-site Cash');
    expect(screen.queryByRole('button', { name: 'GCash' })).not.toBeInTheDocument();
  });
  it('does not show an empty inbox before offers have loaded', () => {
    vi.mocked(useApp).mockReturnValue({
      isDark: false, users: [], services: [], acceptBid: vi.fn(), declineBid: vi.fn(),
      jobRequests: [], bids: [], offersStatus: 'loading', refreshAll: vi.fn(),
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading offers received');
    expect(screen.queryByText('No Incoming Proposals Yet')).not.toBeInTheDocument();
  });

  it('shows a newly received offer before the general request list loads', () => {
    vi.mocked(useApp).mockReturnValue({
      isDark: false, users: [], services: [], acceptBid: vi.fn(), declineBid: vi.fn(),
      jobRequests: [],
      bids: [{ id: 'offer-1', requestId: 'request-1', seekerId: 'seeker-1', requestTitle: 'Aircon repair', status: 'pending', providerId: 'provider-1', providerName: 'Provider', providerAvatar: '', providerRating: 0, price: 1000, message: 'I can repair it.', createdAt: '2026-09-29' }],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    expect(screen.getByText('Aircon repair')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept Offer' })).toBeInTheDocument();
  });

  it('keeps GCash selected when the seeker accepts the provider’s exact offer', async () => {
    const acceptBid = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApp).mockReturnValue({
      isDark: false, users: [], services: [], acceptBid, declineBid: vi.fn(),
      jobRequests: [{ id: 'request-1', seekerId: 'seeker-1', title: 'Aircon repair', preferredPaymentMethod: 'GCash' }],
      bids: [{ id: 'offer-1', requestId: 'request-1', status: 'pending', providerId: 'provider-1', providerName: 'Provider', providerAvatar: '', providerRating: 0, price: 1000, message: 'I can repair it.', createdAt: '2026-09-29' }],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept Offer' }));
    expect(screen.getByRole('button', { name: 'Confirm GCash' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm On-site Cash' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm GCash' }));
    await waitFor(() => expect(acceptBid).toHaveBeenCalledWith('offer-1', 'GCash'));
  });

  it.each([
    ['pending_payment', 'PAYMENT_PENDING', 'Payment in progress'],
    ['pending', 'PAYMENT_PENDING', 'Another checkout in progress'],
    ['pending', 'CLOSED', 'Request paused'],
  ])('blocks invalid decisions for a %s offer on a %s request', (status, requestStatus, label) => {
    vi.mocked(useApp).mockReturnValue({ isDark: false, users: [], services: [], acceptBid: vi.fn(), declineBid: vi.fn(), jobRequests: [], bids: [{ id: 'offer-1', requestId: 'request-1', seekerId: 'seeker-1', requestTitle: 'Pipe repair', status, requestStatus, providerId: 'provider-1', providerName: 'Provider', price: 150, message: 'Repair it.', createdAt: '2026-10-02' }] } as unknown as ReturnType<typeof useApp>);
    render(<IncomingOffers currentUserId="seeker-1" />);
    expect(screen.getByRole('button', { name: label })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeDisabled();
  });
});
