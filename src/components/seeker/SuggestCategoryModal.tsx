import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lightbulb,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { apiGetMyCategorySuggestions } from '../../api/categories.api';

interface SuggestCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function SuggestCategoryModal({
  isOpen,
  onClose,
  initialQuery = '',
}: SuggestCategoryModalProps) {
  const { categorySuggestions, suggestCategory, isDark, user } = useApp();
  const { canTransact, navigateToVerification } = useTransactionPermission();

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [dbSuggestions, setDbSuggestions] = useState<any[]>([]);
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setName(initialQuery);
      }
      fetchMySuggestions();
    }
  }, [isOpen, initialQuery]);

  const fetchMySuggestions = () => {
    apiGetMyCategorySuggestions()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDbSuggestions(res.data);
        }
      })
      .catch(() => {});
  };

  // Combine context and DB suggestions for instant optimistic update + DB persistence
  const mySuggestions =
    dbSuggestions.length > 0
      ? dbSuggestions
      : categorySuggestions.filter(
          (s) =>
            s.suggestedBy === `${user?.firstName} ${user?.lastName}`.trim() ||
            s.suggestedBy === user?.firstName
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      return;
    }

    setLoading(true);
    try {
      await suggestCategory(
        `${user?.firstName} ${user?.lastName}`.trim() || 'User',
        name,
        description
      );
      setSuccess(true);
      setName('');
      setDescription('');
      fetchMySuggestions();
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('history');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark ? 'border-neutral-800 bg-[#22211e]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-snug">Suggest a Category</h3>
              <p className={`text-xs ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                Help expand Cordova’s local marketplace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400'
                : 'border-slate-200 hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-orange-600 text-white shadow-sm'
                : isDark
                ? 'bg-[#22211e] text-neutral-400 hover:text-neutral-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Submit Suggestion
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-orange-600 text-white shadow-sm'
                : isDark
                ? 'bg-[#22211e] text-neutral-400 hover:text-neutral-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Suggestions</span>
            {mySuggestions.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'history'
                    ? 'bg-white/20 text-white'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {mySuggestions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'submit' ? (
            <div className="space-y-4">
              {/* Verification Gate */}
              {!canTransact && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                    isDark
                      ? 'bg-amber-950/25 border-amber-900/30 text-amber-400'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <span>Verify your residency to submit category suggestions.</span>
                  <button
                    type="button"
                    onClick={navigateToVerification}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Verify Now
                  </button>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    isDark
                      ? 'bg-orange-950/20 border-orange-900/40 text-orange-400'
                      : 'bg-orange-50 border-orange-200 text-orange-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <span>Suggestion submitted! Admins will review it soon.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-[#b4b0a9]' : 'text-slate-600'
                    }`}
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canTransact}
                    placeholder="e.g. Banca / Boat Repair, Pet Grooming, AC Cleaning"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-orange-500/10 ${
                      isDark
                        ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9] focus:border-orange-500'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${
                      isDark ? 'text-[#b4b0a9]' : 'text-slate-600'
                    }`}
                  >
                    Why should we add this?
                  </label>
                  <textarea
                    rows={4}
                    required
                    disabled={!canTransact}
                    placeholder="Describe the typical tasks or services that fall under this category in Cordova..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium text-sm resize-none transition-all focus:ring-4 focus:ring-orange-500/10 ${
                      isDark
                        ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9] focus:border-orange-500'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      isDark
                        ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !canTransact}
                    className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                      !canTransact
                        ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Submitting...' : 'Submit Suggestion'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              {mySuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-400">No suggestions submitted yet.</p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="mt-3 text-xs font-bold text-orange-500 hover:underline cursor-pointer"
                  >
                    + Submit your first suggestion
                  </button>
                </div>
              ) : (
                mySuggestions.map((suggestion) => {
                  const statusNormalized = (suggestion.status || 'PENDING').toUpperCase();
                  const isApproved = statusNormalized === 'APPROVED';
                  const isRejected = statusNormalized === 'REJECTED';
                  const isPending = statusNormalized === 'PENDING';
                  const isExpanded = expandedSuggestionId === suggestion.id;

                  const formattedDate = suggestion.createdAt
                    ? new Date(suggestion.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently';

                  return (
                    <div
                      key={suggestion.id}
                      onClick={() =>
                        setExpandedSuggestionId(isExpanded ? null : suggestion.id)
                      }
                      className={`border rounded-2xl p-4 space-y-2.5 transition-all duration-200 cursor-pointer ${
                        isExpanded
                          ? isDark
                            ? 'bg-[#282723] border-orange-500/60 shadow-md ring-1 ring-orange-500/20'
                            : 'bg-white border-orange-500/60 shadow-md ring-1 ring-orange-500/20'
                          : isDark
                          ? 'bg-[#22211e] border-neutral-800 hover:border-neutral-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs tracking-tight">
                              {suggestion.name}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-medium">
                              • {formattedDate}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] leading-relaxed mt-1 ${
                              isExpanded
                                ? isDark
                                  ? 'text-[#e2ded6]'
                                  : 'text-slate-700'
                                : `line-clamp-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`
                            }`}
                          >
                            {suggestion.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isPending && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider text-amber-500 bg-amber-500/10 border-amber-500/20 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              Pending
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider text-orange-500 bg-orange-500/10 border-orange-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider text-red-400 bg-red-500/10 border-red-500/20 flex items-center gap-1">
                              <XCircle className="w-2.5 h-2.5" />
                              Declined
                            </span>
                          )}

                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-orange-500' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Admin Feedback Box */}
                      {isApproved && (
                        <div
                          className={`p-2.5 rounded-xl border text-[10px] flex items-center gap-2 ${
                            isDark
                              ? 'bg-orange-950/20 border-orange-900/30 text-orange-300'
                              : 'bg-orange-50 border-orange-200 text-orange-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
                          <span>
                            <strong>Added to Catalog:</strong> This category is now active on
                            ServiceHub Cordova.
                          </span>
                        </div>
                      )}

                      {isRejected && (
                        <div
                          className={`p-2.5 rounded-xl border text-[10px] flex items-center gap-2 ${
                            isDark
                              ? 'bg-red-950/20 border-red-900/30 text-red-400'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                          <span>
                            <strong>Admin Review:</strong> This suggestion was reviewed and not
                            approved for the public catalog.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
