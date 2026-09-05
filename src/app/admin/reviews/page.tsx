"use client";

import { useEffect, useState } from 'react';
import { EyeOff, RotateCcw, Star } from 'lucide-react';
import { apiListAdminReviews, apiModerateReview } from '../../../api/admin.api';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';

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

  const load = async () => {
    try {
      const response = await apiListAdminReviews({ page, limit: 20 });
      setItems(response.data || []);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
    } catch (cause: any) {
      error('Unable to load reviews', cause.response?.data?.error || cause.message);
    }
  };
  useEffect(() => { void load(); }, [page]);

  const moderate = async (item: ReviewItem) => {
    const action = item.visibility === 'VISIBLE' ? 'hide' : 'restore';
    const reason = window.prompt(`Explain why this review should be ${action === 'hide' ? 'hidden' : 'restored'}:`);
    if (!reason || reason.trim().length < 3) return;
    try {
      await apiModerateReview(item.id, action, reason.trim());
      success('Review updated', `The review was ${action === 'hide' ? 'hidden' : 'restored'} and audited.`);
      await load();
    } catch (cause: any) {
      error('Moderation failed', cause.response?.data?.error || cause.message);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border p-5 ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
        <h2 className="text-base font-extrabold">Review Moderation</h2>
        <p className="mt-1 text-xs text-slate-500">Hide policy-violating reviews or restore them. Every decision requires a reason and is audit logged.</p>
      </section>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-4 ${isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold">{item.author.name} → {item.target.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-500"><Star className="h-3 w-3" /> {item.rating}/5</p>
                <p className="mt-2 text-xs">{item.text || 'No written feedback.'}</p>
                {item.moderationReason && <p className="mt-2 text-[10px] text-slate-500">Last moderation reason: {item.moderationReason}</p>}
              </div>
              <button onClick={() => void moderate(item)} className="flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-[10px] font-bold">
                {item.visibility === 'VISIBLE' ? <EyeOff className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                {item.visibility === 'VISIBLE' ? 'Hide' : 'Restore'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex justify-end gap-3 text-xs font-bold">
        <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
        <span className="py-2">Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
