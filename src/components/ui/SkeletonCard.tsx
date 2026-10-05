import Skeleton from './Skeleton';

function ListingSkeleton({ request = false }: { request?: boolean }) {
  return (
    <article className="workspace-card flex h-full min-w-0 flex-col justify-between rounded-2xl border p-4 sm:p-5">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Skeleton variant="circular" className="size-9 shrink-0" />
            <div className="min-w-0 space-y-1"><Skeleton className="h-3.5 w-28 max-w-full" /><Skeleton className="h-6 w-24 max-w-full" /></div>
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5"><Skeleton className="h-5 w-32 max-w-full" /><Skeleton className="h-4 w-16" /></div>
        <div className="space-y-1">
          <div className={request ? 'min-h-10 space-y-1' : ''}><Skeleton className="h-5 w-5/6" />{request && <Skeleton className="h-4 w-1/2" />}</div>
          <div className="min-h-10 space-y-1.5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
        </div>
        {request && <Skeleton className="h-4 w-44 max-w-full" />}
        <div className="flex items-baseline justify-between border-t border-[color:var(--workspace-border)] pt-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-4 w-16" /></div>
        <div className="space-y-1.5 pb-1"><Skeleton className="h-3 w-28" /><div className="flex flex-wrap gap-1.5"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-24" /></div></div>
      </div>
      <div className="mt-3.5 flex gap-2 border-t border-[color:var(--workspace-border)] pt-3"><Skeleton className="h-11 w-24" /><Skeleton className="h-11 flex-1" /></div>
    </article>
  );
}

export function ServiceListingSkeleton({ count = 6 }: { count?: number }) {
  return <div className="marketplace-results-grid" role="status" aria-label="Loading services" aria-busy="true">{Array.from({ length: count }, (_, index) => <ListingSkeleton key={index} />)}</div>;
}

export function JobRequestSkeleton({ count = 6 }: { count?: number }) {
  return <div className="marketplace-results-grid" role="status" aria-label="Loading job requests" aria-busy="true">{Array.from({ length: count }, (_, index) => <ListingSkeleton key={index} request />)}</div>;
}

/** ActivityFeed groups bookings; waiting uses the QueueActivityCard split panel. */
export function ActivityItemSkeleton({ count = 3, variant = 'active' }: { count?: number; variant?: 'active' | 'waiting' | 'history' }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading booking activity" aria-busy="true">
      <Skeleton className="h-5 w-44" />
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="workspace-card overflow-hidden rounded-2xl border">
          <div className={variant === 'waiting' ? 'grid lg:grid-cols-[minmax(0,1fr)_minmax(230px,290px)]' : ''}>
            <div className={variant === 'history' ? 'space-y-2 p-4 sm:p-5' : 'space-y-4 p-5 sm:p-6'}>
              <div className="flex justify-between gap-4"><Skeleton className="h-5 w-52 max-w-full" /><Skeleton className="h-5 w-16 shrink-0" /></div>
              <Skeleton className="h-4 w-36 max-w-full" />
              <div className="flex flex-wrap gap-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-28" /></div>
              {variant !== 'history' && <><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Skeleton className="h-12 w-full lg:w-2/3" />{variant !== 'waiting' && <Skeleton className="h-11 w-full lg:w-36" />}</div></>}
            </div>
            {variant === 'waiting' && <div className="flex flex-col gap-5 border-t border-[color:var(--workspace-border)] bg-[color:var(--workspace-surface-muted)] p-5 sm:p-6 lg:border-l lg:border-t-0"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-12" /><Skeleton className="h-4 w-full" /><Skeleton className="h-5 w-36" /><Skeleton className="mt-auto h-11 w-full" /></div>}
          </div>
        </article>
      ))}
    </div>
  );
}
