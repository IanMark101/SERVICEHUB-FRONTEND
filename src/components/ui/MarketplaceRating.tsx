import { Star } from '@phosphor-icons/react';

/** The zero display means no reviews; missing or invalid data stays unavailable. */
export default function MarketplaceRating({ rating, reviewCount, context }: {
  rating?: number;
  reviewCount?: number;
  context: 'provider' | 'seeker';
}) {
  const hasCount = typeof reviewCount === 'number' && Number.isInteger(reviewCount) && reviewCount >= 0;
  const hasRating = typeof rating === 'number' && Number.isFinite(rating) && rating >= 1 && rating <= 5;
  if (!hasCount || (reviewCount > 0 && !hasRating)) {
    return <span className="text-xs text-ink-muted">{context === 'provider' ? 'Provider' : 'Seeker'} reviews unavailable</span>;
  }
  const value = reviewCount === 0 ? '0.0' : rating!.toFixed(1);
  const description = reviewCount === 0
    ? `No reviews yet as a service ${context}`
    : `Service ${context} rating: ${value} out of 5 from ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`;
  return <span role="img" aria-label={description} title={description} className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-secondary">
    <Star size={14} weight="fill" className="shrink-0 text-amber-500" aria-hidden="true" />
    <span className="font-semibold tabular-nums text-ink">{value}</span>
    <span className="text-[11px] tabular-nums text-ink-subtle">({reviewCount})</span>
  </span>;
}
