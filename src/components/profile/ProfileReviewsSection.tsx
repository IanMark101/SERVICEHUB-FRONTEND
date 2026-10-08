"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Star, MessageSquare, Lock } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../ui/PaginationBar';
import WorkspaceTabs from '../ui/WorkspaceTabs';
import type { ProfileReviewContext, ProfileReviewStatsByContext } from '../../types/reviews';
import styles from './ProfileReviewsSection.module.css';

interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewContext?: ProfileReviewContext;
}

interface ProfileReviewsSectionProps {
  initialReviews?: ReviewItem[];
  reviewStats?: ProfileReviewStatsByContext;
  initialReviewContext?: ProfileReviewContext;
  isDark: boolean;
  cardBg: string;
  innerBg: string;
  labelText: string;
  headingText: string;
  isOwnProfile?: boolean;
  isVerified?: boolean;
  canReview?: boolean;
  reviewActivityHref?: string;
}

export default function ProfileReviewsSection(props: ProfileReviewsSectionProps) {
  // Reset only the review selection/pagination when a role-specific URL changes.
  // The parent profile and its loaded data stay mounted.
  return <ReviewContent key={props.initialReviewContext ?? 'auto'} {...props} />;
}

function ReviewContent({
  initialReviews = [], reviewStats, initialReviewContext, isDark, cardBg, innerBg, labelText, headingText,
  isOwnProfile = false, isVerified = false, canReview = false,
  reviewActivityHref = '/seeker/activity',
}: ProfileReviewsSectionProps) {
  const [selectedContext, setSelectedContext] = useState<ProfileReviewContext | null>(null);
  const statsFor = (context: ProfileReviewContext) => {
    if (reviewStats?.[context]) return reviewStats[context];
    const items = initialReviews.filter(review => review.reviewContext === context);
    return {
      reviewCount: items.length,
      averageRating: items.length ? items.reduce((sum, review) => sum + review.rating, 0) / items.length : 0,
      ratingDistribution: [5, 4, 3, 2, 1].map(star => ({ star, count: items.filter(review => review.rating === star).length })),
    };
  };
  const serviceCount = statsFor('PROVIDER').reviewCount;
  const seekerCount = statsFor('SEEKER').reviewCount;
  const context = selectedContext ?? initialReviewContext ?? (serviceCount || !seekerCount ? 'PROVIDER' : 'SEEKER');
  const stats = statsFor(context);
  const reviews = initialReviews.filter(review => review.reviewContext === context);
  const isService = context === 'PROVIDER';
  const heading = isService ? 'Reviews as Service Provider' : 'Reviews as Service Seeker';
  const { currentPage, totalPages, paginatedItems, goToPage, nextPage, prevPage, startIndex, endIndex } = usePagination(reviews, 3);

  return (
    <section className={`${cardBg} rounded-2xl p-5 sm:p-6 border space-y-6`} aria-label="Ratings and reviews">
      <WorkspaceTabs
        className={styles.roleTabs}
        activeValue={context}
        onChange={value => { setSelectedContext(value); goToPage(1); }}
        ariaLabel="Review type"
        tone={isService ? 'provider' : 'seeker'}
        idPrefix="profile-review-context"
        items={[
          { value: 'PROVIDER', label: 'Reviews as Service Provider', count: serviceCount },
          { value: 'SEEKER', label: 'Reviews as Service Seeker', count: seekerCount },
        ]}
      />
      <div role="tabpanel" id={`profile-review-context-panel-${context}`} aria-labelledby={`profile-review-context-tab-${context}`} tabIndex={0} className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--workspace-border)] pb-4">
          <div>
            <h3 className={`flex items-center gap-2 text-base font-bold ${headingText}`}><MessageSquare size={18} className="text-amber-500" aria-hidden="true" />{heading} ({stats.reviewCount})</h3>
            <p className={`mt-2 text-sm leading-6 ${labelText}`}>{isService
              ? 'Feedback from service seekers about the work this member provided.'
              : 'Feedback from service providers about working with this member as a service seeker.'}</p>
          </div>
          {!isOwnProfile && (isVerified && canReview
            ? <Link href={reviewActivityHref} className="inline-flex min-h-11 items-center rounded-xl border border-[color:var(--workspace-border)] px-3 text-sm font-semibold text-[color:var(--workspace-focus)]">Review a completed booking</Link>
            : <span className={`flex items-center gap-1.5 text-xs ${labelText}`}><Lock size={13} aria-hidden="true" />Reviews from completed bookings</span>)}
        </div>

        {stats.reviewCount > 0 && (
          <div className={`p-5 rounded-2xl border ${innerBg} grid grid-cols-1 sm:grid-cols-12 gap-5 items-center`}>
            <div className="sm:col-span-4 space-y-2">
              <div className={`text-4xl font-black tabular-nums ${headingText}`}>{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1" role="img" aria-label={`${stats.averageRating.toFixed(1)} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} aria-hidden="true" className={star <= Math.round(stats.averageRating) ? 'text-amber-500 fill-amber-500' : 'text-ink-subtle'} />)}
              </div>
              <p className={`text-xs ${labelText}`}>{stats.reviewCount} {stats.reviewCount === 1 ? 'verified rating' : 'verified ratings'} {isService ? 'from service seekers' : 'from service providers'}</p>
            </div>
            <div className="sm:col-span-8 space-y-2" aria-label="Rating distribution">
              {stats.ratingDistribution.map(({ star, count }) => {
                const percentage = Math.round(count / stats.reviewCount * 100);
                return <div key={star} className="flex items-center gap-2 text-xs" aria-label={`${star} stars: ${count} ${count === 1 ? 'review' : 'reviews'}`}>
                  <span className={`w-4 text-right font-semibold ${labelText}`}>{star}</span>
                  <div className="flex-1 bg-slate-200 dark:bg-charcoal h-2 rounded-full overflow-hidden" aria-hidden="true"><div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentage}%` }} /></div>
                  <span className={`w-9 text-right tabular-nums ${labelText}`}>{percentage}%</span>
                </div>;
              })}
            </div>
          </div>
        )}

        {stats.reviewCount === 0 ? (
          <div className="py-6 space-y-2">
            <p className={`font-semibold ${headingText}`}>No {isService ? 'provider' : 'seeker'} reviews yet</p>
            <p className={`text-sm leading-6 ${labelText}`}>{isService
              ? 'Provider reviews appear after service seekers review completed work.'
              : 'Seeker reviews appear after service providers review a completed booking.'}</p>
            {(isService ? seekerCount : serviceCount) > 0 && <p className={`text-sm leading-6 ${labelText}`}>This member has reviews as a {isService ? 'service seeker' : 'service provider'} in the other review tab.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {stats.reviewCount > reviews.length && <p className={`text-xs ${labelText}`}>Showing the {reviews.length} latest {isService ? 'provider' : 'seeker'} reviews. Rating totals include all {stats.reviewCount} reviews.</p>}
            {paginatedItems.map(review => <article key={review.id} className={`p-4 rounded-2xl border ${innerBg} space-y-3`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-700 text-white font-bold" aria-hidden="true">{review.authorName[0]}</span>
                  <div className="min-w-0"><p className={`text-sm font-semibold break-words ${headingText}`}>{review.authorName}</p><p className={`text-xs mt-1 ${labelText}`}>{review.createdAt}</p></div>
                </div>
                <div className="flex items-center gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} aria-hidden="true" className={star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-ink-subtle'} />)}
                </div>
              </div>
              {review.comment && <p className={`text-sm leading-6 break-words ${isDark ? 'text-neutral-300' : 'text-ink-secondary'}`}>{review.comment}</p>}
              <p className={`pt-3 border-t border-[color:var(--workspace-border)] text-xs ${labelText}`}>Reviewed {isService ? 'as a service provider by a service seeker' : 'as a service seeker by a service provider'} · Completed booking</p>
            </article>)}
            {totalPages > 1 && <PaginationBar currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} nextPage={nextPage} prevPage={prevPage} startIndex={startIndex} endIndex={endIndex} totalItems={reviews.length} variant={isService ? 'provider' : 'seeker'} />}
          </div>
        )}
      </div>
    </section>
  );
}
