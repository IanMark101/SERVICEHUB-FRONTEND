'use client';

import { arrangementLabel } from '../../../lib/serviceArrangement';

import { formatDistance } from '../../../lib/location';

import React, { useEffect } from 'react';
import useDialogFocus from '../../../hooks/useDialogFocus';
import type { JobRequest } from '../../../types';
import UserAvatar from '../../ui/UserAvatar';
import RequestPaymentMethods from '../../ui/RequestPaymentMethods';
import ContentCaseAction from '../../moderation/ContentCaseAction';
import styles from '../../ui/ListingDetails.module.css';
import { formatUrgencyDisplay } from './browseJobs.utils';
import { requestUrgencyRank } from '../../../lib/requestUrgency';
import ListingPhotoGallery from '../../ui/ListingPhotoGallery';
import {
  X,
  ShieldCheck,
  CheckCircle as CheckCircle2,
  CalendarBlank as CalendarDays,
  Alarm,
  ArrowRight,
  UserCircle,
  MapPin,
  Truck,
} from '@phosphor-icons/react';

interface JobRequestDetailsModalProps {
  request: JobRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBid: (requestId: string, budget?: number, targetServiceId?: string) => void;
  isOwned: boolean;
  hasSentBid: boolean;
  previousOffer?: { status: string };
  canTransact: boolean;
  onOpenBlockedModal: () => void;
  isDark: boolean;
  router: { push: (href: string) => void };
}

export default function JobRequestDetailsModal({
  request,
  isOpen,
  onClose,
  onOpenBid,
  isOwned,
  hasSentBid,
  previousOffer,
  canTransact,
  onOpenBlockedModal,
  isDark,
  router,
}: JobRequestDetailsModalProps) {
  const dialogRef = useDialogFocus(isOpen, false, onClose, 'dialog');
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  if (!isOpen || !request) return null;

  const totalBids = request.offersCount ?? 0;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="job-request-details-title" tabIndex={-1} ref={dialogRef} className={styles.overlay}>
      <div className={styles.panel} data-theme={isDark ? 'dark' : 'light'} data-tone="provider">
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.topbar}>
              <div className={styles.tags}>
                <span className={styles.category}>{request.category}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${requestUrgencyRank(request.urgency) === 4 ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-900/40' : requestUrgencyRank(request.urgency) >= 2 ? 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-900/40' : styles.tag}`}>
                  <Alarm size={14} aria-hidden="true" /><span>Needed: {formatUrgencyDisplay(request.urgency)}</span>
                </span>
              </div>
              <button type="button" onClick={onClose} aria-label="Close modal" className={styles.close}><X size={20} /></button>
            </div>
            <div className={styles.identity}>
              <div className={styles.person}>
                <UserAvatar src={request.seekerAvatar} name={request.seekerName || 'Service customer'} alt={request.seekerName} size={48} role="seeker" />
                <div className={styles.personText}>
                  <div className={styles.personName}><span>{request.seekerName}</span><span className={styles.tag}>Customer</span></div>
                  {request.seekerVerificationStatus === 'APPROVED' && <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1"><ShieldCheck size={14} /><span>Verified resident</span></div>}
                </div>
              </div>
              {request.seekerId && <button type="button" onClick={() => { onClose(); router.push(`/profile/${encodeURIComponent(request.seekerId)}`); }} className={styles.secondary}>View Profile <ArrowRight size={14} /></button>}
            </div>
            <h2 id="job-request-details-title" className={styles.title}>{request.title}</h2>
            <div className={styles.summary}>
              <div>
                <div className={styles.priceLine}>
                  <span className={styles.price}>{request.targetServiceId && !request.budget ? 'Quote required' : `₱${request.budget}`}</span>
                  <span className={styles.priceNote}>{request.targetServiceId ? 'Listed Rate' : 'Customer Budget'}</span>
                </div>
                {request.targetServiceId && <p className={styles.hint}>Requested from your listing</p>}
              </div>
              <div className={styles.geography}>
                {request.locationLabel && <p className={styles.locationLine}><MapPin size={15} aria-hidden="true" /><span>{request.locationLabel}{request.distanceKm != null && <> · {formatDistance(request.distanceKm)}</>}</span></p>}
                {request.serviceLocationMode !== 'REMOTE' && request.serviceLocationMode !== 'SEEKER_VISITS' && !!request.transportationFee && <p className={styles.locationLine}><Truck size={15} aria-hidden="true" /><span>Additional travel budget: ₱{request.transportationFee.toLocaleString()}. Offers include travel in their final total.</span></p>}
              </div>
            </div>
          </header>

          <div className={styles.body}>
            <ListingPhotoGallery key={request.id} photos={request.photos} title={request.title} />
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>About This Request</h3>
              <p className={styles.description}>{request.description}</p>
            </section>
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Request details</h3>
              <dl className={styles.detailFacts}>
                <div><dt><MapPin size={16} aria-hidden="true" />Work location</dt><dd>{arrangementLabel[request.serviceLocationMode ?? 'PROVIDER_VISITS']}</dd></div>
                <div><dt><Alarm size={16} aria-hidden="true" />When it is needed</dt><dd>{formatUrgencyDisplay(request.urgency)}</dd></div>
              </dl>
            </section>
            <div className={`${styles.info} ${styles.facts}`}>
              <div className={styles.row}><span className={styles.label}>Date Posted</span><span className={styles.value}><CalendarDays size={15} aria-hidden="true" />{request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently posted'}</span></div>
              <div className={styles.row}><span className={styles.label}>Submitted so far</span><span className={styles.value}>{totalBids} proposal{totalBids === 1 ? '' : 's'}</span></div>
            </div>
            <section className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Accepted Payment Methods</h3>
              <div className={styles.payment}><RequestPaymentMethods request={request} isDark={isDark} /></div>
            </section>
            <section className={styles.bookingGuide}>
              <h3 className={styles.sectionTitle}>How to offer your service</h3>
              <ol className={styles.bookingSteps}>
                <li><strong>Review the request</strong><p>Check the work, location and payment options.</p></li>
                <li><strong>Send your offer</strong><p>Include your final price and explain the work you will do.</p></li>
                <li><strong>Wait for the customer</strong><p>The customer reviews your offer and chooses whether to accept it.</p></li>
              </ol>
            </section>
          </div>
        </div>

        <footer className={styles.footer}>
          {!isOwned && <ContentCaseAction caseType="REPORT" contentType="SERVICE_REQUEST" resourceId={request.id} label="Report request" isDark={isDark} className={styles.report} />}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondary}>Close</button>
            {isOwned ? <div className={styles.tag}><UserCircle className="mr-1 inline h-3.5 w-3.5" />Your Request</div> :
              hasSentBid ? <div className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/20"><CheckCircle2 size={14} />{previousOffer?.status === 'accepted' || previousOffer?.status === 'ACCEPTED' ? 'Offer accepted' : 'Proposal Submitted'}</div> :
              <button type="button" onClick={() => { onClose(); if (!canTransact) { onOpenBlockedModal(); return; } onOpenBid(request.id, request.budget, request.targetServiceId || ''); }} className={styles.primary}>Send Offer <ArrowRight size={15} /></button>}
          </div>
        </footer>
      </div>
    </div>
  );
}
