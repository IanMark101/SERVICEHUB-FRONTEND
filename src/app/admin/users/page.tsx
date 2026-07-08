"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListUsers, apiUpdateTrustScore, apiSuspendUser, apiBanUser, apiRestoreUser } from '../../../api/admin.api';
import { Loader2, Search, Award, ShieldAlert, Ban, RotateCcw, AlertCircle, Filter } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import PaginationBar from '../../../components/PaginationBar';

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
  createdAt: string;
}

export default function AdminUsers() {
  const { isDark } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Search and filter states
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(6);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Overlay states
  const [editingTrustUser, setEditingTrustUser] = useState<UserItem | null>(null);
  const [newTrustScore, setNewTrustScore] = useState<number>(50);

  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [suspendDuration, setSuspendDuration] = useState<number>(7);

  const [banningUser, setBanningUser] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState<string>('');

  const [confirmRestoreUserId, setConfirmRestoreUserId] = useState<string | null>(null);

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
    if (!editingTrustUser) return;
    try {
      const res = await apiUpdateTrustScore(editingTrustUser.id, newTrustScore);
      if (res.success) {
        toastSuccess("Trust Updated", "User trust score manually set to " + newTrustScore);
        setEditingTrustUser(null);
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

  // Pagination bounds
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      
      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className={`flex items-center rounded-xl px-3 py-2 w-full md:max-w-xs border transition-all ${
          isDark ? 'bg-[#1c1b18] border-neutral-850' : 'bg-slate-50 border-slate-200'
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
          
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-450">
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
            <option value="suspended">Suspended / Banned</option>
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
                  isDark ? 'bg-[#22211e] border-neutral-855' : 'bg-white border-slate-200 hover:shadow-md'
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
                    <span>Status: {u.isActive ? "Active" : "Suspended / Banned"}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold">
                    <span>Trust Score:</span>
                    <span className={u.trustScore >= 80 ? 'text-emerald-500' : u.trustScore >= 40 ? 'text-amber-500' : 'text-red-500'}>
                      {u.trustScore}
                    </span>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2 ${
                  isDark ? 'border-neutral-850' : 'border-slate-100'
                }`}>
                  {u.isActive ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingTrustUser(u);
                          setNewTrustScore(u.trustScore);
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

      {/* Set Trust Score Overlay */}
      {editingTrustUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleUpdateTrust} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm">Update Trust Score</h4>
              <p className="text-[10px] text-slate-400">Set direct trust score value for user {editingTrustUser.name}.</p>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newTrustScore}
                  onChange={(e) => setNewTrustScore(parseInt(e.target.value))}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTrustUser(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Overlay */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleSuspend} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm">Suspend User Account</h4>
              <p className="text-[10px] text-slate-400">Suspend user {suspendingUser.name} temporarily.</p>
              <div className="space-y-3">
                <textarea
                  required
                  placeholder="Reason for suspension..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={suspendDuration}
                  onChange={(e) => setSuspendDuration(parseInt(e.target.value))}
                  placeholder="Duration (days)"
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Suspend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ban Overlay */}
      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleBan} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-red-500">
                <Ban className="w-4 h-4" />
                <span>Ban User Account</span>
              </h4>
              <p className="text-[10px] text-slate-400">Ban user {banningUser.name} permanently. This invalidates access immediately.</p>
              <div>
                <textarea
                  required
                  placeholder="Reason for permanent ban..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBanningUser(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Ban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable custom confirmation overlay to remove browser confirms */}
      {confirmRestoreUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm text-red-500">Restore Account Status</h4>
              <p className="text-xs leading-relaxed">Are you sure you want to restore this user's active status? They will be able to log in and participate in transactions again.</p>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setConfirmRestoreUserId(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleRestore(confirmRestoreUserId);
                    setConfirmRestoreUserId(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
