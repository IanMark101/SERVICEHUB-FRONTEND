import Link from 'next/link';
import { Loader2, ShieldCheck } from 'lucide-react';
import type { Bid, JobRequest, User } from '../../types';
import { arrangementLabel } from '../../lib/serviceArrangement';
import { normalizeOfferStatus } from '../../lib/offerStatus';
import UserAvatar from '../ui/UserAvatar';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import styles from '../ui/Inbox.module.css';

export default function IncomingOfferRow({ bid, request, provider, relatedService, timeLabel, disabled, loadingAction, onAccept, onDecline }: {
  bid:Bid; request?:JobRequest; provider?:User; relatedService?:string; timeLabel:string; disabled:boolean;
  loadingAction:'accepting'|'declining'|null; onAccept:()=>void; onDecline:()=>void;
}) {
  const isVerified = provider?.verificationStatus === 'APPROVED' || provider?.isVerified;
  const mode = bid.serviceLocationMode ?? 'PROVIDER_VISITS';
  return <article className={styles.row} aria-busy={Boolean(loadingAction)}>
    <header className={styles.header}>
      <div className={styles.identity}>
        <UserAvatar src={bid.providerAvatar} name={bid.providerName || 'Provider'} alt="" size={32} role="provider" />
        <div className={styles.identityCopy}>
          <Link href={`/profile/${encodeURIComponent(bid.providerId)}`} className={styles.profile}>{bid.providerName || 'Provider'}{isVerified && <span className={styles.verified}><ShieldCheck size={13} aria-hidden="true" />Verified</span>}</Link>
          <h3 className={styles.title}>{request?.title || bid.requestTitle || 'Custom task'}</h3>
        </div>
      </div>
      <div className={styles.price}><span>Offer total</span><strong>₱{Number(bid.price).toLocaleString()}</strong></div>
    </header>
    <div className={styles.meta}>
      <TrustScoreBadge score={provider?.trustScore ?? 50} />
      {bid.providerRating > 0 && <span>Rating {bid.providerRating.toFixed(1)}</span>}
      <span>{timeLabel}</span>
      <span>{bid.estimatedDuration ? `${bid.estimatedDuration} minutes` : 'Duration to confirm'}</span>
    </div>
    <p className={styles.summary}><span>{arrangementLabel[mode]}</span><span>{mode === 'SEEKER_VISITS' ? `Provider venue: ${bid.venueLabel || 'Shared after booking'}` : `Job area: ${request?.locationLabel || 'Customer’s posted job location'}`}</span></p>
    <div className={styles.decision}><details className={styles.details}>
      <summary>Offer details</summary>
      <div className={styles.detailsCopy}>
        <p><strong>Provider’s message</strong></p><p>{bid.message}</p>
        {bid.availability?.trim() && <p>Available: {bid.availability}</p>}
        {(request?.preferredPaymentMethod || bid.requestPreferredPaymentMethod) && <p>Selected payment: {request?.preferredPaymentMethod || bid.requestPreferredPaymentMethod}</p>}
        {relatedService && <p>Related service: {relatedService}</p>}
        {provider?.location && <p>Provider area: {provider.location}</p>}
        <p>One final quoted total. Transportation is not added again. Messaging opens after acceptance.</p>
      </div>
    </details>
    <div className={styles.actions}>
      <button type="button" className={styles.button} disabled={disabled} onClick={onDecline}>{loadingAction === 'declining' && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}{loadingAction === 'declining' ? 'Declining...' : 'Decline'}</button>
      <button type="button" className={`${styles.button} ${styles.primary}`} disabled={disabled} onClick={onAccept}>{loadingAction === 'accepting' && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}{loadingAction === 'accepting' ? 'Accepting...' : normalizeOfferStatus(bid.status) === 'pending_payment' ? 'Payment in progress' : bid.requestStatus === 'PAYMENT_PENDING' ? 'Another checkout in progress' : bid.requestStatus === 'CLOSED' ? 'Request paused' : 'Accept Offer'}</button>
    </div></div>
  </article>;
}
