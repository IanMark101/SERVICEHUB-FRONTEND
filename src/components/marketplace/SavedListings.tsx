'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkSimple } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { apiGetSavedListings, apiSetListingSaved, type SavedListingsPage } from '../../api/savedListings.api';
import { mapRequestToJobRequest, mapServiceToListing } from '../../context/mappers';
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useToast } from '../ui/Toast';
import ServiceMarketplaceCard from '../seeker/seek-services/ServiceMarketplaceCard';
import JobRequestCard from '../provider/browse-jobs/JobRequestCard';
import EmptyState from '../ui/EmptyState';
import { ServiceListingSkeleton } from '../ui/SkeletonCard';
import { hasActiveOffer } from '../../lib/offerStatus';

export default function SavedListings({ workspace }: { workspace: 'seeker' | 'provider' }) {
  const { user, isDark, jobEngagements, bids } = useApp();
  const router = useRouter();
  const contentType = workspace === 'seeker' ? 'SERVICE_LISTING' : 'SERVICE_REQUEST';
  const [page, setPage] = useState(1);
  const key = `${user?.id || ''}:${contentType}:${page}`;
  const currentKey = useRef(key);
  useEffect(() => { currentKey.current = key; return () => { currentKey.current = ''; }; }, [key]);
  const [result, setResult] = useState<{ key: string; data: SavedListingsPage | null; error: string }>({ key: '', data: null, error: '' });
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const pending = useRef(new Set<string>());
  const generation = useRef(0);
  const { success, error: toastError } = useToast();
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useApiCacheRefresh(['saved', 'services', 'requests'], refresh, Boolean(user?.id));
  useEffect(() => {
    const requestGeneration = ++generation.current;
    if (!user?.id) return;
    let active = true;
    void apiGetSavedListings(contentType, page).then(data => {
      if (active && generation.current === requestGeneration) setResult({ key, data, error: '' });
    }).catch(error => {
      if (active && generation.current === requestGeneration) setResult(previous => ({ key, data: previous.key === key ? previous.data : null, error: getApiErrorMessage(error, 'Saved listings could not load. Please try again.') }));
    });
    return () => { active = false; };
  }, [key, user?.id, contentType, page, revision]);
  useEffect(() => {
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);
  const data = result.key === key ? result.data : null;
  const error = result.key === key ? result.error : '';
  const remove = async (listingId: string) => {
    const pendingKey = `${key}:${listingId}`;
    if (pending.current.has(pendingKey)) return;
    const actionKey = key;
    pending.current.add(pendingKey); setBusy(new Set(pending.current));
    ++generation.current;
    try {
      await apiSetListingSaved(contentType, listingId, false);
      if (currentKey.current !== actionKey) return;
      setResult(previous => previous.key === actionKey && previous.data ? {
        ...previous, data: { ...previous.data, items: previous.data.items.filter(item => item.listingId !== listingId), pagination: { ...previous.data.pagination, total: Math.max(0, previous.data.pagination.total - 1) } },
      } : previous);
      success('Listing removed', 'Removed from your saved listings.', workspace); refresh();
    } catch (failure) { if (currentKey.current === actionKey) { toastError('Could not remove listing', getApiErrorMessage(failure, 'Please try again.')); refresh(); } }
    finally { pending.current.delete(pendingKey); setBusy(new Set(pending.current)); }
  };
  const isBusy = (id: string) => busy.has(`${key}:${id}`);
  const browse = workspace === 'seeker' ? '/seeker/seek-services' : '/provider/browse-services';
  const details = (id: string) => router.push(`${browse}?${workspace === 'seeker' ? 'serviceId' : 'request'}=${encodeURIComponent(id)}`);

  return <div className="workspace-page marketplace-results space-y-5">
    <div><h1 className="text-xl font-bold tracking-tight">Saved listings</h1><p className="mt-1 text-sm text-ink-muted dark:text-ink-muted">{workspace === 'seeker' ? 'Services you saved to view or book later.' : 'Service requests you saved to revisit or send an offer.'}</p></div>
    {error && <div role="alert" className="workspace-surface rounded-xl border p-4 text-sm">{error} <button type="button" onClick={refresh} className="ml-2 font-semibold underline">Try again</button></div>}
    {!data && !error ? <ServiceListingSkeleton count={3} /> : data && <>
      {!data.items.length ? <EmptyState icon={BookmarkSimple} title="No saved listings yet" description={workspace === 'seeker' ? 'Tap Save on a service listing to keep it here.' : 'Tap Save on a service request to keep it here.'} actionLabel="Browse listings" onAction={() => router.push(browse)} accentColor={workspace === 'seeker' ? 'orange' : 'emerald'} /> : <>
        <p className="text-xs text-ink-muted dark:text-ink-muted">{data.pagination.total} saved {data.pagination.total === 1 ? 'listing' : 'listings'}</p>
        <div className="marketplace-results-grid">{data.items.map(item => {
          if (!item.listing) return <article key={item.id} className="workspace-surface rounded-2xl border p-5"><BookmarkSimple size={24} aria-hidden="true" /><h2 className="mt-3 text-sm font-semibold">Listing unavailable</h2><p className="mt-2 text-sm text-ink-muted dark:text-ink-muted">This listing is paused, closed, removed, or no longer public.</p><button type="button" disabled={isBusy(item.listingId)} onClick={() => { void remove(item.listingId); }} className="mt-4 min-h-11 rounded-xl border px-4 text-sm font-semibold disabled:opacity-50">{isBusy(item.listingId) ? 'Removing...' : 'Remove from Saved'}</button></article>;
          if (item.contentType === 'SERVICE_LISTING') {
            const service = mapServiceToListing(item.listing);
            const activeEngagement = jobEngagements.find(booking => booking.seekerId === user?.id && booking.serviceId === service.id && ['pending_provider', 'queued', 'in_progress', 'awaiting_seeker_approval', 'disputed'].includes(booking.status));
            return <ServiceMarketplaceCard key={item.id} service={service} trustScore={service.providerTrustScore} verified={service.providerVerificationStatus === 'APPROVED'} isDark={isDark} isOwned={service.providerId === user?.id} activeEngagement={activeEngagement} joiningWaitlistId={null}
              onDetails={() => details(service.id)} onProfile={() => router.push(`/profile/${encodeURIComponent(service.providerId)}`)} onReviews={() => router.push(`/profile/${encodeURIComponent(service.providerId)}?tab=reviews&reviewRole=provider`)} onEdit={() => router.push(`/provider/service-manager?id=${encodeURIComponent(service.id)}`)} onActivity={() => router.push(`/seeker/seeker-activity?tab=all&booking=${encodeURIComponent(activeEngagement?.id || '')}`)}
              onBook={() => details(service.id)} onJoinWaitlist={() => details(service.id)} prefetch={() => {}} saved saving={isBusy(item.listingId)} onToggleSaved={() => { void remove(item.listingId); }} />;
          }
          const request = mapRequestToJobRequest(item.listing);
          const offer = bids.find(bid => bid.requestId === request.id && bid.providerId === user?.id && hasActiveOffer(bid));
          return <JobRequestCard key={item.id} request={request} proposalCount={request.offersCount || 0} isOwned={request.seekerId === user?.id} offerState={offer ? offer.status.toLowerCase() === 'accepted' ? 'accepted' : 'submitted' : null} isDark={isDark} onProfile={reviews => router.push(`/profile/${encodeURIComponent(request.seekerId)}${reviews ? '?tab=reviews&reviewRole=seeker' : ''}`)} onDetails={() => details(request.id)} onSendOffer={() => details(request.id)} saved saving={isBusy(item.listingId)} onToggleSaved={() => { void remove(item.listingId); }} />;
        })}</div>
        {data.pagination.totalPages > 1 && <nav aria-label="Saved listings pages" className="flex items-center justify-center gap-4"><button type="button" className="min-h-11 rounded-xl border px-4 text-sm disabled:opacity-50" disabled={data.pagination.page <= 1} onClick={() => setPage(data.pagination.page - 1)}>Previous</button><span className="text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span><button type="button" className="min-h-11 rounded-xl border px-4 text-sm disabled:opacity-50" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => setPage(data.pagination.page + 1)}>Next</button></nav>}
      </>}
    </>}
  </div>;
}
