'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, RefreshCw, ShieldCheck, Star } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import AdminPagination from '@/components/admin/AdminPagination';
import { apiGetAdminUserRecords } from '@/api/admin.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { AdminUserProfileData, AdminUserRecordsResponse, UserRecordKind } from './types';
import './admin-users.css';

const sections: { id: 'account' | UserRecordKind; label: string }[] = [
  { id: 'account', label: 'Account details' }, { id: 'reviews', label: 'Reviews' }, { id: 'trust', label: 'Trust history' },
  { id: 'moderation', label: 'Moderation history' }, { id: 'services', label: 'Service listings' }, { id: 'requests', label: 'Requests' }, { id: 'bookings', label: 'Bookings' },
];
const date = (value: string) => new Date(value).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric' });
const label = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/^./, char => char.toUpperCase());
function externalLink(value: string | null) { try { const url = new URL(value || ''); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; } }

export default function AdminUserProfileView({ data, backHref, onRefresh }: { data: AdminUserProfileData; backHref: string; onRefresh?: () => void }) {
  const { user, ratings, activity } = data;
  const [section, setSection] = useState<'account' | UserRecordKind>('account');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<AdminUserRecordsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const load = useCallback(async (signal?: AbortSignal) => {
    if (section === 'account') return;
    const version = ++generation.current;
    setLoading(true); setError('');
    try { const result = await apiGetAdminUserRecords(user.id, section, page, signal); if (version === generation.current && !signal?.aborted) setRecords(result); }
    catch (cause) { if (version === generation.current && !signal?.aborted) setError(getApiErrorMessage(cause, 'Could not load account history.')); }
    finally { if (version === generation.current && !signal?.aborted) setLoading(false); }
  }, [section, page, user.id]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => { window.clearTimeout(timer); controller.abort(); invalidate(); };
  }, [load, invalidate, data]);
  const status = user.deactivatedAt ? 'Deleted account' : user.moderationStatus !== 'ACTIVE' ? label(user.moderationStatus) : user.isActive ? 'Active' : 'Inactive';
  const facts: [string, string | null | undefined][] = [
    ['User ID', user.id], ['Account role', user.role === 'admin' ? 'Administrator' : 'User · seeker and provider workspaces'],
    ['Email', user.email], ['Phone', user.phone], ['Email verification', user.emailVerified ? 'Verified' : 'Not verified'],
    ['Residency verification', label(user.verificationStatus)], ['Location', user.location], ['Joined', date(user.createdAt)],
    ['Account status', status], ['Suspension ends', user.suspendedUntil ? date(user.suspendedUntil) : null],
    ['Moderation reason', user.moderationReason], ['Service posting', user.postingSuspended ? `Suspended${user.postingSuspendReason ? `: ${user.postingSuspendReason}` : ''}` : 'No posting restriction'],
  ];
  return <div className="au-page">
    <div className="au-topbar"><Link href={backHref} className="au-button"><ArrowLeft size={16} />Back to {backHref.startsWith('/admin/ban-appeals') ? 'appeals' : 'users'}</Link>{onRefresh && <button type="button" className="au-button" onClick={onRefresh}><RefreshCw size={16} />Refresh profile</button>}</div>
    <header className="au-panel">
      <div className="au-identity"><UserAvatar src={user.avatarUrl} name={user.name} size={64} role="admin" /><div className="min-w-0"><h1 className="au-heading">{user.name}</h1><p className="au-muted mt-1">{user.role === 'admin' ? 'Administrator account' : 'ServiceHub member'} · Joined {date(user.createdAt)}</p><div className="mt-3 flex flex-wrap gap-2"><span className="au-badge">{status}</span><span className="au-badge">Trust {user.trustScore}/100</span>{user.verificationStatus === 'APPROVED' && <span className="au-badge"><ShieldCheck size={14} />Verified resident</span>}</div></div></div>
      {user.bio && <p className="mt-5 max-w-[70ch] whitespace-pre-wrap text-sm leading-6">{user.bio}</p>}
      <div className="mt-4 flex flex-wrap gap-4">{([['Facebook', user.facebookUrl], ['Instagram', user.instagramUrl], ['Website', user.websiteUrl]] as const).map(([name, value]) => { const href = externalLink(value); return href ? <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline underline-offset-4">{name}<ArrowUpRight size={14} /></a> : null; })}</div>
      <div className="au-rating-grid">{(['provider', 'seeker'] as const).map(context => <div key={context}><h2 className="text-sm font-semibold">As a {context}</h2><p className="au-muted mt-1">{context === 'provider' ? activity.completedAsProvider : activity.completedAsSeeker} completed bookings</p><p className="mt-2 flex items-center gap-1 text-sm"><Star size={15} className="text-amber-600" />{ratings[context].count ? `${ratings[context].average?.toFixed(1)}/5 · ${ratings[context].count} visible reviews` : 'No visible reviews yet'}</p></div>)}</div>
    </header>
    <nav className="au-tabs" aria-label="User profile sections">{sections.map(item => <button key={item.id} type="button" aria-pressed={section === item.id} onClick={() => { generation.current++; setSection(item.id); setPage(1); setRecords(null); setError(''); setLoading(item.id !== 'account'); }}>{item.label}{item.id === 'services' ? ` (${activity.services})` : item.id === 'requests' ? ` (${activity.requests})` : item.id === 'bookings' ? ` (${activity.bookings})` : ''}</button>)}</nav>
    <section className="au-panel" aria-label={sections.find(item => item.id === section)?.label} aria-busy={loading}>
      <h2 className="text-lg font-semibold">{sections.find(item => item.id === section)?.label}</h2>
      {section === 'account' ? <><p className="au-muted mt-1">Account information is available to authorized administrators.</p><dl className="au-facts">{facts.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value || 'Not recorded'}</dd></div>)}</dl><div className="mt-5 flex flex-wrap gap-3"><Link className="au-button" href={`/admin/reports?userId=${encodeURIComponent(user.id)}`}>Review disputes and payment obligations<ArrowUpRight size={15} /></Link>{user.moderationStatus === 'BANNED' && <Link className="au-button" href="/admin/ban-appeals">Review ban appeals<ArrowUpRight size={15} /></Link>}</div></>
        : error ? <div className="au-error mt-4" role="alert"><p>{error}</p><button type="button" onClick={() => void load()} className="au-button mt-3">Try again</button></div>
        : loading ? <p className="au-muted py-8" role="status">Loading {sections.find(item => item.id === section)?.label.toLowerCase()}…</p>
        : !records?.data.length ? <p className="au-muted py-8">No {sections.find(item => item.id === section)?.label.toLowerCase()} recorded for this account.</p>
        : <><div>{records.data.map(row => <article className="au-record" key={row.id}><div className="au-topbar"><h3>{row.title}</h3><span className="au-muted">{date(row.createdAt)}</span></div><div className="mt-2 flex flex-wrap items-center gap-2">{row.status && <span className="au-badge">{label(row.status)}</span>}{row.reviewContext && <span className="au-badge">As {row.reviewContext.toLowerCase()}</span>}{row.rating !== undefined && <span className="inline-flex items-center gap-1 text-sm"><Star size={14} />{row.rating}/5</span>}{row.delta !== undefined && <span className="text-sm font-semibold">{row.delta > 0 ? '+' : ''}{row.delta} points · {row.scoreBefore} → {row.scoreAfter}</span>}{row.amount !== undefined && <span className="text-sm font-semibold">₱{row.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>}</div>{row.description && <p className="whitespace-pre-wrap">{row.description}</p>}{row.moderationReason && <p className="au-muted">Moderation reason: {row.moderationReason}</p>}{row.actorName && <p className="au-muted">Recorded by {row.actorName}</p>}{row.link && <Link href={row.link} className="au-button mt-3">Open {section === 'bookings' ? 'booking workspace' : 'related content'}<ArrowUpRight size={15} /></Link>}</article>)}</div><AdminPagination page={page} totalPages={records.pagination.totalPages} totalItems={records.pagination.total} pageSize={10} onPageChange={setPage} itemLabel="account records" /></>}
    </section>
  </div>;
}
