"use client";

import { useCallback, useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { apiListAdminAuditLogs } from '../../../api/admin.api';
import { useApp } from '../../../context/AppContext';
import AdminPagination from '../../../components/admin/AdminPagination';

const PAGE_SIZE = 20;

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  reason: string;
  createdAt: string;
  actor: { name: string; email: string };
  targetUser?: { name: string };
}

export default function AdminAuditLogsPage() {
  const { isDark } = useApp();
  const [items, setItems] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiListAdminAuditLogs({ page, limit: PAGE_SIZE });
      setItems(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border p-5 ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold"><History className="h-5 w-5 text-violet-600" /> Administrator Audit Log</h2>
            <p className="mt-1 text-xs text-slate-500">Immutable history of privileged moderation, private-document access, and account actions.</p>
          </div>
          <button type="button" onClick={() => void load()} className="rounded-xl border px-3 py-2 text-xs font-bold"><RefreshCw className="mr-1 inline h-3.5 w-3.5" />Refresh</button>
        </div>
      </section>
      <section className={`overflow-hidden rounded-2xl border ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
        {loading ? <p className="p-8 text-center text-xs text-slate-500">Loading audit records...</p> : items.length === 0 ? <p className="p-8 text-center text-xs text-slate-500">No audit records found.</p> : (
          <div className="divide-y divide-slate-200 dark:divide-neutral-800">
            {items.map((item) => (
              <article key={item.id} className="grid gap-2 p-4 text-xs md:grid-cols-[180px_1fr_180px]">
                <div><p className="font-extrabold">{item.action.replace(/_/g, ' ')}</p><p className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>
                <div><p>{item.reason}</p><p className="mt-1 text-slate-500">{item.resourceType}{item.resourceId ? ` · ${item.resourceId}` : ''}{item.targetUser ? ` · Target: ${item.targetUser.name}` : ''}</p></div>
                <div className="md:text-right"><p className="font-bold">{item.actor.name}</p><p className="text-slate-500">{item.actor.email}</p></div>
              </article>
            ))}
          </div>
        )}
      </section>
      <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="audit records" />
    </div>
  );
}
