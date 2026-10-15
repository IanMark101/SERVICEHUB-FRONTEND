import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import type { ListingPhoto } from '../../lib/listingPhotos';
import OfferServices from './OfferServices';

const walletState = vi.hoisted(() => ({ ready: true }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/GCashNumberField', async () => {
  const { useEffect } = await import('react');
  return { default: ({ userId, enabled, onReadinessChange }: { userId: string; enabled: boolean; onReadinessChange?: (state: { userId: string; ready: boolean }) => void }) => {
    useEffect(() => { if (enabled) onReadinessChange?.({ userId, ready: walletState.ready }); }, [userId, enabled, onReadinessChange]);
    return enabled ? <p>Saved number ending in 6789</p> : null;
  } };
});
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../location/LocationField', () => ({ default: ({ onChange, disabled, radiusKm, error }: { onChange: (point: { latitude: number; longitude: number; label: string }) => void; disabled?: boolean; radiusKm?: number | null; error?: string }) => <div><button type="button" data-testid="test-location" data-radius={radiusKm ?? ''} disabled={disabled} onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cebu' })}>Set test location</button>{error && <p role="alert">{error}</p>}</div> }));
let finishUpload = () => {};
vi.mock('../ui/ListingPhotoUploader', () => ({ default: ({ value, onChange, onBusyChange }: { value: ListingPhoto[]; onChange: (photos: ListingPhoto[]) => void; onBusyChange: (busy: boolean) => void }) => <div><p>{value.length} uploaded photos</p><button type="button" onClick={() => onChange([{ id: 'photo-1', url: 'https://example.test/laptop.jpg', width: 640, height: 480 }])}>Add test photo</button><button type="button" onClick={() => { onBusyChange(true); finishUpload = () => onBusyChange(false); }}>Start upload</button></div> }));

const createServiceListing = vi.fn();
const toastError = vi.fn();
const description = 'I will repair the leaking kitchen pipe and clean up.';
function next() { fireEvent.click(screen.getByRole('button', { name: /^(Next|Review service)$/ })); }
function fillDetails() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Service name' }), { target: { value: 'Kitchen pipe repair' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'What is included?' }), { target: { value: description } });
  fireEvent.click(screen.getByRole('combobox', { name:'Service category' }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name:'Plumbing' }));
}
function toPrice() {
  fillDetails(); next();
  fireEvent.click(screen.getByTestId('test-location'));
  next();
}
function toReview() { toPrice(); next(); next(); }

beforeEach(() => {
  walletState.ready = true;
  vi.clearAllMocks();
  createServiceListing.mockResolvedValue({ success: false });
  vi.mocked(useApp).mockReturnValue({ user: { id: 'provider-id', phone: '09123456789' }, createServiceListing, isDark: false, dbCategories: [{ id: 'category-cuid', name: 'Plumbing' }] } as unknown as ReturnType<typeof useApp>);
  vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: true, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
  vi.mocked(useToast).mockReturnValue({ error: toastError, success: vi.fn() } as unknown as ReturnType<typeof useToast>);
});

it('keeps public map sharing opt-in and includes the choice in publication', async () => {
  render(<OfferServices />); fillDetails(); next();
  fireEvent.click(screen.getByTestId('test-location'));
  const consent=screen.getByRole('checkbox', { name:/Show this exact pin on the public map/ });
  expect(consent).not.toBeChecked(); fireEvent.click(consent); expect(consent).toBeChecked();
  next(); next(); next();
  fireEvent.click(screen.getByRole('button', { name:'Publish service' }));
  await waitFor(() => expect(createServiceListing).toHaveBeenCalledWith(expect.any(String),expect.any(String),expect.any(String),expect.any(Number),expect.any(String),expect.any(Object),expect.objectContaining({publicMapPin:true})));
});

