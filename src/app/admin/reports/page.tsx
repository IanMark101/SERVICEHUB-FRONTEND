"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileImage,
  Loader2,
  MessageSquare,
  PhilippinePeso,
  RefreshCw,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import { apiCancelAdminBooking, apiListAdminBookings, apiListAdminPaymentAttempts, apiListCompletionEscalations, apiListPaymentReconciliation, apiListReports, apiResolveCompletionEscalation, apiResolveReport, apiRetryPaymentReconciliation } from "../../../api/admin.api";
import { useApp } from "../../../context/AppContext";
import { getSocket } from "../../../lib/socket";
import { useToast } from "../../../components/ui/Toast";

type ResolutionAction = "warn" | "trust_deduct" | "suspend" | "ban" | "approve_refund" | "release_provider_and_complete" | "dismiss";

interface Party {
  id: string;
  name: string;
  trustScore: number;
  verificationStatus: string;
}

interface CaseMessage {
  id: string;
  senderId: string;
  content: string;
  text?: string;
  imageUrl?: string | null;
  isSystem: boolean;
  createdAt: string;
}

interface ReportCase {
  id: string;
  reason: string;
  description: string;
  evidenceUrl?: string | null;
  status: string;
  createdAt: string;
  reporter: Party;
  reportedUser: Party;
  booking: {
    id: string;
    seekerId: string;
    providerId: string;
    title: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    scheduledDate?: string | null;
    scheduledTime?: string | null;
    messages: CaseMessage[];
    escalatedCancellation?: {
      id: string;
      reason?: string | null;
      providerNote?: string | null;
    } | null;
  };
}

interface CompletionEscalationCase {
  id: string;
  reason: string;
  createdAt: string;
  booking: {
    id: string;
    paymentMethod: string;
    agreedAmount: number | string;
    seeker: { name: string };
    provider: { name: string };
    service?: { title: string } | null;
  } | null;
}

interface AdminBookingItem {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  agreedAmount?: number | string | null;
  started: boolean;
  seeker: { name: string };
  provider: { name: string };
  service?: { title: string } | null;
  queue?: { status: string; position: number } | null;
}

interface AdminPaymentAttemptItem {
  id: string;
  amount: number | string;
  currency: string;
  paymentMethod: string;
  status: string;
  failureReason?: string | null;
  providerIntentId?: string | null;
  booking?: { id: string; status: string; paymentStatus: string } | null;
}

const ACTION_LABELS: Record<ResolutionAction, string> = {
  dismiss: "Dismiss report",
  warn: "Issue formal warning",
  trust_deduct: "Deduct 10 trust points",
  suspend: "Suspend account for 7 days",
  ban: "Permanently ban account",
  approve_refund: "Cancel booking and issue PayMongo refund",
  release_provider_and_complete: "Complete booking and release provider payment",
};

