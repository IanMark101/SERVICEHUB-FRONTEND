"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListUsers, apiUpdateTrustScore, apiSuspendUser, apiBanUser, apiRestoreUser, apiRestorePostingPrivilege, apiPromoteUserToAdmin } from '../../../api/admin.api';
import { Loader2, Search, Award, ShieldAlert, Ban, RotateCcw, AlertCircle, Filter, UserPlus } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import PaginationBar from '../../../components/ui/PaginationBar';
import { useSearchParams } from 'next/navigation';
import AdminUserModals from '../../../components/admin/users/AdminUserModals';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  trustScore: number;
  verificationStatus: string;
  emailVerified: boolean;
  isActive: boolean;
  moderationStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  suspendedUntil?: string | null;
  moderationReason?: string | null;
  postingSuspended: boolean;
  postingSuspendReason?: string | null;
  createdAt: string;
}

export default function AdminUsers() {
  const searchParams = useSearchParams();
  const { isDark, user: currentUser } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Search and filter states
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(6);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Overlay states
  const [editingTrustUser, setEditingTrustUser] = useState<UserItem | null>(null);
  const [trustDelta, setTrustDelta] = useState<number>(0);
  const [trustReason, setTrustReason] = useState<string>('');

  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [suspendDuration, setSuspendDuration] = useState<number>(7);

  const [banningUser, setBanningUser] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState<string>('');

  const [confirmRestoreUserId, setConfirmRestoreUserId] = useState<string | null>(null);
  const [promotingUser, setPromotingUser] = useState<UserItem | null>(null);
  const [promotionReason, setPromotionReason] = useState('');
  const [promotionPassword, setPromotionPassword] = useState('');

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users when parameters change
  const fetchUsers = () => {
    setLoading(true);
    apiListUsers({
      search: debouncedSearch || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      page,
      limit
    })
      .then(res => {
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
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter, page, limit]);

  const handleUpdateTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrustUser || !trustReason.trim()) return;
    try {
      const res = await apiUpdateTrustScore(editingTrustUser.id, trustDelta, trustReason);
      if (res.success) {
        const sign = trustDelta > 0 ? '+' : '';
        toastSuccess("Trust Updated", `Applied ${sign}${trustDelta} pts to ${editingTrustUser.name}. New score updates shortly.`);
        setEditingTrustUser(null);
        setTrustDelta(0);
        setTrustReason('');
        fetchUsers();
      }
    } catch (err: any) {
      toastError("Failed to update", err.response?.data?.error || err.message);
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
    } catch (err: any) {
      toastError("Suspension Failed", err.response?.data?.error || err.message);
    }
  };

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banningUser || !banReason.trim()) return;
    try {
      const res = await apiBanUser(banningUser.id, banReason);
      if (res.success) {
        toastSuccess("User Banned", `${banningUser.name} has been permanently banned.`);
        setBanningUser(null);
        setBanReason('');
        fetchUsers();
      }
    } catch (err: any) {
      toastError("Banning Failed", err.response?.data?.error || err.message);
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      const res = await apiRestoreUser(userId);
      if (res.success) {
        toastSuccess("Account Restored", "User account active status successfully restored.");
        fetchUsers();
      }
    } catch (err: any) {
      toastError("Restoration Failed", err.response?.data?.error || err.message);
    }
  };

  const handleRestorePosting = async (userId: string) => {
    try {
      await apiRestorePostingPrivilege(userId);
      toastSuccess("Posting Restored", "The user may submit service listings again.");
      fetchUsers();
    } catch (err: any) {
      toastError("Restoration Failed", err.response?.data?.error || err.message);
    }
  };

  const handlePromote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!promotingUser || promotionReason.trim().length < 3 || promotionPassword.length < 8) return;
    try {
      await apiPromoteUserToAdmin(promotingUser.id, promotionReason.trim(), promotionPassword);
      toastSuccess("Administrator Added", `${promotingUser.name} must sign in again to use the Admin workspace.`);
      setPromotingUser(null);
      setPromotionReason('');
      setPromotionPassword('');
      fetchUsers();
    } catch (err: any) {
      toastError("Promotion Failed", err.response?.data?.error || err.message);
    }
  };

  // Pagination bounds
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      
      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className={`flex items-center rounded-xl px-3 py-2 w-full md:max-w-xs border transition-all ${
          isDark ? 'bg-[#1c1b18] border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className={`w-4 h-4 mr-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-[#f2efe9] placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
          
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <option value="">All Roles</option>
            <option value="user">User (Seeker/Provider)</option>
            <option value="admin">Administrator</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#b4b0a9]' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <option value={4}>4 per page</option>
            <option value={6}>6 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 border rounded-xl font-bold text-xs bg-red-500/5 text-red-500 border-red-500/25 cursor-pointer hover:bg-red-500/10 transition-colors"
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
                isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2 w-1/2">
                  <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-neutral-800 rounded w-5/6" />
                </div>
                <div className="h-6 bg-slate-200 dark:bg-neutral-800 rounded w-16" />
              </div>
              <div className="h-10 bg-slate-200 dark:bg-neutral-800 rounded" />
              <div className="h-8 bg-slate-200 dark:bg-neutral-800 rounded w-1/3 self-end" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
          isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
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
                  isDark ? 'bg-[#22211e] border-neutral-800' : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {u.name}
                    </h4>
                    <p className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
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
                  isDark ? 'bg-neutral-800/40 border-neutral-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <span className={`w-2.5 h-2.5 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>Status: {u.moderationStatus === 'BANNED' ? 'Banned' : u.moderationStatus === 'SUSPENDED' ? 'Suspended' : 'Active'}</span>
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

                {/* Moderation Actions */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2 ${
                  isDark ? 'border-neutral-800' : 'border-slate-100'
                }`}>
                  {u.role === 'admin' || u.id === currentUser?.id ? (
                    <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 dark:border-neutral-700">
                      Protected administrator
                    </span>
                  ) : u.isActive ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingTrustUser(u);
                          setTrustDelta(0);
                          setTrustReason('');
                        }}
                        className="px-2.5 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
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
                      <button
                        onClick={() => { setPromotingUser(u); setPromotionReason(''); }}
                        className="px-2.5 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-neutral-700 dark:text-slate-300 dark:hover:bg-neutral-800"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Make Admin</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmRestoreUserId(u.id)}
                      className="px-3 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Account</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            goToPage={(p) => setPage(p)}
            nextPage={() => setPage(prev => Math.min(prev + 1, totalPages))}
            prevPage={() => setPage(prev => Math.max(prev - 1, 1))}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={total}
            variant="admin"
          />
        </div>
      )}

      <AdminUserModals
        model={{
          isDark,
          editingTrustUser,
          setEditingTrustUser,
          trustDelta,
          setTrustDelta,
          trustReason,
          setTrustReason,
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
          handleBan,
          confirmRestoreUserId,
          setConfirmRestoreUserId,
          handleRestore,
          promotingUser,
          setPromotingUser,
          promotionReason,
          setPromotionReason,
          promotionPassword,
          setPromotionPassword,
          handlePromote
        }}
      />

    </div>
  );
}
