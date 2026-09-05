"use client";

import { Ban } from 'lucide-react';

export default function AdminUserModals({ model }: { model: any }) {
  const {
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
  } = model;

  return (
    <>
      {/* Set Trust Score Overlay */}
      {editingTrustUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleUpdateTrust} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm">Adjust Trust Score</h4>
              <p className="text-[10px] text-slate-400">
                Apply a trust point adjustment for <strong>{editingTrustUser.name}</strong>. Current score: <strong className="text-red-500">{editingTrustUser.trustScore}</strong>/100.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Adjustment Delta (e.g. -10, +5)</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    required
                    value={trustDelta}
                    onChange={(e) => setTrustDelta(parseInt(e.target.value) || 0)}
                    className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                      isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
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
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Reason (required)</label>
                  <textarea
                    required
                    placeholder="Admin reason for this trust adjustment..."
                    value={trustReason}
                    onChange={(e) => setTrustReason(e.target.value)}
                    rows={3}
                    className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                      isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
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
                  disabled={!trustReason.trim() || trustDelta === 0}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer"
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

      {promotingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form onSubmit={handlePromote} className={`rounded-[24px] max-w-sm w-full p-5 space-y-4 border shadow-2xl ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div>
              <h4 className="font-extrabold text-sm">Promote to Administrator</h4>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">Grant {promotingUser.name} permanent access to protected moderation tools. This action is audited.</p>
            </div>
            <textarea required minLength={3} maxLength={500} rows={3} value={promotionReason} onChange={(event) => setPromotionReason(event.target.value)} placeholder="Explain why this account requires administrator access..." className={`w-full rounded-xl p-3 border text-xs outline-none ${isDark ? 'bg-[#1c1b18] border-neutral-700' : 'bg-slate-50 border-slate-300'}`} />
            <input required minLength={8} maxLength={200} type="password" autoComplete="current-password" value={promotionPassword} onChange={(event) => setPromotionPassword(event.target.value)} placeholder="Confirm your current administrator password" className={`w-full rounded-xl p-3 border text-xs outline-none ${isDark ? 'bg-[#1c1b18] border-neutral-700' : 'bg-slate-50 border-slate-300'}`} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setPromotingUser(null); setPromotionPassword(''); }} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancel</button>
              <button disabled={promotionReason.trim().length < 3 || promotionPassword.length < 8} className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white disabled:opacity-50">Confirm promotion</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
