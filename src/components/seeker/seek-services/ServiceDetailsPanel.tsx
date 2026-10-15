'use client';

import { arrangementLabel } from '../../../lib/serviceArrangement';

import { formatDistance } from '../../../lib/location';

import TrustScoreBadge from '../../ui/TrustScoreBadge';
import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Bell,
  Briefcase,
  Truck,
  Banknote,
} from 'lucide-react';
import type { ServiceListing, JobEngagement } from '../../../types';
import { getServicePaymentMethods } from '../../../lib/paymentUtils';
import styles from '../../ui/ListingDetails.module.css';
import GCashLogo from '../../ui/GCashLogo';
import ListingPhotoGallery from '../../ui/ListingPhotoGallery';
import { isPriceByAgreement } from '../../../lib/listingPricing';

export interface ServiceDetailsPanelProps {
  listing: ServiceListing;
  onClose: () => void;
  onBookListing: (listing: ServiceListing, method?: 'GCash' | 'On-site Cash') => void;
  onJoinWaitlist: (listing: ServiceListing) => void;
  joiningWaitlistId: string | null;
  isOwned: boolean;
  activeEngagement?: JobEngagement;
  isDark: boolean;
  router: { push: (href: string) => void };
  titleId?: string;
  compact?: boolean;
  reportAction?: ReactNode;
  prefetchProviderSummary: (listing: ServiceListing) => void;
}

