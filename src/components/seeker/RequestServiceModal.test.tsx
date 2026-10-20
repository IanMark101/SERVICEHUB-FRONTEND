import { selectWorkLocation } from '../../test/selectWorkLocation';
import { fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import { apiBookDirect } from '../../api/bookings.api';
import RequestServiceModal from './RequestServiceModal';
import { apiCreateListingInquiry } from '../../api/requests.api';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../api/bookings.api', () => ({ apiBookDirect: vi.fn() }));
vi.mock('../../api/requests.api', () => ({ apiCreateListingInquiry: vi.fn() }));
vi.mock('../ui/ListingPhotoUploader', () => ({ default: ({ onChange }: { onChange: (photos: object[]) => void }) => <button type="button" onClick={() => onChange([{ id: 'photo-1', url: 'https://example.test/laptop.jpg', width: 640, height: 480 }])}>Attach test photo</button> }));
vi.mock('../../api/ai.api', () => ({
  getCachedProviderSummary: () => ({ data: { summary: 'Previous customers were satisfied.', source: 'computed' } }),
  apiGetProviderSummary: vi.fn().mockResolvedValue({ success: true, data: { summary: 'Previous customers were satisfied.', source: 'computed' } }),
}));

const listing: ServiceListing = {
  id: 'fixed-listing', providerId: 'provider-1', providerName: 'Ian', providerAvatar: '',
  title: 'House Cleaning', category: 'House Cleaning', description: 'Clean the house',
  price: 500, queueSize: 0, isPaused: false, proofOfSkillUrl: '', rating: 0, reviewCount: 0,
  priceType: 'FIXED', serviceLocationMode: 'SEEKER_VISITS', locationLabel: 'Cordova workshop', paymentMethods: { cash: true, gcash: true },
};
const online = vi.fn();
const refreshAll = vi.fn();

describe('quote required service requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ user: { id: 'seeker-1' }, bookProviderDirectly: online, isDark: false, jobEngagements: [], refreshAll } as unknown as ReturnType<typeof useApp>);
  });
  it('validates description and job location, preserves drafts and sends only a private request with photos', async () => {
    vi.mocked(apiCreateListingInquiry).mockResolvedValue({ success: true, data: {} });
    rtlRender(<RequestServiceModal listing={{ ...listing, price: 0, priceType: 'BY_AGREEMENT', serviceLocationMode: 'PROVIDER_VISITS' }} onClose={vi.fn()} />);
    expect(screen.queryByText(/₱0/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert')).toHaveTextContent('describe the work');
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'broken' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert')).toHaveTextContent('10 characters');
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'My laptop will not turn on. Please check it.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Attach test photo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose where');
    fireEvent.click(screen.getByTestId('test-location'));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Work description')).toHaveValue('My laptop will not turn on. Please check it.');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
    expect(screen.getByText('1 photo attached')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Cash' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Request a Quote' }));
    await waitFor(() => expect(apiCreateListingInquiry).toHaveBeenCalledWith({ serviceId: listing.id, message: 'My laptop will not turn on. Please check it.', serviceLocationMode: 'PROVIDER_VISITS', jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, photoIds: ['photo-1'] }));
    expect(await screen.findByRole('status')).toHaveTextContent('No booking or payment has been created');
    expect(refreshAll).toHaveBeenCalledOnce();
    expect(apiBookDirect).not.toHaveBeenCalled(); expect(online).not.toHaveBeenCalled();
  });
  it('uses the provider venue without a customer pin and keeps the request on submission failure', async () => {
    vi.mocked(apiCreateListingInquiry).mockRejectedValue(new Error('This listing changed.'));
    rtlRender(<RequestServiceModal listing={{ ...listing, price: 0, priceType: 'BY_AGREEMENT', serviceLocationMode: 'SEEKER_VISITS', locationLabel: 'Cordova workshop' }} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'Please repair the charging port.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.queryByTestId('test-location')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
    fireEvent.click(screen.getByRole('button', { name: 'Request a Quote' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('This listing changed.');
    expect(apiCreateListingInquiry).toHaveBeenCalledWith({ serviceId: listing.id, message: 'Please repair the charging port.', serviceLocationMode: 'SEEKER_VISITS' });
    expect(apiBookDirect).not.toHaveBeenCalled(); expect(online).not.toHaveBeenCalled();
  });
});

describe('direct listing booking payment choices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      user: { id: 'seeker-1' }, bookProviderDirectly: online, isDark: false, jobEngagements: [],
    } as unknown as ReturnType<typeof useApp>);
  });

  it('offers only cash and books the listing without a ServiceRequest', async () => {
    vi.mocked(apiBookDirect).mockResolvedValue({ success: true });
    render(<RequestServiceModal listing={{ ...listing, paymentMethods: { cash: true, gcash: false } }} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cash' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /GCash/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Describe the work you need/), { target: { value: 'Please clean the kitchen and living room.' } });
    submitBooking('Send Request');
    await waitFor(() => expect(apiBookDirect).toHaveBeenCalledWith({
      serviceLocationMode: 'SEEKER_VISITS', serviceId: 'fixed-listing', quantity: 1, message: 'Please clean the kitchen and living room.', schedule: undefined,
    }));
    expect(online).not.toHaveBeenCalled();
  });

  it('offers only GCash for a GCash-only listing', () => {
    render(<RequestServiceModal listing={{ ...listing, paymentMethods: { cash: false, gcash: true } }} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /GCash · Test Mode/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cash' })).not.toBeInTheDocument();
  });

  it('books a provider venue without a customer pin or a provider travel fee', async () => {
    vi.mocked(apiBookDirect).mockResolvedValue({ success: true });
    render(<RequestServiceModal listing={{ ...listing, serviceLocationMode: 'SEEKER_VISITS', locationLabel: 'Cordova workshop', transportationFee: 75 }} onClose={vi.fn()} />);
    expect(screen.queryByTestId('test-location')).not.toBeInTheDocument();
    expect(screen.getAllByText('Cordova workshop')[0]).toBeInTheDocument();
    expect(screen.getByText('Total: ₱500')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Describe the work you need/), { target: { value: 'Please repair my laptop at your workshop.' } });
    submitBooking('Send Request');
    await waitFor(() => expect(apiBookDirect).toHaveBeenCalledWith({ serviceLocationMode: 'SEEKER_VISITS', serviceId: listing.id, quantity: 1, message: 'Please repair my laptop at your workshop.', schedule: undefined }));
  });

  it('switches a fixed-price listing between travel and shop checkout without requiring a quote', async () => {
    rtlRender(<RequestServiceModal listing={{ ...listing, serviceLocationMode: 'BOTH', transportationFee: 75 }} onClose={vi.fn()} initialPaymentMethod="GCash" />);
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'I will bring my laptop to your venue.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByTestId('test-location'));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Total: '+String.fromCharCode(8369)+'575')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Request a Quote' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    selectWorkLocation(/At provider’s place/);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Total: ₱500')).toBeVisible();
    submitBooking('Continue to GCash');
    await waitFor(() => expect(online).toHaveBeenCalledWith('seeker-1', listing.id, 500, 'I will bring my laptop to your venue.', 'GCash', 1, undefined, 'SEEKER_VISITS'));
  });

  it('allows both supported methods when the provider selected both', () => {
    render(<RequestServiceModal listing={listing} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /GCash · Test Mode/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cash' })).toBeInTheDocument();
  });

  it('books an hourly listing directly with the chosen duration and payment method', async () => {
    vi.mocked(apiBookDirect).mockResolvedValue({ success: true });
    render(<RequestServiceModal listing={{ ...listing, priceType: 'PER_HOUR' }} onClose={vi.fn()} />);
    expect(screen.getByText('Service: ₱500')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Payment Method' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Number of hours'), { target: { value: '2' } });
    expect(screen.getByText('Total: ₱1,000')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Describe the work you need/), { target: { value: 'Please clean the kitchen and living room.' } });
    submitBooking('Send Request');
    await waitFor(() => expect(apiBookDirect).toHaveBeenCalledWith({
      serviceLocationMode: 'SEEKER_VISITS', serviceId: 'fixed-listing', quantity: 2, message: 'Please clean the kitchen and living room.', schedule: undefined,
    }));
    expect(online).not.toHaveBeenCalled();
  });

  it('passes the selected GCash method and quantity into direct checkout', async () => {
    render(<RequestServiceModal listing={{ ...listing, priceType: 'PER_DAY' }} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Number of days'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /GCash · Test Mode/ }));
    fireEvent.change(screen.getByPlaceholderText(/Describe the work you need/), { target: { value: 'Please clean the kitchen and living room.' } });
    submitBooking('Continue to GCash');
    await waitFor(() => expect(online).toHaveBeenCalledWith('seeker-1', 'fixed-listing', 500, 'Please clean the kitchen and living room.', 'GCash', 3, undefined, 'SEEKER_VISITS'));
  });

  it('hands checkout to the workspace dialog without claiming a booking or keeping the request dialog open', async () => {
    const onClose = vi.fn();
    online.mockResolvedValueOnce({ seekerId: 'seeker-1', paymentIntentId: 'pi_pending' });
    render(<RequestServiceModal listing={listing} onClose={onClose} initialPaymentMethod="GCash" />);
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'Fix the kitchen.' } });
    submitBooking('Continue to GCash');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Booking Created Successfully!')).not.toBeInTheDocument();
  });

  it('keeps the request form and description when checkout initiation fails', async () => {
    const onClose = vi.fn();
    online.mockRejectedValueOnce(new Error('Checkout unavailable'));
    render(<RequestServiceModal listing={listing} onClose={onClose} initialPaymentMethod="GCash" />);
    fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'Fix the kitchen.' } });
    submitBooking('Continue to GCash');
    expect(await screen.findByRole('alert')).toHaveTextContent('Checkout unavailable');
    expect(screen.getByLabelText('Work description')).toHaveValue('Fix the kitchen.');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not book an older custom-priced listing without a final price', () => {
    render(<RequestServiceModal listing={{ ...listing, priceType: 'CUSTOM', price: 0 }} onClose={vi.fn()} />);
    expect(screen.getByText('Price unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Price Needed Before Booking' })).toBeDisabled();
    expect(apiBookDirect).not.toHaveBeenCalled();
  });
});

