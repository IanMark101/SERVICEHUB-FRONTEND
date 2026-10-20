'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { ArrowRight, Briefcase, Clock, ListNumbers } from '@phosphor-icons/react';
import { apiGetProviderWorkload, apiSetProviderWorkloadCapacity, type ProviderWorkload } from '../../../api/bookings.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import FormalSelect from '../../ui/FormalSelect';
import styles from './WorkQueue.module.css';

function jobTitle(job: { service?: { title: string } | null; offer?: { request: { title: string } } | null }) {
  return job.offer?.request.title || job.service?.title || 'Service booking';
}

export default function ProviderWorkloadPanel({ onOpen, onStart, startingBookingId, isDark }: {
  onOpen: (bookingId: string) => void; onStart: (bookingId: string) => void;
  startingBookingId?: string | null; isDark: boolean;
}) {
  const [workload, setWorkload] = useState<ProviderWorkload | null>(null);
  const [capacity, setCapacity] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(false);
  const savedLimit = useRef<number | null>(null);
  const savePending = useRef(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const request = ++generation.current;
    try {
      const result = await apiGetProviderWorkload();
      if (!active.current || request !== generation.current) return;
      setWorkload(result.data);
      const oldLimit = savedLimit.current;
      setCapacity(previous => oldLimit === null || previous === oldLimit ? result.data.onlineQueueLimit : previous);
      savedLimit.current = result.data.onlineQueueLimit;
      setError('');
    } catch (failure) {
      if (active.current && request === generation.current) setError(getApiErrorMessage(failure, 'Workload is temporarily unavailable.'));
    }
  }, []);
  const stop = useCallback(() => { active.current = false; generation.current += 1; }, []);
  useEffect(() => { active.current = true; queueMicrotask(() => { if (active.current) void load(); }); return stop; }, [load, stop]);
  useApiCacheRefresh(['bookings'], load, !saving);

  const currentPaid = workload?.paidJobs.find(job => job.status === 'SERVING');
  const currentCash = workload?.cashJobs.find(job => job.started && ['ONGOING', 'DISPUTED', 'UNDER_REVIEW'].includes(job.status));
  const waiting = workload?.paidJobs.filter(job => job.status === 'WAITING') || [];
  const next = waiting[0];
  const cashArrangements = workload?.cashJobs.filter(job => !job.started && ['ACCEPTED', 'PENDING_APPROVAL'].includes(job.status)) || [];
  const current = currentPaid?.booking || currentCash;
  const currentId = currentPaid?.bookingId || currentCash?.id;
  const canStartNext = !current && !!next?.bookingId && next.canStart;
  const nextBlockedReason = current ? 'Finish your current job before starting another one.' : next?.startBlockedReason;
  const currentStatus = current?.status === 'DISPUTED' || current?.status === 'UNDER_REVIEW' ? 'Under review' : 'In progress';
  const saveCapacity = async () => {
    if (savePending.current) return;
    savePending.current = true;
    ++generation.current;
    setSaving(true); setError('');
    try {
      await apiSetProviderWorkloadCapacity(capacity);
      if (!active.current) return;
      savedLimit.current = capacity;
      setWorkload(previous => previous ? { ...previous, onlineQueueLimit: capacity } : previous);
      await load();
    } catch (failure) { if (active.current) setError(getApiErrorMessage(failure, 'Could not update your waiting capacity.')); }
    finally { savePending.current = false; if (active.current) setSaving(false); }
  };

  return <section aria-labelledby="provider-workload-heading" className={styles.queue}>
    <div className={styles.header}>
      <div><h1 id="provider-workload-heading">Your work queue</h1><p>Manage your current job and paid bookings in the order they arrived.</p></div>
      <Link href="/provider/provider-activity" className={styles.link}>View Activity <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    {error && <div role="alert" className={styles.error}>{error} <button type="button" onClick={() => { void load(); }}>Try again</button></div>}
    {!workload && !error && <div aria-label="Loading workload" className={styles.skeleton}><div /><div /><div /></div>}
    {!workload && error && <p className={styles.muted}>Workload unavailable</p>}
    {workload && <>
      <div className={styles.layout}>
        <div className={styles.jobs}>
          <div className={styles.current}>
            <h2><Briefcase size={19} aria-hidden="true" /> Current job</h2>
            {current ? <><h3>{jobTitle(current)}</h3><p>{current.seeker.name}</p><div className={styles.jobActions}><span className={styles.badge}>{currentStatus}</span>{currentId && <button type="button" className={styles.secondary} onClick={() => onOpen(currentId)}>Open booking <ArrowRight size={16} aria-hidden="true" /></button>}</div></>
              : <p className={styles.empty}>No job in progress.</p>}
          </div>
          <div className={styles.next}>
            <h2><Clock size={19} aria-hidden="true" /> Next paid job</h2>
            {next?.booking ? <><h3>{jobTitle(next.booking)}</h3><p>{next.booking.seeker.name}</p><div className={styles.jobActions}>
              <span className={styles.badge}>Position #{next.position}</span>
              {next.bookingId && <><button type="button" className={styles.secondary} onClick={() => onOpen(next.bookingId!)}>Details</button><button type="button" className={styles.primary} disabled={!canStartNext || !!startingBookingId || Boolean(error)} onClick={() => onStart(next.bookingId!)} title={nextBlockedReason || undefined}>{startingBookingId === next.bookingId ? 'Starting...' : 'Start Job'}</button></>}
            </div>{nextBlockedReason && <p className={styles.blocked}>{nextBlockedReason}</p>}</>
              : <p className={styles.empty}>No paid job waiting.</p>}
          </div>
        </div>
        <aside className={styles.settings} aria-labelledby="queue-settings-heading">
          <h2 id="queue-settings-heading">Queue settings</h2>
          <span className={styles.count}>{waiting.length}<span> / {workload.onlineQueueLimit}</span></span>
          <p className={styles.muted}>Paid waiting places used</p>
          <p className={styles.help}>One shared limit for GCash-paid jobs across your services and accepted offers. Your current job does not use a waiting place.</p>
          <label htmlFor="provider-paid-capacity">Paid waiting capacity</label>
          <div className={styles.settingActions}><div className={styles.select}><FormalSelect id="provider-paid-capacity" name="capacity" value={String(capacity)} onChange={event => setCapacity(Number(event.target.value))} options={Array.from({ length: 10 }, (_, index) => ({ value: String(index + 1), label: String(index + 1) + (index === 0 ? ' job' : ' jobs') }))} theme="provider" isDark={isDark} disabled={saving} /></div><button type="button" className={styles.primary} disabled={saving || Boolean(error) || capacity === workload.onlineQueueLimit} onClick={() => { void saveCapacity(); }}>{saving ? 'Saving...' : 'Save'}</button></div>
        </aside>
      </div>
      <section className={styles.waiting} aria-labelledby="paid-waiting-heading">
        <div className={styles.sectionHeading}><h2 id="paid-waiting-heading"><ListNumbers size={19} aria-hidden="true" /> Paid waiting list</h2><span className={styles.muted}>{waiting.length} paid waiting</span></div>
        {waiting.length ? <ol className={styles.list}>{waiting.map(job => <li key={job.id}><span className={styles.position}>#{job.position}</span><div className={styles.rowText}><h3>{job.booking ? jobTitle(job.booking) : 'Service booking'}</h3><p>{job.booking?.seeker.name || 'Booking information unavailable'}{job.paymentStatus ? ' · ' + (job.paymentStatus === 'PAID' ? 'Paid' : job.paymentStatus.toLowerCase().replaceAll('_', ' ')) : ''}</p></div><span className={styles.badge}>{job.id === next?.id ? 'Up next' : 'Waiting'}</span>{job.bookingId && <button type="button" className={styles.secondary} aria-label="View booking details" onClick={() => onOpen(job.bookingId!)}>Details</button>}</li>)}</ol>
          : <p className={styles.empty}>New paid bookings will appear here. Jobs stay in payment order.</p>}
      </section>
      <section className={styles.waiting} aria-labelledby="cash-bookings-heading"><h2 id="cash-bookings-heading">Cash bookings</h2><p className={styles.help}>Cash bookings are arranged directly with customers and stay outside the paid queue. Open a booking to see its status and available actions.</p>
        {cashArrangements.length ? <ul className={styles.list}>{cashArrangements.map(job => <li key={job.id}><div className={styles.rowText}><h3>{jobTitle(job)}</h3><p>{job.seeker.name}</p></div><span className={styles.badge}>{job.status === 'PENDING_APPROVAL' ? 'Needs approval' : 'Accepted'}</span><button type="button" className={styles.secondary} onClick={() => onOpen(job.id)}>Details</button></li>)}</ul> : <p className={styles.empty}>No cash bookings waiting.</p>}
      </section>
    </>}
  </section>;
}
