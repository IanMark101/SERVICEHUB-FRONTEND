import { selectWorkLocation } from '../../../test/selectWorkLocation';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProposalModal from './ProposalModal';
import type { JobRequest, ServiceListing } from '../../../types';

vi.mock('../../ui/ReviewSummaryPanel', () => ({ default: () => null }));
vi.mock('../../location/LocationField', () => ({ default: ({ onChange }: { onChange: (point: object) => void }) => <button type="button" onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cordova workshop', address: 'Private entrance' })}>Choose test venue</button> }));
const request = { id: 'request', seekerId: 'seeker', seekerName: 'Client', title: 'Repair a laptop', category: 'Repair', urgency: 'This Week', budget: 500, serviceLocationMode: 'BOTH', locationLabel: 'Customer area' } as JobRequest;
const listing = { id: 'listing', title: 'Laptop repair', serviceLocationMode: 'SEEKER_VISITS', locationLabel: 'Workshop area' } as ServiceListing;
const props = { request, listings: [], serviceId: '', onServiceChange: vi.fn(), isSubmitting: false, isDark: false, price: 500, duration: 60, message: 'Repair the laptop.', availability: '', onAvailabilityChange: vi.fn(), onPriceChange: vi.fn(), onDurationChange: vi.fn(), onMessageChange: vi.fn(), onClose: vi.fn() };

describe('provider offer service arrangement', () => {
  it('sends a remote proposal with no venue and blocks a visit-only linked listing', () => {
    const submit = vi.fn();
    const view = render(<ProposalModal {...props} request={{ ...request, serviceLocationMode:'REMOTE' }} onSubmit={submit} />);
    expect(screen.queryByRole('button', { name:'Choose test venue' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode:'REMOTE' });
    view.rerender(<ProposalModal {...props} request={{ ...request, serviceLocationMode:'REMOTE' }} listings={[listing]} serviceId="listing" onSubmit={submit} />);
    expect(screen.getByRole('button', { name:'Send Offer' })).toBeDisabled();
  });
  it('requires a venue for a custom seeker-visit offer and sends that private pin', () => {
    const submit = vi.fn();
    render(<ProposalModal {...props} onSubmit={submit} />);
    selectWorkLocation(/At your place/);
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Choose your service venue');
    fireEvent.click(screen.getByRole('button', { name: 'Choose test venue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode: 'SEEKER_VISITS', providerVenue: { latitude: 10.3, longitude: 123.9, label: 'Cordova workshop', address: 'Private entrance' } });
  });
  it('uses a compatible listing’s saved venue without requesting another pin', () => {
    const submit = vi.fn();
    render(<ProposalModal {...props} listings={[listing]} serviceId="listing" onSubmit={submit} />);
    expect(screen.getByText('Saved business address · shared privately after booking.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose test venue' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(submit).toHaveBeenCalledWith(expect.anything(), { serviceLocationMode: 'SEEKER_VISITS' });
  });
  it('blocks an offer when the listing and request arrangements are incompatible', () => {
    render(<ProposalModal {...props} request={{ ...request, serviceLocationMode: 'PROVIDER_VISITS' }} listings={[listing]} serviceId="listing" onSubmit={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('does not support');
    expect(screen.getByRole('button', { name: 'Send Offer' })).toBeDisabled();
  });
});
