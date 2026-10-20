import type { ServiceListing } from '../types';

export const isPriceByAgreement = (listing: Pick<ServiceListing, 'priceType'>) => listing.priceType === 'BY_AGREEMENT';
export function listingPriceLabel(listing: Pick<ServiceListing, 'priceType' | 'price'>) {
  if (isPriceByAgreement(listing)) return 'Quote required';
  if (listing.priceType === 'CUSTOM' || listing.priceType === 'STARTS_AT') return 'Quote required';
  if (!Number.isFinite(Number(listing.price)) || Number(listing.price) < 50) return 'Price unavailable';
  const unit = listing.priceType === 'PER_HOUR' ? ' / hour' : listing.priceType === 'PER_DAY' ? ' / day' : listing.priceType === 'PER_PROJECT' ? ' / project' : '';
  return `₱${Number(listing.price).toLocaleString()}${unit}`;
}
