'use client';

import { useEffect } from 'react';
import useDialogFocus from '../../../hooks/useDialogFocus';
import ServiceDetailsPanel, { type ServiceDetailsPanelProps } from './ServiceDetailsPanel';
import ContentCaseAction from '../../moderation/ContentCaseAction';
import styles from '../../ui/ListingDetails.module.css';

type ServiceDetailsModalProps = Omit<ServiceDetailsPanelProps, 'listing' | 'titleId' | 'reportAction'> & {
  listing: ServiceDetailsPanelProps['listing'] | null;
  isOpen: boolean;
};

export default function ServiceDetailsModal({ listing, isOpen, ...props }: ServiceDetailsModalProps) {
  const { onClose, isDark, isOwned } = props;
  const dialogRef = useDialogFocus(isOpen, false, onClose, 'dialog');
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !listing) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="service-details-title" tabIndex={-1} ref={dialogRef} className={styles.overlay}>
      <ServiceDetailsPanel {...props} listing={listing} reportAction={!isOwned && <ContentCaseAction caseType="REPORT" contentType="SERVICE_LISTING" resourceId={listing.id} label="Report listing" isDark={isDark} className={styles.report} />} />
    </div>
  );
}
