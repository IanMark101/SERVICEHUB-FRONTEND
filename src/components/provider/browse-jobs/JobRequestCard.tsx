import { arrangementLabel } from '../../../lib/serviceArrangement';
import { formatDistance } from '../../../lib/location';
import type { JobRequest } from '../../../types';
import { getRequestPaymentMethods } from '../../../lib/paymentUtils';
import UserAvatar from '../../ui/UserAvatar';
import TrustScoreBadge from '../../ui/TrustScoreBadge';
import MarketplaceRating from '../../ui/MarketplaceRating';
import ListingCardTools, { type ListingSaveProps } from '../../marketplace/ListingCardTools';
import { formatUrgencyDisplay } from './browseJobs.utils';
import { TrailCard, TrailCardStats } from '../../ui/trail-card';
import styles from '../../ui/TrailCard.module.css';

interface JobRequestCardProps extends ListingSaveProps {
  request: JobRequest; proposalCount: number; isOwned: boolean; offerState: 'accepted' | 'submitted' | null;
  isDark: boolean; readOnly?: boolean; onProfile: (reviews?: boolean) => void; onDetails: () => void; onSendOffer: () => void;
}

export default function JobRequestCard({ request, proposalCount, isOwned, offerState, isDark, readOnly = false, onProfile, onDetails, onSendOffer, saved, saving, onToggleSaved }: JobRequestCardProps) {
  const methods = getRequestPaymentMethods(request);
  return <TrailCard photo={request.photos?.[0]} title={request.title} location={request.locationLabel} category={request.category} isDark={isDark}>
    <div className={styles.identity}>
      <button type="button" className={styles.person} disabled={!request.seekerId} onClick={() => onProfile()} aria-label={`View ${request.seekerName}'s profile`}>
        <UserAvatar src={request.seekerAvatar} name={request.seekerName} alt="" size={32} role="seeker" />
        <div><span className={styles.name}>{request.seekerName}</span><span className={styles.reputation}><TrustScoreBadge score={request.seekerTrustScore} />{request.seekerVerificationStatus === 'APPROVED' && <span className={styles.verified}>Verified</span>}</span></div>
      </button>
      <button type="button" className={styles.person} disabled={!request.seekerId} onClick={() => onProfile(true)} aria-label={`View service seeker reviews for ${request.seekerName}`}><MarketplaceRating rating={request.seekerRating} reviewCount={request.seekerReviewCount} context="seeker" /></button>
    </div>
    <TrailCardStats items={[{ label: request.targetServiceId ? 'Listed rate' : 'Budget', value: request.targetServiceId && !request.budget ? 'Quote required' : `₱${request.budget.toLocaleString()}` }, { label: 'Distance', value: request.distanceKm == null ? 'Not set' : formatDistance(request.distanceKm) }, { label: 'Offers', value: proposalCount }]} />
    <p className={styles.line}>Needed: {formatUrgencyDisplay(request.urgency)}</p>
    <p className={styles.line}>{arrangementLabel[request.serviceLocationMode ?? 'PROVIDER_VISITS']}</p>
    {!request.paymentMethods && !request.preferredPaymentMethod ? <p className={styles.line}>Payment methods not specified</p> : <div className={styles.line}>{methods.cash && <span>Cash in person</span>}{methods.cash && methods.gcash && ' · '}{methods.gcash && <span>GCash (test mode)</span>}</div>}
    <div className={styles.actions} data-workspace="provider">
      <button type="button" onClick={onDetails} aria-label={`Inspect ${request.title} details`}>Details</button>
      {!isOwned && (offerState ? <span className={styles.status}>{offerState === 'accepted' ? 'Offer accepted' : 'Proposal Submitted'}</span> : <button type="button" data-primary="true" onClick={onSendOffer}>Send Offer</button>)}
    </div>
    {isOwned && <p className={styles.line}>Your own request · cannot send an offer</p>}
    {!readOnly && <ListingCardTools contentType="SERVICE_REQUEST" listingId={request.id} isOwned={isOwned} isDark={isDark} saved={saved} saving={saving} onToggleSaved={onToggleSaved} />}
  </TrailCard>;
}
