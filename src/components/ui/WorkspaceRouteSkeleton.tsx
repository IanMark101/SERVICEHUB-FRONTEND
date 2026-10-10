'use client';

import { usePathname } from 'next/navigation';
import WorkspacePageSkeleton, { type WorkspaceSkeletonRole, type WorkspaceSkeletonVariant } from './WorkspacePageSkeleton';

/** A parent route fallback must not pretend every child is a marketplace grid. */
export default function WorkspaceRouteSkeleton({ role }: { role: WorkspaceSkeletonRole }) {
  const pathname = usePathname() || '';
  const segment = pathname.split('/').filter(Boolean).at(-1);
  let variant: WorkspaceSkeletonVariant | undefined;
  if (role === 'admin') {
    variant = ({ admin: 'overview', overview: 'overview', categories: 'table', announcements: 'announcements', verifications: 'verification' } as const)[segment as 'admin' | 'overview' | 'categories' | 'announcements' | 'verifications'];
  } else if (['seeker', 'provider', 'seek-services', 'browse-services'].includes(segment || '')) variant = 'marketplace';
  else if (segment === 'activity') variant = 'activity';
  else if (segment === 'service-manager' || segment === 'request-manager') variant = 'manager';
  if (variant) return <WorkspacePageSkeleton role={role} variant={variant} />;
  // Forms, messages and other distinct screens keep a neutral navigation status
  // until their own content mounts, instead of showing an unrelated card grid.
  return <div role="status" aria-busy="true" className="flex min-h-40 items-center justify-center gap-3 text-sm text-[color:var(--workspace-muted)]"><span className="size-5 animate-spin rounded-full border-2 border-[color:var(--workspace-border)] border-t-[color:var(--workspace-focus)] motion-reduce:animate-none" aria-hidden="true" />Loading your page…</div>;
}
