'use client';

import { useId, useState } from 'react';
import { LocationSchema, type BookingLocation } from '../../lib/location';
import LocationField from './LocationField';
import styles from './Location.module.css';

export default function BookingAddressField({ value, onChange, disabled = false, error, label = 'Service address' }: {
  value:BookingLocation|null; onChange:(value:BookingLocation)=>void; disabled?:boolean; error?:string; label?:string;
}) {
  const id = useId();
  const [showPin,setShowPin] = useState(false);
  const point = LocationSchema.safeParse(value);
  return <div className={styles.fieldGroup}>
    <label htmlFor={id} className={styles.label}>{label}</label>
    <textarea id={id} className={styles.field} rows={3} maxLength={500} disabled={disabled} value={value?.address || ''}
      placeholder="e.g. Blue gate beside the barangay hall, Ibabao, Cordova"
      aria-invalid={Boolean(error)} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
      onChange={event => onChange({ ...value,label:value?.label || 'Job address',address:event.target.value })} />
    <p id={`${id}-help`} className={styles.hint}>Address or map pin. Shared privately with booking participants.</p>
    <button type="button" className={styles.button} disabled={disabled} onClick={() => setShowPin(current => !current)}>{showPin ? 'Hide job pin' : point.success ? 'View or change job pin' : 'Add job pin (optional)'}</button>
    {showPin && <LocationField label="Job pin (optional)" value={point.success ? point.data : null} disabled={disabled} onChange={pin => onChange({ ...pin,...(value?.address && {address:value.address}) })} hint="Mark the actual job location only if it helps the other participant find the address." />}
    {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
  </div>;
}