describe('Offer Services wizard', () => {
  it('publishes remote work with a discovery area and no venue, pin consent, travel coverage or fee', async () => {
    render(<OfferServices />); fillDetails(); next();
    fireEvent.click(screen.getByRole('radio', { name: /Online \/ remote/ }));
    fireEvent.click(screen.getByTestId('test-location'));
    expect(screen.queryByRole('checkbox', { name: /Show this exact pin/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/How far will you travel/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Address or directions/)).not.toBeInTheDocument();
    next();
    expect(screen.queryByLabelText(/Your travel fee/)).not.toBeInTheDocument();
    next(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(createServiceListing).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(String), 500, description, expect.any(Object), expect.objectContaining({ serviceLocationMode: 'REMOTE', publicMapPin: false, coverageRadiusKm: null, venueAddress: null, transportationFee: null })));
  });
  it('lets providers publish by agreement without an amount or separate travel fee and retains a fixed-price draft', async () => {
    render(<OfferServices />); toPrice();
    fireEvent.change(screen.getByLabelText('Service price (₱)'), { target: { value: '2500' } });
    fireEvent.change(screen.getByLabelText('How do you charge?'), { target: { value: 'BY_AGREEMENT' } });
    expect(screen.queryByLabelText('Service price (₱)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Travel fee/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('How do you charge?'), { target: { value: 'FIXED' } });
    expect(screen.getByLabelText('Service price (₱)')).toHaveValue(2500);
    fireEvent.change(screen.getByLabelText('How do you charge?'), { target: { value: 'BY_AGREEMENT' } });
    next(); next();
    expect(screen.getAllByText('Price by agreement').some(element => element.tagName !== 'OPTION')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(createServiceListing).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(String), 2500, description, expect.any(Object), expect.objectContaining({ priceType: 'BY_AGREEMENT', transportationFee: null })));
  });
  it('shows only Details, keeps provider tone and validates before Next or Enter', () => {
    render(<OfferServices />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar').parentElement).toHaveAttribute('data-workspace', 'provider');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish service' })).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: 'Create a service listing' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Check 3 fields to continue');
    const name = screen.getByRole('textbox', { name: 'Service name' });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription(/Enter a service name/);
    expect(screen.getByRole('combobox', { name: 'Service category' })).toHaveAccessibleDescription(/Choose the category that best fits/);
    expect(screen.getByRole('textbox', { name: 'What is included?' })).toHaveAccessibleDescription(/Describe what you will do/);
    expect(toastError).not.toHaveBeenCalled();
    expect(createServiceListing).not.toHaveBeenCalled();
  });
  it('shows errors only after Next, clears each corrected field and focuses the next problem on retry', () => {
    render(<OfferServices />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    next();
    fireEvent.change(screen.getByRole('textbox', { name: 'Service name' }), { target: { value: 'Laptop repair and diagnostics' } });
    expect(screen.getByRole('textbox', { name: 'Service name' })).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('alert')).toHaveTextContent('Check 2 fields');
    expect(screen.queryByText('Enter a service name, such as Laptop repair and diagnostics.')).not.toBeInTheDocument();
    next();
    expect(screen.getByRole('combobox', { name: 'Service category' })).toHaveFocus();
    fireEvent.click(screen.getByRole('combobox', { name:'Service category' }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name:'Plumbing' }));
    next();
    expect(screen.getByRole('textbox', { name: 'What is included?' })).toHaveFocus();
    fireEvent.change(screen.getByRole('textbox', { name: 'What is included?' }), { target: { value: 'Too short' } });
    expect(screen.getByRole('textbox', { name: 'What is included?' })).toHaveAccessibleDescription(/Use 30–1,000 characters/);
    fireEvent.change(screen.getByRole('textbox', { name: 'What is included?' }), { target: { value: description } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(createServiceListing).not.toHaveBeenCalled();
  });
  it('offers only pricing that shows a definite amount before booking', () => {
    render(<OfferServices />); toPrice();
    for (const name of ['Fixed Price', 'Per Hour', 'Per Day', 'Per Project']) expect(screen.getByRole('option', { name })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Starts At' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Custom' })).not.toBeInTheDocument();
    expect(createServiceListing).not.toHaveBeenCalled();
  });
  it('publishes a base area without asking for a travel limit', async () => {
    render(<OfferServices />); fillDetails(); next();
    fireEvent.click(screen.getByTestId('test-location'));
    expect(screen.queryByLabelText(/How far will you travel/)).not.toBeInTheDocument();
    next(); next(); await waitFor(() => expect(screen.getByText(/Saved number ending/)).toBeVisible()); next();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(createServiceListing).toHaveBeenCalledWith('provider-id', 'KITCHEN PIPE REPAIR', 'category-cuid', 500, description, { cash: true, gcash: true }, expect.objectContaining({ serviceLocationMode: 'PROVIDER_VISITS', coverageRadiusKm: null, venueAddress: null })));
  });
  it.each(['The seeker comes to you', 'Either option'])('requires a venue for %s and preserves its conditional payload', async choice => {
    render(<OfferServices />); toPrice();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(choice) })); next();
    expect(createServiceListing).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Mark the place where seekers can visit you');
    if (choice === 'The seeker comes to you') expect(screen.queryByLabelText('How far will you travel? (required)')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('test-location'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Address or directions for the seeker (optional)' }), { target: { value: 'Shop beside the barangay hall' } });
    next(); next(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(createServiceListing).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(String), 500, description, expect.any(Object), expect.objectContaining({ serviceLocationMode: choice === 'Either option' ? 'BOTH' : 'SEEKER_VISITS', coverageRadiusKm: null, venueAddress: 'Shop beside the barangay hall', transportationFee: null })));
  });
  it('publishes without a coverage circle and resets only on success', async () => {
    createServiceListing.mockResolvedValue({ success: true });
    render(<OfferServices />); toPrice();
    expect(screen.getByTestId('test-location')).toHaveAttribute('data-radius', '');
    next(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0'));
    expect(screen.getByRole('textbox', { name: 'Service name' })).toHaveValue('');
    expect(createServiceListing).toHaveBeenCalledWith('provider-id', 'KITCHEN PIPE REPAIR', 'category-cuid', 500, description, { cash: true, gcash: true }, expect.objectContaining({ coverageRadiusKm: null }));
  });
  it('returns server moderation rejection to Details without losing the draft', async () => {
    createServiceListing.mockResolvedValue({ success: false, field: 'title', error: 'Remove hateful or abusive language before publishing.' });
    render(<OfferServices />); toReview();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    expect(await screen.findByText(/Remove hateful or abusive language before publishing/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Service name' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'Service name' })).toHaveValue('KITCHEN PIPE REPAIR');
    expect(createServiceListing).toHaveBeenCalledTimes(1);
  });
  it('preserves photos and all pricing/payment choices through review edits', async () => {
    render(<OfferServices />);
    fireEvent.click(screen.getByRole('button', { name: 'Add test photo' })); toPrice();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Service price (₱)' }), { target: { value: '900' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'How do you charge?' }), { target: { value: 'PER_HOUR' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Time needed (minutes)' }), { target: { value: '45' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Your travel fee/ }), { target: { value: '75.50' } });
    next(); fireEvent.click(screen.getByRole('checkbox', { name: /GCash/ })); next();
    expect(screen.getByText('1 photo added')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Edit service details' }));
    expect(screen.getByRole('textbox', { name: 'Service name' })).toHaveValue('KITCHEN PIPE REPAIR');
    expect(screen.getByText('1 uploaded photos')).toBeVisible(); next(); next();
    expect(screen.getByRole('spinbutton', { name: 'Service price (₱)' })).toHaveValue(900);
    expect(screen.getByRole('combobox', { name: 'How do you charge?' })).toHaveValue('PER_HOUR'); next();
    expect(screen.getByRole('checkbox', { name: /GCash/ })).not.toBeChecked(); next();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(createServiceListing).toHaveBeenCalledWith('provider-id', 'KITCHEN PIPE REPAIR', 'category-cuid', 900, description, { cash: true, gcash: false }, expect.objectContaining({ photoIds: ['photo-1'], priceType: 'PER_HOUR', estimatedDurationMins: 45, transportationFee: 75.5 })));
  });
  it('honors the existing native price and duration bounds before Payment', () => {
    render(<OfferServices />); toPrice();
    for (const price of ['49', '50001', '500.5']) {
      fireEvent.change(screen.getByRole('spinbutton', { name: 'Service price (₱)' }), { target: { value: price } }); next();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    }
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Service price (₱)' }), { target: { value: '500' } });
    for (const duration of ['14', '481', '17']) {
      fireEvent.change(screen.getByRole('spinbutton', { name: 'Time needed (minutes)' }), { target: { value: duration } }); next();
      expect(screen.getByRole('spinbutton', { name: 'Time needed (minutes)' })).toHaveAccessibleDescription(/Enter 15–480 minutes/);
      expect(screen.getByRole('spinbutton', { name: 'Time needed (minutes)' })).toHaveFocus();
    }
    expect(createServiceListing).not.toHaveBeenCalled();
  });
  it('requires a payment choice before Review', () => {
    render(<OfferServices />); toPrice(); next();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cash in person' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /GCash/ })); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    expect(screen.queryByRole('button', { name: 'Publish service' })).not.toBeInTheDocument();
    expect(createServiceListing).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cash in person' })); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
  it('blocks navigation while photos upload', () => {
    render(<OfferServices />); fillDetails();
    fireEvent.click(screen.getByRole('button', { name: 'Start upload' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    act(() => finishUpload()); next();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });
  it('preserves verification restrictions on navigation', () => {
    vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: false, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
    render(<OfferServices />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Service name' })).toBeDisabled();
  });
  it('keeps a suspended verified provider from publishing and explains suspension instead of re-verification', () => {
    vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: false, isSuspended: true, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
    render(<OfferServices />);
    expect(screen.getByRole('textbox', { name: 'Service name' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByText('Publishing is unavailable while suspended.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Verify Now' })).not.toBeInTheDocument();
    expect(createServiceListing).not.toHaveBeenCalled();
  });
  it('revalidates categories before final publication', () => {
    const view = render(<OfferServices />); toReview();
    vi.mocked(useApp).mockReturnValue({ ...useApp(), dbCategories: [] }); view.rerender(<OfferServices />);
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(createServiceListing).not.toHaveBeenCalled();
  });
  it('prevents duplicate publishes while the existing create call is pending', async () => {
    let resolve!: (value: { success: boolean }) => void;
    createServiceListing.mockReturnValue(new Promise(done => { resolve = done; }));
    render(<OfferServices />); toReview();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    fireEvent.submit(screen.getByRole('form', { name: 'Create a service listing' }));
    expect(createServiceListing).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    await act(async () => resolve({ success: false }));
    expect(screen.getByRole('button', { name: 'Publish service' })).toBeEnabled();
  });
  it('retains the review and releases the controls if creation throws', async () => {
    createServiceListing.mockRejectedValue(new Error('Service unavailable'));
    render(<OfferServices />); toReview();
    fireEvent.click(screen.getByRole('button', { name: 'Publish service' }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Could not publish your service', 'Service unavailable'));
    expect(screen.getByRole('button', { name: 'Publish service' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit service details' }));
    expect(screen.getByRole('textbox', { name: 'Service name' })).toHaveValue('KITCHEN PIPE REPAIR');
  });
});

it('blocks GCash publication without a saved number and permits Cash only', () => {
  walletState.ready = false;
  render(<OfferServices />); toPrice(); next(); next();
  expect(screen.getByRole('alert')).toHaveTextContent('Save a valid GCash number');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  expect(createServiceListing).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: /GCash/ })); next();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
});
