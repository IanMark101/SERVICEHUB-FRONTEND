import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ServiceListing } from '../../../types';
import ServiceMarketplaceGrid from './ServiceMarketplaceGrid';

vi.mock('../../moderation/ContentCaseAction', () => ({ default: () => null }));
vi.mock('../../ui/PaginationBar', () => ({ default: () => null }));

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
    handleJoinWaitlist: vi.fn(), joiningWaitlistId: null, setIsSuggestModalOpen: vi.fn(),
    prefetchProviderSummary: vi.fn(),
  } as unknown as React.ComponentProps<typeof ServiceMarketplaceGrid>['model'];
  render(<ServiceMarketplaceGrid model={model} />);
  return { push, handleBookListing };
}

describe('Seek Services listing booking entry point', () => {
  it('shows the same zero rating format for an unreviewed provider and opens provider reviews', () => {
    const { push } = renderListing(listing);
    expect(screen.getByRole('img', { name: 'No reviews yet as a service provider' })).toHaveTextContent('0.0(0)');
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View reviews for Ian' }));
    expect(push).toHaveBeenCalledWith('/profile/provider-1?tab=reviews&reviewRole=provider');
  });

  it('preserves the actual rating and count for reviewed providers', () => {
    renderListing({ ...listing, rating: 4.5, reviewCount: 2 });
    expect(screen.getByRole('img', { name: 'Service provider rating: 4.5 out of 5 from 2 reviews' })).toHaveTextContent('4.5(2)');
  });
  it('opens direct booking for a FIXED listing instead of redirecting to Post Request', () => {
    const { push, handleBookListing } = renderListing(listing);
    expect(screen.getByText('Accepted payment methods')).toBeInTheDocument();
    expect(screen.getByText('On-site Cash')).toBeInTheDocument();
    expect(screen.getByText('GCash · Test Mode')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Book Service' }));
    expect(handleBookListing).toHaveBeenCalledWith(listing, 'On-site Cash');
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
    expect(screen.getByText('Price unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Book Service' })).not.toBeInTheDocument();
    expect(handleBookListing).not.toHaveBeenCalled();
  });
});
