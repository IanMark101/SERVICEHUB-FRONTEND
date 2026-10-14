'use client';

import type { ServiceListing, JobEngagement } from '../../../types';
import { TrailCard, TrailCardStats } from '../../ui/trail-card';
import styles from '../../ui/TrailCard.module.css';
import UserAvatar from '../../ui/UserAvatar';
import TrustScoreBadge from '../../ui/TrustScoreBadge';
import MarketplaceRating from '../../ui/MarketplaceRating';
import { formatDistance } from '../../../lib/location';
import { arrangementLabel } from '../../../lib/serviceArrangement';
import { getServicePaymentMethods } from '../../../lib/paymentUtils';
import ListingCardTools, { type ListingSaveProps } from '../../marketplace/ListingCardTools';
import { isPriceByAgreement, listingPriceLabel } from '../../../lib/listingPricing';

export default function ServiceMarketplaceCard({ service, trustScore, verified, isDark, isOwned, activeEngagement, joiningWaitlistId, onDetails, onProfile, onReviews, onEdit, onActivity, onBook, onJoinWaitlist, prefetch, saved, saving, onToggleSaved, readOnly = false }: ListingSaveProps & {
  service: ServiceListing; trustScore?: number; verified: boolean; isDark: boolean; isOwned: boolean; activeEngagement?: JobEngagement; joiningWaitlistId: string | null;
  onDetails: () => void; onProfile: () => void; onReviews: () => void; onEdit: () => void; onActivity: () => void; onBook: (method: 'GCash' | 'On-site Cash') => void; onJoinWaitlist: () => void; prefetch: () => void; readOnly?: boolean;
}) {
  const { cash, gcash } = getServicePaymentMethods(service);
  const queue = service.providerWaitingCount ?? service.queueSize;
  const queueFull = gcash && queue >= (service.queueLimit || 5);
  const agreement = isPriceByAgreement(service);
  const quote = !agreement && (service.priceType === 'STARTS_AT' || service.priceType === 'CUSTOM' || Number(service.price) < 50);
  return <TrailCard photo={service.photos?.[0]} title={service.title} location={service.locationLabel} category={service.category} isDark={isDark}>
    <div className={styles.identity}><button type="button" className={styles.person} onClick={onProfile} disabled={!service.providerId} aria-label={`View ${service.providerName}'s profile`}><UserAvatar src={service.providerAvatar} name={service.providerName} alt="" size={32} role="provider" /><div><span className={styles.name}>{service.providerName}</span><span className={styles.reputation}><TrustScoreBadge score={trustScore} />{verified && <span className={styles.verified}>Verified</span>}</span></div></button><button type="button" className={styles.person} onClick={onReviews} aria-label={`View reviews for ${service.providerName}`}><MarketplaceRating context="provider" rating={service.rating} reviewCount={service.reviewCount} /></button></div>
    <TrailCardStats items={[{ label: 'Price', value: listingPriceLabel(service) }, { label: 'Distance', value: service.distanceKm == null ? 'Not set' : formatDistance(service.distanceKm) }, { label: 'Time needed', value: service.estimatedDurationMins ? `${service.estimatedDurationMins} min` : 'Ask provider' }]} />
    <p className={styles.line}>{arrangementLabel[service.serviceLocationMode ?? 'PROVIDER_VISITS']}</p>
    <div className={styles.line} aria-label="Accepted payment methods">{cash && <span>Cash in person</span>}{cash && gcash && ' · '}{gcash && <span>GCash (test mode)</span>}{service.transportationFee && service.serviceLocationMode !== 'SEEKER_VISITS' ? ` · +₱${service.transportationFee.toLocaleString()} travel` : ''}</div>
    <span className={styles.status} data-full={queueFull}>{isOwned ? 'Your listing' : queueFull ? `Queue full (${queue}/${service.queueLimit || 5})` : queue > 0 && gcash ? `${queue} waiting` : 'Available'}</span>
    <div className={styles.actions}>
      {quote && !isOwned && !activeEngagement ? <button type="button" onClick={onDetails}>View Details &amp; Request Quote</button> : <>
        <button type="button" aria-label={`Inspect ${service.title} details`} onClick={onDetails}>Details</button>
        {isOwned ? <button type="button" onClick={onEdit}>Edit</button> : activeEngagement ? <button type="button" onClick={onActivity}>View Activity</button> : <>
          {queueFull && !agreement && <button type="button" disabled={joiningWaitlistId === service.id} onClick={onJoinWaitlist}>{joiningWaitlistId === service.id ? 'Joining...' : 'Notify Me'}</button>}
          {(agreement || !queueFull || cash) && <button type="button" data-primary="true" onMouseEnter={prefetch} onFocus={prefetch} onClick={() => onBook(cash ? 'On-site Cash' : 'GCash')}>{agreement ? 'Request service' : queueFull ? 'Direct Cash' : 'Book Service'}</button>}
        </>}
      </>}
    </div>
    {!readOnly && <ListingCardTools contentType="SERVICE_LISTING" listingId={service.id} isOwned={isOwned} isDark={isDark} saved={saved} saving={saving} onToggleSaved={onToggleSaved} />}
  </TrailCard>;
}
