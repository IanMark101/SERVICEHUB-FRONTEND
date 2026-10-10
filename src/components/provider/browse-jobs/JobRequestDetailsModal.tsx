'use client';

import { formatDistance } from '../../../lib/location';

import React, { useEffect } from 'react';
import type { JobRequest } from '../../../types';
import UserAvatar from '../../ui/UserAvatar';
import RequestPaymentMethods from '../../ui/RequestPaymentMethods';
import ContentCaseAction from '../../moderation/ContentCaseAction';
import styles from '../../ui/ListingDetails.module.css';
import { formatUrgencyDisplay } from './browseJobs.utils';
import { requestUrgencyRank } from '../../../lib/requestUrgency';
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

  if (!isOpen || !request) return null;

  const totalBids = request.offersCount ?? 0;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="job-request-details-title" className={styles.overlay}>
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
            <h2 id="job-request-details-title" className={styles.title}>{request.title}</h2>
            <div className={styles.summary}>
              <div>
                <div className={styles.priceLine}>
                  <span className={styles.price}>{request.targetServiceId && !request.budget ? 'Quote required' : `₱${request.budget}`}</span>
                  <span className={styles.priceNote}>{request.targetServiceId ? 'Listed Rate' : 'Seeker Budget'}</span>
                </div>
                {request.targetServiceId && <p className={styles.hint}>Requested from your listing</p>}
              </div>
              <div className={styles.geography}>
                {request.locationLabel && <p className={styles.locationLine}><MapPin size={15} aria-hidden="true" /><span>{request.locationLabel}{request.distanceKm != null && <> · {formatDistance(request.distanceKm)}</>}</span></p>}
                {!!request.transportationFee && <p className={styles.locationLine}><Truck size={15} aria-hidden="true" /><span>Additional travel budget: ₱{request.transportationFee.toLocaleString()}. Offers include travel in their final total.</span></p>}
              </div>
            </div>
          </header>

          <div className={styles.body}>
            <div className={styles.identity}>
              <div className={styles.person}>
                <UserAvatar src={request.seekerAvatar} name={request.seekerName || 'Service seeker'} alt={request.seekerName} size={48} role="seeker" />
                <div className={styles.personText}>
                  <div className={styles.personName}><span>{request.seekerName}</span><span className={styles.tag}>Service Seeker</span></div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1"><ShieldCheck size={14} /><span>Verified resident</span></div>
                </div>
              </div>
              {request.seekerId && <button type="button" onClick={() => router.push(`/profile/${encodeURIComponent(request.seekerId)}`)} className={styles.secondary}>View Profile <ArrowRight size={14} /></button>}
            </div>
            <section>
              <h3 className={styles.label}>About This Request</h3>
              <p className={styles.description}>{request.description}</p>
            </section>
            <div className={`${styles.info} ${styles.facts}`}>
              <div className={styles.row}><span className={styles.label}>Date Posted</span><span className={styles.value}><CalendarDays size={15} aria-hidden="true" />{request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently posted'}</span></div>
              <div className={styles.row}><span className={styles.label}>Submitted so far</span><span className={styles.value}>{totalBids} proposal{totalBids === 1 ? '' : 's'}</span></div>
            </div>
            <section>
              <h3 className={styles.label}>Accepted Payment Methods</h3>
              <div className={styles.payment}><RequestPaymentMethods request={request} isDark={isDark} /></div>
              <p className={styles.hint}>Submit an offer if you can accept the payment options shown. The seeker chooses a method when accepting.</p>
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
