'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, MapPinned } from 'lucide-react';
import type { LocationPoint } from '../../lib/location';
import LocationEditor from './LocationEditor';
import styles from './Location.module.css';

export default function LocationField({ value, onChange, onClear, label, radiusKm, privateAddress = false, disabled = false, workspace = 'seeker', hint, selectionMode = 'pin', required = false, error, purpose = 'job' }: {
  purpose?: 'job' | 'discovery';
  value:LocationPoint | null; onChange:(point:LocationPoint) => void; onClear?:()=>void; label:string; radiusKm?:number | null; privateAddress?:boolean; disabled?:boolean; workspace?:'seeker'|'provider'; hint?:string; selectionMode?:'area'|'area-search'|'pin'; required?:boolean; error?:string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const summaryRef = useRef<HTMLElement>(null);
  const closeAfterSelection = () => {
    const details = summaryRef.current?.parentElement;
    if (details instanceof HTMLDetailsElement) details.open = false;
  };
  const areaOnly = selectionMode !== 'pin';
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
        </span>
        <span id={`${id}-action`} className={styles.pickerAction}>{open ? 'Close' : value ? 'Change' : areaOnly ? 'Choose area' : 'Choose location'}<ChevronDown size={16} aria-hidden="true" /></span>
      </summary>
      {open && !disabled && <LocationEditor compact purpose={purpose} key={selectionMode} selectionMode={selectionMode} value={value} onChange={onChange} onSelected={closeAfterSelection} radiusKm={radiusKm ?? undefined} accent={workspace==='provider' ? '#059669' : 'var(--color-brand-text)'}/>}
    </details>
    {value && onClear && <button type="button" className={styles.button} disabled={disabled} onClick={onClear}>Remove area</button>}
    <p id={`${id}-hint`} className={styles.hint}>{hint || (privateAddress ? 'Exact location is shared privately after booking.' : 'Only an approximate location is public.')}</p>
    {error && <p id={`${id}-error`} role="alert" className={styles.error}>{error}</p>}
    {privateAddress && value && <label><span className={styles.label}>Directions (optional)</span><textarea className={styles.field} rows={2} maxLength={500} placeholder="e.g. Blue gate beside the barangay hall" disabled={disabled} value={value.address || ''} onChange={e => onChange({ ...value, address:e.target.value })}/></label>}
  </div>;
}
