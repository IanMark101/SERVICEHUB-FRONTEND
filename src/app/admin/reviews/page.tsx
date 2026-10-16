"use client";

import { useCallback, useEffect, useState } from 'react';
import { useApiCacheRefresh } from '../../../hooks/useApiCacheRefresh';
import { EyeOff, RotateCcw, Star } from 'lucide-react';
import { apiListAdminReviews, apiModerateReview } from '../../../api/admin.api';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import ReasonModal from '../../../components/ui/ReasonModal';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../../../components/admin/AdminPagination';
import { AdminTrustCasesPanel } from '../../../components/admin/AdminTrustCasesPanel';
import type { ReviewViolation } from '../../../api/trust.api';
import FormSelect from '../../../components/ui/FormSelect';

const PAGE_SIZE = 12;

interface ReviewItem {
  id: string;
  rating: number;
  text?: string;
  visibility: 'VISIBLE' | 'HIDDEN';
  moderationReason?: string;
  createdAt: string;
  author: { name: string };
  target: { name: string };
}

export default function AdminReviewsPage() {
  const { isDark } = useApp();
  const { success, error } = useToast();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [violation, setViolation] = useState<ReviewViolation>('MANIPULATION');

  const load = useCallback(async () => {
    try {
      const response = await apiListAdminReviews({ page, limit: PAGE_SIZE });
      setItems(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
    } catch (cause: unknown) {
      error('Unable to load reviews', getApiErrorMessage(cause, 'The review list could not be loaded.'));
    }
  }, [error, page]);
  useApiCacheRefresh(['admin', 'reviews'], () => load(), !submitting);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const moderate = async () => {
    if (!selectedReview || reason.trim().length < 20) return;
    const action = selectedReview.visibility === 'VISIBLE' ? 'hide' : 'restore';
    setSubmitting(true);
    try {
      await apiModerateReview(selectedReview.id, action, reason.trim(), action === 'hide' ? violation : undefined);
      success('Review updated', `The review was ${action === 'hide' ? 'hidden' : 'restored'} and audited.`);
      setSelectedReview(null);
      setReason('');
      await load();
    } catch (cause: unknown) {
      error('Moderation failed', getApiErrorMessage(cause, 'The moderation decision could not be saved.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <AdminTrustCasesPanel />
      <section className={`rounded-2xl border p-5 ${isDark ? 'border-neutral-800 bg-charcoal-surface' : 'border-slate-200 bg-white'}`}>
        <h2 className="text-base font-extrabold">Review Moderation</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">Hide documented policy violations or restore reviews. Genuine negative feedback stays visible. Reviews do not change Trust Score.</p>
      </section>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-4 ${isDark ? 'border-neutral-800 bg-charcoal-surface' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold">{item.author.name} → {item.target.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-500"><Star className="h-3 w-3" /> {item.rating}/5</p>
                <p className="mt-2 text-xs">{item.text || 'No written feedback.'}</p>
                {item.moderationReason && <p className="mt-2 text-[10px] text-ink-muted">Last moderation reason: {item.moderationReason}</p>}
              </div>
              <button onClick={() => { setSelectedReview(item); setReason(''); }} className="flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-[10px] font-bold">
                {item.visibility === 'VISIBLE' ? <EyeOff className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                {item.visibility === 'VISIBLE' ? 'Hide' : 'Restore'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="reviews" />
      <ReasonModal
        isOpen={!!selectedReview}
        title={selectedReview?.visibility === 'VISIBLE' ? 'Hide review' : 'Restore review'}
        description="Explain this moderation decision. The reason is stored in the administrator audit log."
        value={reason}
        minLength={20}
        onChange={setReason}
        onClose={() => { if (!submitting) { setSelectedReview(null); setReason(''); } }}
        onSubmit={moderate}
        confirmText={selectedReview?.visibility === 'VISIBLE' ? 'Hide review' : 'Restore review'}
        variant={selectedReview?.visibility === 'VISIBLE' ? 'danger' : 'primary'}
        isSubmitting={submitting}
      >
        {selectedReview?.visibility === 'VISIBLE' && <div className="mt-4 space-y-2"><label htmlFor="review-policy" className="block text-sm font-semibold">Policy violated</label><FormSelect id="review-policy" tone="admin" value={violation} onChange={event => setViolation(event.target.value as ReviewViolation)} className="w-full rounded-lg border p-3 text-base">
          <option value="MANIPULATION">Manipulation or threats</option><option value="HARASSMENT">Harassment or abuse</option><option value="FABRICATED">Fabricated participation</option><option value="IRRELEVANT">Unrelated content</option><option value="OTHER_POLICY">Other policy violation</option>
        </FormSelect></div>}
      </ReasonModal>
    </div>
  );
}
