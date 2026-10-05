import Skeleton from '../../ui/Skeleton';

export default function CaseSkeleton({ variant = 'queue', busy = true }: { variant?: 'queue' | 'detail' | 'operations'; busy?: boolean }) {
  if (variant === 'detail') return (
    <div className="case-workroom" role="status" aria-label="Opening case" aria-busy={busy}>
      <Skeleton className="mb-3 h-11 w-32" />
      <header className="case-workroom-header"><Skeleton className="h-5 w-44" /><Skeleton className="mt-3 h-8 w-80 max-w-full" /><Skeleton className="mt-2 h-5 w-64 max-w-full" /><Skeleton className="mt-2 h-4 w-72 max-w-full" /></header>
      <div className="case-workroom-grid">
        <div className="case-workroom-content"><div className="case-tabs" aria-hidden="true">{[0, 1, 2, 3].map(index => <Skeleton key={index} className="h-11 w-24" />)}</div>{[0, 1, 2].map(index => <section key={index} className="case-detail-section"><Skeleton className="mb-4 h-6 w-44" /><Skeleton className="h-4 w-full" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-3 h-4 w-2/3" /></section>)}</div>
        <aside className="case-decision"><Skeleton className="h-6 w-36" /><Skeleton className="mt-3 h-4 w-full" />{[0, 1, 2].map(index => <div key={index} className="mt-5 space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-11 w-full" /></div>)}<Skeleton className="mt-5 h-24 w-full" /><Skeleton className="mt-5 h-11 w-full" /></aside>
      </div>
    </div>
  );
  return (
    <div className={variant === 'operations' ? 'case-operation-list' : 'case-list'} role="status" aria-label={variant === 'operations' ? 'Loading bookings' : 'Loading cases'} aria-busy="true">
      {[0, 1, 2].map(index => <div key={index} className={variant === 'operations' ? 'case-operation-row' : 'case-row'}>
        <div className="case-row-main space-y-2"><div className="flex flex-wrap gap-2"><Skeleton className="h-5 w-44 max-w-full" /><Skeleton className="h-5 w-20" /></div><Skeleton className="h-5 w-64 max-w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" />{variant === 'queue' && <Skeleton className="h-4 w-36" />}</div>
        {variant === 'queue' && <div className="case-row-payment"><Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-24" /></div>}
        <Skeleton className="h-11 w-28 shrink-0" />
      </div>)}
    </div>
  );
}
