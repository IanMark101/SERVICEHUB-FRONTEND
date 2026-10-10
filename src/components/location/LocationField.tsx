'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { LocationPoint } from '../../lib/location';
import LocationEditor from './LocationEditor';
import styles from './Location.module.css';

export default function LocationField({ value, onChange, label, radiusKm, privateAddress = false, disabled = false, workspace = 'seeker' }: {
  value:LocationPoint | null; onChange:(point:LocationPoint) => void; label:string; radiusKm?:number | null; privateAddress?:boolean; disabled?:boolean; workspace?:'seeker'|'provider';
}) {
  const [open, setOpen] = useState(false);
  return <div className={styles.fieldGroup} data-form-tone={workspace}>
    <span className={styles.label}>{label}</span>
    <details className={styles.inline} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary><MapPin size={16}/>{value ? `${value.label} · Change location` : 'Choose location on a map'}</summary>
      {open && !disabled && <LocationEditor value={value} onChange={onChange} radiusKm={radiusKm ?? undefined} accent={workspace==='provider' ? '#059669' : 'var(--color-brand-text)'}/>}
    </details>
    <p className={styles.hint}>{privateAddress ? 'The area is visible in discovery. Your exact pin and private address are shared only with booking participants.' : 'Use your service operating base. Other users see the area and approximate distance, never the exact pin.'}</p>
    {privateAddress && value && <label><span className={styles.label}>Private address / directions (optional)</span><textarea className={styles.field} rows={2} maxLength={500} disabled={disabled} value={value.address || ''} onChange={e => onChange({ ...value, address:e.target.value })}/></label>}
  </div>;
}
