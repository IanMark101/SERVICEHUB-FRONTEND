import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobRequest } from '../../../types';
import JobRequestCard from './JobRequestCard';

vi.mock('../../moderation/ContentCaseAction', () => ({ default: () => null }));
const request: JobRequest = { id: 'request-1', seekerId: 'resident-1', seekerName: 'Maria Santos', seekerAvatar: '', title: 'Repair my door', category: 'Carpentry & Woodwork', description: 'The wooden door needs repair.', budget: 150, urgency: 'Flexible Schedule', status: 'OPEN', createdAt: '2026-09-29', seekerTrustScore: 79, seekerVerificationStatus: 'APPROVED', seekerRating: 4.5, seekerReviewCount: 2, paymentMethods: { cash: true, gcash: false } };
const props = { request, proposalCount: 0, isOwned: false, offerState: null, isDark: false, onProfile: vi.fn(), onDetails: vi.fn(), onSendOffer: vi.fn() };

describe('request card reputation and actions', () => {
  it('shows client reputation with an accessible verification icon and no Client badge', () => {
    render(<JobRequestCard {...props} />);
    expect(screen.getByLabelText('Trust score: 79 out of 100')).toBeInTheDocument();
    expect(screen.getByLabelText('Verified resident')).toBeInTheDocument();
    expect(screen.queryByText('Verified resident')).not.toBeInTheDocument();
    expect(screen.queryByText('Client')).not.toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View client reviews for Maria Santos' }));
    expect(props.onProfile).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Send Offer' }));
    expect(props.onSendOffer).toHaveBeenCalled();
  });
  it('does not invent a rating or verification for an unreviewed account', () => {
    render(<JobRequestCard {...props} request={{ ...request, seekerRating: 0, seekerReviewCount: 0, seekerVerificationStatus: 'PENDING' }} />);
    expect(screen.getByRole('button', { name: 'View client reviews for Maria Santos' })).toHaveAttribute('title', 'No client reviews yet');
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Verified resident')).not.toBeInTheDocument();
  });
  it('keeps details accessible while preventing offers on an owned request', () => {
    const onDetails = vi.fn();
    render(<JobRequestCard {...props} isOwned onDetails={onDetails} />);
    expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
    expect(screen.getByText(/Your own request/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Inspect/ }));
    expect(onDetails).toHaveBeenCalled();
  });
});
