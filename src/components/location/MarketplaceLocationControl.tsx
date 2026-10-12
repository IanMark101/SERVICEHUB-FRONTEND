'use client';

import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, PencilSimple, X } from '@phosphor-icons/react';
import { LocationSchema, SearchRadiusSchema, SEARCH_RADII, SEARCH_RADIUS_MIN_KM, SEARCH_RADIUS_MAX_KM, SEARCH_RADIUS_STEP_KM, type MarketplaceLocation, type LocationPoint } from '../../lib/location';
import useDialogFocus from '../../hooks/useDialogFocus';
import useProviderMapListings, { type ProviderMapFilters } from '../../hooks/useProviderMapListings';
import type { MarketplaceMapViewport } from '../../lib/marketplace-map';
import LocationEditor from './LocationEditor';
import FormSelect from '../ui/FormSelect';
import styles from './Location.module.css';

function LocationDialog({ value, workspace, onClose, onApply, providerMap, onViewListing }: {
  value:MarketplaceLocation | null; workspace:'seeker'|'provider'; onClose:() => void; onApply:(value:MarketplaceLocation) => void;
  providerMap?:ProviderMapFilters; onViewListing?:(id:string)=>void;
}) {
  const title = useId();
  const radiusInputId = useId();
  const radiusHintId = useId();
  const radiusErrorId = useId();
  const [point,setPoint] = useState<LocationPoint | null>(value?.point || null);
  const [pending,setPending]=useState(false);
  const [viewport,setViewport]=useState<MarketplaceMapViewport|null>(null);
  const mapListings=useProviderMapListings(viewport,workspace==='seeker' ? providerMap : undefined);
  const initialRadius = value?.radiusKm ?? 10;
  const [radiusChoice,setRadiusChoice] = useState(SEARCH_RADII.some(km => km === initialRadius) ? String(initialRadius) : 'custom');
  const [customRadius,setCustomRadius] = useState(String(initialRadius));
  const radiusDraft = radiusChoice === 'custom' ? customRadius : radiusChoice;
  const radiusResult = SearchRadiusSchema.safeParse(radiusDraft.trim() ? Number(radiusDraft) : NaN);
  const radius = radiusResult.success ? radiusResult.data : undefined;
  const radiusError = radiusResult.success ? '' : !radiusDraft.trim() ? 'Enter a custom radius.' : radiusResult.error.issues[0].message;
  const ref = useDialogFocus(true,false,onClose,'dialog');
  const valid = !pending && LocationSchema.safeParse(point).success && radiusResult.success;
  const accent = workspace==='provider' ? '#059669' : 'var(--color-brand-text)';
  return <div className={styles.overlay} data-form-tone={workspace} style={{ '--location-accent':accent, '--location-button': workspace === 'provider' ? 'var(--color-provider-hover, #047857)' : 'var(--color-seeker-primary, var(--color-brand-text))' } as React.CSSProperties} onClick={event => { if(event.target===event.currentTarget)onClose(); }}>
    <div className={styles.panel} data-marketplace-dialog role="dialog" aria-modal="true" aria-labelledby={title} tabIndex={-1} ref={ref}>
      <header className={styles.header}><h2 id={title}>Change search location</h2><button className={styles.close} type="button" aria-label="Close location dialog" onClick={onClose}><X size={20}/></button></header>
      <div className={styles.body}>
        <p className={styles.hint}>Choose a location and search radius. The circle previews the area used to find nearby {workspace==='seeker' ? 'service bases' : 'job locations'}. Your search, category and quick filters stay applied.</p>
        <p className={styles.hint}>{workspace === 'seeker' ? 'This changes browsing only. Coverage is checked against your actual job location when booking.' : 'This changes browsing only. It does not change a listing’s service coverage.'}</p>
        <div className={styles.fieldGroup}>
          <label><span className={styles.label}>Search radius</span><FormSelect tone={workspace} className={styles.field} value={radiusChoice} aria-describedby={radiusHintId} onChange={event => {
            const choice = event.target.value;
            if (choice === 'custom' && radiusResult.success) setCustomRadius(String(radiusResult.data));
            setRadiusChoice(choice);
          }}>{SEARCH_RADII.map(km=><option key={km} value={km}>{km} kilometer{km===1 ? '' : 's'}</option>)}<option value="custom">Custom radius</option></FormSelect></label>
          <p id={radiusHintId} className={styles.hint}>Choose 0.5–30 km, in increments of 0.1 km.</p>
        </div>
        {radiusChoice === 'custom' && <div className={styles.fieldGroup}>
          <label htmlFor={radiusInputId} className={styles.label}>Custom radius (km)</label>
          <input id={radiusInputId} className={`${styles.field} ${styles.radiusInput}`} type="number" inputMode="decimal" min={SEARCH_RADIUS_MIN_KM} max={SEARCH_RADIUS_MAX_KM} step={SEARCH_RADIUS_STEP_KM} required value={customRadius} placeholder="e.g. 2.5" aria-invalid={Boolean(radiusError)} aria-describedby={`${radiusHintId}${radiusError ? ` ${radiusErrorId}` : ''}`} onChange={event => setCustomRadius(event.target.value)}/>
          {radiusError && <p id={radiusErrorId} role="alert" className={styles.error}>{radiusError}</p>}
        </div>}
        {providerMap && workspace==='seeker' && <div className={styles.hint}>
          <p>Orange: your search location and radius. Green: provider service areas, including outside the circle. Markers are approximate; exact locations stay private.</p>
          <p role="status">{mapListings.error || (mapListings.loading ? 'Loading provider listings…' : mapListings.resolved ? `${mapListings.pins.length} provider listing${mapListings.pins.length===1 ? '' : 's'} loaded for this map.` : '')}</p>
          {mapListings.limited && <p>Zoom in to load providers across the visible area.</p>}
          {mapListings.error && <button className={styles.button} type="button" onClick={mapListings.retry}>Retry provider listings</button>}
        </div>}
        <LocationEditor value={point} onChange={setPoint} radiusKm={radius} accent={accent} label="Search area name" onPendingChange={setPending}
          mapResults={providerMap && workspace==='seeker' ? mapListings.pins : undefined} onViewportChange={providerMap && workspace==='seeker' ? setViewport : undefined}
          onResultSelect={id=>{ onClose();onViewListing?.(id); }}/>
      </div>
      <footer className={styles.footer}><button className={styles.button} type="button" onClick={onClose}>Cancel</button><button className={`${styles.button} ${styles.primary}`} type="button" disabled={!valid} onClick={() => { if(point && valid && radiusResult.success)onApply({ point:{ latitude:point.latitude, longitude:point.longitude, label:point.label },radiusKm:radiusResult.data }); }}>Apply location</button></footer>
    </div>
  </div>;
}

export default function MarketplaceLocationControl({ value, workspace, onApply, open: controlledOpen, onOpenChange, providerMap, onViewListing }: {
  value:MarketplaceLocation | null; workspace:'seeker'|'provider'; onApply:(value:MarketplaceLocation) => void;
  open?:boolean; onOpenChange?:(open:boolean) => void;
  providerMap?:ProviderMapFilters; onViewListing?:(id:string)=>void;
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
    {open && createPortal(<LocationDialog value={value} workspace={workspace} providerMap={providerMap} onViewListing={onViewListing} onClose={() => setOpen(false)} onApply={next=>{onApply(next);setOpen(false);}}/>, document.body)}
  </div>;
}
