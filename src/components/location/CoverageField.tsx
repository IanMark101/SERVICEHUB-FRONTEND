'use client';

import { useEffect, useId } from 'react';
import FormSelect from '../ui/FormSelect';
import { SEARCH_RADII } from '../../lib/location';

export default function CoverageField({ value, onChange, isDark, disabled = false, error }: {
  value: number | null | undefined; onChange: (value: number | null) => void; isDark: boolean; disabled?: boolean; error?:string;
}) {
  const id = useId();
  useEffect(() => {
    if (!error || disabled) return;
    const field = document.getElementById(id);
    field?.focus();
    field?.scrollIntoView?.({block:'center',behavior:'instant'});
  },[error,disabled,id]);
  return <div>
    <label htmlFor={id} className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>How far will you travel? (required)</label>
    <FormSelect id={id} tone="provider" required aria-invalid={Boolean(error)} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} value={value === undefined ? '' : value === null ? 'unlimited' : value} disabled={disabled} onChange={event => onChange(event.target.value === 'unlimited' ? null : Number(event.target.value))}
      className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm ${isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-white border-slate-300 text-ink-secondary'}`}>
      <option value="" disabled>Choose how far you will travel</option>
      <option value="unlimited">No distance limit</option>
      {SEARCH_RADII.filter(radius => radius >= 1).map(radius => <option key={radius} value={radius}>Up to {radius} km</option>)}
    </FormSelect>
    <p id={`${id}-help`} className="text-xs mt-1.5 leading-relaxed text-ink-muted">Distance starts from the center of your chosen area or the place you marked on the map. Choose “No distance limit” if you are willing to travel anywhere.</p>
    {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-700 dark:text-red-300">{error}</p>}
  </div>;
}
