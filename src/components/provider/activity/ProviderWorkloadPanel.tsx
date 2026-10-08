import { useEffect, useState } from 'react';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { ArrowRight, Briefcase, Clock, UsersThree } from '@phosphor-icons/react';
import { apiGetProviderWorkload, apiSetProviderWorkloadCapacity, type ProviderWorkload } from '../../../api/bookings.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import FormalSelect from '../../ui/FormalSelect';

function jobTitle(job: { service?: { title: string } | null; offer?: { request: { title: string } } | null }) {
  return job.offer?.request.title || job.service?.title || 'Service booking';
}

export default function ProviderWorkloadPanel({ onOpen, onStart, startingBookingId, isDark }: {
  onOpen: (bookingId: string) => void;
  onStart: (bookingId: string) => void;
  startingBookingId?: string | null;
  isDark: boolean;
}) {
  const [workload, setWorkload] = useState<ProviderWorkload | null>(null);
  const [capacity, setCapacity] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    apiGetProviderWorkload().then((result) => {
      if (active) { setWorkload(result.data); setCapacity(result.data.onlineQueueLimit); setError(''); }
    }).catch((failure) => { if (active) setError(getApiErrorMessage(failure, 'Workload is temporarily unavailable.')); });
    return () => { active = false; };
  }, []);
  useApiCacheRefresh(['bookings'], async () => {
    const result = await apiGetProviderWorkload();
    setWorkload(result.data);
    setCapacity(previous => previous === workload?.onlineQueueLimit ? result.data.onlineQueueLimit : previous);
    setError('');
  }, !saving);

  const currentPaid = workload?.paidJobs.find((job) => job.status === 'SERVING');
  const currentCash = workload?.cashJobs.find((job) => job.started && ['ONGOING', 'DISPUTED', 'UNDER_REVIEW'].includes(job.status));
  const waiting = workload?.paidJobs.filter((job) => job.status === 'WAITING') || [];
  const next = waiting[0];
  const cashArrangements = workload?.cashJobs.filter((job) => !job.started && ['ACCEPTED', 'PENDING_APPROVAL'].includes(job.status)) || [];
  const current = currentPaid?.booking || currentCash;
  const currentId = currentPaid?.bookingId || currentCash?.id;
  const canStartNext = !current && !!next?.bookingId && next.canStart;
  const nextBlockedReason = current
    ? 'Finish your current job before starting another one.'
    : next?.startBlockedReason;
  const currentStatus = current?.status === 'DISPUTED' || current?.status === 'UNDER_REVIEW'
    ? 'Under review'
    : 'In progress';

  const saveCapacity = async () => {
    setSaving(true);
    setError('');
    try {
      await apiSetProviderWorkloadCapacity(capacity);
      setWorkload((previous) => previous ? { ...previous, onlineQueueLimit: capacity } : previous);
    } catch (failure) { setError(getApiErrorMessage(failure, 'Could not update your waiting capacity.')); }
    finally { setSaving(false); }
  };

  return (
    <section aria-labelledby="provider-workload-heading" className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-emerald-900/50 bg-charcoal-surface' : 'border-emerald-200 bg-white'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="provider-workload-heading" className="text-lg font-bold text-ink dark:text-ink">Your workload</h2>
          <p className="mt-1 text-sm text-ink-muted dark:text-ink-secondary">One current job and one shared paid queue across all your services and accepted offers.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"><UsersThree size={15} /> {workload ? `${waiting.length} paid waiting` : error ? 'Workload unavailable' : 'Loading workload'}</span>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {!workload && !error ? <div className="mt-5 h-24 animate-pulse rounded-xl bg-stone-100 dark:bg-charcoal" aria-label="Loading workload" /> : workload && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
          <div className="rounded-xl bg-stone-50 p-4 dark:bg-charcoal/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted dark:text-ink-secondary"><Briefcase size={16} /> Current job</div>
            {current ? <>
              <p className="mt-2 font-bold text-ink dark:text-ink">{jobTitle(current)}</p>
              <p className="text-sm text-ink-muted dark:text-ink-secondary">{current.seeker.name} · {currentStatus}</p>
              {currentId && <button type="button" onClick={() => onOpen(currentId)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">Open booking <ArrowRight size={15} /></button>}
            </> : <p className="mt-2 text-sm text-ink-muted dark:text-ink-secondary">No job in progress.</p>}
          </div>
          <div className="rounded-xl bg-emerald-50/70 p-4 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300"><Clock size={16} /> Next paid job</div>
            {next?.booking ? <>
              <p className="mt-2 font-bold text-ink dark:text-ink">{jobTitle(next.booking)}</p>
              <p className="text-sm text-ink-muted dark:text-ink-secondary">{next.booking.seeker.name} · Position #{next.position}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {next.bookingId && <button type="button" onClick={() => onOpen(next.bookingId!)} className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">Details</button>}
                {next.bookingId && <button type="button" disabled={!canStartNext || !!startingBookingId} onClick={() => onStart(next.bookingId!)} title={nextBlockedReason || undefined} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-ink-muted dark:disabled:bg-charcoal dark:disabled:text-ink-secondary">{startingBookingId === next.bookingId ? 'Starting…' : 'Start Job'}</button>}
              </div>
              {nextBlockedReason && <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-300">{nextBlockedReason}</p>}
            </> : <p className="mt-2 text-sm text-ink-muted dark:text-ink-secondary">No paid job waiting.</p>}
          </div>
          <div className="rounded-xl bg-stone-50 p-4 dark:bg-charcoal/70">
            <label htmlFor="provider-paid-capacity" className="text-xs font-semibold text-ink dark:text-ink">Paid waiting capacity</label>
            <p className="mt-1 text-sm text-ink-secondary dark:text-ink">{waiting.length} of {workload.onlineQueueLimit} paid waiting places used</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted dark:text-ink-muted">Maximum GCash-paid jobs waiting across all your services and offers.</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-36">
                <FormalSelect
                  id="provider-paid-capacity"
                  name="capacity"
                  value={String(capacity)}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                  options={Array.from({ length: 10 }, (_, index) => ({
                    value: String(index + 1),
                    label: `${index + 1} jobs`,
                  }))}
                  theme="provider"
                  isDark={isDark}
                  className="!py-2 !px-3 !text-sm !rounded-xl"
                />
              </div>
              <button type="button" disabled={saving || capacity === workload.onlineQueueLimit} onClick={() => void saveCapacity()} className="min-h-10 rounded-lg border border-emerald-300 px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {workload && (waiting.length > 1 || cashArrangements.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-stone-200 pt-4 text-sm dark:border-neutral-700">
          {waiting.length > 1 && <span className="text-ink-secondary dark:text-ink">Also waiting: {waiting.slice(1).map((job) => `#${job.position} ${job.booking ? jobTitle(job.booking) : 'Booking'}`).join(', ')}</span>}
          {cashArrangements.length > 0 && <span className="text-ink-secondary dark:text-ink">Direct cash arrangements: {cashArrangements.length} (outside the numbered paid queue)</span>}
        </div>
      )}
    </section>
  );
}
