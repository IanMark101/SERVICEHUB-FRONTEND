'use client';

import { useId } from 'react';
import FormSelect from '../ui/FormSelect';
import { SEARCH_RADII } from '../../lib/location';

export default function CoverageField({ value, onChange, isDark, disabled = false }: {
  value: number | null | undefined; onChange: (value: number | null) => void; isDark: boolean; disabled?: boolean;
}) {
  const id = useId();
  return <div>
    <label htmlFor={id} className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>Service coverage radius (optional)</label>
    <FormSelect id={id} tone="provider" value={value ?? ''} disabled={disabled} onChange={event => onChange(event.target.value ? Number(event.target.value) : null)}
      className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm ${isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-white border-slate-300 text-ink-secondary'}`}>
      <option value="">No distance limit set</option>
      {SEARCH_RADII.map(radius => <option key={radius} value={radius}>Within {radius} km of the service base</option>)}
    </FormSelect>
    <p className="text-xs mt-1.5 leading-relaxed text-ink-muted">Limits where this listing accepts jobs. Choose a base pin to see the coverage circle. This is separate from your Browse Service Requests search radius.</p>
  </div>;
}
