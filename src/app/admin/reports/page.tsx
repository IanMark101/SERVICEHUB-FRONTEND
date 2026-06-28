"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiListReports, apiResolveReport } from '../../../api/admin.api';
import { Loader2, AlertTriangle, ShieldCheck, User, MessageSquare, ChevronDown, ChevronUp, Scale, CheckCircle } from 'lucide-react';

interface ReporterInfo {
  id: string;
  name: string;
  trustScore: number;
  verificationStatus: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface BookingInfo {
  id: string;
  status: string;
  paymentStatus: string;
  messages: MessageItem[];
}

interface ReportItem {
  id: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reporter: ReporterInfo;
  reportedUser: ReporterInfo;
  booking: BookingInfo;
}

export default function AdminReports() {
  const { isDark } = useApp();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [expandedChatReportId, setExpandedChatReportId] = useState<string | null>(null);

  const [resolvingItem, setResolvingItem] = useState<ReportItem | null>(null);
  const [action, setAction] = useState<'trust_deduct' | 'suspend' | 'approve_refund' | 'dismiss'>('dismiss');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const fetchReports = () => {
    setLoading(true);
    apiListReports()
      .then(res => {
        if (res.success) {
          setReports(res.data);
        } else {
          setError("Failed to fetch reports queue.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "An error occurred.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingItem) return;
    try {
      const res = await apiResolveReport(resolvingItem.id, action, adminNotes);
      if (res.success) {
        alert("Report resolved successfully!");
        setResolvingItem(null);
        setAdminNotes('');
        fetchReports();
      }
    } catch (err: any) {
      alert("Failed to resolve report: " + (err.response?.data?.error || err.message));
    }
  };

  const getReasonLabel = (reason: string) => {
    return reason.replace(/_/g, ' ');
  };

  if (loading && reports.length === 0) {
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
          Active Disputes & Moderation Reports
        </h4>
        <button
          onClick={fetchReports}
          className="px-4 py-2 border rounded-xl font-bold text-xs bg-blue-500/5 text-blue-500 border-blue-500/25 cursor-pointer hover:bg-blue-500/10"
        >
          Refresh Queue
        </button>
      </div>

      {error && (
        <div className="p-5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-2xl font-medium">
          Error: {error}
        </div>
      )}

      {/* Reports Queue */}
      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className={`rounded-[24px] p-12 border text-center text-sm font-medium ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#b4b0a9]' : 'bg-white border-slate-300 text-slate-500'
          }`}>
            There are no open reports or disputes needing moderation.
          </div>
        ) : (
          reports.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const isChatExpanded = expandedChatReportId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-[24px] p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-white border-slate-300'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b pb-3 border-slate-100 dark:border-neutral-800/60">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm capitalize text-red-500">
                        {getReasonLabel(item.reason)}
                      </h4>
                      <p className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                        Report ID: {item.id}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                    📅 Filed: {formattedDate}
                  </span>
                </div>

                {/* Dispute details */}
                <div className="space-y-4">
                  {/* Accusation / Parties */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-800/20 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Reporter (Accuser)</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-[#f2efe9]">{item.reporter?.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">Trust: {item.reporter?.trustScore}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-800/20 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Reported User (Accused)</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-[#f2efe9]">{item.reportedUser?.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">Trust: {item.reportedUser?.trustScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
                      Description of issue
                    </span>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Chat logs / messages transcript (Wow factor) */}
                  {item.booking && (
                    <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedChatReportId(isChatExpanded ? null : item.id)}
                        className={`w-full p-3 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                          isDark ? 'bg-neutral-800/50 hover:bg-neutral-800 text-[#f2efe9]' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span>Booking Chat Log & Activity ({item.booking.messages?.length || 0} messages)</span>
                        </div>
                        {isChatExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isChatExpanded && (
                        <div className={`p-4 space-y-3 max-h-60 overflow-y-auto border-t text-xs ${
                          isDark ? 'bg-[#1c1b18] border-neutral-800' : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200 dark:border-neutral-800 text-[10px] text-slate-400 font-semibold">
                            <span>Booking ID: {item.booking.id}</span>
                            <span className="uppercase">Status: {item.booking.status} • Payment: {item.booking.paymentStatus}</span>
                          </div>

                          {item.booking.messages && item.booking.messages.length === 0 ? (
                            <p className="text-center text-slate-400 py-4 italic font-medium">No chat messages were sent during this booking.</p>
                          ) : (
                            item.booking.messages?.map((msg) => {
                              const isReporter = msg.senderId === item.reporter?.id;
                              const senderName = isReporter ? item.reporter?.name : item.reportedUser?.name;
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[85%] rounded-2xl p-3 border ${
                                    isReporter
                                      ? 'mr-auto bg-blue-550/5 border-blue-500/10 text-left'
                                      : 'ml-auto bg-neutral-850/20 border-neutral-800 text-left'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-slate-450">
                                    <span>{senderName}</span>
                                    <span>•</span>
                                    <span>{new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="leading-relaxed text-slate-800 dark:text-[#f2efe9]">{msg.text}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Audit Action panel */}
                <div className={`border-t pt-4 flex items-center justify-end gap-2.5 ${
                  isDark ? 'border-neutral-850' : 'border-slate-100'
                }`}>
                  <button
                    onClick={() => {
                      setResolvingItem(item);
                      setAction('dismiss');
                      setAdminNotes('');
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Arbitrate & Resolve Dispute</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Dialog Overlay */}
      {resolvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`rounded-[24px] max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <form onSubmit={handleResolveSubmit} className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-blue-500">
                <Scale className="w-4 h-4" />
                <span>Arbitrate Report</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Choose the moderation action for resolving this dispute. Both users will be notified.
              </p>

              {/* Action dropdown selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Select Resolution Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className={`w-full rounded-xl p-3 border outline-none text-xs font-bold leading-relaxed cursor-pointer ${
                    isDark ? 'bg-[#1c1b18] border-neutral-800/80 text-[#f2efe9]' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="dismiss">Dismiss Case (No penalties)</option>
                  <option value="trust_deduct">Deduct Trust Points (-10 from Accused)</option>
                  <option value="suspend">Suspend Accused User Account</option>
                  {resolvingItem.booking && <option value="approve_refund">Cancel Booking & Refund Seeker</option>}
                </select>
              </div>

              {/* Remarks/Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Moderator Notes & Explanation</label>
                <textarea
                  required
                  placeholder="Explain your resolution decision. This will be shared in notifications to both parties..."
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
                  onClick={() => setResolvingItem(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold ${isDark ? 'border-neutral-800 hover:bg-[#2c2b27]' : 'border-slate-200 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-650 hover:bg-blue-750 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
