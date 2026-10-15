'use client';

import { ArrowRight, BriefcaseBusiness, Sparkles } from 'lucide-react';
import type { ServiceListing } from '../../types';
import { listingPriceLabel } from '../../lib/listingPricing';
import styles from './ManagedServiceRow.module.css';

export default function ManagedServiceRow({service,highlighted,onDetails,onMatches}:{service:ServiceListing;highlighted:boolean;onDetails:()=>void;onMatches:()=>void}) {
  const attention=['REJECTED','PENDING_REVIEW','SUSPENDED'].includes(service.status||'');
  const needsPrice=service.priceType!=='BY_AGREEMENT'&&(['CUSTOM','STARTS_AT'].includes(service.priceType||'')||Number(service.price)<50);
  const active=service.status==='ACTIVE'&&!service.isPaused&&!needsPrice;
  const status=service.status==='SUSPENDED'?'Removed':attention?'Needs changes':needsPrice?'Price needed':active?'Active':'Paused';
  return <article className={styles.row} data-highlighted={highlighted} aria-label={service.title}>
    <span className={styles.icon} aria-hidden="true"><BriefcaseBusiness size={21}/></span>
    <div className={styles.identity}><div className={styles.heading}><h3>{service.title}</h3><span className={styles.status} data-attention={attention} data-active={active}>{status}</span></div><p>{service.category}{service.locationLabel&&<> · {service.locationLabel}</>}</p></div>
    <div className={styles.price}>{listingPriceLabel(service)}</div>
    <div className={styles.actions}>{!attention&&!needsPrice&&<button type="button" onClick={onMatches} aria-label={`AI matches for ${service.title}`} aria-haspopup="dialog"><Sparkles size={15} aria-hidden="true"/>AI Matches</button>}<button type="button" className={styles.details} onClick={onDetails} aria-label={`Details of ${service.title}`} aria-haspopup="dialog">Details<ArrowRight size={15} aria-hidden="true"/></button></div>
  </article>;
}
