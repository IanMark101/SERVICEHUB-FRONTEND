import Skeleton from './Skeleton';

type WorkspaceSkeletonRole = 'seeker' | 'provider' | 'admin';
type WorkspaceSkeletonVariant = 'marketplace' | 'profile' | 'table';

interface WorkspacePageSkeletonProps {
  label?: string;
  role?: WorkspaceSkeletonRole;
  variant?: WorkspaceSkeletonVariant;
}

export default function WorkspacePageSkeleton({
  label = 'Loading workspace content',
  role = 'admin',
  variant = 'marketplace',
}: WorkspacePageSkeletonProps) {
  if (variant === 'profile') {
    return (
      <div className={`workspace-page-skeleton workspace-page-skeleton--${role} space-y-5`} role="status" aria-label={label}>
        <section className="workspace-surface rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton variant="rounded" className="size-24 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-52 max-w-full" />
              <Skeleton className="h-3.5 w-72 max-w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-11 w-32" />
          </div>
        </section>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <SkeletonPanel rows={4} />
          <SkeletonPanel rows={3} />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`workspace-page-skeleton workspace-page-skeleton--${role} space-y-5`} role="status" aria-label={label}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 max-w-full" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <section className="workspace-surface overflow-hidden rounded-2xl border">
          <div className="flex gap-3 border-b border-[color:var(--workspace-border)] p-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="divide-y divide-[color:var(--workspace-border)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3.5">
                <Skeleton variant="circular" className="size-10" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-44 max-w-full" />
                  <Skeleton className="h-3 w-64 max-w-full" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`workspace-page-skeleton workspace-page-skeleton--${role} space-y-5`} role="status" aria-label={label}>
      <section className="workspace-surface rounded-2xl border px-5 py-6 sm:px-7">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Skeleton className="mx-auto h-7 w-80 max-w-full" />
          <Skeleton className="mx-auto h-3.5 w-96 max-w-full" />
          <Skeleton className="mx-auto h-12 w-full max-w-xl rounded-xl" />
        </div>
      </section>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonPanel key={index} rows={3} />
        ))}
      </div>
    </div>
  );
}

function SkeletonPanel({ rows }: { rows: number }) {
  return (
    <section className="workspace-surface rounded-2xl border p-5">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton variant="circular" className="size-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32 max-w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={`h-3.5 ${index === rows - 1 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
      <Skeleton className="mt-5 h-10 w-full" />
    </section>
  );
}
