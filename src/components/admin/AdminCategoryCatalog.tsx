"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import { invalidateApiCache } from '../../lib/api/responseCache';
import { CheckCircle2, Loader2, Pencil, Power, RefreshCw, Tag } from "lucide-react";
import { apiCreateAdminCategory, apiListAdminCategories, apiUpdateAdminCategory } from "../../api/admin.api";
import { getApiErrorMessage } from "../../lib/api/errors";
import { useToast } from "../ui/Toast";
import AdminPagination from "./AdminPagination";
import WorkspacePageSkeleton from "../ui/WorkspacePageSkeleton";

const PAGE_SIZE = 10;

interface ManagedCategory {
  id: string;
  name: string;
  isActive: boolean;
  listingCount: number;
  liveListingCount: number;
  requestCount: number;
  openRequestCount: number;
}

interface EditState {
  category: ManagedCategory;
  name: string;
  isActive: boolean;
  reason: string;
}

export default function AdminCategoryCatalog({ isDark }: { isDark: boolean }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [create, setCreate] = useState<{ name: string; reason: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiListAdminCategories({ page, limit: PAGE_SIZE });
      setCategories(response.data ?? []);
      setTotal(response.pagination?.total ?? 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages ?? 1));
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "The category catalog could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [page]);
  useApiCacheRefresh(['admin', 'categories'], () => fetchCategories(), !saving);

  useEffect(() => {
    const timer = window.setTimeout(fetchCategories, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCategories]);

  const saveCategory = async () => {
    if (!edit || edit.reason.trim().length < 3 || edit.name.trim().length < 3) return;
    setSaving(true);
    try {
      await apiUpdateAdminCategory(edit.category.id, {
        name: edit.name.trim(),
        isActive: edit.isActive,
        reason: edit.reason.trim(),
      });
      toastSuccess("Category updated", "The marketplace category and its audit record were updated.");
      setEdit(null);
      await fetchCategories();
    } catch (requestError) {
      toastError("Category not updated", getApiErrorMessage(requestError, "The category change could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const createCategory = async () => {
    if (!create || create.name.trim().length < 3 || create.reason.trim().length < 3 || saving) return;
    setSaving(true);
    try {
      await apiCreateAdminCategory({ name: create.name.trim(), reason: create.reason.trim() });
      toastSuccess('Category created', 'The category is now available to Seekers and Providers.');
      setCreate(null);
      await fetchCategories();
    } catch (requestError) { toastError('Category not created', getApiErrorMessage(requestError, 'The category could not be created.')); }
    finally { setSaving(false); }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h4 className={`text-sm font-extrabold ${isDark ? "text-white" : "text-ink"}`}>Marketplace Category Catalog</h4>
          <p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted">
            Rename categories or retire unused ones. Existing marketplace and historical records are preserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setCreate({ name: '', reason: '' })} className="rounded-lg bg-[var(--admin-solid)] px-3 py-2 text-[11px] font-bold text-white hover:bg-[var(--admin-solid-hover)]">Create category</button><button type="button" onClick={() => { invalidateApiCache(['admin', 'categories']); void fetchCategories(); }} className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-ink-secondary hover:bg-slate-50 dark:border-neutral-700 dark:bg-charcoal dark:text-ink"><RefreshCw className="h-3.5 w-3.5" /> Refresh Catalog</button></div>
      </div>

      {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs font-medium text-red-600">{error}</div>}

      <div className={`overflow-hidden rounded-2xl border shadow-sm ${isDark ? "border-neutral-800 bg-charcoal-surface" : "border-slate-200 bg-white"}`}>
        {loading ? (
          <WorkspacePageSkeleton label="Loading category catalog" role="admin" variant="table" />
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-sm text-ink-muted">No marketplace categories found.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-neutral-800">
            {categories.map((category) => {
              const preventsDeactivation = category.listingCount > 0 || category.openRequestCount > 0;
              return (
                <div key={category.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-2 text-[var(--admin-accent)]"><Tag className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className={`truncate text-sm font-bold ${isDark ? "text-neutral-100" : "text-ink"}`}>{category.name}</h5>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${category.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" : "border-slate-200 bg-slate-100 text-ink-muted dark:border-neutral-700 dark:bg-charcoal dark:text-ink-muted"}`}>
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-ink-muted dark:text-ink-muted">
                        {category.liveListingCount} live / {category.listingCount} retained listings · {category.openRequestCount} open / {category.requestCount} total requests
                      </p>
                      {category.isActive && preventsDeactivation && (
                        <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400">Status cannot be disabled while listings or open requests depend on it.</p>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => setEdit({ category, name: category.name, isActive: category.isActive, reason: "" })} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-ink-secondary hover:bg-slate-50 dark:border-neutral-700 dark:text-ink dark:hover:bg-charcoal">
                    <Pencil className="h-3.5 w-3.5" /> Manage
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="categories" />

      {create && <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4"><form onSubmit={(event) => { event.preventDefault(); void createCategory(); }} className={`viewport-dialog-scroll w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? 'border-neutral-700 bg-charcoal-surface text-white' : 'border-slate-200 bg-white text-ink'}`}><h4 className="text-sm font-bold">Create official category</h4><p className="mt-1 text-xs opacity-70">The new category will be available to Seekers and Providers immediately.</p><label htmlFor="new-category-name" className="mt-4 block text-xs font-semibold">Category name</label><input id="new-category-name" required minLength={3} maxLength={80} value={create.name} onChange={(event) => setCreate({ ...create, name: event.target.value })} className={`mt-1 w-full rounded-xl border p-3 text-sm ${isDark ? 'border-neutral-700 bg-charcoal' : 'border-slate-300 bg-white'}`} /><label htmlFor="new-category-reason" className="mt-3 block text-xs font-semibold">Reason for addition</label><textarea id="new-category-reason" required minLength={3} maxLength={500} rows={3} value={create.reason} onChange={(event) => setCreate({ ...create, reason: event.target.value })} className={`mt-1 w-full rounded-xl border p-3 text-sm ${isDark ? 'border-neutral-700 bg-charcoal' : 'border-slate-300 bg-white'}`} /><div className="mt-4 flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setCreate(null)} className="rounded-lg border px-3 py-2 text-xs">Cancel</button><button type="submit" disabled={saving || create.name.trim().length < 3 || create.reason.trim().length < 3} className="rounded-lg bg-[var(--admin-solid)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Creating…' : 'Create category'}</button></div></form></div>}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm">
          <div className={`viewport-dialog-scroll w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? "border-neutral-700 bg-charcoal-surface text-neutral-100" : "border-slate-200 bg-white text-ink"}`}>
            <h4 className="flex items-center gap-2 text-sm font-extrabold"><Pencil className="h-4 w-4" /> Manage Category</h4>
            <div className="mt-4 space-y-4">
              <label className="block text-[11px] font-bold">Category name
                <input value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value })} maxLength={80} className={`mt-1.5 w-full rounded-xl border p-3 text-xs outline-none focus:border-[var(--admin-accent)] ${isDark ? "border-neutral-700 bg-charcoal" : "border-slate-300 bg-slate-50"}`} />
              </label>
              <div className={`rounded-xl border p-3 ${isDark ? "border-neutral-700" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div><p className="text-[11px] font-bold">Available for new activity</p><p className="mt-0.5 text-[10px] text-ink-muted">Inactive categories remain attached to historical records.</p></div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={edit.isActive}
                    disabled={edit.category.isActive && (edit.category.listingCount > 0 || edit.category.openRequestCount > 0)}
                    onClick={() => setEdit({ ...edit, isActive: !edit.isActive })}
                    className={`rounded-full p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${edit.isActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-ink-muted dark:bg-charcoal dark:text-ink-secondary"}`}
                    aria-label={edit.isActive ? "Deactivate category" : "Activate category"}
                  ><Power className="h-4 w-4" /></button>
                </div>
              </div>
              <label className="block text-[11px] font-bold">Reason for change
                <textarea value={edit.reason} onChange={(event) => setEdit({ ...edit, reason: event.target.value })} rows={3} maxLength={500} placeholder="Required for the administrator audit log" className={`mt-1.5 w-full rounded-xl border p-3 text-xs outline-none focus:border-[var(--admin-accent)] ${isDark ? "border-neutral-700 bg-charcoal" : "border-slate-300 bg-slate-50"}`} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEdit(null)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold dark:border-neutral-700">Cancel</button>
              <button type="button" onClick={saveCategory} disabled={saving || edit.name.trim().length < 3 || edit.reason.trim().length < 3} className="flex items-center gap-1.5 rounded-lg bg-[var(--admin-solid)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--admin-solid-hover)] disabled:opacity-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
