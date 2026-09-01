"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListCategorySuggestions, apiResolveCategorySuggestion } from '../../../api/admin.api';
import { Loader2, CheckCircle2, XCircle, Tag, User, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface SubmitterInfo {
  id: string;
  name: string;
}

interface SuggestionItem {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  submitter: SubmitterInfo;
}

export default function AdminCategories() {
  const { isDark } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Reusable custom overlay confirm state
  const [pendingAction, setPendingAction] = useState<{ id: string; approve: boolean; name: string } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchSuggestions = () => {
    setLoading(true);
    apiListCategorySuggestions({ page, limit: 10 })
      .then(res => {
        if (res.success) {
          setSuggestions(res.data);
          setTotal(res.pagination?.total || 0);
          setTotalPages(Math.max(1, res.pagination?.totalPages || 1));
          setError('');
        } else {
          setError("Failed to fetch suggested categories.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSuggestions();
  }, [page]);

  const handleResolveAction = async (id: string, approve: boolean) => {
    try {
      const res = await apiResolveCategorySuggestion(id, approve, adminNotes.trim() || undefined);
      if (res.success) {
        toastSuccess(
          "Category Resolved", 
          `Suggestion has been successfully ${approve ? 'APPROVED & PUBLISHED' : 'REJECTED'}.`
        );
        fetchSuggestions();
        setPendingAction(null);
        setAdminNotes('');
      }
    } catch (err: any) {
      toastError("Failed to resolve", err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
          Suggested Categories Queue
        </h4>
        <button
          onClick={fetchSuggestions}
          className="px-4 py-2 border rounded-xl font-bold text-xs bg-red-500/5 text-red-500 border-red-500/25 cursor-pointer hover:bg-red-500/10 transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Suggestions</span>
        </button>
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Suggested Categories queue items */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
          }`}>
            No pending category suggestions found.
          </div>
        ) : (
          suggestions.map((item) => {
            const formattedDate = new Date(item.submittedAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            return (
              <div
                key={item.id}
                className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isDark ? 'bg-[#22211e] border-neutral-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Info */}
                <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                        Suggested Category
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    📅 Suggested: {formattedDate}
                  </span>
                </div>

                {/* Description details */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Proposed Description
                    </span>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Submitter details */}
                  <div className={`rounded-xl p-2.5 border flex items-center space-x-2 text-[10px] ${
                    isDark ? 'bg-neutral-800/40 border-neutral-800 text-[#f2efe9]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <User className="w-3.5 h-3.5 text-red-500" />
                    <span className="font-semibold text-slate-400">Suggested By:</span>
                    <span className="font-bold">{item.submitter?.name}</span>
                    <span className="text-slate-400 font-medium">({item.submitter?.id})</span>
                  </div>
                </div>

                {/* Actions panel */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2.5 ${
                  isDark ? 'border-neutral-800' : 'border-slate-100'
                }`}>
                  <button
                    onClick={() => setPendingAction({ id: item.id, approve: false, name: item.name })}
                    className="px-3.5 py-2 border rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Suggestion</span>
                  </button>
                  <button
                    onClick={() => setPendingAction({ id: item.id, approve: true, name: item.name })}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Publish Category</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>{total} pending suggestion{total === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-3">
            <button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border px-3 py-2 font-bold disabled:opacity-40">Previous</button>
            <span className="font-bold">Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)} className="rounded-lg border px-3 py-2 font-bold disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-5 space-y-4">
              <h4 className={`font-extrabold text-sm flex items-center gap-1.5 ${pendingAction.approve ? 'text-emerald-500' : 'text-red-500'}`}>
                {pendingAction.approve ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{pendingAction.approve ? "Approve Category Suggestion" : "Reject Category Suggestion"}</span>
              </h4>
              <p className="text-xs leading-relaxed">
                Are you sure you want to {pendingAction.approve ? 'approve and publish' : 'reject'} the suggested category "{pendingAction.name}"?
              </p>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                required={!pendingAction.approve}
                minLength={pendingAction.approve ? undefined : 3}
                rows={3}
                placeholder={pendingAction.approve ? 'Optional review notes...' : 'Explain why this category is not appropriate...'}
                className={`w-full rounded-xl border p-3 text-xs outline-none ${isDark ? 'bg-[#1c1b18] border-neutral-700' : 'bg-slate-50 border-slate-300'}`}
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => { setPendingAction(null); setAdminNotes(''); }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  disabled={!pendingAction.approve && adminNotes.trim().length < 3}
                  onClick={() => handleResolveAction(pendingAction.id, pendingAction.approve)}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold cursor-pointer ${pendingAction.approve ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
