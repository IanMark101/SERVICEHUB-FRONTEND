import { useId } from 'react';
import type { PaymentMethods } from '../../types';

interface Props {
  value: PaymentMethods;
  onChange: (value: PaymentMethods) => void;
  isDark: boolean;
  legend: string;
  disabled?: boolean;
  description?: string;
  error?: string;
}

export default function PaymentMethodCheckboxes({ value, onChange, isDark, legend, disabled, description, error }: Props) {
  const id = useId();
  const describedBy = [description && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset disabled={disabled} aria-describedby={describedBy} className="min-w-0">
      <legend className={`text-xs font-semibold mb-1.5 ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`}>{legend}</legend>
      <div className={`grid grid-cols-1 gap-2 border rounded-xl p-2.5 transition-colors sm:grid-cols-2 ${error ? 'border-red-500' : isDark ? 'border-neutral-800/80' : 'border-slate-300'} ${isDark ? 'bg-charcoal-inset' : 'bg-white'}`}>
        {([['cash', 'On-site Cash'], ['gcash', 'GCash · PayMongo Test Mode']] as const).map(([key, label]) => (
          <label key={key} className={`flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60 ${isDark ? 'text-white' : 'text-ink'}`}>
            <input type="checkbox" checked={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.checked })} aria-invalid={!!error} aria-describedby={describedBy} className="h-4 w-4 shrink-0 rounded accent-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {description && <p id={`${id}-help`} className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{description}</p>}
      {error && <p id={`${id}-error`} role="alert" className={`mt-2 text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
    </fieldset>
  );
}
