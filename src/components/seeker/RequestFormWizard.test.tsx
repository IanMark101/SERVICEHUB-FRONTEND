import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { apiBookDirect } from '../../api/bookings.api';
import type { ServiceListing } from '../../types';
import type { ListingPhoto } from '../../lib/listingPhotos';
import PostRequest from './PostRequest';
import RequestServiceModal from './RequestServiceModal';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/GCashNumberField', async () => {
  const { useEffect } = await import('react');
  return { default: ({ userId, enabled, onReadinessChange }: { userId: string; enabled: boolean; onReadinessChange?: (state: { userId: string; ready: boolean }) => void }) => {
    useEffect(() => { if (enabled) onReadinessChange?.({ userId, ready: true }); }, [userId, enabled, onReadinessChange]);
    return enabled ? <p>Saved number ending in 6789</p> : null;
  } };
});
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('../../api/bookings.api', () => ({ apiBookDirect: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ error: vi.fn(), success: vi.fn() }) }));
vi.mock('../ui/ReviewSummaryPanel', () => ({ default: () => <p>Provider feedback</p> }));
vi.mock('../location/LocationField', () => ({ default: ({ onChange, disabled }: { onChange: (p: { latitude: number; longitude: number; label: string; address: string }) => void; disabled?: boolean }) => <button type="button" disabled={disabled} onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cordova', address: 'Blue gate' })}>Use Cordova location</button> }));
let finishUpload = () => {};
vi.mock('../ui/ListingPhotoUploader', () => ({ default: ({ value, onChange, onBusyChange }: { value: ListingPhoto[]; onChange: (p: ListingPhoto[]) => void; onBusyChange: (busy: boolean) => void }) => <div><p>{value.length} uploaded photos</p><button type="button" onClick={() => onChange([{ id: 'photo-1', url: 'https://example.test/laptop.jpg', width: 640, height: 480 }])}>Add test photo</button><button type="button" onClick={() => { onBusyChange(true); finishUpload = () => onBusyChange(false); }}>Start photo upload</button></div> }));

const post = vi.fn();
const online = vi.fn();
const listing: ServiceListing = { id: 'service-1', providerId: 'provider-1', providerName: 'Ian', providerAvatar: '', title: 'Laptop repair', category: 'Computer & Laptop Repair', description: 'Repair laptops', price: 500, queueSize: 0, isPaused: false, proofOfSkillUrl: '', rating: 0, reviewCount: 0, priceType: 'FIXED', paymentMethods: { cash: true, gcash: true }, serviceLocationMode: 'BOTH', transportationFee: 75 };

beforeEach(() => {
  vi.clearAllMocks();
  post.mockResolvedValue(false);
  online.mockResolvedValue(undefined);
  vi.mocked(apiBookDirect).mockResolvedValue({ success: true });
  vi.mocked(useApp).mockReturnValue({ user: { id: 'seeker-1' }, postJobRequest: post, bookProviderDirectly: online, isDark: false, jobEngagements: [], dbCategories: [{ id: 'category-1', name: 'Computer & Laptop Repair' }] } as unknown as ReturnType<typeof useApp>);
  vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: true, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
});
function next() { fireEvent.click(screen.getByRole('button', { name: /^(Next|Review request)$/ })); }
function details() {
  fireEvent.change(screen.getByLabelText('Request title'), { target: { value: 'Laptop will not turn on' } });
  fireEvent.change(screen.getByLabelText('Service category'), { target: { value: 'category-1' } });
  fireEvent.change(screen.getByLabelText('Describe what you need'), { target: { value: 'Please check why my laptop will not start.' } });
}
function requestToPayment() {
  details(); next();
  fireEvent.click(screen.getByRole('button', { name: 'Use Cordova location' })); next();
  fireEvent.change(screen.getByRole('combobox', { name: 'When do you need help?' }), { target: { value: 'This Week' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /Your service budget/ }), { target: { value: '1500' } }); next();
}
function bookingToPayment() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Describe the work needed' }), { target: { value: 'Please repair my laptop.' } }); next();
  fireEvent.click(screen.getByRole('button', { name: 'Use Cordova location' }));
  fireEvent.click(screen.getByRole('radio', { name: /You go to the provider/ })); next();
}

describe('Post Request wizard', () => {
  it('shows only the current fields and blocks an empty step, including Enter submission', () => {
    render(<PostRequest />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Post request' })).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: 'Post a request' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('alert')).toHaveTextContent('3–100 characters');
    expect(screen.getByLabelText('Request title')).toHaveAttribute('aria-invalid', 'true');
    expect(post).not.toHaveBeenCalled();
  });
  it('preserves details, photos, location and budget when going Back and editing from Review', () => {
    render(<PostRequest />);
    fireEvent.click(screen.getByRole('button', { name: 'Add test photo' }));
    requestToPayment(); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('list').querySelectorAll('[data-complete="true"]')).toHaveLength(4);
    expect(screen.getByText('1 photo added')).toBeVisible();
    expect(post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit request details' }));
    expect(screen.getByRole('textbox', { name: 'Request title' })).toHaveValue('LAPTOP WILL NOT TURN ON');
    expect(screen.getByText('1 uploaded photos')).toBeVisible();
    next();
    expect(screen.getByRole('group', { name: 'Request location' })).toHaveFocus();
    next();
    expect(screen.getByRole('spinbutton', { name: /Your service budget/ })).toHaveValue(1500);
    next(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Post request' }));
    expect(post).toHaveBeenCalledWith('seeker-1', expect.any(String), 'category-1', 'This Week', 1500, expect.any(String), { cash: true, gcash: true }, expect.objectContaining({ photoIds: ['photo-1'], jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cordova', address: 'Blue gate' } }));
  });
  it('requires a job location and validates the budget before showing Payment', () => {
    render(<PostRequest />); details(); next(); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    fireEvent.click(screen.getByRole('button', { name: 'Use Cordova location' })); next(); next();
    expect(screen.getByRole('alert')).toHaveTextContent('₱50');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(post).not.toHaveBeenCalled();
  });
  it('keeps the photo uploader mounted and disables navigation during upload', () => {
    render(<PostRequest />); details();
    fireEvent.click(screen.getByRole('button', { name: 'Start photo upload' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    act(() => finishUpload()); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });
  it('revalidates a retired category at final submission instead of sending the stale draft', () => {
    const view = render(<PostRequest />); requestToPayment(); next();
    vi.mocked(useApp).mockReturnValue({ ...useApp(), dbCategories: [] }); view.rerender(<PostRequest />);
    fireEvent.click(screen.getByRole('button', { name: 'Post request' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('alert')).toHaveTextContent('Select the type of service');
    expect(post).not.toHaveBeenCalled();
  });
  it('keeps verification restrictions on the new navigation', () => {
    vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: false, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
    render(<PostRequest />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Request title' })).toBeDisabled();
    expect(post).not.toHaveBeenCalled();
  });
});

describe('Request Service wizard', () => {
  it('requires work details and a location before proceeding; no API is called by Next', () => {
    render(<RequestServiceModal listing={listing} onClose={vi.fn()} />); next();
    expect(screen.getByRole('alert')).toHaveTextContent('describe the work');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    fireEvent.change(screen.getByRole('textbox', { name: 'Describe the work needed' }), { target: { value: 'Fix my laptop.' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); next(); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('alert')).toHaveTextContent('Choose where the work');
    expect(apiBookDirect).not.toHaveBeenCalled(); expect(online).not.toHaveBeenCalled();
  });
  it('preserves schedule, metered quantity and payment when returning from Review', () => {
    render(<RequestServiceModal listing={{ ...listing, priceType: 'PER_HOUR' }} onClose={vi.fn()} />); bookingToPayment();
    fireEvent.change(screen.getByRole('textbox', { name: /Preferred schedule/ }), { target: { value: 'Saturday afternoon' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Number of hours' }), { target: { value: '3' } }); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(apiBookDirect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('textbox', { name: /Preferred schedule/ })).toHaveValue('Saturday afternoon');
    expect(screen.getByRole('spinbutton', { name: 'Number of hours' })).toHaveValue(3);
    expect(screen.getByRole('button', { name: 'On-site Cash' })).toHaveAttribute('aria-pressed', 'true'); next();
    fireEvent.click(screen.getByRole('button', { name: 'Send Request' }));
    expect(apiBookDirect).toHaveBeenCalledWith(expect.objectContaining({ quantity: 3, schedule: 'Saturday afternoon', serviceLocationMode: 'SEEKER_VISITS' }));
  });
  it.each([0, 41, 1.5])('blocks invalid hourly quantity %s before Review', quantity => {
    render(<RequestServiceModal listing={{ ...listing, priceType: 'PER_HOUR' }} onClose={vi.fn()} />); bookingToPayment();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Number of hours' }), { target: { value: String(quantity) } }); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    expect(screen.getByRole('alert')).toHaveTextContent('valid number of hours');
    expect(apiBookDirect).not.toHaveBeenCalled();
  });
  it('switches between arrangements without losing the job location and omits it for venue booking', () => {
    render(<RequestServiceModal listing={listing} onClose={vi.fn()} />); bookingToPayment();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('radio', { name: /You go to the provider/ })); next(); next();
    const section = screen.getByRole('group', { name: 'Review your booking request' });
    expect(within(section).getByText('Total').nextElementSibling).toHaveTextContent('₱500');
    fireEvent.click(screen.getByRole('button', { name: 'Edit location' }));
    fireEvent.click(screen.getByRole('radio', { name: /The provider comes to you/ })); next();
    expect(within(screen.getByRole('group', { name: 'Review your booking request' })).getByText('Cordova')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Edit location' }));
    fireEvent.click(screen.getByRole('radio', { name: /You go to the provider/ })); next(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Send Request' }));
    expect(apiBookDirect).toHaveBeenCalledWith(expect.objectContaining({ serviceLocationMode: 'SEEKER_VISITS' }));
    expect(vi.mocked(apiBookDirect).mock.calls[0][0]).not.toHaveProperty('jobLocation');
  });
  it('keeps the Review step and draft on a server error', async () => {
    vi.mocked(apiBookDirect).mockRejectedValue(new Error('Provider is unavailable'));
    render(<RequestServiceModal listing={listing} onClose={vi.fn()} />); bookingToPayment(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Send Request' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Provider is unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Edit work details' }));
    expect(screen.getByRole('textbox', { name: 'Describe the work needed' })).toHaveValue('Please repair my laptop.');
  });
  it('blocks repeated confirms while the cash request is in flight', async () => {
    let resolve!: (value: { success: boolean }) => void;
    vi.mocked(apiBookDirect).mockReturnValue(new Promise(done => { resolve = done; }));
    render(<RequestServiceModal listing={listing} onClose={vi.fn()} />); bookingToPayment(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Send Request' }));
    fireEvent.submit(screen.getByRole('form', { name: 'Request service' }));
    expect(apiBookDirect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    await act(async () => resolve({ success: true }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Request Sent Successfully'));
  });
  it('keeps self-booking unavailable and exposes the existing Edit Listing action', () => {
    render(<RequestServiceModal listing={{ ...listing, providerId: 'seeker-1' }} onClose={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('own service listing');
    expect(screen.getByRole('button', { name: 'Edit Listing Details' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: 'Request service' }));
    expect(apiBookDirect).not.toHaveBeenCalled();
  });
});
