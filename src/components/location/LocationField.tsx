'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, MapPinned } from 'lucide-react';
import type { LocationPoint } from '../../lib/location';
import LocationEditor from './LocationEditor';
import styles from './Location.module.css';

export default function LocationField({ value, onChange, label, radiusKm, privateAddress = false, disabled = false, workspace = 'seeker', hint, selectionMode = 'pin', required = false, error }: {
  value:LocationPoint | null; onChange:(point:LocationPoint) => void; label:string; radiusKm?:number | null; privateAddress?:boolean; disabled?:boolean; workspace?:'seeker'|'provider'; hint?:string; selectionMode?:'area'|'pin'; required?:boolean; error?:string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const summaryRef = useRef<HTMLElement>(null);
  const areaOnly = selectionMode === 'area';
  useEffect(() => {
    if (!error || disabled) return;
    const summary = summaryRef.current;
    if (summary?.parentElement instanceof HTMLDetailsElement) summary.parentElement.open = true;
    summary?.focus();
    summary?.scrollIntoView?.({ block: 'center', behavior: 'instant' });
  }, [error, disabled]);
  return <div className={styles.fieldGroup} data-form-tone={workspace}>
    <span id={`${id}-label`} className={styles.label}>{label}{required && ' (required)'}</span>
    <details className={styles.inline} data-disabled={disabled} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary ref={summaryRef} aria-invalid={Boolean(error)} aria-labelledby={`${id}-label ${id}-title ${id}-action`} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} aria-disabled={disabled} tabIndex={disabled ? -1 : 0} onClick={event => { if (disabled) event.preventDefault(); }}>
        <span className={styles.pickerIcon}><MapPinned size={22} aria-hidden="true" /></span>
        <span className={styles.pickerCopy}>
          <strong id={`${id}-title`}>{value?.label || (areaOnly ? 'Choose a city or barangay' : 'Choose a location')}</strong>
          <small>{areaOnly ? 'Choose a general area. No exact address is needed here.' : value ? 'Check the marked place. Move the pin if needed.' : 'Search your city or barangay, then mark the exact place.'}</small>
        </span>
        <span id={`${id}-action`} className={styles.pickerAction}>{areaOnly ? open ? 'Hide areas' : value ? 'Change area' : 'Choose area' : open ? 'Hide map' : value ? 'Change location' : 'Open map'}<ChevronDown size={16} aria-hidden="true" /></span>
      </summary>
      {open && !disabled && <LocationEditor key={selectionMode} selectionMode={selectionMode} value={value} onChange={onChange} radiusKm={radiusKm ?? undefined} accent={workspace==='provider' ? '#059669' : 'var(--color-brand-text)'}/>}
    </details>
    <p id={`${id}-hint`} className={styles.hint}>{hint || (privateAddress ? 'Mark where the provider should come. Only the city or barangay is public; the exact location and directions are shared after booking.' : 'Other users see the general area and approximate distance. Your exact location stays private.')}</p>
    {error && <p id={`${id}-error`} role="alert" className={styles.error}>{error}</p>}
    {privateAddress && value && <label><span className={styles.label}>Address or directions (optional, shared after booking)</span><textarea className={styles.field} rows={2} maxLength={500} placeholder="e.g. Blue gate beside the barangay hall" disabled={disabled} value={value.address || ''} onChange={e => onChange({ ...value, address:e.target.value })}/></label>}
  </div>;
}