export default function AdminReportsPage() {
  const { isDark } = useApp();
  const { success, error: showError } = useToast();
  const [cases, setCases] = useState<ReportCase[]>([]);
  const [completionEscalations, setCompletionEscalations] = useState<CompletionEscalationCase[]>([]);
  const [paymentReconciliation, setPaymentReconciliation] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<AdminBookingItem[]>([]);
  const [recentPaymentAttempts, setRecentPaymentAttempts] = useState<AdminPaymentAttemptItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReportCase | null>(null);
  const [action, setAction] = useState<ResolutionAction>("dismiss");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const [response, escalationResponse, paymentResponse, bookingsResponse, attemptsResponse] = await Promise.all([
        apiListReports({ page, limit: 10 }),
        apiListCompletionEscalations({ page: 1, limit: 50 }),
        apiListPaymentReconciliation(),
        apiListAdminBookings({ page: 1, limit: 10 }),
        apiListAdminPaymentAttempts({ page: 1, limit: 10 }),
      ]);
      setCases(response.data || []);
      setCompletionEscalations(escalationResponse.data || []);
      setPaymentReconciliation(paymentResponse.data || []);
      setRecentBookings(bookingsResponse.data || []);
      setRecentPaymentAttempts(attemptsResponse.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
      setLoadError("");
    } catch (cause: any) {
      setLoadError(cause.response?.data?.error || cause.message || "Unable to load moderation cases.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const resolveCompletion = async (item: CompletionEscalationCase, action: 'release_provider_and_complete' | 'dismiss') => {
    const resolution = window.prompt(action === 'release_provider_and_complete'
      ? 'Explain why the booking should be completed and provider payment released:'
      : 'Explain why this escalation is dismissed:');
    if (!resolution || resolution.trim().length < 3) return;
    try {
      await apiResolveCompletionEscalation(item.id, action, resolution.trim());
      success('Escalation resolved', 'The decision was recorded in the administrator audit log.');
      await loadCases();
    } catch (cause: any) {
      showError('Resolution failed', cause.response?.data?.error || cause.message);
    }
  };

  useEffect(() => void loadCases(), [loadCases]);
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("ADMIN_MODERATION_CHANGED", loadCases);
    return () => { socket.off("ADMIN_MODERATION_CHANGED", loadCases); };
  }, [loadCases]);

  const submitResolution = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || notes.trim().length < 3) return;
    setSubmitting(true);
    try {
      await apiResolveReport(selected.id, action, notes.trim());
      success("Case resolved", "The action was recorded and both parties were notified.");
      setSelected(null);
      setNotes("");
      setAction("dismiss");
      await loadCases();
    } catch (cause: any) {
      showError("Resolution failed", cause.response?.data?.error || cause.message);
    } finally {
      setSubmitting(false);
    }
  };

  const surface = isDark ? "bg-[#22211e] border-neutral-800 text-[#f2efe9]" : "bg-white border-slate-200 text-slate-800";
  const mutedSurface = isDark ? "bg-[#1c1b18] border-neutral-800" : "bg-slate-50 border-slate-200";

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border p-5 ${surface}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-red-600" />
              <h3 className="text-base font-extrabold">Moderation Case Queue</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Reports and escalated cancellations are reviewed here as one case file.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700">
              {total} open {total === 1 ? "case" : "cases"}
            </span>
            <button onClick={loadCases} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>
      </section>

      {completionEscalations.length > 0 && (
        <section className={`rounded-2xl border p-5 ${surface}`}>
          <h3 className="text-sm font-extrabold">Completion escalations</h3>
          <p className="mt-1 text-xs text-slate-500">Provider requests submitted after the 72-hour seeker response window.</p>
          <div className="mt-4 space-y-3">
            {completionEscalations.map((item) => (
              <div key={item.id} className={`rounded-xl border p-4 ${mutedSurface}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold">{item.booking?.service?.title || 'Service engagement'}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{item.booking?.provider.name} · Provider / {item.booking?.seeker.name} · Seeker</p>
                    <p className="mt-2 text-xs">{item.reason}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => resolveCompletion(item, 'dismiss')} className="rounded-lg border px-3 py-2 text-[10px] font-bold">Dismiss</button>
                    <button onClick={() => resolveCompletion(item, 'release_provider_and_complete')} className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white">Complete and release</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {paymentReconciliation.length > 0 && (
        <section className={`rounded-2xl border p-5 ${surface}`}>
          <h3 className="text-sm font-extrabold">Payment reconciliation required</h3>
          <p className="mt-1 text-xs text-slate-500">Captured Test Mode payments that could not be booked and still need a confirmed refund.</p>
          <div className="mt-4 space-y-3">
            {paymentReconciliation.map((attempt) => (
              <div key={attempt.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${mutedSurface}`}>
                <div>
                  <p className="text-xs font-extrabold">₱{Number(attempt.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })} · {attempt.paymentMethod.toUpperCase()}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{attempt.failureReason || 'Captured payment requires reconciliation'} · Attempt {attempt.id.slice(0, 10)}</p>
                </div>
                <button onClick={async () => {
                  try { await apiRetryPaymentReconciliation(attempt.id); success('Refund retried', 'The reconciliation state was refreshed.'); await loadCases(); }
                  catch (cause: any) { showError('Refund retry failed', cause.response?.data?.error || cause.message); }
                }} className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-bold text-white">Retry refund</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`rounded-2xl border p-5 ${surface}`}>
        <h3 className="text-sm font-extrabold">Recent booking operations</h3>
        <p className="mt-1 text-xs text-slate-500">Lifecycle, payment, and queue state needed for moderation and reconciliation.</p>
        <div className="mt-4 space-y-2">
          {recentBookings.length === 0 ? <p className="text-xs text-slate-400">No bookings found.</p> : recentBookings.map((booking) => (
            <div key={booking.id} className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${mutedSurface}`}>
              <div>
                <p className="text-xs font-extrabold">{booking.service?.title || "Service engagement"} · ₱{Number(booking.agreedAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                <p className="mt-1 text-[10px] text-slate-500">{booking.seeker.name} → {booking.provider.name} · {booking.status.replace(/_/g, " ")} · {booking.paymentStatus.replace(/_/g, " ")} · {booking.paymentMethod}{booking.queue ? ` · Queue ${booking.queue.position} (${booking.queue.status})` : " · No queue"}</p>
              </div>
              {!booking.started && ["PENDING_APPROVAL", "WAITING", "ACCEPTED"].includes(booking.status) && (
                <button onClick={async () => {
                  const reason = window.prompt("Explain why this unstarted booking must be cancelled:");
                  if (!reason || reason.trim().length < 3) return;
                  try { await apiCancelAdminBooking(booking.id, reason.trim()); success("Booking cancelled", "Queue and payment reconciliation were applied and audited."); await loadCases(); }
                  catch (cause: any) { showError("Cancellation failed", cause.response?.data?.error || cause.message); }
                }} className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-[10px] font-bold text-white">Cancel and reconcile</button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border p-5 ${surface}`}>
        <h3 className="text-sm font-extrabold">Recent PayMongo Test Mode attempts</h3>
        <p className="mt-1 text-xs text-slate-500">Safe operational identifiers and state only; credentials and client secrets are never returned.</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {recentPaymentAttempts.length === 0 ? <p className="text-xs text-slate-400">No payment attempts found.</p> : recentPaymentAttempts.map((attempt) => (
            <div key={attempt.id} className={`rounded-xl border p-3 ${mutedSurface}`}>
              <p className="text-xs font-extrabold">₱{Number(attempt.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} {attempt.currency} · {attempt.status.replace(/_/g, " ")}</p>
              <p className="mt-1 text-[10px] text-slate-500">{attempt.paymentMethod.toUpperCase()} · Attempt {attempt.id.slice(0, 10)}{attempt.providerIntentId ? ` · Intent ${attempt.providerIntentId.slice(0, 12)}` : ""}</p>
              {attempt.failureReason && <p className="mt-2 text-[10px] text-red-600">{attempt.failureReason}</p>}
            </div>
          ))}
        </div>
      </section>

      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-red-600" /></div>
      ) : cases.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center ${surface}`}>
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <h4 className="mt-3 text-sm font-extrabold">Moderation queue is clear</h4>
          <p className="mt-1 text-xs text-slate-500">There are no unresolved reports or escalated cancellations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <article key={item.id} className={`overflow-hidden rounded-2xl border shadow-sm ${surface}`}>
                <div className="border-b border-slate-100 p-5 dark:border-neutral-800">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex gap-3">
                      <span className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-950/30"><AlertTriangle className="h-4 w-4" /></span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold">{item.booking.title}</h4>
                          {item.booking.escalatedCancellation && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">Escalated cancellation</span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">{item.reason.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p>Case {item.id.slice(0, 10)}</p>
                      <p>{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[["Reporter", item.reporter], ["Reported user", item.reportedUser]].map(([label, party]) => {
                        const person = party as Party;
                        return (
                          <div key={label as string} className={`rounded-xl border p-3 ${mutedSurface}`}>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label as string}</p>
                            <p className="mt-1 text-xs font-extrabold">{person.name}</p>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Trust {person.trustScore}/100</span>
                              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {person.verificationStatus.replace(/_/g, " ")}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Reported issue</p>
                      <p className="mt-1 text-xs leading-5">{item.description}</p>
                    </div>
                    {item.booking.escalatedCancellation && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <p><strong>Cancellation reason:</strong> {item.booking.escalatedCancellation.reason || "Not supplied"}</p>
                        <p className="mt-1"><strong>Provider response:</strong> {item.booking.escalatedCancellation.providerNote || "Not supplied"}</p>
                      </div>
                    )}
                    {item.evidenceUrl && (
                      <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-neutral-700">
                        <FileImage className="h-4 w-4" /> Open submitted evidence
                      </a>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className={`grid grid-cols-2 gap-3 rounded-xl border p-3 text-xs ${mutedSurface}`}>
                      <div><p className="text-[9px] font-bold uppercase text-slate-400">Booking</p><p className="mt-1 font-bold">{item.booking.status.replace(/_/g, " ")}</p></div>
                      <div><p className="text-[9px] font-bold uppercase text-slate-400">Payment</p><p className="mt-1 font-bold">{item.booking.paymentStatus.replace(/_/g, " ")}</p></div>
                      <div className="flex items-center gap-1.5"><PhilippinePeso className="h-3.5 w-3.5 text-red-600" /> <span className="font-bold">{item.booking.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-red-600" /> <span>{item.booking.scheduledDate || "No schedule"} {item.booking.scheduledTime || ""}</span></div>
                      <div className="col-span-2 text-[10px] text-slate-500">Method: {item.booking.paymentMethod}</div>
                    </div>

                    <button onClick={() => setExpandedId(expanded ? null : item.id)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs font-bold ${mutedSurface}`}>
                      <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-red-600" /> Booking chat ({item.booking.messages.length})</span>
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expanded && (
                      <div className={`max-h-72 space-y-2 overflow-y-auto rounded-xl border p-3 ${mutedSurface}`}>
                        {item.booking.messages.length === 0 ? <p className="py-6 text-center text-xs text-slate-400">No messages for this booking.</p> : item.booking.messages.map((message) => (
                          <div key={message.id} className={`rounded-xl border p-2.5 text-xs ${message.isSystem ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"}`}>
                            <div className="mb-1 flex justify-between text-[9px] font-bold text-slate-400"><span>{message.senderId === item.reporter.id ? item.reporter.name : item.reportedUser.name}</span><span>{new Date(message.createdAt).toLocaleString()}</span></div>
                            <p className="whitespace-pre-wrap leading-5">{message.text || message.content}</p>
                            {message.imageUrl && <a className="mt-1 block font-bold text-red-600" href={message.imageUrl} target="_blank" rel="noreferrer">View attachment</a>}
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={() => { setSelected(item); setNotes(""); setAction("dismiss"); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-red-700">
                      <Scale className="h-4 w-4" /> Review and resolve
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
          <span className="font-bold">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <form onSubmit={submitResolution} className={`w-full max-w-lg rounded-2xl border shadow-2xl ${surface}`}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-neutral-800">
              <div><h3 className="text-sm font-extrabold">Resolve moderation case</h3><p className="mt-1 text-[10px] text-slate-500">Decision applies once and is recorded in the Admin audit log.</p></div>
              <button type="button" onClick={() => setSelected(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Resolution action
                <select value={action} onChange={(event) => setAction(event.target.value as ResolutionAction)} className={`mt-1.5 w-full rounded-xl border p-3 text-xs normal-case ${mutedSurface}`}>
                  {(Object.keys(ACTION_LABELS) as ResolutionAction[]).map((value) => (
                    <option key={value} value={value}>{ACTION_LABELS[value]}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Decision explanation
                <textarea required minLength={3} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="State the evidence considered and explain the final decision..." className={`mt-1.5 w-full resize-none rounded-xl border p-3 text-xs normal-case leading-5 ${mutedSurface}`} />
              </label>
              {action === "approve_refund" && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-800">This submits a real refund through PayMongo and only applies to held online payments.</p>}
              {action === "release_provider_and_complete" && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] leading-4 text-emerald-800">This completes the disputed booking. Online funds enter the provider ledger; cash is recorded only as externally confirmed.</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 p-5 dark:border-neutral-800">
              <button type="button" onClick={() => setSelected(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Cancel</button>
              <button disabled={submitting || notes.trim().length < 3} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirm resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
