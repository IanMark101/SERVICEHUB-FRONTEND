import { ShieldCheck } from '@phosphor-icons/react';
import { formatDistance } from '../../../lib/location';
import type { JobRequest } from '../../../types';
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
  return <TrailCard status={isOwned ? 'Your own request' : `Needed: ${formatUrgencyDisplay(request.urgency)}`} tools={!readOnly && <ListingCardTools compact contentType="SERVICE_REQUEST" listingId={request.id} isOwned={isOwned} isDark={isDark} saved={saved} saving={saving} onToggleSaved={onToggleSaved} />} photo={request.photos?.[0]} title={request.title} location={request.serviceLocationMode === 'REMOTE' ? `Online / remote${request.locationLabel ? ' · ' + request.locationLabel : ''}` : request.locationLabel} category={request.category} isDark={isDark}>
    <div className={styles.identity}>
      <button type="button" className={styles.person} disabled={!request.seekerId} onClick={() => onProfile()} aria-label={`View ${request.seekerName}'s profile`}>
        <UserAvatar src={request.seekerAvatar} name={request.seekerName} alt="" size={32} role="seeker" />
        <div><span className={styles.name}>{request.seekerName}</span><span className={styles.reputation}><TrustScoreBadge score={request.seekerTrustScore} />{request.seekerVerificationStatus === 'APPROVED' && <span className={styles.verified} role="img" aria-label="Verified resident" title="Verified resident"><ShieldCheck size={15} aria-hidden="true" /></span>}</span></div>
      </button>
      <button type="button" className={styles.person} disabled={!request.seekerId} onClick={() => onProfile(true)} aria-label={`View service seeker reviews for ${request.seekerName}`}><MarketplaceRating rating={request.seekerRating} reviewCount={request.seekerReviewCount} context="seeker" /></button>
    </div>
    <TrailCardStats items={[{ label: request.targetServiceId ? 'Listed rate' : 'Budget', value: request.targetServiceId && !request.budget ? 'Quote required' : `₱${request.budget.toLocaleString()}` }, { label: 'Distance', value: request.distanceKm == null ? 'Not set' : formatDistance(request.distanceKm) }, { label: 'Offers', value: proposalCount }]} />
    <div className={styles.actions} data-workspace="provider">
      <button type="button" onClick={onDetails} aria-label={`Inspect ${request.title} details`}>Details</button>
      {!isOwned && (offerState ? <span className={styles.status}>{offerState === 'accepted' ? 'Offer accepted' : 'Proposal Submitted'}</span> : <button type="button" data-primary="true" onClick={onSendOffer}>Send Offer</button>)}
    </div>
  </TrailCard>;
}
