import { Banknote, Smartphone } from 'lucide-react';
import type { JobRequest } from '../../types';
import { getRequestPaymentMethods } from '../../lib/paymentUtils';

export default function RequestPaymentMethods({ request, isDark }: { request: Pick<JobRequest, 'paymentMethods' | 'preferredPaymentMethod'>; isDark: boolean }) {
  if (!request.paymentMethods && !request.preferredPaymentMethod) {
    return <p className={`text-xs ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>Payment methods not specified</p>;
  }
  const methods = getRequestPaymentMethods(request);
  return (
    <div className="space-y-1.5">
      <p className={`text-xs font-semibold ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>Payment methods the seeker can use</p>
      <div className="flex flex-wrap gap-1.5">
        {([['cash', 'On-site Cash', Banknote], ['gcash', 'GCash · Test Mode', Smartphone]] as const).filter(([key]) => methods[key]).map(([key, label, Icon]) => (
          <span key={key} className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${isDark ? 'bg-neutral-850/60 border-neutral-700/80 text-neutral-300' : 'bg-slate-50 border-slate-200 text-ink-muted'}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</span>
        ))}
      </div>
    </div>
  );
}
