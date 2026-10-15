'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus';
import ManagedServiceCard from './ManagedServiceCard';
import type { ServiceListing } from '../../types';
import styles from './ManagedServiceRow.module.css';

export default function ManagedServiceDetailsModal({service,isDark,toggling,onClose,onEdit,onDelete,onToggle}:{service:ServiceListing;isDark:boolean;toggling:boolean;onClose:()=>void;onEdit:()=>void;onDelete:()=>void;onToggle:()=>void}) {
  const ref=useDialogFocus(true,false,onClose,'dialog');
  useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
  return createPortal(<div className={styles.overlay} data-workspace="provider" onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className={styles.panel} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="managed-service-details-title"><header className={styles.modalHeader}><h2 id="managed-service-details-title">Service listing details</h2><button type="button" onClick={onClose} aria-label="Close service details"><X size={20}/></button></header><div className={styles.modalBody}><ManagedServiceCard service={service} isDark={isDark} highlighted={false} toggling={toggling} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle}/></div></section>
  </div>,document.body);
}
