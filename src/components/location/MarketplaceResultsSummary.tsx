import { marketplaceSubject, type MarketplaceLocation } from '../../lib/location';

export default function MarketplaceResultsSummary({ workspace, location, search, category, filterLabel, total, loading }: {
  workspace:'seeker'|'provider'; location:MarketplaceLocation|null; search:string; category:string;
  filterLabel?:string; total:number; loading:boolean;
}) {
  if (!location) return null;
  return <p role="status" aria-live="polite" className="mb-4 break-words text-sm text-ink-muted">
    {loading ? 'Finding' : `${total} matching`} {marketplaceSubject(workspace, search, category)} near {location.point.label}, within {location.radiusKm} km.
    {search.trim() && category !== 'All Categories' ? ` Category: ${category}.` : ''}
    {filterLabel ? ` Filter: ${filterLabel}.` : ''}
    {' '}Distances are measured from this search location.
  </p>;
}
