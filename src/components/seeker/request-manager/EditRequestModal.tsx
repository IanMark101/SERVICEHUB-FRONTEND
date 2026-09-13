import type { FormEvent } from 'react';
import { X } from 'lucide-react';

export interface EditRequestState {
  requestId: string;
  title: string;
  budget: number;
  description: string;
}

interface EditRequestModalProps {
  value: EditRequestState | null;
  isDark: boolean;
  onChange: (value: EditRequestState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function EditRequestModal({ value, isDark, onChange, onClose, onSubmit }: EditRequestModalProps) {
  if (!value) return null;
  const labelClass = `text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`;
  const fieldClass = `w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-855 text-[#f2efe9] focus:border-orange-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-orange-500'}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Edit Request details</h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'}`}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div><label className={labelClass}>Request Title</label><input type="text" required value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} className={`${fieldClass} font-medium`} /></div>
          <div><label className={labelClass}>Estimated Budget (₱)</label><input type="number" required min={1} value={value.budget} onChange={(event) => onChange({ ...value, budget: Number(event.target.value) })} className={`${fieldClass} font-semibold`} /></div>
          <div><label className={labelClass}>Description</label><textarea rows={4} required value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} className={`${fieldClass} font-medium resize-none`} /></div>
          <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
            <button type="button" onClick={onClose} className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
