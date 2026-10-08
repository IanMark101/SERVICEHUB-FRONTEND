"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { invalidateApiCache } from '../../../lib/api/responseCache';
import { useApp } from '../../../context/AppContext';
import { apiListCategorySuggestions, apiResolveCategorySuggestion } from '../../../api/admin.api';
import { CheckCircle2, XCircle, Tag, User, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../../../components/admin/AdminPagination';
import AdminCategoryCatalog from '../../../components/admin/AdminCategoryCatalog';
import WorkspacePageSkeleton from '../../../components/ui/WorkspacePageSkeleton';

const PAGE_SIZE = 10;

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

  const fetchSuggestions = useCallback(() => {
    setLoading(true);
    apiListCategorySuggestions({ page, limit: PAGE_SIZE })
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
  }, [page]);
  useApiCacheRefresh(['admin', 'categories'], () => fetchSuggestions());

  useEffect(() => {
    const timer = window.setTimeout(fetchSuggestions, 0);
    return () => window.clearTimeout(timer);
  }, [fetchSuggestions]);

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
    } catch (err: unknown) {
      toastError("Failed to resolve", getApiErrorMessage(err, 'The category decision could not be saved.'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminCategoryCatalog isDark={isDark} />

      <div className="border-t border-slate-200 pt-6 dark:border-neutral-800" />

      <div className="flex items-center justify-between">
        <h4 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-ink'}`}>
          Suggested Categories Queue
        </h4>
        <button
          onClick={() => { invalidateApiCache(['admin', 'categories']); fetchSuggestions(); }}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-ink-secondary hover:bg-slate-50 dark:border-neutral-700 dark:bg-charcoal dark:text-ink"
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
          <WorkspacePageSkeleton label="Loading category suggestions" role="admin" variant="suggestions" />
        ) : suggestions.length === 0 ? (
          <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-ink-muted' : 'bg-white border-slate-300 text-ink-muted'
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
                  isDark ? 'bg-charcoal-surface border-neutral-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Info */}
                <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 text-ink-muted border border-slate-200 dark:bg-charcoal dark:text-ink-secondary dark:border-neutral-700">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-ink'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
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
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>
                      Proposed Description
                    </span>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white' : 'text-ink-secondary'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Submitter details */}
                  <div className={`rounded-xl p-2.5 border flex items-center space-x-2 text-[10px] ${
                    isDark ? 'bg-charcoal/40 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-ink-secondary'
                  }`}>
                    <User className="w-3.5 h-3.5 text-ink-muted" />
                    <span className="font-semibold text-ink-subtle">Suggested By:</span>
                    <span className="font-bold">{item.submitter?.name}</span>
                    <span className="text-ink-subtle font-medium">({item.submitter?.id})</span>
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
                    className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-extrabold text-white transition-colors hover:bg-emerald-700"
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

      <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="suggestions" />

      {/* Confirmation Dialog Overlay */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`viewport-dialog-scroll rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
          }`}>
            <div className="p-5 space-y-4">
              <h4 className={`font-extrabold text-sm flex items-center gap-1.5 ${pendingAction.approve ? 'text-emerald-500' : 'text-red-500'}`}>
                {pendingAction.approve ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{pendingAction.approve ? "Approve Category Suggestion" : "Reject Category Suggestion"}</span>
              </h4>
              <p className="text-xs leading-relaxed">
                Are you sure you want to {pendingAction.approve ? 'approve and publish' : 'reject'} the suggested category &ldquo;{pendingAction.name}&rdquo;?
              </p>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                required={!pendingAction.approve}
                minLength={pendingAction.approve ? undefined : 3}
                rows={3}
                placeholder={pendingAction.approve ? 'Optional review notes...' : 'Explain why this category is not appropriate...'}
                className={`w-full rounded-xl border p-3 text-xs outline-none ${isDark ? 'bg-charcoal-inset border-neutral-700' : 'bg-slate-50 border-slate-300'}`}
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => { setPendingAction(null); setAdminNotes(''); }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-charcoal-hover' : 'border-slate-200 hover:bg-slate-100'}`}
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
