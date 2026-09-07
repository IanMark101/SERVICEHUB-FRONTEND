"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListAdminServices, apiReviewService } from '../../../api/admin.api';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { getSocket } from '../../../lib/socket';
import { useSearchParams } from 'next/navigation';
import { getApiErrorMessage } from '../../../lib/api/errors';
import AdminPagination from '../../../components/admin/AdminPagination';

const PAGE_SIZE = 10;

interface ProviderInfo {
  id: string;
  name: string;
  email: string;
  trustScore: number;
  verificationStatus: string;
}

interface CategoryInfo {
  id: string;
  name: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  priceType: 'FIXED' | 'STARTS_AT' | 'PER_HOUR' | 'PER_SESSION' | 'PER_DAY' | 'PER_PROJECT' | 'CUSTOM';
  serviceType?: 'ONE_TIME' | 'SESSION_BASED';
  estimatedDurationMins: number;
  queueLimit: number;
  paymentMethods?: { cash?: boolean; gcash?: boolean; maya?: boolean; card?: boolean };
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  adminNotes?: string | null;
  provider: ProviderInfo;
  category: CategoryInfo;
}

export default function AdminServices() {
  const searchParams = useSearchParams();
  const { isDark } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const requestedStatus = searchParams.get('status')?.toUpperCase();
  const [status, setStatus] = useState(
    requestedStatus && ['ALL', 'LIVE', 'PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED'].includes(requestedStatus)
      ? requestedStatus
      : 'PENDING_REVIEW',
  );

  const [reviewingItem, setReviewingItem] = useState<ServiceItem | null>(null);
  const [isApproveMode, setIsApproveMode] = useState<boolean>(true);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchServices = useCallback(() => {
    setLoading(true);
    apiListAdminServices({ page, limit: PAGE_SIZE, status: status === 'ALL' ? undefined : status })
      .then(res => {
        if (res.success) {
          setServices(res.data);
          setTotal(res.pagination?.total || 0);
          setTotalPages(Math.max(1, res.pagination?.totalPages || 1));
          setError('');
        } else {
          setError("Failed to fetch service listings.");
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(getApiErrorMessage(err, "An error occurred."));
        setLoading(false);
      });
  }, [page, status]);

  useEffect(() => {
    const initialFetch = setTimeout(fetchServices, 0);

    // Real-time: auto-refresh when a new service listing is submitted
    const socket = getSocket();
    if (socket) {
      const handleNewService = () => {
        fetchServices();
      };
      socket.on('SERVICE_LISTING_SUBMITTED', handleNewService);
      socket.on('SERVICE_LISTINGS_CHANGED', handleNewService);
      return () => {
        clearTimeout(initialFetch);
        socket.off('SERVICE_LISTING_SUBMITTED', handleNewService);
        socket.off('SERVICE_LISTINGS_CHANGED', handleNewService);
      };
    }
    return () => clearTimeout(initialFetch);
  }, [fetchServices]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;
    setSubmittingReview(true);
    try {
      const res = await apiReviewService(reviewingItem.id, isApproveMode, adminNotes);
      if (res.success) {
        toastSuccess(
          "Listing Moderated", 
          `Service listing "${reviewingItem.title}" has been ${isApproveMode ? 'APPROVED' : 'REJECTED'}.`
        );
        setReviewingItem(null);
        setAdminNotes('');
        fetchServices();
      }
    } catch (err: unknown) {
      toastError("Review Failed", getApiErrorMessage(err, "The listing review could not be saved."));
    } finally {
      setSubmittingReview(false);
    }
  };

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case 'FIXED': return 'Fixed';
      case 'STARTS_AT': return 'Starts At';
      case 'PER_HOUR': return 'Per Hour';
      case 'PER_SESSION': return 'Fixed (legacy record)';
      case 'PER_DAY': return 'Per Day';
      case 'PER_PROJECT': return 'Per Project';
      case 'CUSTOM': return 'Custom';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className={`font-extrabold text-sm ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
          Service Listing Administration
        </h4>
        <button
          onClick={fetchServices}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-[#202020] dark:text-neutral-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Listings</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter service listings by status">
        {['PENDING_REVIEW', 'LIVE', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED', 'ALL'].map((option) => (
          <button key={option} type="button" role="tab" aria-selected={status === option}
            onClick={() => { setStatus(option); setPage(1); }}
            className={`rounded-xl border px-3 py-2 text-[10px] font-bold transition-colors ${status === option
              ? 'border-slate-950 bg-slate-950 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950'
              : isDark ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {option === 'ALL' ? 'All Listings' : option === 'LIVE' ? 'Live Marketplace' : option.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Services Listings queue */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-slate-900 dark:text-neutral-100" />
          </div>
        ) : services.length === 0 ? (
          <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
          }`}>
            No {status === 'ALL' ? '' : status.toLowerCase().replace(/_/g, ' ')} service listings were found.
          </div>
        ) : (
          services.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            const methods = [];
            if (item.paymentMethods) {
              if (item.paymentMethods.gcash) methods.push("GCash");
              if (item.paymentMethods.maya) methods.push("Maya");
              if (item.paymentMethods.cash) methods.push("Cash");
            }

            return (
              <div
                key={item.id}
                className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isDark ? 'bg-[#22211e] border-neutral-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b pb-3 border-slate-100 dark:border-neutral-800">
                  <div>
                    <h3 className={`font-extrabold text-base ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center mt-1.5">
                      <span className="text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border bg-red-500/10 text-red-400 border-red-900/30">
                        📁 {item.category?.name || 'Uncategorized'}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border bg-slate-500/10 text-slate-400 border-slate-900/30`}>
                        ⏱️ {item.estimatedDurationMins} mins
                      </span>
                      {methods.map((method, idx) => (
                        <span key={idx} className="text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border bg-slate-100 text-slate-600 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                          💵 {method}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className={`text-lg font-black tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ₱{parseFloat(item.price).toLocaleString()}{item.priceType === 'PER_HOUR' ? ' / hr' : item.priceType === 'PER_DAY' ? ' / day' : item.priceType === 'PER_PROJECT' ? ' / project' : ''}
                    </span>
                    <span className={`text-[10px] block font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Price Type: {getPriceTypeLabel(item.priceType)}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Listing Description
                    </span>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Provider Profile details */}
                  <div className={`rounded-xl p-3 border ${
                    isDark ? 'bg-neutral-800/40 border-neutral-800 text-[#f2efe9]' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className={`text-[9px] uppercase font-extrabold tracking-wider block mb-2 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Submitted By Provider:
                    </span>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h5 className="text-xs font-bold">{item.provider?.name}</h5>
                        <p className="text-[10px] text-slate-400 font-medium">📧 {item.provider?.email}</p>
                      </div>
                      <div className="flex gap-4 text-[10px]">
                        <div>
                          <span className="text-slate-400 mr-1.5 font-semibold">Trust Score:</span>
                          <span className={`font-bold ${item.provider?.trustScore >= 80 ? 'text-emerald-500' : item.provider?.trustScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {item.provider?.trustScore}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 mr-1.5 font-semibold">Verification:</span>
                          <span className={`font-bold uppercase ${
                            item.provider?.verificationStatus === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {item.provider?.verificationStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Action panel */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2.5 ${
                  isDark ? 'border-neutral-800' : 'border-slate-100'
                }`}>
                  <span className={`text-[9px] mr-auto font-bold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    Created: {formattedDate}
                  </span>
                  {item.status === 'PENDING_REVIEW' ? <><button
                    onClick={() => {
                      setReviewingItem(item);
                      setIsApproveMode(false);
                      setAdminNotes('');
                    }}
                    className="px-3.5 py-2 border rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Listing</span>
                  </button>
                  <button
                    onClick={() => {
                      setReviewingItem(item);
                      setIsApproveMode(true);
                      setAdminNotes('');
                    }}
                    className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-extrabold text-white transition-colors hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Listing</span>
                  </button></> : (
                    <div className="text-right">
                      <span className="rounded-lg border border-slate-200 px-2 py-1 text-[9px] font-bold">{item.status.replace(/_/g, ' ')}</span>
                      {item.adminNotes && <p className="mt-2 max-w-sm text-[10px] text-slate-500">Administrator note: {item.adminNotes}</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="listings" />

      {/* Review Dialog Overlay */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">
              <h4 className={`font-extrabold text-sm flex items-center gap-1.5 ${isApproveMode ? 'text-emerald-500' : 'text-red-500'}`}>
                {isApproveMode ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{isApproveMode ? "Approve Service Listing" : "Reject Service Listing"}</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Confirm action for service listing: &quot;{reviewingItem.title}&quot;.
              </p>
              <div>
                <textarea
                  placeholder="Write the decision message the provider will receive..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs leading-relaxed ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                  rows={4}
                  required
                  minLength={3}
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
                  disabled={submittingReview || adminNotes.trim().length < 3}
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
