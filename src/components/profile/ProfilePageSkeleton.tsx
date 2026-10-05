import Skeleton from '../ui/Skeleton';

/** Mirrors ProfileHeader and the initial Marketplace Activity tab. */
export default function ProfilePageSkeleton({ isOwnProfile = false, displayName = 'ServiceHub member', usernameHandle = 'member', location = '' }: { isOwnProfile?: boolean; displayName?: string; usernameHandle?: string; location?: string }) {
  return (
    <div className="mx-auto max-w-[1180px] space-y-5" role="status" aria-label="Loading marketplace profile" aria-busy="true">
      <section className="marketplace-profile-hero relative p-5 sm:p-6 sm:pb-5">
        {isOwnProfile && <div className="absolute right-4 top-4 sm:right-6 sm:top-5"><Skeleton className="h-8 w-32 rounded-full sm:h-9" /></div>}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 shrink-0 sm:mb-3.5">
            <div className="rounded-full border-2 border-[color:var(--workspace-border-strong)] p-1.5 ring-4 ring-[color:var(--workspace-border)]">
              <Skeleton variant="circular" className="size-40" />
            </div>
            <div className="absolute bottom-1 right-1"><Skeleton variant="circular" className="size-8 border-[3px] border-[color:var(--workspace-surface)] sm:size-9" /></div>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
            <div className="relative max-w-full"><span className="invisible break-words text-xl font-extrabold tracking-tight sm:text-2xl" aria-hidden="true">{displayName}</span><div className="absolute inset-0"><Skeleton className="h-full w-full" /></div></div>
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <div className="mt-1.5 flex max-w-full flex-wrap justify-center gap-x-2 gap-y-1 text-xs sm:text-sm">
            <div className="relative"><span className="invisible font-medium" aria-hidden="true">{location ? `${location}, Cordova` : 'Cordova, Cebu'}</span><div className="absolute inset-0"><Skeleton className="h-full w-full" /></div></div>
            <div className="relative"><span className="invisible font-semibold" aria-hidden="true">@{usernameHandle.replace(/^@/, '')}</span><div className="absolute inset-0"><Skeleton className="h-full w-full" /></div></div>
            <Skeleton className="hidden h-5 w-44 sm:block" />
          </div>
          <Skeleton className="mt-2 h-5 w-36 max-w-full" />
          <div className="mt-2.5 flex max-w-full flex-wrap justify-center gap-2">
            {[108, 112, 96].map(width => <Skeleton key={width} className="h-[30px] rounded-full" style={{ width }} />)}
          </div>
        </div>
        <div className="mt-5 border-t border-[color:var(--workspace-border)] pt-4">
          <div className="mx-auto grid max-w-xl grid-cols-3 divide-x divide-[color:var(--workspace-border)]">
            {[0, 1, 2].map(index => <div key={index} className="flex min-w-0 flex-col items-center px-2"><Skeleton className="h-7 w-12 sm:h-8" /><Skeleton className={`mt-0.5 w-28 max-w-full ${index === 2 ? 'h-8 sm:h-4' : 'h-4'}`} /></div>)}
          </div>
        </div>
      </section>
      <div className="workspace-tabs marketplace-profile-tabs" aria-hidden="true">
        {[96, 108, 132, 128].map(width => <div key={width} className="workspace-tabs__item"><Skeleton className="h-4 max-w-full" style={{ width }} /></div>)}
      </div>
      <section>
        <div className="mb-6 border-b border-[color:var(--workspace-border)] pb-3"><Skeleton className="h-7 w-44" /><Skeleton className="mt-0.5 h-4 w-72 max-w-full" /></div>
        <Skeleton className="mb-3 h-5 w-36" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(index => <article key={index} className="workspace-surface rounded-2xl border p-5 sm:p-6"><div className="flex justify-between"><Skeleton className="h-5 w-16" /><Skeleton className="h-6 w-16" /></div><Skeleton className="mt-3 h-5 w-3/4" /><Skeleton className="mt-1.5 h-4 w-full" /><Skeleton className="mt-2 h-4 w-2/3" /><div className="mt-5 flex justify-between border-t border-[color:var(--workspace-border)] pt-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-12" /></div></article>)}
        </div>
      </section>
    </div>
  );
}
