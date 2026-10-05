import Skeleton from './Skeleton';
import { ActivityItemSkeleton, JobRequestSkeleton, ServiceListingSkeleton } from './SkeletonCard';
import ProfilePageSkeleton from '../profile/ProfilePageSkeleton';

export type WorkspaceSkeletonRole = 'seeker' | 'provider' | 'admin';
export type WorkspaceSkeletonVariant = 'marketplace' | 'profile' | 'table' | 'overview' | 'announcements' | 'verification' | 'suggestions' | 'manager' | 'activity';

interface WorkspacePageSkeletonProps {
  label?: string;
  role?: WorkspaceSkeletonRole;
  variant?: WorkspaceSkeletonVariant;
}

export default function WorkspacePageSkeleton({ label = 'Loading workspace content', role = 'admin', variant = 'marketplace' }: WorkspacePageSkeletonProps) {
  if (variant === 'profile') return <ProfilePageSkeleton />;
  const panel = 'workspace-surface rounded-2xl border p-5';
  let content;
  if (variant === 'table') {
    // Only the rows are replaced; catalog heading, container and pager stay mounted.
    content = <div className="divide-y divide-[color:var(--workspace-border)]">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><Skeleton className="size-9 shrink-0" /><div className="min-w-0 space-y-2"><div className="flex flex-wrap gap-2"><Skeleton className="h-5 w-36 max-w-full" /><Skeleton className="h-4 w-14 rounded-full" /></div><Skeleton className="h-3 w-64 max-w-full" /></div></div><Skeleton className="h-8 w-24 shrink-0" /></div>)}</div>;
  } else if (variant === 'overview') {
    content = <div className="space-y-5">
      <div className="flex items-center justify-between gap-3"><Skeleton className="h-4 w-44" /><Skeleton className="h-8 w-28" /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className={panel}><div className="flex justify-between gap-3"><Skeleton className="h-4 w-36" /><Skeleton className="size-9 shrink-0" /></div><Skeleton className="mt-4 h-8 w-12" /><Skeleton className="mt-1.5 h-4 w-full" /></div>)}</div>
      <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-3/4" /><div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]"><div className={panel}><Skeleton className="h-5 w-44" /><Skeleton className="mt-1 h-4 w-2/3" /><Skeleton className="mt-5 h-4 w-48" /><Skeleton className="mt-4 h-44 w-full" /></div><div className={panel}><Skeleton className="h-5 w-40" /><Skeleton className="mt-1 h-4 w-2/3" /><Skeleton variant="circular" className="mx-auto mt-5 size-40" /></div></div><div className={panel}><Skeleton className="h-5 w-44" /><Skeleton className="mt-4 h-36 w-full" /></div></div>
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">{[0, 1].map(index => <div key={index} className={panel}><Skeleton className="mb-4 h-5 w-44" /><Skeleton className="h-10 w-full" /><Skeleton className="mt-3 h-10 w-full" /></div>)}</div>
    </div>;
  } else if (['announcements', 'verification', 'suggestions'].includes(variant)) {
    const verification = variant === 'verification';
    content = <div className={variant === 'announcements' ? 'space-y-3' : 'space-y-6'}>{Array.from({ length: 3 }, (_, index) => <article key={index} className={`workspace-surface border ${variant === 'announcements' ? 'rounded-2xl p-5' : 'rounded-[24px] p-6'}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0 flex-1 space-y-2"><div className="flex gap-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-28" /></div><Skeleton className="h-5 w-52 max-w-full" /><Skeleton className="h-4 w-full" /></div><Skeleton className="h-8 w-28 shrink-0" /></div>
      {verification ? <div className="mt-4 grid gap-4 sm:grid-cols-2">{[0, 1].map(proof => <div key={proof} className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-28 w-full" /></div>)}</div> : <><Skeleton className="mt-2 h-4 w-2/3" /><Skeleton className="mt-3 h-4 w-40 max-w-full" /></>}
      {variant !== 'announcements' && <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[color:var(--workspace-border)] pt-3"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-28" /></div>}
    </article>)}</div>;
  } else if (variant === 'manager') {
    content = <div className="space-y-6"><div className="flex flex-col justify-between gap-4 border-b border-[color:var(--workspace-border)] pb-4 sm:flex-row"><div className="flex flex-wrap gap-2">{[0, 1, 2].map(index => <Skeleton key={index} className="h-11 w-28" />)}</div><Skeleton className="h-9 w-28" /></div>{[0, 1, 2].map(index => <article key={index} className={panel}><div className="flex flex-wrap justify-between gap-3"><Skeleton className="h-5 w-32" /><div className="flex gap-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div></div><Skeleton className="mt-4 h-5 w-2/3" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-4 h-5 w-36" /><div className="mt-5 flex justify-between border-t border-[color:var(--workspace-border)] pt-3"><Skeleton className="h-6 w-24" /><Skeleton className="h-5 w-28" /></div></article>)}</div>;
  } else if (variant === 'activity') {
    content = <div className="space-y-5"><div className="flex flex-wrap gap-2">{[0, 1, 2, 3].map(index => <Skeleton key={index} className="h-11 w-28" />)}</div><div className="workspace-activity-toolbar"><Skeleton className="h-11 flex-1" /><Skeleton className="h-11 w-32" /></div><ActivityItemSkeleton /></div>;
  } else {
    content = <div className="marketplace-results space-y-6">
      <section className="workspace-surface rounded-2xl border px-5 py-6 sm:px-7"><div className="mx-auto max-w-2xl space-y-3 text-center"><Skeleton className="mx-auto h-8 w-96 max-w-full" /><Skeleton className="mx-auto h-5 w-80 max-w-full" /><Skeleton className="mx-auto h-12 w-full max-w-xl" /></div></section>
      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--workspace-border)] pb-4"><Skeleton className="h-4 w-20" />{[80, 100, 120, 96].map(width => <Skeleton key={width} className="h-10 rounded-full" style={{ width }} />)}</div>
      <div className="flex flex-wrap justify-between gap-3"><div className="flex flex-wrap gap-2">{[128, 144, 136].map(width => <Skeleton key={width} className="h-10 rounded-full" style={{ width }} />)}</div><Skeleton className="h-10 w-28 rounded-full" /></div>
      {role === 'provider' ? <JobRequestSkeleton /> : <ServiceListingSkeleton />}
      <Skeleton className="h-16 w-full" />
    </div>;
  }
  return <div className={`workspace-page-skeleton workspace-page-skeleton--${role}`} role="status" aria-label={label} aria-busy="true">{content}</div>;
}
