"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListCategorySuggestions, apiResolveCategorySuggestion } from '../../../api/admin.api';
import { Loader2, CheckCircle2, XCircle, Tag, User } from 'lucide-react';

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
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchSuggestions = () => {
    setLoading(true);
    apiListCategorySuggestions()
      .then(res => {
        if (res.success) {
          setSuggestions(res.data);
        } else {
          setError("Failed to fetch suggested categories.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleResolve = async (id: string, approve: boolean) => {
    const actionText = approve ? 'approve' : 'reject';
    if (window.confirm(`Are you sure you want to ${actionText} this category suggestion?`)) {
      try {
        const res = await apiResolveCategorySuggestion(id, approve);
        if (res.success) {
          alert(`Category suggestion ${approve ? 'approved and published' : 'rejected'} successfully!`);
          fetchSuggestions();
        }
      } catch (err: any) {
        alert("Failed to resolve category suggestion: " + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
          Suggested Categories Queue
        </h4>
        <button
          onClick={fetchSuggestions}
          className="px-4 py-2 border rounded-xl font-bold text-xs bg-blue-500/5 text-blue-500 border-blue-500/25 cursor-pointer hover:bg-blue-500/10"
        >
          Refresh Suggestions
        </button>
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Suggested Categories queue items */}
      <div className="space-y-6">
        {suggestions.length === 0 ? (
          <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
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
                  isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
                }`}
              >
                {/* Header Info */}
                <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-neutral-800/60">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
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
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Proposed Description
                    </span>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Submitter details */}
                  <div className={`rounded-xl p-2.5 border flex items-center space-x-2 text-[10px] ${
                    isDark ? 'bg-neutral-800/40 border-neutral-800 text-[#f2efe9]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-400">Suggested By:</span>
                    <span className="font-bold">{item.submitter?.name}</span>
                    <span className="text-slate-400 font-medium">({item.submitter?.id})</span>
                  </div>
                </div>

                {/* Actions panel */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2.5 ${
                  isDark ? 'border-neutral-850' : 'border-slate-100'
                }`}>
                  <button
                    onClick={() => handleResolve(item.id, false)}
                    className="px-3 py-1.5 border rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Suggestion</span>
                  </button>
                  <button
                    onClick={() => handleResolve(item.id, true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
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
    </div>
  );
}
