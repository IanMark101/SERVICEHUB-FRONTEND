import FormSelect from '../../ui/FormSelect';
import type { FormEvent } from 'react';
import type { JobRequest, ServiceListing } from '../../../types';
import { formatUrgencyDisplay } from './browseJobs.utils';
import RequestPaymentMethods from '../../ui/RequestPaymentMethods';
import { CircleNotch } from '@phosphor-icons/react';
import useDialogFocus from '../../../hooks/useDialogFocus';
import ReviewSummaryPanel from '../../ui/ReviewSummaryPanel';

interface ProposalModalProps {
  request: JobRequest | undefined;
  listings: ServiceListing[];
  serviceId: string;
  onServiceChange: (id: string) => void;
  isSubmitting: boolean;
  isDark: boolean;
  price: number;
  duration: number;
  message: string;
  availability: string;
  onAvailabilityChange: (availability: string) => void;
  onPriceChange: (price: number) => void;
  onDurationChange: (minutes: number) => void;
  onMessageChange: (message: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function ProposalModal({ request, listings, serviceId, onServiceChange, isSubmitting, isDark, price, duration, message, availability, onAvailabilityChange, onPriceChange, onDurationChange, onMessageChange, onClose, onSubmit }: ProposalModalProps) {
  const dialogRef = useDialogFocus(!!request, isSubmitting, onClose);
  if (!request) return null;
  const labelClass = `text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`;
  const fieldClass = `w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${isDark ? 'bg-[#1c1b18] border-neutral-850 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-ink-secondary focus:border-emerald-500'}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="offer-dialog-title" className={`rounded-[20px] max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-xl border ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-white' : 'bg-white border-slate-300 text-ink'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 id="offer-dialog-title" className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-ink'}`}>Send an offer</h3>
          <button type="button" aria-label="Close offer form" onClick={onClose} disabled={isSubmitting} className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 ${isDark ? 'border-neutral-800 hover:bg-slate-800 text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle'}`}>×</button>
        </div>
        <form onSubmit={onSubmit} aria-busy={isSubmitting} className="p-5">
          <fieldset disabled={isSubmitting} className="space-y-4">
          <RequestPaymentMethods request={request} isDark={isDark} />
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-2"><h4 className="uppercase font-extrabold text-xs text-orange-600 dark:text-orange-400 truncate">{request.title}</h4><span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex-shrink-0 ${isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{request.targetServiceId ? request.budget ? `Listed rate: ₱${request.budget}` : 'Quote required' : `Budget: ₱${request.budget}`}</span></div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted dark:text-ink-muted font-medium"><span>Client: <strong className="text-ink-secondary dark:text-ink">{request.seekerName}</strong></span><span>•</span><span>Category: <strong>{request.category}</strong></span><span>•</span><span className="text-amber-600 dark:text-amber-400 font-extrabold">⏰ Needed: {formatUrgencyDisplay(request.urgency)}</span></div>
          </div>
          <ReviewSummaryPanel subjectId={request.seekerId} context="seeker" isDark={isDark} />
          <div>
            <label htmlFor="offer-service-listing" className={labelClass}>Service listing <span className="font-normal">{request.targetServiceId ? '(requested by the client)' : '(optional)'}</span></label>
            <FormSelect id="offer-service-listing" value={serviceId} disabled={!!request.targetServiceId} onChange={(event) => onServiceChange(event.target.value)} className={`${fieldClass} font-medium`}>
              {!request.targetServiceId && <option value="">No listing. Offer for this request only</option>}
              {listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.title}</option>)}
            </FormSelect>
            <p className="mt-1.5 text-xs text-ink-muted dark:text-ink-muted">{request.targetServiceId ? `Quote the final total for this listing. The client selected ${request.preferredPaymentMethod || 'a payment method'} and must approve your price before booking or paying.` : 'A listing can fill in your usual price and duration. You can change either for this job.'}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label htmlFor="offer-price" className={labelClass}>Your price (₱)</label><input id="offer-price" type="number" min={50} max={50000} step="0.01" required value={price} onChange={(event) => onPriceChange(Number(event.target.value))} className={`${fieldClass} font-semibold`} /></div>
            <div><label htmlFor="offer-duration" className={labelClass}>Expected duration (minutes)</label><input id="offer-duration" type="number" min={15} max={480} required value={duration} onChange={(event) => onDurationChange(Number(event.target.value))} className={`${fieldClass} font-semibold`} /></div>
          </div>
          <div><label htmlFor="offer-availability" className={labelClass}>Availability <span className="font-normal">(optional)</span></label><input id="offer-availability" maxLength={500} placeholder="For example, Saturday morning" value={availability} onChange={(event) => onAvailabilityChange(event.target.value)} className={fieldClass} /></div>
          <div><label htmlFor="offer-message" className={labelClass}>How you will handle this job</label><textarea id="offer-message" rows={3} maxLength={2000} required placeholder="Describe your approach and availability" value={message} onChange={(event) => onMessageChange(event.target.value)} className={`${fieldClass} font-medium resize-none`} /></div>
          <div className={`pt-3 border-t flex items-center justify-end gap-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}><button type="button" onClick={onClose} disabled={isSubmitting} className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27] text-ink-muted' : 'border-slate-200 hover:bg-slate-50 text-ink-muted'}`}>Cancel</button><button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-extrabold text-xs rounded-xl transition-all active:scale-95">{isSubmitting && <CircleNotch size={14} className="animate-spin" aria-hidden="true" />}{isSubmitting ? 'Sending offer…' : 'Send Offer'}</button></div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
