"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiFinalizeAccountDeletion, apiListAccountDeletionRequests } from '../../../api/admin.api';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import ReasonModal from '../../../components/ui/ReasonModal';
import { getApiErrorMessage } from '../../../lib/api/errors';

interface DeletionItem {
  id: string;
  userId: string;
  status: string;
  blockers?: Array<{ type: string; count: number }>;
  requestedAt: string;
  user: { name: string; email: string; isActive: boolean };
}

export default function AccountDeletionsPage() {
  const { isDark } = useApp();
  const { success, error } = useToast();
  const [items, setItems] = useState<DeletionItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<DeletionItem | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await apiListAccountDeletionRequests({ page, limit: 20 });
      setItems(response.data || []);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
    } catch (cause: unknown) {
      error('Unable to load deletion requests', getApiErrorMessage(cause, 'The deletion request list could not be loaded.'));
    }
  }, [error, page]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const finalize = async () => {
    if (!selectedItem || reason.trim().length < 3) return;
    setSubmitting(true);
    try {
      await apiFinalizeAccountDeletion(selectedItem.userId, reason.trim());
      success('Account deactivated', 'Active sessions were revoked and retained records were preserved.');
      setSelectedItem(null);
      setReason('');
      await load();
    } catch (cause: unknown) {
      error('Deactivation blocked', getApiErrorMessage(cause, 'The account cannot be deactivated yet.'));
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border p-5 ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
        <h2 className="text-base font-extrabold">Account Deletion Requests</h2>
        <p className="mt-1 text-xs text-slate-500">Final deactivation is available only after all marketplace, payment, and moderation obligations are resolved.</p>
      </section>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
            <div><p className="text-xs font-extrabold">{item.user.name} · {item.user.email}</p><p className="mt-1 text-[10px] text-slate-500">{item.status} · requested {new Date(item.requestedAt).toLocaleString()}</p>{item.blockers && item.blockers.length > 0 && <p className="mt-2 text-[10px] text-amber-600">{item.blockers.map((b) => `${b.count} ${b.type}`).join(', ')}</p>}</div>
            <button disabled={item.status !== 'PENDING'} onClick={() => { setSelectedItem(item); setReason(''); }} className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40">Finalize deactivation</button>
          </article>
        ))}
      </div>
      <div className="flex justify-end gap-3 text-xs font-bold"><button disabled={page === 1} onClick={() => setPage((v) => v - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><span className="py-2">Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div>
      <ReasonModal
        isOpen={!!selectedItem}
        title="Finalize account deactivation"
        description="Record why this request can be finalized. Retained transaction and audit records are preserved according to policy."
        value={reason}
        onChange={setReason}
        onClose={() => { if (!submitting) { setSelectedItem(null); setReason(''); } }}
        onSubmit={finalize}
        confirmText="Deactivate account"
        variant="danger"
        isSubmitting={submitting}
      />
    </div>
  );
}
