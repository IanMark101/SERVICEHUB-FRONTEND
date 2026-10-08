"use client";

import TrustScoreBadge from '../../ui/TrustScoreBadge';
import React, { useEffect } from 'react';
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
} from 'lucide-react';
import type { ServiceListing, JobEngagement } from '../../../types';
import { getServicePaymentMethods } from '../../../lib/paymentUtils';
import ContentCaseAction from '../../moderation/ContentCaseAction';
import styles from '../../ui/ListingDetails.module.css';
import GCashLogo from '../../ui/GCashLogo';

interface ServiceDetailsModalProps {
  listing: ServiceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onBookListing: (listing: ServiceListing, method?: 'GCash' | 'On-site Cash') => void;
  onJoinWaitlist: (listing: ServiceListing) => void;
  joiningWaitlistId: string | null;
  isOwned: boolean;
  activeEngagement?: JobEngagement;
  isDark: boolean;
  router: { push: (href: string) => void };
  prefetchProviderSummary: (listing: ServiceListing) => void;
}

export default function ServiceDetailsModal({
  listing,
  isOpen,
  onClose,
  onBookListing,
  onJoinWaitlist,
  joiningWaitlistId,
  isOwned,
  activeEngagement,
  isDark,
  router,
  prefetchProviderSummary,
}: ServiceDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !listing) return null;

  const { cash, gcash } = getServicePaymentMethods(listing);
  const isVerified = listing.providerVerificationStatus === 'APPROVED';
  const trustScore = listing.providerTrustScore;
  const isQueueFull = gcash && (listing.providerWaitingCount ?? listing.queueSize) >= (listing.queueLimit || 5);
  const queueCount = listing.providerWaitingCount ?? listing.queueSize;
  const queueLimit = listing.queueLimit || 5;
  const priceUnavailable =
    listing.priceType === 'STARTS_AT' ||
    listing.priceType === 'CUSTOM' ||
    Number(listing.price) < 50;

  const handleBookClick = () => {
    prefetchProviderSummary(listing);
    onClose();
    onBookListing(listing, cash ? 'On-site Cash' : 'GCash');
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="service-details-title" className={styles.overlay}>
      <div className={styles.panel} data-theme={isDark ? 'dark' : 'light'}>
        <header className={styles.header}>
          <div className={styles.topbar}>
            <div className={styles.tags}>
              <span className={styles.category}>{listing.category}</span>
              {isOwned && <span className={styles.tag}>Your Listing</span>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close service details" className={styles.close}><X size={20} /></button>
          </div>
          <h2 id="service-details-title" className={styles.title}>{listing.title}</h2>
          <div className={styles.priceLine}>
            {priceUnavailable ? <span className={styles.priceNote}>Price set upon quote</span> : <>
              <span className={styles.price}>₱{Number(listing.price).toLocaleString()}</span>
              <span className={styles.priceNote}>{listing.priceType === 'PER_HOUR' ? '/ hour' : listing.priceType === 'PER_DAY' ? '/ day' : listing.priceType === 'PER_PROJECT' ? '/ project' : 'fixed price'}</span>
            </>}
          </div>
        </header>
        <div className={styles.body}>
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
          <section>
            <h3 className={styles.label}>About This Service</h3>
            <p className={styles.description}>{listing.description}</p>
          </section>
          <div className={styles.info}>
            {listing.estimatedDurationMins && <div className={styles.row}>
              <span className={styles.label}>Estimated duration</span>
              <span className={styles.value}><Clock size={15} aria-hidden="true" /><span>{listing.estimatedDurationMins} minutes</span></span>
            </div>}
            {gcash ? <section className={styles.queue}>
              <div className={styles.queueHeading}><h3 className={styles.label}>Online queue · GCash bookings only</h3><span className={styles.value}>{queueCount} / {queueLimit} waiting</span></div>
              {isQueueFull ? <div className={`${styles.queueMessage} text-rose-700 dark:text-rose-400`}><AlertCircle size={15} /><span>Online queue is currently full. Join the waitlist to be notified when space opens.{cash && ' On-site Cash requests remain subject to provider approval.'}</span></div> : queueCount > 0 ?
                <div className={`${styles.queueMessage} text-ink-muted`}><Clock size={15} /><span>Provider has {queueCount} paid job{queueCount === 1 ? '' : 's'} in queue. New bookings follow first-come, first-served order.</span></div> :
                <div className={`${styles.queueMessage} text-emerald-700 dark:text-emerald-400`}><CheckCircle2 size={15} /><span>No paid bookings are waiting. The provider confirms when work starts.</span></div>}
            </section> : cash && <section className={styles.queue}>
              <h3 className={styles.label}>Scheduling</h3>
              <p className={styles.description}>Subject to provider approval. Arrange the schedule with the provider and pay in person upon completion.</p>
            </section>}
          </div>
          <section>
            <h3 className={styles.label}>Accepted Payment Methods</h3>
            <div className={styles.payment}>
              {cash && <div className={styles.paymentChip}><MapPin size={14} aria-hidden="true" /><span>On-site Cash (settled in person upon completion)</span></div>}
              {gcash && <div className={styles.paymentChip}><GCashLogo /><span>· Test Mode (secured online checkout)</span></div>}
            </div>
          </section>
        </div>
        <footer className={styles.footer}>
          {!isOwned && <ContentCaseAction caseType="REPORT" contentType="SERVICE_LISTING" resourceId={listing.id} label="Report listing" isDark={isDark} />}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondary}>Cancel</button>
            {isOwned ? <button type="button" onClick={() => { onClose(); router.push(`/provider/service-manager?id=${listing.id}`); }} className={styles.primary}>Edit Listing</button> :
              activeEngagement ? <button type="button" onClick={() => { onClose(); router.push(`/seeker/seeker-activity?tab=all&booking=${activeEngagement.id}`); }} className={styles.primary}>View Active Booking</button> :
              priceUnavailable ? <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Price unavailable</span> :
              isQueueFull ? <>
                <button type="button" onClick={() => onJoinWaitlist(listing)} disabled={joiningWaitlistId === listing.id} className={styles.notify}><Bell size={14} />{joiningWaitlistId === listing.id ? (cash ? 'Joining...' : 'Joining Waitlist...') : (cash ? 'Notify Me' : 'Notify Me When Open')}</button>
                {cash && <button type="button" onClick={() => { onClose(); onBookListing(listing, 'On-site Cash'); }} className={styles.primary}>Direct Cash</button>}
              </> : <button type="button" onClick={handleBookClick} className={styles.primary}><Briefcase size={14} /><span>Book This Service</span></button>}
          </div>
        </footer>
      </div>
    </div>
  );
}
