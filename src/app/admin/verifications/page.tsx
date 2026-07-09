"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListPendingVerifications, apiReviewVerification } from '../../../api/admin.api';
import { Loader2, CheckCircle2, XCircle, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/Toast';

interface VerificationProof {
  id: string;
  documentType: string;
  fileUrl: string;
}

interface VerificationItem {
  id: string;
  userId: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  proofs: VerificationProof[];
}

export default function AdminVerifications() {
  const { isDark } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [reviewingItem, setReviewingItem] = useState<VerificationItem | null>(null);
  const [isApproveMode, setIsApproveMode] = useState<boolean>(true);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchVerifications = () => {
    setLoading(true);
    apiListPendingVerifications()
      .then(res => {
        if (res.success) {
          setVerifications(res.data);
          setError('');
        } else {
          setError("Failed to fetch pending verifications queue.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;
    setSubmittingReview(true);
    try {
      const res = await apiReviewVerification(reviewingItem.id, isApproveMode, adminNotes);
      if (res.success) {
        toastSuccess(
          "Verification Resolved", 
          `Request for ${reviewingItem.user?.name} has been ${isApproveMode ? 'APPROVED' : 'REJECTED'}.`
        );
        setReviewingItem(null);
        setAdminNotes('');
        fetchVerifications();
      }
    } catch (err: any) {
      toastError("Failed to update", err.response?.data?.error || err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
          Pending Provider Verifications
        </h4>
        <button
          onClick={fetchVerifications}
          className="px-4 py-2 border rounded-xl font-bold text-xs bg-red-500/5 text-red-500 border-red-500/25 cursor-pointer hover:bg-red-500/10 transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Verification Queue items */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : verifications.length === 0 ? (
          <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
          }`}>
            There are no verifications currently pending review.
          </div>
        ) : (
          verifications.map((item) => {
            const formattedDate = new Date(item.submittedAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            return (
              <div
                key={item.id}
                className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isDark ? 'bg-[#22211e] border-neutral-855' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between border-b pb-3 border-slate-100 dark:border-neutral-850">
                  <div>
                    <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {item.user?.name}
                    </h4>
                    <p className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Provider ID: {item.userId} • Email: {item.user?.email}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold ${isDark ? 'text-amber-450' : 'text-amber-600'}`}>
                    📅 Submitted: {formattedDate}
                  </span>
                </div>

                {/* Proofs documents grid */}
                <div className="space-y-2">
                  <span className={`text-xs font-bold block ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`}>
                    Document Proofs:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {item.proofs && item.proofs.map((proof) => (
                      <div
                        key={proof.id}
                        className={`rounded-xl p-3 border flex items-center justify-between text-[11px] font-bold ${
                          isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span>{proof.documentType}</span>
                        </div>
                        <a
                          href={proof.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-655 flex items-center space-x-0.5"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Action panel */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2.5 ${
                  isDark ? 'border-neutral-850' : 'border-slate-100'
                }`}>
                  <button
                    onClick={() => {
                      setReviewingItem(item);
                      setIsApproveMode(false);
                      setAdminNotes('');
                    }}
                    className="px-3.5 py-2 border rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject proofs</span>
                  </button>
                  <button
                    onClick={() => {
                      setReviewingItem(item);
                      setIsApproveMode(true);
                      setAdminNotes('');
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-xl transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve verification</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Dialog Overlay */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">
              <h4 className={`font-extrabold text-sm flex items-center gap-1.5 ${isApproveMode ? 'text-emerald-500' : 'text-red-500'}`}>
                {isApproveMode ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{isApproveMode ? "Approve Verification" : "Reject Verification"}</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Confirm action for provider {reviewingItem.user?.name}. Send remarks.
              </p>
              <div>
                <textarea
                  placeholder="Explain rejection reason or add approval remarks here..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer ${
                    submittingReview
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                      : isApproveMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>{isApproveMode ? 'Approving...' : 'Rejecting...'}</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
