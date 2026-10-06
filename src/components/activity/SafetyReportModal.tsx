"use client";

import FormSelect from '../ui/FormSelect';
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FileImage, Loader2, ShieldAlert, X } from "lucide-react";
import { apiSubmitSafetyReport, apiUploadBookingEvidence } from "../../api/bookings.api";
import { getApiErrorMessage } from "../../lib/api/errors";
import { getEngagementBookingId, getSafetyReportBlockReason } from "../../lib/bookingActions";
import type { JobEngagement } from "../../types";

type ReportReason = "POOR_SERVICE_QUALITY" | "INCOMPLETE_SERVICE" | "SCAM_OR_FRAUD" | "INAPPROPRIATE_BEHAVIOR" | "OVERPRICING" | "NO_SHOW";

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate or unsafe behavior" },
  { value: "SCAM_OR_FRAUD", label: "Suspected scam or fraud" },
  { value: "NO_SHOW", label: "No-show" },
  { value: "POOR_SERVICE_QUALITY", label: "Service quality concern" },
  { value: "INCOMPLETE_SERVICE", label: "Incomplete service" },
  { value: "OVERPRICING", label: "Pricing concern" },
];

interface SafetyReportModalProps {
  engagement: Pick<JobEngagement, 'id' | 'bookingId' | 'bookingStatus' | 'title' | 'providerName' | 'seekerName'> | null;
  targetRole: "provider" | "seeker";
  isDark: boolean;
  onClose: () => void;
  onSubmitted: (created: boolean) => void | Promise<void>;
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The evidence image could not be read."));
    reader.readAsDataURL(file);
  });
}

type OpenSafetyReportModalProps = Omit<SafetyReportModalProps, "engagement"> & {
  engagement: NonNullable<SafetyReportModalProps["engagement"]>;
};

export default function SafetyReportModal(props: SafetyReportModalProps) {
  if (!props.engagement) return null;
  return <SafetyReportDialog key={`${props.engagement.id}:${props.targetRole}`} {...props} engagement={props.engagement} />;
}

function SafetyReportDialog({ engagement, targetRole, isDark, onClose, onSubmitted }: OpenSafetyReportModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLFormElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [reason, setReason] = useState<ReportReason>("INAPPROPRIATE_BEHAVIOR");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetDraft = useCallback(() => {
    setReason("INAPPROPRIATE_BEHAVIOR");
    setDescription("");
    setEvidence(null);
    setError("");
  }, []);

  const closeDialog = useCallback(() => {
    resetDraft();
    onClose();
  }, [onClose, resetDraft]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || []).filter((element) => element.offsetParent !== null);
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [closeDialog, submitting]);
  const targetName = targetRole === "provider" ? engagement.providerName : engagement.seekerName;
  const valid = description.trim().length >= 10;
  const bookingId = getEngagementBookingId(engagement);
  const blockedReason = getSafetyReportBlockReason(engagement);
  const accent = targetRole === "provider" ? "orange" : "emerald";
  const fieldFocus = accent === "orange" ? "focus:border-orange-500 focus:ring-orange-500/15" : "focus:border-emerald-500 focus:ring-emerald-500/15";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || submitting || blockedReason || !bookingId) return;
    setSubmitting(true);
    setError("");
    try {
      let evidenceStorageKey: string | undefined;
      if (evidence) {
        if (evidence.size > 5 * 1024 * 1024) throw new Error("Choose an evidence image smaller than 5 MB.");
        const uploaded = await apiUploadBookingEvidence(bookingId, await readImage(evidence));
        evidenceStorageKey = uploaded.data?.storageKey;
      }
      const response = await apiSubmitSafetyReport(bookingId, { reason, description: description.trim(), evidenceStorageKey });
      await onSubmitted(response.data?.created !== false);
      closeDialog();
    } catch (cause: unknown) {
      setError(getApiErrorMessage(cause, "The report could not be submitted. Check your connection and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <form ref={dialogRef} onSubmit={submit} className={`flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${isDark ? "border-neutral-800 bg-[#22211e] text-white" : "border-slate-200 bg-white text-ink"}`}>
        <div className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200 p-5 dark:border-neutral-800">
          <div className="flex items-start gap-3">
            <span className={`rounded-xl p-2.5 ${accent === "orange" ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"}`}>
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id={titleId} className="text-base font-extrabold">Report a safety or conduct concern</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted dark:text-ink-muted">Booking: {engagement.title} · Report concerns involving {targetName || `this ${targetRole}`}.</p>
            </div>
          </div>
          <button ref={closeButton} type="button" onClick={closeDialog} disabled={submitting} aria-label="Close report dialog" className="rounded-lg border border-slate-200 p-1.5 text-ink-muted transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"><X className="h-4 w-4" /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className={`rounded-xl border p-3 text-[11px] leading-5 ${isDark ? "border-neutral-700 bg-[#1c1b18] text-neutral-300" : "border-slate-200 bg-slate-50 text-ink-muted"}`}>
            This creates a private moderation case. It is separate from disputing completion or requesting cancellation, which have different payment consequences.
          </div>

          <label className="block text-xs font-bold">Concern category
            <FormSelect value={reason} onChange={(event) => setReason(event.target.value as ReportReason)} disabled={submitting} className={`mt-2 min-h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 ${isDark ? "border-neutral-700 bg-[#191919] focus:border-neutral-500 focus:ring-neutral-500/20" : `border-slate-300 bg-white ${fieldFocus}`}`}>
              {REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </FormSelect>
          </label>

          <label className="block text-xs font-bold">What happened?
            <textarea autoFocus rows={5} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} disabled={submitting} placeholder="Describe the incident, including what happened and when. Do not include passwords or payment credentials." className={`mt-2 w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-6 outline-none focus:ring-2 ${isDark ? "border-neutral-700 bg-[#191919] focus:border-neutral-500 focus:ring-neutral-500/20" : `border-slate-300 bg-white ${fieldFocus}`}`} />
            <span className="mt-1 flex justify-between text-[10px] font-normal text-ink-muted"><span>{valid ? "Ready to submit." : "Enter at least 10 characters."}</span><span>{description.length}/2000</span></span>
          </label>

          <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${isDark ? "border-neutral-700 hover:bg-neutral-800/60" : "border-slate-200 hover:bg-slate-50"}`}>
            <span className="flex min-w-0 items-center gap-3"><FileImage className="h-4 w-4 shrink-0 text-ink-muted" /><span className="min-w-0"><span className="block text-xs font-bold">Private evidence image <span className="font-normal text-ink-muted">(optional)</span></span><span className="block truncate text-[10px] text-ink-muted">{evidence ? evidence.name : "JPEG, PNG, or WebP · up to 5 MB"}</span></span></span>
            <span className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold dark:border-neutral-700">Choose file</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={submitting} onChange={(event) => { setError(""); setEvidence(event.target.files?.[0] || null); }} />
          </label>

          {(blockedReason || error) && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">{blockedReason || error}</div>}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-200 p-5 dark:border-neutral-800">
          <button type="button" onClick={closeDialog} disabled={submitting} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Cancel</button>
          <button type="submit" disabled={!valid || submitting || Boolean(blockedReason)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${accent === "orange" ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{submitting ? "Submitting report…" : "Submit private report"}
          </button>
        </div>
      </form>
    </div>
  );
}
