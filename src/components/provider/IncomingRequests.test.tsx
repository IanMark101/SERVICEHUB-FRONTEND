import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import IncomingRequests from './IncomingRequests';
import { apiGetMyServices } from '../../api/services.api';
import { apiDeclineListingInquiry } from '../../api/requests.api';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ error: vi.fn(), success: vi.fn() }) }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: () => ({ canTransact: true }) }));
vi.mock('../landing/LimitedModeDashboardCard', () => ({ default: () => null }));
vi.mock('../ui/TransactionBlockedModal', () => ({ default: () => null }));
vi.mock('../ui/ReviewSummaryPanel', () => ({ default: () => null }));
vi.mock('../../api/services.api', () => ({ apiGetMyServices: vi.fn() }));
vi.mock('../../api/requests.api', () => ({ apiDeclineListingInquiry: vi.fn() }));

describe('provider incoming listing inquiries', () => {
  it('does not reopen a withdrawn private price request while the request refresh is still pending', () => {
    vi.mocked(useApp).mockReturnValue({ jobRequests: [{ id: 'private', targetProviderId: 'provider-1', targetServiceId: 'service-1', preferredPaymentMethod: null, status: 'OPEN', title: 'Laptop repair', budget: 0 }], bids: [{ id: 'closed-price', requestId: 'private', providerId: 'provider-1', status: 'withdrawn' }], jobEngagements: [], isDark: false, requestsStatus: 'ready', engagementsStatus: 'ready' } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByRole('heading', { name: 'No Requests' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Send Quote' })).not.toBeInTheDocument();
  });
  it('sets the final price inside Requests and uses the existing offer action', async () => {
    const submitBid = vi.fn().mockResolvedValue(true);
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [{ id: 'service-1', title: 'Laptop repair', providerId: 'provider-1', priceType: 'BY_AGREEMENT', price: null, status: 'ACTIVE', isAvailable: true, serviceLocationMode: 'SEEKER_VISITS', locationLabel: 'Cordova shop' }] });
    vi.mocked(useApp).mockReturnValue({ jobRequests: [{ id: 'private', seekerId: 'seeker-1', targetProviderId: 'provider-1', targetServiceId: 'service-1', preferredPaymentMethod: null, paymentMethods: { cash: true, gcash: true }, status: 'OPEN', title: 'Laptop repair', seekerName: 'Client', description: 'The laptop does not turn on.', budget: 0, serviceLocationMode: 'SEEKER_VISITS' }], bids: [], jobEngagements: [], isDark: false, submitBid } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Quote' }));
    const dialog = await screen.findByRole('dialog', { name: 'Send Quote' });
    expect(dialog).toHaveTextContent('The laptop does not turn on.');
    fireEvent.change(screen.getByLabelText(/Final.*total/i), { target: { value: '1250' } });
    fireEvent.change(screen.getByLabelText('What’s included'), { target: { value: 'Charging port repair, including parts and labor.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send Quote' }));
    await waitFor(() => expect(submitBid).toHaveBeenCalledWith('private', 'provider-1', 'service-1', 1250, 60, 'Charging port repair, including parts and labor.', undefined, { serviceLocationMode: 'SEEKER_VISITS' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('declines a private request through the backend and refreshes the inbox', async () => {
    const refreshAll = vi.fn();
    vi.mocked(apiDeclineListingInquiry).mockResolvedValue({ success: true, data: { id: 'private', status: 'CANCELED' } });
    vi.mocked(useApp).mockReturnValue({ jobRequests: [{ id: 'private', targetProviderId: 'provider-1', targetServiceId: 'service-1', status: 'OPEN', title: 'Laptop repair', description: 'Broken charging port.', budget: 0 }], bids: [], jobEngagements: [], isDark: false, refreshAll } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline request' }));
    await waitFor(() => expect(apiDeclineListingInquiry).toHaveBeenCalledWith('private'));
    await waitFor(() => expect(refreshAll).toHaveBeenCalledOnce());
  });
  it('shows the restored inbox message only when the loaded inbox is empty', () => {
    vi.mocked(useApp).mockReturnValue({ jobRequests: [], bids: [], jobEngagements: [], isDark: false,
      requestsStatus: 'ready', engagementsStatus: 'ready' } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByRole('heading', { name: 'No Requests' })).toBeVisible();
    expect(screen.getByText('When customers choose your services, their booking requests and quote inquiries will appear here.')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error with retry instead of an empty success state when loading fails', () => {
    const retry = vi.fn();
    vi.mocked(useApp).mockReturnValue({ jobRequests: [], bids: [], jobEngagements: [], isDark: false,
      requestsStatus: 'error', engagementsStatus: 'ready', refreshAll: retry } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Incoming requests could not be loaded.');
    expect(screen.queryByText('No Requests')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('paginates the work queue and resets to the first page when searching', () => {
    vi.mocked(useApp).mockReturnValue({jobRequests:[],bids:[],isDark:false,jobEngagements:Array.from({length:12},(_,i)=>({id:`booking-${i}`,providerId:'provider-1',seekerId:'client',seekerName:`Client ${i}`,title:`Repair ${i}`,price:500,status:'pending_provider',createdAt:'2026-10-13'}))} as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1"/>);
    expect(screen.getAllByRole('article')).toHaveLength(10);
    fireEvent.click(screen.getByRole('button',{name:'2'}));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    fireEvent.change(screen.getByRole('searchbox',{name:'Search incoming requests'}),{target:{value:'Repair 0'}});
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Repair 0')).toBeInTheDocument();
    const details=screen.getByText('Request details').closest('details')!;
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(screen.getByText('Request details'));
    expect(details).toHaveAttribute('open');
  });
  it('shows the submitted job pin instead of a missing profile location and preserves the response action', async () => {
    const respond = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApp).mockReturnValue({
      jobRequests: [], bids: [], isDark: false, respondToDirectBooking: respond,
      jobEngagements: [{ id: 'booking', providerId: 'provider-1', seekerId: 'seeker', seekerName: 'Client', seekerLocation: 'Location not provided', title: 'Laptop repair', price: 1575, status: 'pending_provider', createdAt: new Date().toISOString(), jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Day-as job site', address: 'Private entrance directions' }, serviceLocationMode: 'PROVIDER_VISITS' }],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByText('Day-as job site')).toBeInTheDocument();
    expect(screen.getByText('Private entrance directions')).toBeInTheDocument();
    expect(screen.queryByText('Location not provided')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View agreed job pin' })).toHaveAttribute('href', expect.stringContaining('mlat=10.3&mlon=123.9'));
    fireEvent.click(screen.getByRole('button', { name: 'Accept request' }));
    await waitFor(() => expect(respond).toHaveBeenCalledWith('booking', true));
  });
  it('does not show an empty inbox before requests and bookings have loaded', () => {
    vi.mocked(useApp).mockReturnValue({
      jobEngagements: [], bids: [], jobRequests: [], isDark: false,
      requestsStatus: 'loading', engagementsStatus: 'loading', refreshAll: vi.fn(),
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading incoming requests');
    expect(screen.queryByText('No Requests')).not.toBeInTheDocument();
  });

  it('shows only this provider’s unanswered inquiry with a path to send its quote', () => {
    vi.mocked(useApp).mockReturnValue({
      jobEngagements: [], bids: [], isDark: false,
      jobRequests: [
        { id: 'selected', targetProviderId: 'provider-1', targetServiceId: 'service-1', preferredPaymentMethod: 'GCash', status: 'OPEN', title: 'Repair aircon', seekerName: 'Client', description: 'The aircon needs repair.', budget: 500 },
        { id: 'other', targetProviderId: 'provider-2', targetServiceId: 'service-2', status: 'OPEN', title: 'Other provider job', seekerName: 'Client', description: 'Private details', budget: 500 },
      ],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByText('Repair aircon')).toBeInTheDocument();
    expect(screen.getByText('Customer selected: GCash')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Send quote' })).toHaveAttribute('href', '/provider/browse-services?request=selected');
    expect(screen.queryByText('Other provider job')).not.toBeInTheDocument();
  });
});