// These regression tests supply an explicit location fixture; location interaction is tested separately.
vi.mock('../location/LocationField', () => ({ default: ({ onChange, disabled }: { onChange: (point: { latitude:number; longitude:number; label:string }) => void; disabled?:boolean }) => <button type="button" data-testid="test-location" disabled={disabled} onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cebu' })}>Set test location</button> }));
// Payment contract fixtures navigate through the validated earlier steps.
function render(...args: Parameters<typeof rtlRender>) {
  const view = rtlRender(...args);
  const choice = view.container.querySelector<HTMLButtonElement>('[data-testid="test-location"]');
  if (choice) fireEvent.click(choice);
  fireEvent.change(screen.getByLabelText('Work description'), { target: { value: 'Work required for this payment fixture.' } });
  for (let i = 0; i < 2; i++) {
    const next = screen.queryByRole('button', { name: 'Next' });
    if (next) fireEvent.click(next);
  }
  return view;
}
function submitBooking(name: string) {
  fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
  fireEvent.click(screen.getByRole('button', { name }));
}

describe('one-time direct booking transportation', () => {
  it('books remote work through online checkout without a job pin or travel charge', async () => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ user:{id:'seeker-1'}, bookProviderDirectly:online, isDark:false,jobEngagements:[] } as unknown as ReturnType<typeof useApp>);
    render(<RequestServiceModal listing={{ ...listing, serviceLocationMode:'REMOTE', transportationFee:100 }} onClose={vi.fn()} />);
    expect(screen.queryByTestId('test-location')).not.toBeInTheDocument();
    expect(screen.getByText('Total: ₱500')).toBeVisible();
    expect(screen.getByRole('button', { name:'GCash · Test Mode' })).toHaveAttribute('aria-pressed', 'true');
    submitBooking('Continue to GCash');
    await waitFor(() => expect(online).toHaveBeenCalledWith('seeker-1', listing.id, 500, expect.any(String), 'GCash', 1, undefined, 'REMOTE'));
    expect(apiBookDirect).not.toHaveBeenCalled();
  });
  it('passes the selected private job point with a fixed-price cash booking without asking for another price', async () => {
    vi.clearAllMocks(); vi.mocked(apiBookDirect).mockResolvedValueOnce({success:true});
    vi.mocked(useApp).mockReturnValue({user:{id:'seeker-1'},bookProviderDirectly:online,isDark:false,jobEngagements:[]} as unknown as ReturnType<typeof useApp>);
    render(<RequestServiceModal listing={{...listing,serviceLocationMode:'PROVIDER_VISITS',price:300,transportationFee:100}} onClose={vi.fn()}/>);
    submitBooking('Send Request');
    await waitFor(()=>expect(apiBookDirect).toHaveBeenCalledWith(expect.objectContaining({serviceId:listing.id,serviceLocationMode:'PROVIDER_VISITS',quantity:1,jobLocation:{latitude:10.3,longitude:123.9,label:'Cebu'}})));
    expect(apiCreateListingInquiry).not.toHaveBeenCalled(); expect(online).not.toHaveBeenCalled();
  });
  it('sends remote price enquiries without inventing a venue', async () => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ user:{id:'seeker-1'}, bookProviderDirectly:online, isDark:false,jobEngagements:[],refreshAll } as unknown as ReturnType<typeof useApp>);
    rtlRender(<RequestServiceModal listing={{ ...listing, priceType:'BY_AGREEMENT', price:0, serviceLocationMode:'REMOTE' }} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Work description'), {target:{value:'Build a website with five pages and a contact form.'}});
    fireEvent.click(screen.getByRole('button', {name:'Next'}));
    expect(screen.getByText('No travel required.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name:'Review request'}));
    fireEvent.click(screen.getByRole('button', {name:'Request a Quote'}));
    await waitFor(() => expect(apiCreateListingInquiry).toHaveBeenCalledWith({serviceId:listing.id,message:'Build a website with five pages and a contact form.',serviceLocationMode:'REMOTE'}));
  });
  it.each(['FIXED', 'PER_HOUR', 'PER_DAY'] as const)('books a travelling %s listing at the posted price plus one displayed travel fee', async priceType => {
    vi.clearAllMocks();
    online.mockResolvedValueOnce({ seekerId:'seeker-1', paymentIntentId:'pi_pending' });
    vi.mocked(useApp).mockReturnValue({ user:{id:'seeker-1'}, bookProviderDirectly:online, isDark:false,jobEngagements:[],refreshAll } as unknown as ReturnType<typeof useApp>);
    render(<RequestServiceModal listing={{...listing, serviceLocationMode:'PROVIDER_VISITS', price:300, priceType, transportationFee:100}} initialPaymentMethod="GCash" onClose={vi.fn()}/>);
    if (priceType !== 'FIXED') fireEvent.change(screen.getByLabelText(priceType === 'PER_HOUR' ? 'Number of hours' : 'Number of days'), {target:{value:'2'}});
    expect(screen.getByText(priceType === 'FIXED' ? 'Total: PHP400'.replace('PHP', String.fromCharCode(8369)) : 'Total: PHP700'.replace('PHP', String.fromCharCode(8369)))).toBeVisible();
    submitBooking('Continue to GCash');
    await waitFor(()=>expect(online).toHaveBeenCalledWith('seeker-1', listing.id, 300, expect.any(String), 'GCash', priceType === 'FIXED' ? 1 : 2, {latitude:10.3,longitude:123.9,label:'Cebu'}, 'PROVIDER_VISITS'));
    expect(apiCreateListingInquiry).not.toHaveBeenCalled(); expect(apiBookDirect).not.toHaveBeenCalled();
  });
});
