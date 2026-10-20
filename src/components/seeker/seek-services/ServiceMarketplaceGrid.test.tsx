import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ServiceListing } from '../../../types';
import ServiceMarketplaceGrid from './ServiceMarketplaceGrid';

vi.mock('../../moderation/ContentCaseAction', () => ({ default: () => null }));
vi.mock('../../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('../../../api/savedListings.api', () => ({ apiGetSavedStatus: vi.fn().mockResolvedValue([]), apiSetListingSaved: vi.fn() }));

const listing: ServiceListing = {
  id: 'fixed-listing', providerId: 'provider-1', providerName: 'Ian', providerAvatar: '',
  title: 'House Cleaning', category: 'House Cleaning', description: 'Clean the house',
  price: 500, queueSize: 0, queueLimit: 5, providerWaitingCount: 0,
  isPaused: false, proofOfSkillUrl: '', rating: 0, reviewCount: 0,
  priceType: 'FIXED', paymentMethods: { cash: true, gcash: true },
};

function renderListing(service: ServiceListing) {
  const push = vi.fn();
  const handleBookListing = vi.fn();
  const model = {
    router: { push }, isDark: false, isLoading: false,
    activeFilter: 'all', setActiveFilter: vi.fn(), searchQuery: '', setSearchQuery: vi.fn(),
    selectedCategory: 'All Categories', setSelectedCategory: vi.fn(),
    filteredServices: [service], paginatedServices: [service], currentPage: 1, totalPages: 1,
    goToPage: vi.fn(), nextPage: vi.fn(), prevPage: vi.fn(), startIndex: 0, endIndex: 1,
    getProviderDetails: () => undefined, user: { id: 'seeker-1', role: 'seeker' },
    jobEngagements: [], canTransact: true, setBlockedModalOpen: vi.fn(), handleBookListing,
    handleJoinWaitlist: vi.fn(), joiningWaitlistId: null,
    prefetchProviderSummary: vi.fn(),
  } as unknown as React.ComponentProps<typeof ServiceMarketplaceGrid>['model'];
  render(<ServiceMarketplaceGrid model={model} />);
  return { push, handleBookListing };
}

describe('Find Services listing booking entry point', () => {
  it('requests an agreement price even when the paid queue is full and never displays zero as a price', () => {
    const agreement = { ...listing, price: 0, priceType: 'BY_AGREEMENT' as const, providerWaitingCount: 5, queueSize: 5 };
    const { handleBookListing } = renderListing(agreement);
    expect(screen.getByText('Quote required')).toBeVisible();
    expect(screen.queryByText(/₱0/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Request a Quote' }));
    expect(handleBookListing).toHaveBeenCalledWith(agreement, 'On-site Cash');
    expect(screen.queryByRole('button', { name: /Join.*waitlist/i })).not.toBeInTheDocument();
  });
  it('shows only the cover on the card and exposes all three photos through Details', () => {
    const photos = Array.from({ length: 3 }, (_, index) => ({ id: `photo-${index}`, url: `https://res.cloudinary.com/fixture/image/upload/photo-${index}.jpg`, width: 1200, height: 800 }));
    renderListing({ ...listing, photos });
    expect(screen.getByRole('img', { name: 'House Cleaning, cover photo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next photo' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspect House Cleaning details' }));
    expect(screen.getByText('Photo 1 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show photo 3' }));
    expect(screen.getByRole('img', { name: 'House Cleaning — photo 3 of 3' })).toHaveAttribute('src', expect.stringContaining('photo-2.jpg'));
  });
  it('shows the same zero rating format for an unreviewed provider and opens provider reviews', () => {
    const { push } = renderListing(listing);
    expect(screen.getByRole('img', { name: 'No reviews yet as a provider' })).toHaveTextContent('0.0(0)');
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View reviews for Ian' }));
    expect(push).toHaveBeenCalledWith('/profile/provider-1?tab=reviews&reviewRole=provider');
  });

  it('preserves the actual rating and count for reviewed providers', () => {
    renderListing({ ...listing, rating: 4.5, reviewCount: 2 });
    expect(screen.getByRole('img', { name: 'Provider rating: 4.5 out of 5 from 2 reviews' })).toHaveTextContent('4.5(2)');
  });
  it('opens direct booking for a FIXED listing instead of redirecting to Post Request', () => {
    const travelListing = { ...listing, serviceLocationMode:'PROVIDER_VISITS' as const };
    const { push, handleBookListing } = renderListing(travelListing);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect House Cleaning details' }));
    expect(screen.getByText('Cash', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('GCash · Test Mode')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Book Service' }));
    expect(handleBookListing).toHaveBeenCalledWith(travelListing, 'On-site Cash');
    expect(push).not.toHaveBeenCalledWith('/seeker/post-request');
  });

  it.each(['PER_HOUR', 'PER_DAY', 'PER_PROJECT'] as const)(
    'opens the listing booking modal for %s', (priceType) => {
      const variableListing = { ...listing, priceType };
      const { push, handleBookListing } = renderListing(variableListing);
      fireEvent.click(screen.getByRole('button', { name: 'Book Service' }));
      expect(handleBookListing).toHaveBeenCalledWith(variableListing, 'On-site Cash');
      expect(push).not.toHaveBeenCalledWith('/seeker/post-request');
    },
  );

  it.each(['STARTS_AT', 'CUSTOM'] as const)('does not offer booking for an older %s listing', (priceType) => {
    const { handleBookListing } = renderListing({ ...listing, priceType });
    expect(screen.getByText('Quote required')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Book Service' })).not.toBeInTheDocument();
    expect(handleBookListing).not.toHaveBeenCalled();
  });
});
