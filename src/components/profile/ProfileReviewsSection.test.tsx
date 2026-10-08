import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProfileReviewsSection from './ProfileReviewsSection';

const props = { isDark: false, cardBg: '', innerBg: '', labelText: '', headingText: '' };
const clientReview = { id: 'client-review', authorName: 'Ian', rating: 5, comment: 'kunohay', createdAt: 'Oct 7, 2026', reviewContext: 'SEEKER' as const };
const serviceReview = { id: 'service-review', authorName: 'Client', rating: 2, comment: 'The repair was incomplete.', createdAt: 'Oct 6, 2026', reviewContext: 'PROVIDER' as const };

describe('profile review roles', () => {
  it('opens the requested seeker role for a member with reviews in both roles', () => {
    const { rerender } = render(<ProfileReviewsSection {...props} initialReviewContext="SEEKER" initialReviews={[clientReview, serviceReview]} />);
    expect(screen.getByRole('tab', { name: 'Reviews as Service Seeker 1' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('kunohay')).toBeInTheDocument();
    expect(screen.queryByText('The repair was incomplete.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Reviews as Service Provider 1' }));
    rerender(<ProfileReviewsSection {...props} initialReviewContext="SEEKER" initialReviews={[clientReview, serviceReview]} />);
    expect(screen.getByText('The repair was incomplete.')).toBeInTheDocument();
    rerender(<ProfileReviewsSection {...props} initialReviewContext="PROVIDER" initialReviews={[clientReview, serviceReview]} />);
    rerender(<ProfileReviewsSection {...props} initialReviewContext="SEEKER" initialReviews={[clientReview, serviceReview]} />);
    expect(screen.getByText('kunohay')).toBeInTheDocument();
  });

  it('keeps an explicitly requested empty seeker role separate from provider reviews', () => {
    render(<ProfileReviewsSection {...props} initialReviewContext="SEEKER" initialReviews={[serviceReview]} />);
    expect(screen.getByText('No seeker reviews yet')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /stars/ })).not.toBeInTheDocument();
  });
  it('labels the screenshot’s five-star review as client feedback without inventing service reviews', () => {
    render(<ProfileReviewsSection {...props} initialReviews={[clientReview]} />);
    expect(screen.getByRole('tab', { name: 'Reviews as Service Seeker 1' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Reviews as Service Seeker (1)' })).toBeInTheDocument();
    expect(screen.getByText('kunohay')).toBeInTheDocument();
    expect(screen.getByText(/Reviewed as a service seeker by a service provider/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Reviews as Service Provider 0' }));
    expect(screen.getByText('No provider reviews yet')).toBeInTheDocument();
    expect(screen.queryByText('kunohay')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /stars/ })).not.toBeInTheDocument();
  });

  it('keeps each role’s comments, average and distribution separate', () => {
    render(<ProfileReviewsSection {...props} initialReviews={[clientReview, serviceReview]} />);
    expect(screen.getByRole('img', { name: '2.0 out of 5 stars' })).toBeInTheDocument();
    expect(screen.getByText('The repair was incomplete.')).toBeInTheDocument();
    expect(screen.queryByText('kunohay')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Reviews as Service Seeker 1' }));
    expect(screen.getByRole('img', { name: '5.0 out of 5 stars' })).toBeInTheDocument();
    expect(screen.queryByText('The repair was incomplete.')).not.toBeInTheDocument();
  });

  it('uses full role totals rather than averaging only the loaded comments', () => {
    const reviewStats = {
      PROVIDER: { reviewCount: 12, averageRating: 4, ratingDistribution: [{ star: 5, count: 6 }, { star: 3, count: 6 }] },
      SEEKER: { reviewCount: 0, averageRating: 0, ratingDistribution: [] },
    };
    render(<ProfileReviewsSection {...props} initialReviews={[{ ...serviceReview, rating: 5 }]} reviewStats={reviewStats} />);
    expect(screen.getByRole('heading', { name: 'Reviews as Service Provider (12)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '4.0 out of 5 stars' })).toBeInTheDocument();
    expect(screen.getByText(/Showing the 1 latest provider reviews/)).toHaveTextContent('Rating totals include all 12 reviews.');
  });

  it('sends review authors to the real completed-booking flow instead of creating a local-only review', () => {
    render(<ProfileReviewsSection {...props} initialReviews={[serviceReview]} isVerified canReview reviewActivityHref="/provider/activity" />);
    expect(screen.getByRole('link', { name: 'Review a completed booking' })).toHaveAttribute('href', '/provider/activity');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