export default function ServiceDetailsPanel({
  listing,
  titleId = 'service-details-title',
  compact = false,
  reportAction,
  onClose,
  onBookListing,
  onJoinWaitlist,
  joiningWaitlistId,
  isOwned,
  activeEngagement,
  isDark,
  router,
  prefetchProviderSummary,
}: ServiceDetailsPanelProps) {
  const { cash, gcash } = getServicePaymentMethods(listing);
  const agreement = isPriceByAgreement(listing);
  const requestFirst = agreement;
  const isVerified = listing.providerVerificationStatus === 'APPROVED';
  const trustScore = listing.providerTrustScore;
  const isQueueFull = gcash && (listing.providerWaitingCount ?? listing.queueSize) >= (listing.queueLimit || 5);
  const queueCount = listing.providerWaitingCount ?? listing.queueSize;
  const queueLimit = listing.queueLimit || 5;
  const priceUnavailable =
    listing.priceType === 'STARTS_AT' ||
    listing.priceType === 'CUSTOM' ||
    (!agreement && Number(listing.price) < 50);

  const handleBookClick = () => {
    prefetchProviderSummary(listing);
    onClose();
    onBookListing(listing, listing.serviceLocationMode === 'REMOTE' && gcash && !isQueueFull ? 'GCash' : cash ? 'On-site Cash' : 'GCash');
  };

  return (
      <div className={styles.panel} data-layout={compact ? 'compact' : undefined} data-theme={isDark ? 'dark' : 'light'}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.topbar}>
              <div className={styles.tags}>
                <span className={styles.category}>{listing.category}</span>
                {isOwned && <span className={styles.tag}>Your Listing</span>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close service details" className={styles.close}><X size={20} /></button>
            </div>
            <div className={styles.identity}>
              <div className={styles.person}>
                {listing.providerAvatar ? <Image unoptimized width={48} height={48} src={listing.providerAvatar} alt={listing.providerName} className="size-12 rounded-full object-cover shrink-0" /> :
                  <div className="size-12 rounded-full bg-orange-100 dark:bg-charcoal text-orange-800 dark:text-orange-300 grid place-items-center font-bold text-base shrink-0">{listing.providerName?.charAt(0) || 'P'}</div>}
                <div className={styles.personText}>
                  <div className={styles.personName}>
                    <span>{listing.providerName}</span>
                    {isVerified && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"><ShieldCheck size={14} />Verified</span>}
                  </div>
                  <div className={styles.reputation}>
                    {listing.reviewCount && listing.reviewCount > 0 ? <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-500 text-amber-500" />{listing.rating.toFixed(1)} ({listing.reviewCount})</span> : <span>New Provider</span>}
                    <TrustScoreBadge score={trustScore} />
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => { onClose(); router.push(`/profile/${encodeURIComponent(listing.providerId)}`); }} className={styles.secondary}>View Profile <ArrowUpRight size={14} /></button>
            </div>
            <h2 id={titleId} className={styles.title}>{listing.title}</h2>
            <div className={styles.summary}>
              <div className={styles.priceLine}>
                {agreement ? <span className={styles.price}>Price by agreement</span> : priceUnavailable ? <span className={styles.priceNote}>Price set upon quote</span> : <>
                  <span className={styles.price}>₱{Number(listing.price).toLocaleString()}</span>
                  <span className={styles.priceNote}>{listing.priceType === 'PER_HOUR' ? '/ hour' : listing.priceType === 'PER_DAY' ? '/ day' : listing.priceType === 'PER_PROJECT' ? '/ project' : 'fixed price'}</span>
                </>}
              </div>
              <div className={styles.geography}>
                {(listing.locationLabel || listing.serviceLocationMode === 'REMOTE') && <p className={styles.locationLine}><MapPin size={15} aria-hidden="true" /><span>{listing.serviceLocationMode === 'REMOTE' ? `Online / remote${listing.locationLabel ? ' · ' + listing.locationLabel : ''}` : listing.locationLabel}{listing.serviceLocationMode !== 'REMOTE' && listing.distanceKm != null && <> · {formatDistance(listing.distanceKm)}</>}</span></p>}
                {listing.serviceLocationMode !== 'REMOTE' && listing.serviceLocationMode !== 'SEEKER_VISITS' && !!listing.transportationFee && <p className={styles.locationLine}><Truck size={15} aria-hidden="true" /><span>+ ₱{listing.transportationFee.toLocaleString()} transportation, once when the provider visits</span></p>}
              </div>
            </div>
          </header>
          <div className={styles.body}>
            <ListingPhotoGallery key={listing.id} photos={listing.photos} title={listing.title} />
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>About This Service</h3>
              <p className={styles.description}>{listing.description}</p>
            </section>
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Service details</h3>
              <dl className={styles.detailFacts}>
                <div><dt><MapPin size={16} aria-hidden="true" />Service arrangement</dt><dd>{arrangementLabel[listing.serviceLocationMode ?? 'PROVIDER_VISITS']}</dd></div>
                {!!listing.estimatedDurationMins && <div><dt><Clock size={16} aria-hidden="true" />Estimated duration</dt><dd>{listing.estimatedDurationMins} minutes</dd></div>}
              </dl>
            </section>
            {requestFirst && <section className={styles.bookingGuide}>
              <h3 className={styles.sectionTitle}>How booking works</h3>
              <ol className={styles.bookingSteps}>
                <li><strong>Describe the work</strong><p>Send a private service request to this provider.</p></li>
                <li><strong>Review the final price</strong><p>The provider proposes a total and explains what it includes, or declines.</p></li>
                <li><strong>Approve and book</strong><p>You approve the price before booking or payment.</p></li>
              </ol>
            </section>}
            <div className={styles.info}>
              {gcash ? <section className={`${styles.queue} ${styles.detailSection}`}>
                <div className={styles.queueHeading}><h3 className={styles.label}>Online queue · GCash bookings only</h3><span className={styles.value}>{queueCount} / {queueLimit} waiting</span></div>
                {isQueueFull ? <div className={`${styles.queueMessage} text-rose-700 dark:text-rose-400`}><AlertCircle size={15} /><span>{requestFirst ? 'The paid queue is full. You can still request a price. GCash availability is checked when you approve it.' : <>Online queue is currently full. Join the waitlist to be notified when space opens.{cash && ' On-site Cash requests remain subject to provider approval.'}</>}</span></div> : queueCount > 0 ?
                  <div className={`${styles.queueMessage} text-ink-muted`}><Clock size={15} /><span>Provider has {queueCount} paid job{queueCount === 1 ? '' : 's'} in queue. New bookings follow first-come, first-served order.</span></div> :
                  <div className={`${styles.queueMessage} text-emerald-700 dark:text-emerald-400`}><CheckCircle2 size={15} /><span>No paid bookings are waiting. The provider confirms when work starts.</span></div>}
              </section> : cash && <section className={`${styles.queue} ${styles.detailSection}`}>
                <h3 className={styles.label}>Scheduling</h3>
                <p className={styles.description}>{requestFirst ? 'Approve the provider’s final price to book. Arrange the schedule with the provider and pay in person upon completion.' : 'Subject to provider approval. Arrange the schedule with the provider and pay in person upon completion.'}</p>
              </section>}
            </div>
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Accepted Payment Methods</h3>
              <div className={styles.payment}>
                {cash && <div className={styles.paymentOption}><Banknote size={20} aria-hidden="true" /><div><strong>{listing.serviceLocationMode === 'REMOTE' ? 'Cash by separate arrangement' : 'On-site Cash'}</strong><p>{listing.serviceLocationMode === 'REMOTE' ? 'The work is online. Cash requires a separate in-person payment arrangement.' : 'Pay the provider in person when the work is completed.'}</p></div></div>}
                {gcash && <div className={styles.paymentOption}><GCashLogo /><div><strong>GCash · Test Mode</strong><p>Use the online test checkout. This is a demonstration payment.</p></div></div>}
              </div>
            </section>
        </div>
        </div>
        <footer className={styles.footer}>
          {!isOwned && reportAction}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondary}>Close</button>
            {isOwned ? <button type="button" onClick={() => { onClose(); router.push(`/provider/service-manager?id=${listing.id}`); }} className={styles.primary}>Edit Listing</button> :
              activeEngagement ? <button type="button" onClick={() => { onClose(); router.push(`/seeker/seeker-activity?tab=all&booking=${activeEngagement.id}`); }} className={styles.primary}>View Active Booking</button> :
              requestFirst ? <button type="button" onClick={handleBookClick} className={styles.primary}>Request service</button> :
              priceUnavailable ? <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Price unavailable</span> :
              isQueueFull ? <>
                <button type="button" onClick={() => onJoinWaitlist(listing)} disabled={joiningWaitlistId === listing.id} className={styles.notify}><Bell size={14} />{joiningWaitlistId === listing.id ? (cash ? 'Joining...' : 'Joining Waitlist...') : (cash ? 'Notify Me' : 'Notify Me When Open')}</button>
                {cash && <button type="button" onClick={() => { onClose(); onBookListing(listing, 'On-site Cash'); }} className={styles.primary}>Direct Cash</button>}
              </> : <button type="button" onClick={handleBookClick} className={styles.primary}><Briefcase size={14} /><span>Book This Service</span></button>}
          </div>
        </footer>
      </div>
  );
}
