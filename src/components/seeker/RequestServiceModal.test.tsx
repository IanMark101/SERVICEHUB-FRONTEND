import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import { apiBookDirect } from '../../api/bookings.api';
import RequestServiceModal from './RequestServiceModal';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../api/bookings.api', () => ({ apiBookDirect: vi.fn() }));
vi.mock('../../api/ai.api', () => ({
  getCachedProviderSummary: () => ({ data: { summary: 'Previous customers were satisfied.', source: 'computed' } }),
  apiGetProviderSummary: vi.fn().mockResolvedValue({ success: true, data: { summary: 'Previous customers were satisfied.', source: 'computed' } }),
}));

const listing: ServiceListing = {
  id: 'fixed-listing', providerId: 'provider-1', providerName: 'Ian', providerAvatar: '',
  title: 'House Cleaning', category: 'House Cleaning', description: 'Clean the house',
  price: 500, queueSize: 0, isPaused: false, proofOfSkillUrl: '', rating: 0, reviewCount: 0,
  priceType: 'FIXED', paymentMethods: { cash: true, gcash: true },
};
const online = vi.fn();

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
    expect(screen.getByRole('button', { name: 'On-site Cash' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /GCash/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Describe exactly what needs to be done/), { target: { value: 'Please clean the kitchen and living room.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Request' }));
    await waitFor(() => expect(apiBookDirect).toHaveBeenCalledWith({
      serviceId: 'fixed-listing', quantity: 1, message: 'Please clean the kitchen and living room.', schedule: undefined,
    }));
    expect(online).not.toHaveBeenCalled();
  });

  it('offers only GCash for a GCash-only listing', () => {
    render(<RequestServiceModal listing={{ ...listing, paymentMethods: { cash: false, gcash: true } }} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /GCash · Test Mode/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'On-site Cash' })).not.toBeInTheDocument();
  });

  it('allows both supported methods when the provider selected both', () => {
    render(<RequestServiceModal listing={listing} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /GCash · Test Mode/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'On-site Cash' })).toBeInTheDocument();
  });

  it('books an hourly listing directly with the chosen duration and payment method', async () => {
    vi.mocked(apiBookDirect).mockResolvedValue({ success: true });
    render(<RequestServiceModal listing={{ ...listing, priceType: 'PER_HOUR' }} onClose={vi.fn()} />);
    expect(screen.getByText('Displayed listing rate')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Number of hours'), { target: { value: '2' } });
    expect(screen.getByText('Total: ₱1,000')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Describe exactly what needs to be done/), { target: { value: 'Please clean the kitchen and living room.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Request' }));
    await waitFor(() => expect(apiBookDirect).toHaveBeenCalledWith({
      serviceId: 'fixed-listing', quantity: 2, message: 'Please clean the kitchen and living room.', schedule: undefined,
    }));
    expect(online).not.toHaveBeenCalled();
  });

  it('passes the selected GCash method and quantity into direct checkout', async () => {
    render(<RequestServiceModal listing={{ ...listing, priceType: 'PER_DAY' }} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Number of days'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /GCash · Test Mode/ }));
    fireEvent.change(screen.getByPlaceholderText(/Describe exactly what needs to be done/), { target: { value: 'Please clean the kitchen and living room.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to GCash' }));
    await waitFor(() => expect(online).toHaveBeenCalledWith('seeker-1', 'fixed-listing', 500, 'Please clean the kitchen and living room.', 'GCash', 3));
  });

  it('hands checkout to the workspace dialog without claiming a booking or keeping the request dialog open', async () => {
    const onClose = vi.fn();
    online.mockResolvedValueOnce({ seekerId: 'seeker-1', paymentIntentId: 'pi_pending' });
    render(<RequestServiceModal listing={listing} onClose={onClose} initialPaymentMethod="GCash" />);
    fireEvent.change(screen.getByLabelText('Describe the work needed'), { target: { value: 'Fix the kitchen.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to GCash' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Booking Created Successfully!')).not.toBeInTheDocument();
  });

  it('keeps the request form and description when checkout initiation fails', async () => {
    const onClose = vi.fn();
    online.mockRejectedValueOnce(new Error('Checkout unavailable'));
    render(<RequestServiceModal listing={listing} onClose={onClose} initialPaymentMethod="GCash" />);
    fireEvent.change(screen.getByLabelText('Describe the work needed'), { target: { value: 'Fix the kitchen.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to GCash' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Checkout unavailable');
    expect(screen.getByLabelText('Describe the work needed')).toHaveValue('Fix the kitchen.');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not book an older custom-priced listing without a final price', () => {
    render(<RequestServiceModal listing={{ ...listing, priceType: 'CUSTOM', price: 0 }} onClose={vi.fn()} />);
    expect(screen.getByText('Price unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Price Needed Before Booking' })).toBeDisabled();
    expect(apiBookDirect).not.toHaveBeenCalled();
  });
});
