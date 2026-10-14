'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Image as PhotoIcon, MapPin, Money as CurrencyPeso, CircleNotch, X } from '@phosphor-icons/react';
import type { JobRequest } from '../../types';
import UserAvatar from '../ui/UserAvatar';
import ListingPhotoGallery from '../ui/ListingPhotoGallery';
import styles from './IncomingInquiryCard.module.css';

export default function IncomingInquiryCard({ request, timeLabel, disabled, loadingAction, onDecline, onSetPrice }: {
  request:JobRequest; timeLabel:string; disabled:boolean; loadingAction:'accepting'|'declining'|null;
  onDecline:()=>void; onSetPrice:()=>void;
}) {
  const quote = Boolean(request.preferredPaymentMethod);
  const name = request.seekerName || 'Seeker';
  const photos = request.photos ?? [];
  return <article className={styles.card} aria-busy={Boolean(loadingAction)}>
    <header className={styles.header}>
      <h3 className={styles.title}>{request.title}</h3>
      <span className={styles.status}><CurrencyPeso size={15} aria-hidden="true" />{quote ? 'Quote requested' : 'Needs your price'}</span>
    </header>
    <div className={styles.sender}>
      <UserAvatar src={request.seekerAvatar} name={name} size={32} role="seeker" />
      {request.seekerId ? <Link className={styles.person} href={`/profile/${encodeURIComponent(request.seekerId)}`}>{name}</Link> : <span className={styles.person}>{name}</span>}
      <span className={styles.time}><Clock size={13} aria-hidden="true" />{timeLabel}</span>
    </div>
    <p className={styles.description}>{request.description}</p>
    <div className={styles.facts}>
      <span><CurrencyPeso size={16} aria-hidden="true" />{request.budget ? `Listed rate: ₱${request.budget.toLocaleString()}` : 'Price by agreement'}</span>
      {request.locationLabel && <span><MapPin size={16} aria-hidden="true" />{request.locationLabel}</span>}
      {photos.length > 0 && <span><PhotoIcon size={16} aria-hidden="true" />{photos.length} photo{photos.length === 1 ? '' : 's'} attached</span>}
    </div>
    <div className={styles.decision}>
      <p>{quote ? `Seeker selected: ${request.preferredPaymentMethod}` : 'Send your final price and what it includes. The seeker approves it before booking or paying.'}</p>
      <div className={styles.actions}>{quote ? <Link href={`/provider/browse-services?request=${encodeURIComponent(request.id)}`} className={`${styles.button} ${styles.primary}`}>Send quote<ArrowRight size={16} aria-hidden="true" /></Link> : <>
        <button type="button" className={styles.button} disabled={disabled} onClick={onDecline}>{loadingAction === 'declining' ? <CircleNotch className={styles.spinner} size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}{loadingAction === 'declining' ? 'Declining…' : 'Decline request'}</button>
        <button type="button" className={`${styles.button} ${styles.primary}`} disabled={disabled} onClick={onSetPrice}>{loadingAction === 'accepting' ? <CircleNotch className={styles.spinner} size={16} aria-hidden="true" /> : <CurrencyPeso size={16} aria-hidden="true" />}{loadingAction === 'accepting' ? 'Opening…' : 'Accept & set price'}</button>
      </>}</div>
    </div>
    <details className={styles.details}><summary>Inquiry details<ArrowRight size={16} aria-hidden="true" /></summary>
      <div className={styles.expanded}>
        <p className={styles.hint}>{photos.length ? 'The description above is shown in full. Review the seeker’s photos before sending your price.' : 'No photos were attached. The seeker’s description is shown in full above.'}</p>
        <ListingPhotoGallery photos={photos} title={request.title} />
      </div>
    </details>
  </article>;
}
