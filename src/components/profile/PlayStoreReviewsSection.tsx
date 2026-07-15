"use client";
import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import PaginationBar from '../PaginationBar';

interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount?: number;
}

interface PlayStoreReviewsSectionProps {
  initialReviews?: ReviewItem[];
  isDark: boolean;
  cardBg: string;
  innerBg: string;
  labelText: string;
  headingText: string;
}

export default function PlayStoreReviewsSection({
  initialReviews = [],
  isDark,
  cardBg,
  innerBg,
  labelText,
  headingText,
}: PlayStoreReviewsSectionProps) {
  const defaultReviews: ReviewItem[] = [
    {
      id: 'r1',
      authorName: 'Anna Ramos',
      rating: 5,
      comment: 'Superb plumbing service! Job was resolved quickly. Maria is very clean, professional, and on time. Highly recommended across Cordova!',
      createdAt: 'July 10, 2026',
      helpfulCount: 14,
    },
    {
      id: 'r2',
      authorName: 'Robert Dy',
      rating: 5,
      comment: 'Arrived within 20 minutes of booking. Diagnosed the main pipe leak efficiently and replaced the fitting with zero hassle. Will book again!',
      createdAt: 'July 8, 2026',
      helpfulCount: 9,
    },
    {
      id: 'r3',
      authorName: 'Clara Tan',
      rating: 5,
      comment: 'Extremely polite and honest pricing. Explained what caused the blockage and gave great tips to prevent future issues.',
      createdAt: 'July 5, 2026',
      helpfulCount: 7,
    },
    {
      id: 'r4',
      authorName: 'Vicente Lim',
      rating: 5,
      comment: 'Great craftsmanship and very reliable technician in Cordova. Fixed our kitchen sink drain cleanly.',
      createdAt: 'July 1, 2026',
      helpfulCount: 4,
    },
    {
      id: 'r5',
      authorName: 'Luz Castro',
      rating: 5,
      comment: 'Top tier service! Solved a severe pipe pressure issue that two other handymen failed to diagnose. 10/10!',
      createdAt: 'June 28, 2026',
      helpfulCount: 11,
    },
  ];

  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(
    initialReviews.length > 0 ? initialReviews : defaultReviews
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});

  // Pagination hook — 3 reviews per page
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedReviews,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
  } = usePagination(reviewsList, 3);

  const handleToggleHelpful = (id: string, current: number = 0) => {
    setHelpfulMap(prev => ({ ...prev, [id]: (prev[id] || current) + 1 }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const created: ReviewItem = {
      id: `r_user_${Date.now()}`,
      authorName: 'You (Verified Client)',
      rating: newRating,
      comment: newComment.trim(),
      createdAt: 'Just now',
      helpfulCount: 0,
    };

    setReviewsList([created, ...reviewsList]);
    setNewComment('');
    setNewRating(5);
    setShowAddForm(false);
    goToPage(1);
  };

  const avgRating = (
    reviewsList.reduce((acc, r) => acc + r.rating, 0) / (reviewsList.length || 1)
  ).toFixed(1);

  return (
    <div className={`${cardBg} rounded-[28px] p-6 sm:p-7 border shadow-sm space-y-6`}>
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-neutral-800 pb-4">
        <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${headingText}`}>
          <MessageSquare size={18} className="text-amber-400" /> Ratings & Reviews ({reviewsList.length})
        </h3>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <Send size={13} />
          <span>{showAddForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitReview} className={`p-4 rounded-2xl border ${innerBg} space-y-3 animate-in fade-in duration-200`}>
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Rate & Comment</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button type="button" key={star} onClick={() => setNewRating(star)} className="p-1 transition-transform hover:scale-110">
                <Star size={20} className={star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-700'} />
              </button>
            ))}
            <span className="text-xs font-bold ml-2 text-amber-500">{newRating} / 5 Stars</span>
          </div>

          <textarea
            rows={3}
            required
            placeholder="Share details of your experience with this provider..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />

          <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm">
            Post Review
          </button>
        </form>
      )}

      {/* Rating Overview Summary Header */}
      <div className={`p-5 rounded-2xl border ${innerBg} grid grid-cols-1 sm:grid-cols-12 gap-5 items-center`}>
        <div className="sm:col-span-4 text-center sm:text-left space-y-1">
          <div className={`text-4xl font-black ${headingText}`}>{avgRating}</div>
          <div className="flex items-center justify-center sm:justify-start gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={15} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <div className={`text-[11px] font-semibold ${labelText}`}>{reviewsList.length} verified ratings in Cordova</div>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="sm:col-span-8 space-y-1 text-xs">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviewsList.filter(r => Math.round(r.rating) === star).length;
            const pct = Math.round((count / (reviewsList.length || 1)) * 100);
            return (
              <div key={star} className="flex items-center gap-2">
                <span className={`w-4 font-bold text-right text-[11px] ${labelText}`}>{star}</span>
                <div className="flex-1 bg-slate-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className={`w-8 text-right text-[10px] font-medium ${labelText}`}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paginated Review Cards Feed */}
      <div className="space-y-3 pt-1">
        {paginatedReviews.map(r => (
          <div key={r.id} className={`p-4 rounded-2xl border ${innerBg} space-y-2 text-xs transition-all hover:scale-[1.005]`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                  {r.authorName[0]}
                </div>
                <div>
                  <div className={`font-bold ${headingText}`}>{r.authorName}</div>
                  <div className="text-[10px] text-slate-400">{r.createdAt}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-700'} />
                ))}
              </div>
            </div>

            <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>{r.comment}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-neutral-800">
              <span className="text-[10px] text-emerald-500 font-semibold">Verified Booking Completed</span>
              <button
                onClick={() => handleToggleHelpful(r.id, r.helpfulCount || 0)}
                className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${
                  isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                }`}
              >
                <ThumbsUp size={11} className="text-emerald-500" />
                <span>Helpful ({helpfulMap[r.id] !== undefined ? helpfulMap[r.id] : (r.helpfulCount || 0)})</span>
              </button>
            </div>
          </div>
        ))}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-2">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              nextPage={nextPage}
              prevPage={prevPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={reviewsList.length}
              variant="seeker"
            />
          </div>
        )}
      </div>
    </div>
  );
}
