import type { FormEvent } from 'react';
import type { JobRequest } from '../../../types';
import { formatUrgencyDisplay } from './browseJobs.utils';

interface ProposalModalProps {
  request: JobRequest | undefined;
  isDark: boolean;
  price: number;
  message: string;
  onPriceChange: (price: number) => void;
  onMessageChange: (message: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function ProposalModal({ request, isDark, price, message, onPriceChange, onMessageChange, onClose, onSubmit }: ProposalModalProps) {
  if (!request) return null;
  const labelClass = `text-xs font-semibold mb-1.5 block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`;
  const fieldClass = `w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-[#f2efe9] focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-500'}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className={`rounded-[24px] max-w-lg w-full overflow-hidden shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-300 text-slate-800'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>Submit Proposal Offer</h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'}`}>✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-2"><h4 className="font-extrabold text-xs text-orange-600 dark:text-orange-400 truncate">{request.title}</h4><span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex-shrink-0 ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>Budget: ₱{request.budget}</span></div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-[#b4b0a9] font-medium"><span>Client: <strong className="text-slate-700 dark:text-slate-200">{request.seekerName}</strong></span><span>•</span><span>Category: <strong>{request.category}</strong></span><span>•</span><span className="text-amber-600 dark:text-amber-400 font-extrabold">⏰ Needed: {formatUrgencyDisplay(request.urgency)}</span></div>
          </div>
          <div><label className={labelClass}>Proposed Rate (₱)</label><input type="number" min={1} required value={price} onChange={(event) => onPriceChange(Number(event.target.value))} className={`${fieldClass} font-semibold`} /></div>
          <div><label className={labelClass}>Proposal Message / Cover Note</label><textarea rows={4} required placeholder="Explain your approach, availability in Cordova, and why the seeker should choose your offer..." value={message} onChange={(event) => onMessageChange(event.target.value)} className={`${fieldClass} font-medium resize-none`} /></div>
          <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}><button type="button" onClick={onClose} className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>Cancel</button><button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95">Send Proposal</button></div>
        </form>
      </div>
    </div>
  );
}
