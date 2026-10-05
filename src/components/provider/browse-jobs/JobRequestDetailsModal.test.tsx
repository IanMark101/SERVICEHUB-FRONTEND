import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobRequest } from '../../../types';
import JobRequestDetailsModal from './JobRequestDetailsModal';

vi.mock('../../moderation/ContentCaseAction', () => ({ default: () => null }));
const request: JobRequest = { id: 'request-1', seekerId: 'client-1', seekerName: 'Sample Client', seekerAvatar: '', title: 'Repair a jammed wooden door', category: 'Carpentry & Woodwork', description: 'The door scrapes against the frame.', budget: 150, urgency: 'Flexible', status: 'OPEN', createdAt: '2026-09-29T00:00:00Z', paymentMethods: { cash: true, gcash: false }, offersCount: 2 };
const props = () => ({ request, isOpen: true, onClose: vi.fn(), onOpenBid: vi.fn(), isOwned: false, hasSentBid: false, canTransact: true, onOpenBlockedModal: vi.fn(), isDark: false, router: { push: vi.fn() } });

describe('JobRequestDetailsModal actions', () => {
  it('passes the request, budget, and listed service to the existing offer flow', () => {
    const inputs = { ...props(), request: { ...request, targetServiceId: 'service-1' } };
    render(<JobRequestDetailsModal {...inputs} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(inputs.onClose).toHaveBeenCalledOnce();
    expect(inputs.onOpenBid).toHaveBeenCalledWith('request-1', 150, 'service-1');
  });
  it('keeps the transaction restriction before opening an offer', () => {
    const inputs = { ...props(), canTransact: false };
    render(<JobRequestDetailsModal {...inputs} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(inputs.onOpenBlockedModal).toHaveBeenCalledOnce();
    expect(inputs.onOpenBid).not.toHaveBeenCalled();
  });
  it('shows an accepted offer without allowing another proposal', () => {
    render(<JobRequestDetailsModal {...props()} hasSentBid previousOffer={{ status: 'ACCEPTED' }} isDark />);
    expect(screen.getByText('Offer accepted')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
  });
  it('keeps own requests separate from bidding and supports profile navigation', () => {
    const inputs = { ...props(), isOwned: true };
    render(<JobRequestDetailsModal {...inputs} />);
    expect(screen.getByText('Your Request')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View Profile' }));
    expect(inputs.router.push).toHaveBeenCalledWith('/profile/client-1');
  });
});
