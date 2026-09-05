import type { FormEvent } from 'react';
import { X } from 'lucide-react';

export interface EditServiceState {
  serviceId: string;
  title: string;
  price: number;
  priceType: string;
  serviceType: string;
  estimatedDurationMins: number;
  description: string;
  paymentMethods: { cash: boolean; gcash: boolean; maya: boolean; card: boolean };
}

interface Props {
  value: EditServiceState | null;
  isDark: boolean;
  onChange: (value: EditServiceState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function EditServiceModal({ value, isDark, onChange, onClose, onSubmit }: Props) {
  if (!value) return null;
  const field = `w-full px-4 py-3 rounded-xl border outline-none text-sm ${isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9]' : 'bg-slate-50 border-slate-200 text-slate-700'}`;
  const label = `text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`;
  const hasPaymentMethod = Object.values(value.paymentMethods).some(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className={`rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-extrabold text-sm">Edit Service Listing</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg border"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div><label className={label}>Listing Title</label><input className={field} required minLength={10} maxLength={100} value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Service Type</label><select className={field} value={value.serviceType} onChange={(e) => onChange({ ...value, serviceType: e.target.value })}><option value="ONE_TIME">One-time</option><option value="SESSION_BASED">Session-based (coming later)</option></select></div>
            <div><label className={label}>Pricing Unit</label><select className={field} value={value.priceType} onChange={(e) => onChange({ ...value, priceType: e.target.value })}><option value="FIXED">Fixed Price</option><option value="STARTS_AT">Starts At</option><option value="PER_HOUR">Per Hour</option><option value="PER_DAY">Per Day</option><option value="PER_PROJECT">Per Project</option><option value="PER_SESSION">Per Session</option><option value="CUSTOM">Custom quotation</option></select></div>
          </div>
          <div><label className={label}>Price (PHP)</label><input className={field} type="number" min={50} max={50000} required={value.priceType !== 'CUSTOM'} disabled={value.priceType === 'CUSTOM'} value={value.price} onChange={(e) => onChange({ ...value, price: Number(e.target.value) })} /></div>
          <div><label className={label}>Estimated Duration (minutes)</label><input className={field} type="number" min={15} max={480} required value={value.estimatedDurationMins} onChange={(e) => onChange({ ...value, estimatedDurationMins: Number(e.target.value) })} /></div>
          <div><label className={label}>Description</label><textarea className={field} rows={4} required minLength={30} maxLength={1000} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} /></div>
          <div>
            <span className={label}>Accepted Payment Methods</span>
            <div className="grid grid-cols-2 gap-2">
              {([['cash', 'On-site Cash'], ['gcash', 'GCash'], ['maya', 'Maya'], ['card', 'Card (unavailable)']] as const).map(([key, text]) => <label key={key} className={`${field} flex items-center gap-2 cursor-pointer`}><input type="checkbox" disabled={key === 'card'} checked={key === 'card' ? false : value.paymentMethods[key]} onChange={(e) => onChange({ ...value, paymentMethods: { ...value.paymentMethods, [key]: e.target.checked } })} />{text}</label>)}
            </div>
            {!hasPaymentMethod && <p className="mt-1 text-xs text-red-500">Select at least one payment method.</p>}
          </div>
          <div className="pt-3 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border font-bold text-xs rounded-xl">Cancel</button>
            <button type="submit" disabled={!hasPaymentMethod} className="px-5 py-2.5 bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
