"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Power, RefreshCw, Tag } from "lucide-react";
import { apiListAdminCategories, apiUpdateAdminCategory } from "../../api/admin.api";
import { getApiErrorMessage } from "../../lib/api/errors";
import { useToast } from "../ui/Toast";
import AdminPagination from "./AdminPagination";

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

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h4 className={`text-sm font-extrabold ${isDark ? "text-[#f2efe9]" : "text-slate-900"}`}>Marketplace Category Catalog</h4>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-neutral-400">
            Rename categories or retire unused ones. Existing marketplace and historical records are preserved.
          </p>
        </div>
        <button type="button" onClick={fetchCategories} className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-[#202020] dark:text-neutral-200">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Catalog
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs font-medium text-red-600">{error}</div>}

      <div className={`overflow-hidden rounded-2xl border shadow-sm ${isDark ? "border-neutral-800 bg-[#22211e]" : "border-slate-200 bg-white"}`}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-600 dark:text-neutral-300" /></div>
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No marketplace categories found.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-neutral-800">
            {categories.map((category) => {
              const preventsDeactivation = category.listingCount > 0 || category.openRequestCount > 0;
              return (
                <div key={category.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"><Tag className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className={`truncate text-sm font-bold ${isDark ? "text-neutral-100" : "text-slate-900"}`}>{category.name}</h5>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${category.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" : "border-slate-200 bg-slate-100 text-slate-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-neutral-400">
                        {category.liveListingCount} live / {category.listingCount} retained listings · {category.openRequestCount} open / {category.requestCount} total requests
                      </p>
                      {category.isActive && preventsDeactivation && (
                        <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400">Status cannot be disabled while listings or open requests depend on it.</p>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => setEdit({ category, name: category.name, isActive: category.isActive, reason: "" })} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                    <Pencil className="h-3.5 w-3.5" /> Manage
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="categories" />

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? "border-neutral-700 bg-[#22211e] text-neutral-100" : "border-slate-200 bg-white text-slate-900"}`}>
            <h4 className="flex items-center gap-2 text-sm font-extrabold"><Pencil className="h-4 w-4" /> Manage Category</h4>
            <div className="mt-4 space-y-4">
              <label className="block text-[11px] font-bold">Category name
                <input value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value })} maxLength={80} className={`mt-1.5 w-full rounded-xl border p-3 text-xs outline-none focus:border-slate-500 ${isDark ? "border-neutral-700 bg-[#191919]" : "border-slate-300 bg-slate-50"}`} />
              </label>
              <div className={`rounded-xl border p-3 ${isDark ? "border-neutral-700" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div><p className="text-[11px] font-bold">Available for new activity</p><p className="mt-0.5 text-[10px] text-slate-500">Inactive categories remain attached to historical records.</p></div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={edit.isActive}
                    disabled={edit.category.isActive && (edit.category.listingCount > 0 || edit.category.openRequestCount > 0)}
                    onClick={() => setEdit({ ...edit, isActive: !edit.isActive })}
                    className={`rounded-full p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${edit.isActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-neutral-700 dark:text-neutral-300"}`}
                    aria-label={edit.isActive ? "Deactivate category" : "Activate category"}
                  ><Power className="h-4 w-4" /></button>
                </div>
              </div>
              <label className="block text-[11px] font-bold">Reason for change
                <textarea value={edit.reason} onChange={(event) => setEdit({ ...edit, reason: event.target.value })} rows={3} maxLength={500} placeholder="Required for the administrator audit log" className={`mt-1.5 w-full rounded-xl border p-3 text-xs outline-none focus:border-slate-500 ${isDark ? "border-neutral-700 bg-[#191919]" : "border-slate-300 bg-slate-50"}`} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEdit(null)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold dark:border-neutral-700">Cancel</button>
              <button type="button" onClick={saveCategory} disabled={saving || edit.name.trim().length < 3 || edit.reason.trim().length < 3} className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
