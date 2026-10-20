'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock, Loader2, MapPin, ShieldCheck, X } from 'lucide-react';
import type { JobEngagement } from '../../types';
import { arrangementLabel } from '../../lib/serviceArrangement';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import styles from './IncomingBookingRequestCard.module.css';

export default function IncomingBookingRequestCard({ booking, timeLabel, disabled, loadingAction, onRespond }: {
  booking: JobEngagement; timeLabel: string; disabled: boolean;
  loadingAction: 'accepting' | 'declining' | null;
  onRespond: (accept: boolean) => void;
}) {
  const location = booking.jobLocation;
  const visitsProvider = booking.serviceLocationMode === 'SEEKER_VISITS';
  return <article className={styles.card} aria-busy={Boolean(loadingAction)}>
    <header className={styles.header}>
      <div className={styles.identity}>
        <Link href={`/profile/${encodeURIComponent(booking.seekerId)}`} className={styles.profile} aria-label={`View ${booking.seekerName}'s profile`}>
          {booking.seekerAvatar ? <Image unoptimized width={32} height={32} src={booking.seekerAvatar} alt="" className={styles.avatar} /> : <span className={styles.avatar}>{booking.seekerName?.charAt(0).toUpperCase() || 'S'}</span>}
          <span className={styles.name}>{booking.seekerName}</span>
        </Link>
        <div className={styles.badges}>
          {booking.seekerVerificationStatus === 'APPROVED' && <span className={styles.verified}><ShieldCheck size={13} aria-hidden="true" />Verified</span>}
          <TrustScoreBadge score={booking.seekerTrustScore ?? 50} />
          <span className={styles.time}><Clock size={13} aria-hidden="true" />{timeLabel}</span>
        </div>
      </div>
      <div className={styles.price}>
        <span>Booking total</span>
        <strong>₱{Number(booking.price).toLocaleString()}</strong>
        <small>{booking.paymentMethod || 'On-site Cash'}</small>
      </div>
    </header>
    <h3 className={styles.title}>{booking.title}</h3>
    <p className={styles.summary}><span>{arrangementLabel[booking.serviceLocationMode ?? 'PROVIDER_VISITS']}</span><span>{booking.serviceLocationMode === 'REMOTE' ? 'No meetup required' : location?.label || 'Location to confirm'}</span>{booking.preferredSchedule && <span>{booking.preferredSchedule}</span>}</p>
    <div className={styles.decision}><details className={styles.details}>
    <summary>Request details</summary>
    <dl className={styles.facts}>
      <div><dt>Work location</dt><dd>{arrangementLabel[booking.serviceLocationMode ?? 'PROVIDER_VISITS']}</dd></div>
      <div><dt>{booking.serviceLocationMode === 'REMOTE' ? 'Delivery' : visitsProvider ? 'Your service venue' : 'Job location'}</dt><dd>
        {booking.serviceLocationMode === 'REMOTE' ? <span>Online delivery. Coordinate through Messages and My Bookings; no job pin is needed.</span> : location ? <><span className={styles.location}><MapPin size={16} aria-hidden="true" />Agreed job pin</span>
          {location.address && <span className={styles.directions}>{location.address}</span>}
          <a href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>View agreed job pin</a>
        </> : <span>Job location was not saved for this older booking. Confirm it with the customer after accepting.</span>}
      </dd></div>
      {booking.preferredSchedule && <div><dt>Preferred schedule</dt><dd>{booking.preferredSchedule}<small className={styles.directions}>Proposed by the customer; confirm your availability.</small></dd></div>}
      {!!booking.transportationFee && <div><dt>Provider transportation</dt><dd>₱{booking.transportationFee.toLocaleString()} <small className={styles.directions}>Included once in the booking total.</small></dd></div>}
      {!!booking.quantity && booking.quantity > 1 && <div><dt>Requested duration</dt><dd>{booking.quantity} {booking.priceType === 'PER_DAY' ? 'days' : 'hours'}</dd></div>}
    </dl>
    {booking.description && <div className={styles.description}><h4>Work requested</h4><p>{booking.description}</p></div>}
    <p className={styles.explanation}>Accepting confirms the booking and opens private messaging. Start the job separately in My Bookings.</p>
    </details>
    <footer className={styles.footer}>
      <div className={styles.actions}>
        <button type="button" disabled={disabled} onClick={() => onRespond(false)} className={styles.button}>
          {loadingAction === 'declining' ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
          {loadingAction === 'declining' ? 'Declining…' : 'Decline'}
        </button>
        <button type="button" disabled={disabled} onClick={() => onRespond(true)} className={`${styles.button} ${styles.accept}`}>
          {loadingAction === 'accepting' ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
          {loadingAction === 'accepting' ? 'Accepting…' : 'Accept request'}
        </button>
      </div>
    </footer></div>
  </article>;
}
