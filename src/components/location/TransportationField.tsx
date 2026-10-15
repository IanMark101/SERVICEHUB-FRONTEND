'use client';

import MoneyInput from '../ui/MoneyInput';
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
      {budget ? 'Extra budget for the provider’s travel' : 'Your travel fee'} (₱, optional)
    </label>
    <MoneyInput id={id} min={0} max={5000} step="0.01" value={value} onChange={event => onChange(event.target.value)} disabled={disabled}
      placeholder="Leave blank if none" aria-describedby={`${id}-hint`}
      className={`w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm transition-all ${isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-white border-slate-300 text-ink-secondary'}`} />
    <p id={`${id}-hint`} className="text-xs mt-1.5 leading-relaxed text-ink-muted">
      {budget ? 'Extra money you can allow for the provider’s trip to you, on top of your service budget. Their offer includes travel in one total for you to review. This amount is not charged separately. Leave blank if unsure. ₱0–₱5,000.' : 'Extra charge for your trip to the seeker. Added once per booking, not per hour or day. Leave blank if you do not charge for travel. ₱0–₱5,000.'}
    </p>
  </div>;
}
