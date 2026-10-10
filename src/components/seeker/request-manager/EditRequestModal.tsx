import type { LocationPoint } from '../../../lib/location';
import LocationField from '../../location/LocationField';
import TransportationField from '../../location/TransportationField';
import FormSelect from '../../ui/FormSelect';
import type { FormEvent } from 'react';
import { X, CircleNotch } from '@phosphor-icons/react';
import ListingTitleInput from '../../ui/ListingTitleInput';
import useDialogFocus from '../../../hooks/useDialogFocus';
import { formatRequestUrgency, REQUEST_URGENCY_OPTIONS, type RequestUrgency } from '../../../lib/requestUrgency';

export interface EditRequestState {
  jobLocation?: LocationPoint;
  originalJobLocation?: LocationPoint;
  transportationFee?: string;
  originalTransportationFee?: number | null;
  locationLocked?: boolean;
  requestId: string;
  title: string;
  budget: number;
  description: string;
  urgency?: RequestUrgency;
  originalUrgency?: string;
}

interface EditRequestModalProps {
  value: EditRequestState | null;
  isDark: boolean;
  isSaving?: boolean;
  onChange: (value: EditRequestState) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

export default function EditRequestModal({ value, isDark, isSaving = false, onChange, onClose, onSubmit }: EditRequestModalProps) {
  const dialogRef = useDialogFocus(Boolean(value), isSaving, onClose);
  if (!value) return null;
  const labelClass = `text-xs font-semibold mb-1.5 block ${isDark ? 'text-ink-muted' : 'text-ink-secondary'}`;
  const fieldClass = `w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${isDark ? 'bg-charcoal-inset border-neutral-855 text-white focus:border-orange-500' : 'bg-slate-50 border-slate-200 text-ink-secondary focus:border-orange-500'}`;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="edit-request-heading" aria-busy={isSaving} tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className={`rounded-[24px] max-w-lg max-h-[calc(100dvh-2rem)] w-full overflow-y-auto shadow-xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-neutral-855 bg-charcoal-inset/45' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 id="edit-request-heading" className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-ink'}`}>Edit Request details</h3>
          <button type="button" aria-label="Close edit request" disabled={isSaving} onClick={onClose} className={`p-1.5 rounded-lg border transition-colors disabled:cursor-wait disabled:opacity-50 ${isDark ? 'border-neutral-800 hover:bg-charcoal text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle'}`}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div><label htmlFor="edit-request-title" className={labelClass}>Request Title</label><ListingTitleInput id="edit-request-title" disabled={isSaving} required minLength={3} maxLength={100} value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} className={`${fieldClass} font-medium`} /></div>
          <div><label htmlFor="edit-request-budget" className={labelClass}>Estimated Budget (₱)</label><input id="edit-request-budget" disabled={isSaving} type="number" required min={1} value={value.budget} onChange={(event) => onChange({ ...value, budget: Number(event.target.value) })} className={`${fieldClass} font-semibold`} /></div>
          <div>
            <label htmlFor="edit-request-urgency" className={labelClass}>Urgency</label>
            <FormSelect id="edit-request-urgency" disabled={isSaving} value={value.urgency || ''} onChange={event => onChange({ ...value, urgency: event.target.value as RequestUrgency || undefined })} className={fieldClass}>
              <option value="">Keep current urgency: {formatRequestUrgency(value.originalUrgency)}</option>
              {REQUEST_URGENCY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FormSelect>
            <p className="mt-1.5 text-xs text-ink-muted">Choose a new urgency or keep the saved value.</p>
          </div>
          <LocationField label="Where will the job happen?" value={value.jobLocation ?? null} privateAddress disabled={isSaving || value.locationLocked} onChange={jobLocation => onChange({ ...value, jobLocation })} />
          <TransportationField budget isDark={isDark} disabled={isSaving || value.locationLocked} value={value.transportationFee ?? ''} onChange={transportationFee => onChange({ ...value, transportationFee })} />
          {value.locationLocked && <p className="text-xs text-ink-muted">Location and travel budget stay fixed while offers are awaiting a decision. Close those offers before changing the job location.</p>}
          {!value.jobLocation && <p className="text-xs text-ink-muted">Add the actual job location to include this older request in nearby discovery.</p>}
          <div><label htmlFor="edit-request-description" className={labelClass}>Description</label><textarea id="edit-request-description" disabled={isSaving} rows={4} required value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} className={`${fieldClass} font-medium resize-none`} /></div>
          <div className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${isDark ? 'border-neutral-850' : 'border-slate-100'}`}>
            <button type="button" disabled={isSaving} onClick={onClose} className={`px-4 py-2.5 border font-bold text-xs rounded-xl transition-all disabled:cursor-wait disabled:opacity-50 ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover text-ink-muted' : 'border-slate-200 hover:bg-slate-50 text-ink-muted'}`}>Cancel</button>
            <button type="submit" disabled={isSaving} aria-live="polite" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:cursor-wait disabled:opacity-75">
              {isSaving && <CircleNotch className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {isSaving ? 'Saving changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
