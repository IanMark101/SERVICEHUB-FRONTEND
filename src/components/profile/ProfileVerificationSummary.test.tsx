import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProfileVerificationSummary from './ProfileVerificationSummary';

describe('Profile verification summary', () => {
  it('shows approval and directs the owner to private settings', () => {
    render(<ProfileVerificationSummary status="APPROVED" isOwnProfile />);
    expect(screen.getByRole('heading', { name: 'Identity and residency verified' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage verification' })).toHaveAttribute('href', '/account/settings#verification');
    expect(screen.getByText(/Identity documents and review messages remain private/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });

  it.each(['PENDING_REVIEW', 'PENDING'])('explains %s without asking for duplicate submissions', status => {
    render(<ProfileVerificationSummary status={status} isOwnProfile />);
    expect(screen.getByRole('heading', { name: 'Verification under review' })).toBeInTheDocument();
    expect(screen.getByText(/You do not need to submit them again/)).toBeInTheDocument();
    expect(screen.queryByText(/24.*48 hours/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Start verification' })).not.toBeInTheDocument();
  });

  it('sends a rejected owner to actual feedback without inventing a rejection reason', () => {
    render(<ProfileVerificationSummary status="REJECTED" isOwnProfile />);
    expect(screen.getByRole('heading', { name: 'Your submission needs attention' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review feedback' })).toHaveAttribute('href', '/account/settings#verification');
    expect(screen.queryByText(/unreadable|incomplete photos/i)).not.toBeInTheDocument();
  });

  it.each(['APPROVED', 'PENDING_REVIEW', 'REJECTED', 'UNVERIFIED'])('keeps %s on another member’s profile read-only', status => {
    render(<ProfileVerificationSummary status={status} isOwnProfile={false} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(/Action needed|submission needs attention|rejection/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/upload/i)).not.toBeInTheDocument();
  });

  it('gives an unverified owner a clear starting action', () => {
    render(<ProfileVerificationSummary status="UNVERIFIED" isOwnProfile />);
    expect(screen.getByRole('link', { name: 'Start verification' })).toHaveAttribute('href', '/account/settings#verification');
  });

  it('does not claim an unknown status is unverified', () => {
    render(<ProfileVerificationSummary status="UNKNOWN" isOwnProfile={false} />);
    expect(screen.getByRole('heading', { name: 'Verification status unavailable' })).toBeInTheDocument();
    expect(screen.queryByText('Not verified')).not.toBeInTheDocument();
  });

  it('reflects an updated status without retaining the old action', () => {
    const { rerender } = render(<ProfileVerificationSummary status="UNVERIFIED" isOwnProfile />);
    rerender(<ProfileVerificationSummary status="APPROVED" isOwnProfile />);
    expect(screen.getByRole('heading', { name: 'Identity and residency verified' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Start verification' })).not.toBeInTheDocument();
  });
});
