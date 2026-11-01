import { selectWorkLocation } from '../../../test/selectWorkLocation';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProposalModal from './ProposalModal';
import type { JobRequest, ServiceListing } from '../../../types';

vi.mock('../../ui/ReviewSummaryPanel', () => ({ default: () => null }));
vi.mock('../../location/LocationField', () => ({ default: ({ onChange, error }: { onChange: (point: object) => void; error?: string }) => <div><button type="button" onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cordova workshop', address: 'Private entrance' })}>Choose test venue</button>{error && <p role="alert">{error}</p>}</div> }));
const request = { id: 'request', seekerId: 'seeker', seekerName: 'Client', title: 'Repair a laptop', category: 'Repair', urgency: 'This Week', budget: 500, serviceLocationMode: 'BOTH', locationLabel: 'Customer area' } as JobRequest;
const listing = { id: 'listing', title: 'Laptop repair', serviceLocationMode: 'SEEKER_VISITS', locationLabel: 'Workshop area' } as ServiceListing;
const props = { request, listings: [], serviceId: '', onServiceChange: vi.fn(), isSubmitting: false, isDark: false, price: 500, duration: 60, message: 'Repair the laptop.', availability: '', onAvailabilityChange: vi.fn(), onPriceChange: vi.fn(), onDurationChange: vi.fn(), onMessageChange: vi.fn(), onClose: vi.fn() };
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }));
const review = () => fireEvent.click(screen.getByRole('button', { name: 'Review offer' }));
function Draft({ onSubmit, ...overrides }: Partial<ComponentProps<typeof ProposalModal>>) {
  const [price, onPriceChange] = useState(500);
  const [duration, onDurationChange] = useState(60);
  const [message, onMessageChange] = useState('Repair the laptop.');
  const [availability, onAvailabilityChange] = useState('');
  return <ProposalModal {...props} price={price} onPriceChange={onPriceChange} duration={duration} onDurationChange={onDurationChange} message={message} onMessageChange={onMessageChange} availability={availability} onAvailabilityChange={onAvailabilityChange} onSubmit={onSubmit ?? vi.fn()} {...overrides} />;
}

beforeEach(() => vi.clearAllMocks());

