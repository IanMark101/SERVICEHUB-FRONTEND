"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListUsers, apiUpdateTrustScore, apiSuspendUser, apiBanUser, apiRestoreUser } from '../../../api/admin.api';
import { Loader2, Search, Award, ShieldAlert, Ban, RotateCcw, AlertCircle } from 'lucide-react';

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
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [editingTrustUser, setEditingTrustUser] = useState<UserItem | null>(null);
  const [newTrustScore, setNewTrustScore] = useState<number>(50);

  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');
  const [suspendDuration, setSuspendDuration] = useState<number>(7);

  const [banningUser, setBanningUser] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState<string>('');

  const fetchUsers = () => {
    setLoading(true);
    apiListUsers()
      .then(res => {
        if (res.success) {
          setUsers(res.data);
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
  }, []);

  const handleUpdateTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrustUser) return;
    try {
      const res = await apiUpdateTrustScore(editingTrustUser.id, newTrustScore);
      if (res.success) {
        alert("Trust score updated successfully!");
        setEditingTrustUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      alert("Failed to update trust score: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser || !suspendReason.trim()) return;
    try {
      const res = await apiSuspendUser(suspendingUser.id, suspendReason, suspendDuration);
      if (res.success) {
        alert("User suspended successfully!");
        setSuspendingUser(null);
        setSuspendReason('');
        fetchUsers();
      }
    } catch (err: any) {
      alert("Failed to suspend user: " + (err.response?.data?.error || err.message));
    }
  };

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banningUser || !banReason.trim()) return;
    try {
      const res = await apiBanUser(banningUser.id, banReason);
      if (res.success) {
        alert("User banned successfully!");
        setBanningUser(null);
        setBanReason('');
        fetchUsers();
      }
    } catch (err: any) {
      alert("Failed to ban user: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRestore = async (userId: string) => {
    if (window.confirm("Are you sure you want to restore this user's active status?")) {
      try {
        const res = await apiRestoreUser(userId);
        if (res.success) {
          alert("User restored successfully!");
          fetchUsers();
        }
      } catch (err: any) {
        alert("Failed to restore user: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className={`flex items-center rounded-xl px-3 py-2 w-full sm:max-w-md border transition-all ${
          isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-slate-50 border-slate-300'
        }`}>
          <Search className={`w-4 h-4 mr-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-[#f2efe9] placeholder-slate-400"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="w-full sm:w-auto px-4 py-2 border rounded-xl font-bold text-xs bg-blue-500/5 text-blue-500 border-blue-500/25 cursor-pointer hover:bg-blue-500/10"
        >
          Refresh List
        </button>
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUsers.length === 0 ? (
          <div className={`col-span-2 rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
          }`}>
            No users found matching search.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-colors ${
                isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                    {u.name}
                  </h4>
                  <p className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                    📧 {u.email} • 📞 {u.phone || 'No phone'}
                  </p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border ${
                  u.role === 'admin' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-900/30'
                    : u.role === 'provider'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-900/30'
                      : 'bg-orange-500/10 text-orange-400 border-orange-900/30'
                }`}>
                  {u.role}
                </span>
              </div>

              {/* Status Section */}
              <div className={`rounded-xl p-3 border text-[10px] flex items-center justify-between ${
                isDark ? 'bg-neutral-800/40 border-neutral-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center space-x-1.5 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
                      className="px-2.5 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-blue-500/20 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer"
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
                    onClick={() => handleRestore(u.id)}
                    className="px-3 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer animate-pulse"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Account</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
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
              <p className="text-[10px] text-slate-400">Ban user {banningUser.name} permanently. This deletes all access.</p>
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
                  className="px-4 py-2 bg-red-655 hover:bg-red-750 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Ban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
