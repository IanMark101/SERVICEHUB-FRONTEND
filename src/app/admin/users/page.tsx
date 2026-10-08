"use client";
import FormSelect from '../../../components/ui/FormSelect';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { invalidateApiCache } from '../../../lib/api/responseCache';
import { useApp } from '../../../context/AppContext';
import { apiListUsers, apiUpdateTrustScore, apiSuspendUser, apiBanUser, apiRestoreUser, apiRestorePostingPrivilege } from '../../../api/admin.api';
import { Search, Award, ShieldAlert, Ban, RotateCcw, Filter, UserRound } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import AdminPagination from '../../../components/admin/AdminPagination';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminUserModals from '../../../components/admin/users/AdminUserModals';
import { getApiErrorMessage } from '../../../lib/api/errors';
import type { AdminUserItem } from '../../../components/admin/users/types';

type UserItem = AdminUserItem;

export default function AdminUsers() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark, user: currentUser } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Search and filter states
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [roleFilter, setRoleFilter] = useState<string>(['user', 'admin'].includes(searchParams.get('role') || '') ? searchParams.get('role')! : '');
  const [statusFilter, setStatusFilter] = useState<string>(['active', 'suspended', 'banned'].includes(searchParams.get('status') || '') ? searchParams.get('status')! : '');

  // Pagination states
  const [page, setPage] = useState<number>(Math.max(1, Math.min(10000, Number(searchParams.get('page')) || 1)));
  const [limit, setLimit] = useState<number>([4, 6, 10, 20].includes(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 6);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const fetchGeneration = useRef(0);

  // Overlay states
  const [editingTrustUser, setEditingTrustUser] = useState<UserItem | null>(null);
  const [trustDelta, setTrustDelta] = useState<number>(0);
  const [trustReason, setTrustReason] = useState<string>('');
  const [trustPassword, setTrustPassword] = useState<string>('');
  const trustOperation = useRef<{ key: string; payload: string } | null>(null);

  const closeTrustModal = () => {
    setEditingTrustUser(null);
    setTrustPassword('');
    trustOperation.current = null;
  };

  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [suspendDuration, setSuspendDuration] = useState<number>(7);

  const [banningUser, setBanningUser] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState<string>('');
  const [banBusy, setBanBusy] = useState(false);

  const [confirmRestoreUserId, setConfirmRestoreUserId] = useState<string | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [restoreBusy, setRestoreBusy] = useState(false);
  useEffect(() => { if (searchParams.has('appeals')) router.replace('/admin/ban-appeals'); }, [router, searchParams]);

  // Search Debouncing
  useEffect(() => {
    if (search === debouncedSearch) return;
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // Fetch users when parameters change
  const fetchUsers = useCallback(() => {
    const generation = ++fetchGeneration.current;
    setLoading(true);
    apiListUsers({
      search: debouncedSearch || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      page,
      limit
    })
      .then(res => {
        if (generation !== fetchGeneration.current) return;
        if (res.success) {
          setUsers(res.data);
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
          setError('');
        } else {
          setError("Failed to fetch users list.");
        }
        setLoading(false);
      })
      .catch(err => {
        if (generation !== fetchGeneration.current) return;
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  }, [debouncedSearch, roleFilter, statusFilter, page, limit]);

  useApiCacheRefresh(['admin'], () => fetchUsers());
  useEffect(() => {
    const timer = window.setTimeout(fetchUsers, 0);
    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  const handleUpdateTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrustUser || !trustReason.trim() || trustDelta === 0 || !trustPassword) return;
    const payload = JSON.stringify([editingTrustUser.id, trustDelta, trustReason.trim()]);
    if (!trustOperation.current || trustOperation.current.payload !== payload) {
      trustOperation.current = { key: crypto.randomUUID(), payload };
    }
    try {
      const res = await apiUpdateTrustScore(editingTrustUser.id, trustDelta, trustReason.trim(), trustPassword, trustOperation.current.key);
      if (res.success) {
        const sign = trustDelta > 0 ? '+' : '';
        toastSuccess("Trust Updated", `Applied ${sign}${trustDelta} pts to ${editingTrustUser.name}. New score updates shortly.`);
        setEditingTrustUser(null);
        setTrustDelta(0);
        setTrustReason('');
        setTrustPassword('');
        trustOperation.current = null;
        fetchUsers();
      }
    } catch (err: unknown) {
      toastError("Failed to update", getApiErrorMessage(err, 'The trust score could not be updated.'));
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser || !suspendReason.trim()) return;
    try {
      const res = await apiSuspendUser(suspendingUser.id, suspendReason, suspendDuration);
      if (res.success) {
        toastSuccess("User Suspended", `${suspendingUser.name} suspended for ${suspendDuration} days.`);
        setSuspendingUser(null);
        setSuspendReason('');
        fetchUsers();
      }
    } catch (err: unknown) {
      toastError("Suspension Failed", getApiErrorMessage(err, 'The account could not be suspended.'));
    }
  };

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banningUser || !banReason.trim() || banBusy) return;
    setBanBusy(true);
    try {
      const res = await apiBanUser(banningUser.id, banReason);
      if (res.success) {
        setUsers((previous) => previous.map((item) => item.id === banningUser.id ? { ...item, moderationStatus: 'BANNED', isActive: true } : item));
        toastSuccess("User Banned", `${banningUser.name} was removed from normal access. Review existing bookings and payments.`);
        setBanningUser(null);
        setBanReason('');
        fetchUsers();
      }
    } catch (err: unknown) {
      toastError("Banning Failed", getApiErrorMessage(err, 'The account could not be banned.'));
    } finally { setBanBusy(false); }
  };

  const handleRestore = async (userId: string) => {
    if (restoreBusy || restoreReason.trim().length < 3) return;
    setRestoreBusy(true);
    try {
      const res = await apiRestoreUser(userId, restoreReason.trim());
      if (res.success) {
        setUsers((previous) => previous.map((item) => item.id === userId ? { ...item, moderationStatus: 'ACTIVE', isActive: true } : item));
        toastSuccess("Account Restored", "The user can sign in subject to normal verification requirements.");
        setConfirmRestoreUserId(null);
        setRestoreReason('');
        fetchUsers();
      }
    } catch (err: unknown) {
      toastError("Restoration Failed", getApiErrorMessage(err, 'The account could not be restored.'));
    } finally { setRestoreBusy(false); }
  };

  const handleRestorePosting = async (userId: string) => {
    try {
      await apiRestorePostingPrivilege(userId);
      toastSuccess("Posting Restored", "The user may submit service listings again.");
      fetchUsers();
    } catch (err: unknown) {
      toastError("Restoration Failed", getApiErrorMessage(err, 'Posting access could not be restored.'));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className={`form-control-group flex items-center rounded-xl px-3 py-2 w-full md:max-w-xs border transition-all ${
          isDark ? 'bg-charcoal-inset border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className={`w-4 h-4 mr-2 ${isDark ? 'text-ink-muted' : 'text-ink-subtle'}`} />
          <input
            data-form-unstyled
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-ink dark:text-white placeholder-ink-subtle"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
          
          <div className="flex items-center space-x-1.5 text-xs font-bold text-ink-subtle">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Role filter */}
          <FormSelect
            compact
            aria-label="Filter users by role"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isDark ? 'bg-charcoal-inset border-neutral-800 text-ink-muted' : 'bg-white border-slate-200 text-ink-muted'
            }`}
          >
            <option value="">All Roles</option>
            <option value="user">User (Seeker/Provider)</option>
            <option value="admin">Administrator</option>
          </FormSelect>

          {/* Status filter */}
          <FormSelect
            compact
            aria-label="Filter users by status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isDark ? 'bg-charcoal-inset border-neutral-800 text-ink-muted' : 'bg-white border-slate-200 text-ink-muted'
            }`}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </FormSelect>

          {/* Limit selector */}
          <FormSelect
            compact
            aria-label="Users per page"
            value={limit}
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isDark ? 'bg-charcoal-inset border-neutral-800 text-ink-muted' : 'bg-white border-slate-200 text-ink-muted'
            }`}
          >
            <option value={4}>4 per page</option>
            <option value={6}>6 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </FormSelect>

          <button
            onClick={() => { invalidateApiCache(['admin']); fetchUsers(); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-ink-secondary hover:bg-slate-50 dark:border-neutral-700 dark:bg-charcoal dark:text-ink"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Main Grid/Loading layout */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className={`rounded-[24px] p-6 border shadow-sm flex flex-col space-y-4 animate-pulse ${
                isDark ? 'bg-charcoal-surface border-neutral-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2 w-1/2">
                  <div className="h-4 bg-slate-200 dark:bg-charcoal rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-charcoal rounded w-5/6" />
                </div>
                <div className="h-6 bg-slate-200 dark:bg-charcoal rounded w-16" />
              </div>
              <div className="h-10 bg-slate-200 dark:bg-charcoal rounded" />
              <div className="h-8 bg-slate-200 dark:bg-charcoal rounded w-1/3 self-end" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
          isDark ? 'bg-charcoal-surface border-neutral-800/80 text-ink-muted' : 'bg-white border-slate-300 text-ink-muted'
        }`}>
          No users match the search filters.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((u) => (
              <div
                key={u.id}
                className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-colors ${
                  isDark ? 'bg-charcoal-surface border-neutral-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-ink'}`}>
                      {u.name}
                    </h4>
                    <p className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                      📧 {u.email} • 📞 {u.phone || 'No phone'}
                    </p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border ${
                    u.role === 'admin' 
                      ? 'bg-red-500/10 text-red-400 border-red-900/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-900/30'
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className={`rounded-xl p-3 border text-[10px] flex items-center justify-between ${
                  isDark ? 'bg-charcoal/40 border-neutral-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <span className={`w-2.5 h-2.5 rounded-full ${u.moderationStatus === 'ACTIVE' && u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>Status: {u.moderationStatus === 'BANNED' ? 'Banned' : u.moderationStatus === 'SUSPENDED' ? 'Suspended' : u.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold">
                    <span>Trust Score:</span>
                    <span className={u.trustScore >= 80 ? 'text-emerald-500' : u.trustScore >= 40 ? 'text-amber-500' : 'text-red-500'}>
                      {u.trustScore}
                    </span>
                  </div>
                </div>

                {u.postingSuspended && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[10px] font-semibold text-amber-800">
                    <span>Service-listing privilege suspended: {u.postingSuspendReason || 'Pending administrator review'}</span>
                    <button onClick={() => handleRestorePosting(u.id)} className="shrink-0 rounded-lg bg-amber-700 px-2.5 py-1.5 font-bold text-white">Restore posting</button>
                  </div>
                )}
                {u.moderationStatus === 'BANNED' && <Link href={`/admin/reports?userId=${encodeURIComponent(u.id)}`} className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 underline dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">Review bookings, payments, and reports for this banned account</Link>}

                {/* Moderation Actions */}
                <div className={`border-t pt-4 flex flex-wrap items-center justify-end gap-2 ${
                  isDark ? 'border-neutral-800' : 'border-slate-100'
                }`}>
                  <Link href={`/admin/users/${encodeURIComponent(u.id)}?returnTo=${encodeURIComponent(`/admin/users?${new URLSearchParams({ search: debouncedSearch, role: roleFilter, status: statusFilter, page: String(page), limit: String(limit) })}`)}`} className="mr-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-3 text-xs font-semibold text-[var(--admin-accent)] hover:bg-[var(--admin-active)]">
                    <UserRound className="size-4" aria-hidden="true" />View profile
                  </Link>
                  {u.role === 'admin' || u.id === currentUser?.id ? (
                    <span className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-3 py-1.5 text-[10px] font-bold uppercase text-[var(--admin-accent)]">
                      Protected administrator
                    </span>
                  ) : u.moderationStatus === 'ACTIVE' && u.isActive ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingTrustUser(u);
                          setTrustDelta(0);
                          setTrustReason('');
                        }}
                        className="flex items-center space-x-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--admin-accent)] transition-colors hover:bg-[var(--admin-active)]"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Set Trust</span>
                      </button>
                      <button
                        onClick={() => setSuspendingUser(u)}
                        className="px-2.5 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Suspend</span>
                      </button>
                      <button
                        onClick={() => setBanningUser(u)}
                        className="px-2.5 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Ban</span>
                      </button>
                    </>
                  ) : (
                    <>
                    {u.moderationStatus === 'SUSPENDED' && <button type="button" onClick={() => setBanningUser(u)} className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[10px] font-bold uppercase text-red-500 hover:bg-red-500/10"><Ban className="h-3.5 w-3.5" />Ban User</button>}
                    <button
                      onClick={() => setConfirmRestoreUserId(u.id)}
                      className="px-3 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{u.moderationStatus === 'BANNED' ? 'Unban User' : 'Restore Account'}</span>
                    </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={limit}
            onPageChange={setPage}
            itemLabel="users"
          />
        </div>
      )}

      <AdminUserModals
        model={{
          isDark,
          editingTrustUser,
          closeTrustModal,
          trustDelta,
          setTrustDelta,
          trustReason,
          setTrustReason,
          trustPassword,
          setTrustPassword,
          handleUpdateTrust,
          suspendingUser,
          setSuspendingUser,
          suspendReason,
          setSuspendReason,
          suspendDuration,
          setSuspendDuration,
          handleSuspend,
          banningUser,
          setBanningUser,
          banReason,
          setBanReason,
          banBusy,
          handleBan,
          confirmRestoreUserId,
          setConfirmRestoreUserId,
          restoreIsBan: users.find((item) => item.id === confirmRestoreUserId)?.moderationStatus === 'BANNED',
          restoreReason,
          setRestoreReason,
          restoreBusy,
          handleRestore
        }}
      />

    </div>
  );
}
