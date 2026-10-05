import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ServiceListing } from '../../../types';
import ServiceDetailsModal from './ServiceDetailsModal';

vi.mock('../../moderation/ContentCaseAction', () => ({ default: () => null }));

const mockListing: ServiceListing = {
  id: 'service-clean-1',
  providerId: 'provider-10',
  providerName: 'Maria Santos',
  providerAvatar: '',
  title: 'Full Deep Home Cleaning',
  category: 'House Cleaning',
  description: 'Thorough cleaning service including sanitizing bathrooms, kitchens, and dusting.',
  price: 750,
  queueSize: 1,
  queueLimit: 5,
  providerWaitingCount: 1,
  isPaused: false,
  proofOfSkillUrl: '',
  rating: 4.8,
  reviewCount: 15,
  providerTrustScore: 92,
  providerVerificationStatus: 'APPROVED',
  priceType: 'FIXED',
  estimatedDurationMins: 120,
  paymentMethods: { cash: true, gcash: true },
};

describe('ServiceDetailsModal', () => {
  const defaultProps = {
    listing: mockListing,
    isOpen: true,
    onClose: vi.fn(),
    onBookListing: vi.fn(),
    onJoinWaitlist: vi.fn(),
    joiningWaitlistId: null,
    isOwned: false,
    activeEngagement: undefined,
    isDark: false,
    router: { push: vi.fn() },
    prefetchProviderSummary: vi.fn(),
  };

  it('renders modal content correctly when open', () => {
    render(<ServiceDetailsModal {...defaultProps} />);

    expect(screen.getByText('Full Deep Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    expect(screen.getByText(/Thorough cleaning service including sanitizing/)).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Trust 92/100')).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 5 waiting/)).toBeInTheDocument();
    expect(screen.getByText('Estimated duration')).toBeInTheDocument();
    expect(screen.getByText('120 minutes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book This Service' })).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ServiceDetailsModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Close service details' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onBookListing when Book This Service button is clicked', () => {
    const onBookListing = vi.fn();
    const onClose = vi.fn();
    render(<ServiceDetailsModal {...defaultProps} onBookListing={onBookListing} onClose={onClose} />);

    const bookBtn = screen.getByRole('button', { name: 'Book This Service' });
    fireEvent.click(bookBtn);

    expect(onBookListing).toHaveBeenCalledWith(mockListing, 'On-site Cash');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders waitlist options when queue is full', () => {
    const fullListing = { ...mockListing, providerWaitingCount: 5, queueSize: 5 };
    const onJoinWaitlist = vi.fn();
    render(<ServiceDetailsModal {...defaultProps} listing={fullListing} onJoinWaitlist={onJoinWaitlist} />);

    expect(screen.getByText(/Online queue is currently full/)).toBeInTheDocument();
    const notifyBtn = screen.getByRole('button', { name: /Notify Me/ });
    fireEvent.click(notifyBtn);
    expect(onJoinWaitlist).toHaveBeenCalledWith(fullListing);
  });

  it('does not render when isOpen is false', () => {
    render(<ServiceDetailsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Full Deep Home Cleaning')).not.toBeInTheDocument();
  });

  it('shows scheduling instead of a full queue for cash-only listings', () => {
    const cashListing = { ...mockListing, paymentMethods: { cash: true, gcash: false }, providerWaitingCount: 5 };
    const onBookListing = vi.fn();
    render(<ServiceDetailsModal {...defaultProps} listing={cashListing} onBookListing={onBookListing} />);

    expect(screen.getByRole('heading', { name: 'Scheduling' })).toBeInTheDocument();
    expect(screen.getByText(/Subject to provider approval/)).toBeInTheDocument();
    expect(screen.queryByText(/waiting/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Notify Me/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Book This Service' }));
    expect(onBookListing).toHaveBeenCalledWith(cashListing, 'On-site Cash');
  });

  it('removes queue and waitlist controls when an edited listing becomes cash-only', () => {
    const fullListing = { ...mockListing, providerWaitingCount: 5 };
    const { rerender } = render(<ServiceDetailsModal {...defaultProps} listing={fullListing} />);
    expect(screen.getByRole('heading', { name: 'Online queue · GCash bookings only' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notify Me/ })).toBeInTheDocument();

    rerender(<ServiceDetailsModal {...defaultProps} listing={{ ...fullListing, paymentMethods: { cash: true, gcash: false } }} />);
    expect(screen.queryByRole('heading', { name: /Online queue/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Notify Me/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book This Service' })).toBeInTheDocument();
  });

  it('keeps GCash-only waitlist access without offering direct cash', () => {
    render(<ServiceDetailsModal {...defaultProps} listing={{ ...mockListing, providerWaitingCount: 5, paymentMethods: { cash: false, gcash: true } }} />);
    expect(screen.getByRole('button', { name: 'Notify Me When Open' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Direct Cash' })).not.toBeInTheDocument();
    expect(screen.queryByText(/On-site Cash requests remain/)).not.toBeInTheDocument();
  });

  it('books with GCash without claiming immediate availability when its queue is empty', () => {
    const onlineListing = { ...mockListing, providerWaitingCount: 0, paymentMethods: { cash: false, gcash: true } };
    const onBookListing = vi.fn();
    render(<ServiceDetailsModal {...defaultProps} listing={onlineListing} onBookListing={onBookListing} />);
    expect(screen.getByText(/The provider confirms when work starts/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Book This Service' }));
    expect(onBookListing).toHaveBeenCalledWith(onlineListing, 'GCash');
  });
});
