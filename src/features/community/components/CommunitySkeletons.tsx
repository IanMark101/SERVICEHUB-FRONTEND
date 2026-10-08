import Skeleton from '../../../components/ui/Skeleton';

type ThemeProps = { isDark?: boolean };
const surface = (isDark: boolean) => isDark ? 'border-neutral-800 bg-charcoal-inset' : 'border-slate-200/90 bg-white';

export function StatsSkeleton({ isDark = false }: ThemeProps) {
  return (
    <div className={`overflow-hidden rounded-3xl border ${surface(isDark)}`} role="status" aria-label="Loading community statistics" aria-busy="true">
      <div className="grid grid-cols-2 divide-y divide-[color:var(--workspace-border)] sm:grid-cols-4 sm:divide-y-0">
        {[0, 1, 2, 3].map(index => <div key={index} className={`p-3.5 sm:p-5 lg:p-6 ${index > 0 ? 'sm:border-l sm:border-[color:var(--workspace-border)]' : ''}`}><div className="flex items-start justify-between gap-1.5 sm:items-center"><Skeleton className="h-7 w-24 max-w-full sm:h-4" /><Skeleton className="size-7 shrink-0 sm:size-8" /></div><Skeleton className="mt-2 h-5 w-16 sm:mt-3 sm:h-6 lg:h-8" /></div>)}
      </div>
    </div>
  );
}

export function UpdatesSkeleton({ isDark = false, columns = 1 }: ThemeProps & { columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? 'grid items-start gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)]' : ''} role="status" aria-label="Loading community notices" aria-busy="true">
      {Array.from({ length: columns }, (_, index) => <div key={index} className={`min-w-0 rounded-3xl border p-5 sm:p-6 ${surface(isDark)}`}>
        <div className="flex justify-between gap-3 border-b border-[color:var(--workspace-border)] pb-3.5"><Skeleton className="h-6 w-44 max-w-full" /><Skeleton className="h-4 w-16 shrink-0" /></div>
        {columns === 1 ? <div className="space-y-3 pt-5"><Skeleton className="h-5 w-28" /><Skeleton className="h-7 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-32" /></div> : [0, 1, 2].map(row => <div key={row} className="space-y-2 border-b border-[color:var(--workspace-border)] py-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-28" /></div>)}
      </div>)}
    </div>
  );
}

export function RecentGridSkeleton({ isDark = false }: ThemeProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.85fr)]" role="status" aria-label="Loading recently added services and categories" aria-busy="true">
      {[0, 1].map(index => <div key={index} className={`min-w-0 rounded-3xl border p-4 sm:p-6 ${surface(isDark)}`}>
        <div className="flex justify-between gap-3 border-b border-[color:var(--workspace-border)] pb-3.5"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-16" /></div>
        {[0, 1, 2].map(row => <div key={row} className="flex gap-2.5 border-b border-[color:var(--workspace-border)] py-3.5 sm:gap-4">
          {index === 0 && <Skeleton className="size-9 shrink-0 sm:size-10" />}
          <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><div className="flex justify-between gap-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-12" /></div>{index === 0 && <Skeleton className="h-5 w-24" />}</div>
        </div>)}
      </div>)}
    </div>
  );
}

export function TopProvidersSkeleton({ isDark = false }: ThemeProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border p-2.5 sm:p-6 md:p-8 lg:p-10 ${surface(isDark)}`} role="status" aria-label="Loading provider rankings" aria-busy="true">
      <div className="mx-auto grid max-w-4xl grid-cols-3 items-end gap-1 sm:gap-4 md:gap-6">
        {['h-24 sm:h-36 md:h-44', 'h-32 sm:h-48 md:h-60', 'h-16 sm:h-24 md:h-32'].map((height, index) => <div key={height} className="flex min-w-0 flex-col items-center">
          <Skeleton className="mb-1 h-5 w-14 sm:mb-2" />
          <Skeleton variant="circular" className={index === 1 ? 'size-13 sm:size-20 md:size-24' : 'size-10 sm:size-16 md:size-20'} />
          <Skeleton className="mt-1.5 h-4 w-3/4 sm:mt-3 sm:h-6" /><Skeleton className="mt-1 h-4 w-2/3" /><Skeleton className="mt-2 h-5 w-3/4" />
          <Skeleton className={`mt-2 w-full rounded-b-none sm:mt-4 ${height}`} />
        </div>)}
      </div>
    </div>
  );
}
