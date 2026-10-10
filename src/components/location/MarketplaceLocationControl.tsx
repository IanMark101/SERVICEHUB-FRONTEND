'use client';

import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, PencilSimple, X } from '@phosphor-icons/react';
import { LocationSchema, SEARCH_RADII, type MarketplaceLocation, type LocationPoint } from '../../lib/location';
import useDialogFocus from '../../hooks/useDialogFocus';
import LocationEditor from './LocationEditor';
import FormSelect from '../ui/FormSelect';
import styles from './Location.module.css';

function LocationDialog({ value, workspace, onClose, onApply }: {
  value:MarketplaceLocation | null; workspace:'seeker'|'provider'; onClose:() => void; onApply:(value:MarketplaceLocation) => void;
}) {
  const title = useId();
  const [point,setPoint] = useState<LocationPoint | null>(value?.point || null);
  const [radius,setRadius] = useState(value?.radiusKm || 10);
  const ref = useDialogFocus(true,false,onClose,'dialog');
  const valid = LocationSchema.safeParse(point).success;
  const accent = workspace==='provider' ? '#059669' : 'var(--color-brand-text)';
  return <div className={styles.overlay} data-form-tone={workspace} style={{ '--location-accent':accent, '--location-button': workspace === 'provider' ? 'var(--color-provider-hover, #047857)' : 'var(--color-seeker-primary, var(--color-brand-text))' } as React.CSSProperties} onClick={event => { if(event.target===event.currentTarget)onClose(); }}>
    <div className={styles.panel} data-marketplace-dialog role="dialog" aria-modal="true" aria-labelledby={title} tabIndex={-1} ref={ref}>
      <header className={styles.header}><h2 id={title}>Change search location</h2><button className={styles.close} type="button" aria-label="Close location dialog" onClick={onClose}><X size={20}/></button></header>
      <div className={styles.body}>
        <p className={styles.hint}>Choose a location and search radius. The circle previews the area used to find nearby {workspace==='seeker' ? 'service bases' : 'job locations'}. Your search, category and quick filters stay applied.</p>
        <p className={styles.hint}>{workspace === 'seeker' ? 'This changes browsing only. Coverage is checked against your actual job location when booking.' : 'This changes browsing only. It does not change a listing’s service coverage.'}</p>
        <label><span className={styles.label}>Search radius</span><FormSelect tone={workspace} className={styles.field} value={radius} onChange={event => setRadius(Number(event.target.value))}>{SEARCH_RADII.map(km=><option key={km} value={km}>{km} kilometer{km===1 ? '' : 's'}</option>)}</FormSelect></label>
        <LocationEditor value={point} onChange={setPoint} radiusKm={radius} accent={accent} label="Search area name"/>
      </div>
      <footer className={styles.footer}><button className={styles.button} type="button" onClick={onClose}>Cancel</button><button className={`${styles.button} ${styles.primary}`} type="button" disabled={!valid} onClick={() => { if(point && valid)onApply({ point:{ latitude:point.latitude, longitude:point.longitude, label:point.label },radiusKm:radius }); }}>Apply location</button></footer>
    </div>
  </div>;
}

export default function MarketplaceLocationControl({ value, workspace, onApply, open: controlledOpen, onOpenChange }: {
  value:MarketplaceLocation | null; workspace:'seeker'|'provider'; onApply:(value:MarketplaceLocation) => void;
  open?:boolean; onOpenChange?:(open:boolean) => void;
}) {
  const [localOpen,setLocalOpen]=useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  return <div className={styles.control} data-marketplace-location data-workspace={workspace} data-form-tone={workspace}>
    <button className={styles.trigger} type="button" aria-haspopup="dialog" aria-expanded={open}
      aria-label={value ? `Location: ${value.point.label}. Radius: ${value.radiusKm} km. Change location` : 'Choose your search location'}
      onClick={() => setOpen(true)}>
      <span className={styles.locationIcon}><MapPin size={22} weight="duotone" aria-hidden="true"/></span>
      <span className={styles.triggerDetails}>
        <span className={styles.triggerLabel}>Search location</span>
        <span className={styles.locationSummary}>
          <span className={styles.area} title={value?.point.label}>{value ? value.point.label : 'Choose your area'}</span>
          <small>{value ? `Within ${value.radiusKm} km` : 'See nearby results'}</small>
        </span>
      </span>
      <span className={styles.changeAction}>{value ? 'Change' : 'Choose'}<PencilSimple size={14} aria-hidden="true"/></span>
    </button>
    {open && createPortal(<LocationDialog value={value} workspace={workspace} onClose={() => setOpen(false)} onApply={next=>{onApply(next);setOpen(false);}}/>, document.body)}
  </div>;
}
