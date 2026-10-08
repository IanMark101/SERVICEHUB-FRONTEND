"use client";

import { useState } from 'react';
import { ArrowLeft, WarningCircle, CalendarBlank } from '@phosphor-icons/react';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';

export type ActivityLoadStatus = 'loading' | 'ready' | 'error';

interface BookingDetailStateProps {
  status: ActivityLoadStatus;
  role: 'seeker' | 'provider';
  onRetry: () => Promise<void>;
  onBack: () => void;
}

export default function BookingDetailState({ status, role, onRetry, onBack }: BookingDetailStateProps) {
  const [retrying, setRetrying] = useState(false);
  const accentColor = role === 'provider' ? 'emerald' : 'orange';
  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    try { await onRetry(); } catch { /* The error state remains available for another attempt. */ }
    finally { setRetrying(false); }
  };

  if (status === 'loading' || retrying) return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-ink-secondary hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-[color:var(--workspace-focus)] dark:text-ink dark:hover:bg-charcoal">
        <ArrowLeft size={18} aria-hidden="true" /> Back to Activity
      </button>
      <section role="status" aria-label="Loading booking details" aria-busy="true" className="workspace-surface rounded-[24px] border p-5 shadow-sm sm:p-7">
        <span className="sr-only">Loading booking details.</span>
        <div aria-hidden="true" className="space-y-6">
          <div className="space-y-3"><Skeleton className="h-7 w-3/4 max-w-md" /><Skeleton className="h-4 w-48 max-w-full" /></div>
          <div className="grid gap-6 border-t border-[color:var(--workspace-border)] pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
            <div className="space-y-5">
              <div className="space-y-3 rounded-2xl bg-[color:var(--workspace-surface-muted)] p-5"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
              <div className="flex flex-wrap gap-3"><Skeleton className="h-11 w-28" /><Skeleton className="h-11 w-36" /></div>
              <div className="space-y-4 pt-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            </div>
            <div className="space-y-5 rounded-2xl bg-[color:var(--workspace-surface-muted)] p-5"><Skeleton className="h-5 w-32" />{[0, 1, 2].map(index => <div key={index} className="flex justify-between gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /></div>)}</div>
          </div>
        </div>
      </section>
    </div>
  );

  if (status === 'error') return (
    <section role="alert">
      <EmptyState icon={WarningCircle} title="Couldn't load this booking" description="Check your connection and try again." accentColor={accentColor} actionLabel="Retry" onAction={() => { void retry(); }} secondaryActionLabel="Back to Activity" onSecondaryAction={onBack} />
    </section>
  );

  return (
    <section role="status">
      <EmptyState icon={CalendarBlank} title="Booking unavailable" description="This booking is no longer in your Activity, or this account does not have access to it." accentColor={accentColor} actionLabel="Back to Activity" onAction={onBack} />
    </section>
  );
}
