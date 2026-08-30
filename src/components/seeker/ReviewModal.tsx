import React, { useState } from 'react';
import { Star, X, Check, Loader2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, tags: string[], reviewId?: string) => Promise<void>;
  targetName?: string;
  providerName?: string;
  targetRole?: 'provider' | 'client' | 'seeker';
  isDark?: boolean;
  initialRating?: number;
  initialComment?: string;
  initialTags?: string[];
  reviewId?: string;
  isEdit?: boolean;
}

const PROVIDER_TAGS = ["Punctual", "Skilled", "Friendly", "Professional", "Great Quality", "Fair Price", "Efficient"];
const CLIENT_TAGS = ["Prompt Payment", "Respectful", "Clear Instructions", "Pleasant to Work With", "Responsive", "Accurate Job Scope"];

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  targetName,
  providerName,
  targetRole = 'provider',
  isDark = false,
  initialRating = 0,
  initialComment = '',
  initialTags = [],
  reviewId,
  isEdit = false,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialComment);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const isClientTarget = targetRole === 'client' || targetRole === 'seeker';
  const nameToDisplay = targetName || providerName || (isClientTarget ? 'Client' : 'Provider');
  const availableTags = isClientTarget ? CLIENT_TAGS : PROVIDER_TAGS;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(rating, comment, selectedTags, reviewId);
      setSubmitting(false);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(err.response?.data?.error || err.message || (isEdit ? "Failed to update review." : "Failed to submit review."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className={`rounded-[24px] max-w-md w-full overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${
          isDark ? 'border-neutral-850 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div>
            <h3 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
              {isEdit ? "Edit Your Review" : isClientTarget ? "Rate & Review Client" : "Write a Review"}
            </h3>
            <p className={`text-[10px] ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
              {isEdit ? "Editable within 24 hours of posting • " : ""}For {isClientTarget ? "client" : "provider"} <strong className="font-bold">{nameToDisplay}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Rating */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className={`text-xs font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
              {isClientTarget ? "How was your experience working with this client?" : "How was your overall service?"}
            </span>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : isDark
                          ? 'text-neutral-700'
                          : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
              Select tags that apply
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all flex items-center space-x-1 cursor-pointer ${
                      isSelected
                        ? isClientTarget
                          ? isDark
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : isDark
                            ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                            : 'bg-orange-50 border-orange-200 text-orange-600'
                        : isDark
                          ? 'bg-[#1c1b18] border-neutral-800 text-[#b4b0a9] hover:bg-[#2c2b27]'
                          : 'bg-slate-50 border-slate-200 text-slate-550 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
              Describe your experience (optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isClientTarget 
                ? "Share details about the client's communication, promptness, and cooperation..." 
                : "Provide details about the provider's performance, skill quality, and general conduct..."
              }
              className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed transition-all ${
                isDark
                  ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9] focus:border-neutral-700'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-slate-400 focus:bg-white'
              }`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase text-white transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm ${
              isClientTarget
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEdit ? "Updating Review..." : "Submitting Review..."}</span>
              </>
            ) : (
              <span>{isEdit ? "Update Review" : "Submit Review"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
