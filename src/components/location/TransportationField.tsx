'use client';

import { useId } from 'react';

export function validTransportationFee(value: string) {
  return value === '' || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 5000);
}

export default function TransportationField({ value, onChange, isDark, disabled = false, budget = false }: {
  value: string; onChange: (value: string) => void; isDark: boolean; disabled?: boolean; budget?: boolean;
}) {
  const id = useId();
  return <div>
    <label htmlFor={id} className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>
      {budget ? 'Additional travel budget' : 'Transportation fee'} (₱, optional)
    </label>
    <input id={id} type="number" min={0} max={5000} step="0.01" value={value} onChange={event => onChange(event.target.value)} disabled={disabled}
      placeholder="Leave blank if none" aria-describedby={`${id}-hint`}
      className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-white border-slate-300 text-ink-secondary'}`} />
    <p id={`${id}-hint`} className="text-xs mt-1.5 leading-relaxed text-ink-muted">
      {budget ? 'An optional allowance above your service budget. Providers must quote one final total including travel; this allowance is not automatically charged.' : 'Added once to the direct booking total, even for several hours or days. Offers on seeker requests use one final quoted total including travel.'}
    </p>
  </div>;
}
