'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PencilSimple, Trash, MapPin, Timer, UsersThree, Money, DeviceMobile, ImageBroken, Images, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import type { ServiceListing } from '../../types';
import { listingPhotoUrl } from '../../lib/listingPhotos';
import ListingPhotoGallery from '../ui/ListingPhotoGallery';
import ContentCaseAction from '../moderation/ContentCaseAction';
import photoStyles from '../ui/TrailCard.module.css';
import styles from './ManagedServiceCard.module.css';

export default function ManagedServiceCard({ service, isDark, highlighted, toggling, onEdit, onDelete, onToggle }: {
  service:ServiceListing; isDark:boolean; highlighted:boolean; toggling:boolean;
  onEdit:()=>void; onDelete:()=>void; onToggle:()=>void;
}) {
  const [showPhotos, setShowPhotos] = useState(false);
  const [failedPhoto, setFailedPhoto] = useState('');
  const photos = service.photos ?? [];
  const cover = photos[0];
  const rejected = ['REJECTED', 'PENDING_REVIEW'].includes(service.status || '');
  const removed = service.status === 'SUSPENDED';
  const needsPrice = service.priceType === 'STARTS_AT' || service.priceType === 'CUSTOM' || (service.priceType !== 'BY_AGREEMENT' && Number(service.price) < 50);
  const active = !service.isPaused && !needsPrice;
  const rate = service.priceType === 'BY_AGREEMENT' ? 'Price by agreement' : needsPrice ? 'Price needed' : `₱${Number(service.price).toLocaleString()}`;
  const unit = service.priceType === 'PER_HOUR' ? ' / hour' : service.priceType === 'PER_DAY' ? ' / day' : service.priceType === 'PER_PROJECT' ? ' / project' : ' fixed price';
  return <article className={styles.card} data-highlighted={highlighted} data-revision={rejected || removed} aria-label={service.title}>
    <div className={styles.composition}>
      <div className={styles.media}>
        {cover && failedPhoto !== cover.id ? <button type="button" className={styles.coverButton} onClick={() => setShowPhotos(value => !value)} aria-expanded={showPhotos} aria-label={`View ${photos.length} listing photo${photos.length === 1 ? '' : 's'}`}>
          <Image unoptimized src={listingPhotoUrl(cover.url, 720, true)} width={720} height={450} alt={`${service.title}, cover photo`} className={styles.cover} loading="lazy" onError={() => setFailedPhoto(cover.id)} />
        </button> : <div className={styles.placeholder} role="img" aria-label={cover ? 'Photo unavailable' : 'No photo added'}>
          <span className={photoStyles.placeholderMark}><ImageBroken size={30} weight="light" className={photoStyles.placeholderIcon} aria-hidden="true" /></span>
          <span>{cover ? 'Photo unavailable' : 'No photos added'}</span>
        </div>}
        {photos.length > 0 && <button type="button" className={styles.photoAction} aria-expanded={showPhotos} onClick={() => setShowPhotos(value => !value)}><Images size={16} aria-hidden="true" />{showPhotos ? 'Hide photos' : `${photos.length} photo${photos.length === 1 ? '' : 's'} · View all`}</button>}
      </div>
      <div className={styles.content}>
        <header className={styles.header}>
          <div><p className={styles.category}>{service.category}</p><h3 className={styles.title}>{service.title}</h3></div>
          <span className={styles.status} data-state={removed || rejected ? 'attention' : active ? 'active' : 'paused'}>{removed ? 'Removed by Admin' : rejected ? 'Needs changes' : active ? 'Active' : needsPrice ? 'Price needed' : 'Paused'}</span>
        </header>
        <p className={styles.location}><MapPin size={16} aria-hidden="true" />{service.locationLabel || 'Add your service area or venue in Edit to appear in nearby discovery.'}{service.coverageRadiusKm != null && <span> · Travels up to {service.coverageRadiusKm} km</span>}</p>
        <p className={styles.description}>{service.description}</p>
        <dl className={styles.price}><dt>Rate</dt><dd>{rate}{!needsPrice && service.priceType !== 'BY_AGREEMENT' && <small>{unit}</small>}</dd></dl>
        <ul className={styles.facts} aria-label="Listing information">
          <li><Timer size={16} aria-hidden="true" />{service.estimatedDurationMins || 60} min</li>
          <li><UsersThree size={16} aria-hidden="true" />{service.providerWaitingCount ?? service.queueSize ?? 0} paid waiting across your work</li>
          {service.paymentMethods?.cash && <li><Money size={16} aria-hidden="true" />Cash</li>}
          {service.paymentMethods?.gcash && <li><DeviceMobile size={16} aria-hidden="true" />GCash</li>}
          <li><MapPin size={16} aria-hidden="true" />{service.publicMapPin ? 'Exact public pin' : 'Approximate public area'}</li>
        </ul>
        <footer className={styles.actions}>
          {!removed && <button type="button" className={styles.button} onClick={onEdit}><PencilSimple size={16} aria-hidden="true" />{rejected ? 'Revise Listing' : 'Edit'}</button>}
          <button type="button" className={`${styles.button} ${styles.danger}`} onClick={onDelete}><Trash size={16} aria-hidden="true" />Delete</button>
          {!rejected && !removed && <button type="button" className={styles.switchButton} role="switch" aria-checked={active} aria-label={`Listing active: ${service.title}`} disabled={toggling || needsPrice} onClick={onToggle}>
            <span className={styles.switchTrack} data-active={active}><span>{toggling && <CircleNotch size={12} className={styles.spinner} aria-hidden="true" />}</span></span>{toggling ? 'Updating…' : active ? 'Active' : needsPrice ? 'Price needed' : 'Paused'}
          </button>}
        </footer>
      </div>
    </div>
    {showPhotos && <div className={styles.gallery}><ListingPhotoGallery photos={photos} title={service.title} /></div>}
    {needsPrice && <p className={styles.notice}>Enter a final price in Edit Listing. This older listing is hidden from seekers until it has an exact bookable price.</p>}
    {rejected && <section className={styles.notice} data-error="true"><strong><WarningCircle size={17} aria-hidden="true" />What to fix</strong><p>{service.adminNotes || 'Check your service details, then save to publish.'}</p><p>Customers cannot see this service yet. Open Edit Listing, check the details, and save to publish. No admin approval is needed.</p><div className={styles.actions}><button type="button" className={styles.button} onClick={onEdit}>Edit Listing</button><ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId={service.id} isDark={isDark} /></div></section>}
    {removed && <section className={styles.notice} data-error="true"><strong>This listing was removed from public view.</strong><p>Existing bookings are still managed in Activity.</p><ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId={service.id} isDark={isDark} label="Appeal this removal" /></section>}
  </article>;
}
