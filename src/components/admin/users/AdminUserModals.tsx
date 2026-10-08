"use client";

import { Ban } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { AdminUserItem as UserItem } from './types';

interface AdminUserModalsModel {
  isDark: boolean;
  editingTrustUser: UserItem | null;
  closeTrustModal: () => void;
  trustDelta: number;
  setTrustDelta: Dispatch<SetStateAction<number>>;
  trustReason: string;
  setTrustReason: Dispatch<SetStateAction<string>>;
  trustPassword: string;
  setTrustPassword: Dispatch<SetStateAction<string>>;
  handleUpdateTrust: (event: FormEvent) => void;
  suspendingUser: UserItem | null;
  setSuspendingUser: Dispatch<SetStateAction<UserItem | null>>;
  suspendReason: string;
  setSuspendReason: Dispatch<SetStateAction<string>>;
  suspendDuration: number;
  setSuspendDuration: Dispatch<SetStateAction<number>>;
  handleSuspend: (event: FormEvent) => void;
  banningUser: UserItem | null;
  setBanningUser: Dispatch<SetStateAction<UserItem | null>>;
  banReason: string;
  setBanReason: Dispatch<SetStateAction<string>>;
  banBusy: boolean;
  handleBan: (event: FormEvent) => void;
  confirmRestoreUserId: string | null;
  setConfirmRestoreUserId: Dispatch<SetStateAction<string | null>>;
  restoreIsBan: boolean;
  restoreReason: string;
  setRestoreReason: Dispatch<SetStateAction<string>>;
  restoreBusy: boolean;
  handleRestore: (userId: string) => void;
}

export default function AdminUserModals({ model }: { model: AdminUserModalsModel }) {
  const {
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
    restoreIsBan,
    restoreReason,
    setRestoreReason,
    restoreBusy,
    handleRestore
  } = model;

  return (
    <>
      {/* Set Trust Score Overlay */}
      {editingTrustUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`viewport-dialog-scroll rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <form onSubmit={handleUpdateTrust} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm">Adjust Trust Score</h4>
              <p className="text-[10px] text-ink-subtle">
                Apply a trust point adjustment for <strong>{editingTrustUser.name}</strong>. Current score: <strong className="text-[var(--admin-accent)]">{editingTrustUser.trustScore}</strong>/100.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-ink-subtle uppercase block mb-1">Adjustment Delta (e.g. -10, +5)</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    required
                    value={trustDelta}
                    onChange={(e) => setTrustDelta(parseInt(e.target.value) || 0)}
                    className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                      isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  {trustDelta !== 0 && (
                    <p className="text-[10px] mt-1 font-semibold">
                      New score: <strong className={trustDelta > 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {Math.min(100, Math.max(0, editingTrustUser.trustScore + trustDelta))}
                      </strong>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[9px] font-bold text-ink-subtle uppercase block mb-1">Reason (required)</label>
                  <textarea
                    required
                    placeholder="Admin reason for this trust adjustment..."
                    value={trustReason}
                    onChange={(e) => setTrustReason(e.target.value)}
                    rows={3}
                    className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                      isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="trust-current-password" className="text-[9px] font-bold text-ink-subtle uppercase block mb-1">Current administrator password</label>
                  <input
                    id="trust-current-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={trustPassword}
                    onChange={(event) => setTrustPassword(event.target.value)}
                    className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                      isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeTrustModal}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!trustReason.trim() || trustDelta === 0 || !trustPassword}
                  className="px-4 py-2 bg-[var(--admin-solid)] hover:bg-[var(--admin-solid-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Overlay */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`viewport-dialog-scroll rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <form onSubmit={handleSuspend} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm">Suspend User Account</h4>
              <p className="text-[10px] text-ink-subtle">Suspend user {suspendingUser.name} temporarily.</p>
              <div className="space-y-3">
                <textarea
                  required
                  placeholder="Reason for suspension..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-slate-50 border-slate-300'
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
                    isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover' : 'border-slate-200 hover:bg-slate-100'}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`viewport-dialog-scroll rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <form onSubmit={handleBan} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-red-500">
                <Ban className="w-4 h-4" />
                <span>Ban User Account</span>
              </h4>
              <p className="text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">Ban {banningUser.name} now. Their workspace and live session will close; they can only see the ban notice, appeal, or log out. Existing bookings and payments remain for Admin resolution.</p>
              <div>
                <textarea
                  required
                  placeholder="Reason for ban (Admin record)..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-charcoal-inset border-neutral-800/80 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBanningUser(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={banBusy || banReason.trim().length < 3}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {banBusy ? 'Banning…' : 'Confirm Ban'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable custom confirmation overlay to remove browser confirms */}
      {confirmRestoreUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`viewport-dialog-scroll rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <form onSubmit={(event) => { event.preventDefault(); handleRestore(confirmRestoreUserId); }} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm text-emerald-600">{restoreIsBan ? 'Unban User' : 'Restore account access'}</h4>
              <p className="text-xs leading-relaxed">The account will return to ACTIVE. Email and residency verification rules still apply. Existing bookings and payments remain unchanged.</p>
              <label htmlFor="restore-reason" className="block text-xs font-semibold">Reason for restoring access</label>
              <textarea id="restore-reason" required minLength={3} maxLength={500} rows={3} value={restoreReason} onChange={(event) => setRestoreReason(event.target.value)} className={`w-full rounded-xl border p-3 text-xs ${isDark ? 'border-neutral-700 bg-charcoal-inset text-white' : 'border-slate-300 bg-white text-ink'}`} />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setConfirmRestoreUserId(null); setRestoreReason(''); }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restoreBusy || restoreReason.trim().length < 3}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {restoreBusy ? 'Restoring…' : 'Confirm restore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