describe('provider offer service arrangement', () => {
  it('sends a remote proposal with no venue and blocks a visit-only linked listing', () => {
    const submit = vi.fn();
    const view = render(<ProposalModal {...props} request={{ ...request, serviceLocationMode:'REMOTE' }} onSubmit={submit} />);
    next();
    expect(screen.queryByRole('button', { name:'Choose test venue' })).not.toBeInTheDocument();
    review();
    fireEvent.click(screen.getByRole('button', { name:'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode:'REMOTE' });
    view.rerender(<ProposalModal {...props} request={{ ...request, serviceLocationMode:'REMOTE' }} listings={[listing]} serviceId="listing" onSubmit={submit} />);
    expect(screen.getByRole('button', { name:'Send Offer' })).toBeDisabled();
  });
  it('requires a venue for a custom seeker-visit offer and sends that private pin', () => {
    const submit = vi.fn();
    render(<ProposalModal {...props} onSubmit={submit} />);
    next();
    selectWorkLocation(/At your place/);
    review();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Choose your service venue');
    fireEvent.click(screen.getByRole('button', { name: 'Choose test venue' }));
    review();
    expect(screen.getByRole('group', { name: 'Review your offer' })).toHaveTextContent('Private entrance');
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode: 'SEEKER_VISITS', providerVenue: { latitude: 10.3, longitude: 123.9, label: 'Cordova workshop', address: 'Private entrance' } });
  });
  it('uses a compatible listing’s saved venue without requesting another pin', () => {
    const submit = vi.fn();
    render(<ProposalModal {...props} listings={[listing]} serviceId="listing" onSubmit={submit} />);
    next();
    expect(screen.getByText('Saved business address · shared privately after booking.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose test venue' })).not.toBeInTheDocument();
    review();
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode: 'SEEKER_VISITS' });
  });
  it('blocks an offer when the listing and request arrangements are incompatible', () => {
    render(<ProposalModal {...props} request={{ ...request, serviceLocationMode: 'PROVIDER_VISITS' }} listings={[listing]} serviceId="listing" onSubmit={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('does not support');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

describe('provider offer wizard', () => {
  it('moves through all three steps without sending until the final confirmation', () => {
    const submit = vi.fn();
    render(<ProposalModal {...props} request={{ ...request, paymentMethods: { cash: true, gcash: true } }} onSubmit={submit} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 1 of 3: Your offer');
    expect(screen.queryByRole('combobox', { name: 'Work location' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: 'Send an offer' }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 2 of 3: Location & schedule');
    expect(screen.queryByRole('spinbutton', { name: 'Your price (₱)' })).not.toBeInTheDocument();
    review();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    const summary = screen.getByRole('group', { name: 'Review your offer' });
    expect(summary).toHaveTextContent('₱500.00');
    expect(summary).toHaveTextContent('Repair the laptop.');
    expect(within(summary).getByRole('region', { name: 'Request payment methods' })).toHaveTextContent('Cash');
    expect(within(summary).getByText('GCash · Test Mode')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).toHaveBeenCalledOnce();
  });

  it('preserves prices, message, location and availability through Back and Edit', () => {
    const submit = vi.fn();
    render(<Draft onSubmit={submit} />);
    fireEvent.change(screen.getByLabelText('Your price (₱)'), { target: { value: '625.50' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Offer details'), { target: { value: 'Inspection and repairs included.' } });
    next();
    selectWorkLocation(/At your place/);
    fireEvent.click(screen.getByRole('button', { name: 'Choose test venue' }));
    fireEvent.change(screen.getByLabelText('Availability (optional)'), { target: { value: 'Saturday morning' } });
    review();
    fireEvent.click(screen.getByRole('button', { name: 'Edit your offer' }));
    expect(screen.getByLabelText('Your price (₱)')).toHaveValue(625.5);
    expect(screen.getByLabelText('Duration (minutes)')).toHaveValue(90);
    expect(screen.getByLabelText('Offer details')).toHaveValue('Inspection and repairs included.');
    next();
    expect(screen.getByRole('combobox', { name: 'Work location' })).toHaveValue('SEEKER_VISITS');
    expect(screen.getByLabelText('Availability (optional)')).toHaveValue('Saturday morning');
    review();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    review();
    expect(screen.getByRole('group', { name: 'Review your offer' })).toHaveTextContent('₱625.50');
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ providerVenue: expect.objectContaining({ address: 'Private entrance' }) }));
  });

  it.each([
    { price: 49, duration: 60, message: props.message, field: 'Your price (₱)' },
    { price: 50000.01, duration: 60, message: props.message, field: 'Your price (₱)' },
    { price: 50.001, duration: 60, message: props.message, field: 'Your price (₱)' },
    { price: 500, duration: 14, message: props.message, field: 'Duration (minutes)' },
    { price: 500, duration: 60.5, message: props.message, field: 'Duration (minutes)' },
    { price: 500, duration: 481, message: props.message, field: 'Duration (minutes)' },
    { price: 500, duration: 60, message: ' ', field: 'Offer details' },
  ])('blocks invalid draft fields before leaving Your offer: $field / $price / $duration', ({ field, ...draft }) => {
    const submit = vi.fn();
    render(<ProposalModal {...props} {...draft} onSubmit={submit} />);
    next();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByLabelText(field)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(field)).toHaveFocus();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(submit).not.toHaveBeenCalled();
  });

  it('revalidates earlier fields on final submission if the draft changes', () => {
    const submit = vi.fn();
    const view = render(<ProposalModal {...props} onSubmit={submit} />);
    next(); review();
    view.rerender(<ProposalModal {...props} price={0} onSubmit={submit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Your price (₱)')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('uses the same wizard for listing quotes, with the requested service fixed', () => {
    const submit = vi.fn();
    const remoteListing = { ...listing, serviceLocationMode: 'REMOTE' } as ServiceListing;
    render(<Draft request={{ ...request, targetServiceId: listing.id, serviceLocationMode: 'REMOTE' }} listings={[remoteListing]} serviceId={listing.id} onSubmit={submit} />);
    expect(screen.getByRole('dialog', { name: 'Send Quote' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Service listing (requested by the customer)' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('What’s included'), { target: { value: 'Short' } });
    next();
    expect(screen.getByRole('alert')).toHaveTextContent('10–2,000');
    fireEvent.change(screen.getByLabelText('What’s included'), { target: { value: 'Online diagnostics and advice.' } });
    next();
    expect(screen.queryByRole('button', { name: 'Choose test venue' })).not.toBeInTheDocument();
    expect(screen.getByText('No travel required.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review quote' }));
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Send Quote' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode: 'REMOTE' });
  });

  it('disables navigation, editing and dismissal during submission', () => {
    const submit = vi.fn();
    const view = render(<ProposalModal {...props} onSubmit={submit} />);
    next(); review();
    view.rerender(<ProposalModal {...props} isSubmitting onSubmit={submit} />);
    for (const name of ['Back', 'Close offer form', 'Edit your offer', 'Edit location and schedule', 'Sending offer…']) expect(screen.getByRole('button', { name })).toBeDisabled();
    fireEvent.submit(screen.getByRole('form', { name: 'Send an offer' }));
    expect(submit).not.toHaveBeenCalled();
  });
});
