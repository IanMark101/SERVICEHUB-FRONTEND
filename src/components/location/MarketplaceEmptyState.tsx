import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import { nextSearchRadius, type MarketplaceLocation } from '../../lib/location';
import EmptyState from '../ui/EmptyState';
import styles from './MarketplaceEmptyState.module.css';

export default function MarketplaceEmptyState({ workspace, location, hasFilters, onChangeLocation, onExpandRadius, onClearFilters, onPostRequest }: {
  workspace:'seeker'|'provider'; location:MarketplaceLocation|null; search:string; category:string; hasFilters:boolean;
  onChangeLocation?:() => void; onExpandRadius?:(radius:number) => void; onClearFilters:() => void; onPostRequest?:() => void;
}) {
  const nextRadius = location ? nextSearchRadius(location.radiusKm) : undefined;
  const isPostAction = workspace === 'seeker' && !!location && !!onPostRequest;
  const primaryAction = isPostAction ? onPostRequest : onChangeLocation;
  return <EmptyState
    className={styles.card}
    icon={Search}
    title={!location ? 'Choose your search location' : workspace === 'seeker' ? 'No Services Found' : 'No Open Service Requests'}
    description={!location
      ? `Set a search location and radius to find ${workspace === 'seeker' ? 'services' : 'work'} nearby.`
      : hasFilters
        ? 'Try a wider search radius or clear your filters to see more results.'
        : workspace === 'seeker'
          ? 'Try a wider search radius, or post a request and let providers send offers.'
          : 'Try a wider search radius or choose another location to find work.'}
    accentColor={workspace === 'seeker' ? 'orange' : 'emerald'}
  >
    <div className={styles.actions} data-marketplace-empty-actions data-workspace={workspace}>
      <div className={styles.mainActions}>
        {primaryAction && <button type="button" className={`${styles.button} ${styles.primary} marketplace-primary text-white`} onClick={primaryAction}>
          {isPostAction ? 'Post a Request' : 'Change location'}
        </button>}
        {nextRadius && onExpandRadius && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => onExpandRadius(nextRadius)}>Expand radius to {nextRadius} km</button>}
        {!location && onPostRequest && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={onPostRequest}>Post a Request</button>}
      </div>
      {hasFilters && <div className={styles.moreActions}>
        <button type="button" className={styles.quiet} onClick={onClearFilters}>Clear filters</button>
      </div>}
    </div>
  </EmptyState>;
}
