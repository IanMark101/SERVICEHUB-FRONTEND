'use client';

import { useId, useState } from 'react';
import { PencilSimple, Trash, MapPin, Timer, UsersThree, Money, ImageBroken, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import type { ServiceListing } from '../../types';
import ListingPhotoGallery from '../ui/ListingPhotoGallery';
import ContentCaseAction from '../moderation/ContentCaseAction';
import photoStyles from '../ui/TrailCard.module.css';
import styles from './ManagedServiceCard.module.css';

export default function ManagedServiceCard({ service, isDark, highlighted, toggling, onEdit, onDelete, onToggle }: {
  service:ServiceListing; isDark:boolean; highlighted:boolean; toggling:boolean;
  onEdit:()=>void; onDelete:()=>void; onToggle:()=>void;
}) {
  const descriptionId = useId();
  const [showDescription, setShowDescription] = useState(false);
  const photos = service.photos ?? [];
  const rejected = ['REJECTED', 'PENDING_REVIEW'].includes(service.status || '');
  const removed = service.status === 'SUSPENDED';
  const needsPrice = service.priceType === 'STARTS_AT' || service.priceType === 'CUSTOM' || (service.priceType !== 'BY_AGREEMENT' && Number(service.price) < 50);
  const active = !service.isPaused && !needsPrice;
  const rate = service.priceType === 'BY_AGREEMENT' ? 'Price by agreement' : needsPrice ? 'Price needed' : `₱${Number(service.price).toLocaleString()}`;
  const unit = service.priceType === 'PER_HOUR' ? ' / hour' : service.priceType === 'PER_DAY' ? ' / day' : service.priceType === 'PER_PROJECT' ? ' / project' : ' fixed price';
  const methods = [service.paymentMethods?.cash && 'Cash', service.paymentMethods?.gcash && 'GCash'].filter(Boolean).join(' · ');
  const lengthyDescription = (service.description?.length ?? 0) > 240;
  return <article className={styles.card} data-highlighted={highlighted} data-revision={rejected || removed} aria-label={service.title}>
    <header className={styles.header}>
      <div><h3 className={styles.title}>{service.title}</h3><p className={styles.category}>{service.category}</p></div>
      <span className={styles.status} data-state={removed || rejected ? 'attention' : active ? 'active' : 'paused'}>{removed ? 'Removed by Admin' : rejected ? 'Needs changes' : active ? 'Active' : needsPrice ? 'Price needed' : 'Paused'}</span>
    </header>
    <div className={styles.composition}>
      <div className={styles.media}>
        {photos.length ? <ListingPhotoGallery key={service.id} photos={photos} title={service.title} presentation="managed" /> : <div className={styles.placeholder} role="img" aria-label="No photo added">
          <span className={photoStyles.placeholderMark}><ImageBroken size={30} weight="light" className={photoStyles.placeholderIcon} aria-hidden="true" /></span>
          <span>No photos added</span><p>Add photos in Edit to show your service.</p>
        </div>}
      </div>
      <div className={styles.content}>
        <dl className={styles.price}><dt>Service price</dt><dd>{rate}{!needsPrice && service.priceType !== 'BY_AGREEMENT' && <small>{unit}</small>}</dd></dl>
        {service.priceType === 'BY_AGREEMENT' && <p className={styles.priceHint}>Review the request, then send your final price.</p>}
        <p className={styles.location}><MapPin size={17} aria-hidden="true" /><span>{service.serviceLocationMode === 'REMOTE' && <span>Online / remote · </span>}{service.locationLabel || 'Add your service area or venue in Edit to appear in nearby discovery.'}{service.coverageRadiusKm != null && service.serviceLocationMode !== 'REMOTE' && service.serviceLocationMode !== 'SEEKER_VISITS' && <span> · Travels up to {service.coverageRadiusKm} km</span>}</span></p>
        <div className={styles.descriptionBlock}>
          <h4>About this service</h4>
          <p id={descriptionId} className={styles.description} data-collapsed={lengthyDescription && !showDescription}>{service.description}</p>
          {lengthyDescription && <button type="button" className={styles.readMore} aria-expanded={showDescription} aria-controls={descriptionId} onClick={() => setShowDescription(value => !value)}>{showDescription ? 'Show less' : 'Read full description'}</button>}
        </div>
        <dl className={styles.facts} aria-label="Listing information">
          <div><dt><Timer size={16} aria-hidden="true" />Time needed</dt><dd>{service.estimatedDurationMins || 60} min</dd></div>
          <div><dt><Money size={16} aria-hidden="true" />Payment methods</dt><dd>{methods || 'Not set'}</dd></div>
          <div><dt><UsersThree size={16} aria-hidden="true" />Your work queue</dt><dd>{service.providerWaitingCount ?? service.queueSize ?? 0} paid waiting <span>across your work</span></dd></div>
          <div><dt><MapPin size={16} aria-hidden="true" />Public map</dt><dd>{service.publicMapPin ? 'Exact public pin' : 'Approximate public area'}</dd></div>
        </dl>
      </div>
    </div>
    <footer className={styles.actions}>
      <div className={styles.editActions}>
        {!removed && <button type="button" className={`${styles.button} ${styles.primary}`} onClick={onEdit}><PencilSimple size={17} aria-hidden="true" />{rejected ? 'Revise Listing' : 'Edit'}</button>}
        <button type="button" className={`${styles.button} ${styles.danger}`} onClick={onDelete}><Trash size={17} aria-hidden="true" />Delete</button>
      </div>
      {!rejected && !removed && <div className={styles.availability}>
        <span>Listing visibility</span>
        <button type="button" className={styles.switchButton} role="switch" aria-checked={active} aria-label={`Listing active: ${service.title}`} disabled={toggling || needsPrice} onClick={onToggle}>
          <span className={styles.switchTrack} data-active={active}><span>{toggling && <CircleNotch size={12} className={styles.spinner} aria-hidden="true" />}</span></span>{toggling ? 'Updating…' : active ? 'Active' : needsPrice ? 'Price needed' : 'Paused'}
        </button>
      </div>}
    </footer>
    {needsPrice && <p className={styles.notice}>Enter a final price in Edit Listing. This older listing is hidden from seekers until it has an exact bookable price.</p>}
    {rejected && <section className={styles.notice} data-error="true"><strong><WarningCircle size={17} aria-hidden="true" />What to fix</strong><p>{service.adminNotes || 'Check your service details, then save to publish.'}</p><p>Customers cannot see this service yet. Open Edit Listing, check the details, and save to publish. No admin approval is needed.</p><div className={styles.noticeActions}><ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId={service.id} isDark={isDark} /></div></section>}
    {removed && <section className={styles.notice} data-error="true"><strong>This listing was removed from public view.</strong><p>Existing bookings are still managed in Activity.</p><ContentCaseAction caseType="APPEAL" contentType="SERVICE_LISTING" resourceId={service.id} isDark={isDark} label="Appeal this removal" /></section>}
  </article>;
}
