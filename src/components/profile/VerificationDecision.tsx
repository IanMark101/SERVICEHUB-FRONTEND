'use client';

import { CheckCircle2, Clock, Shield, XCircle } from 'lucide-react';
import type { VerificationStatusData } from '../../api/verifications.api';

interface VerificationDecisionProps {
  verification: VerificationStatusData | null;
}

export default function VerificationDecision({ verification }: VerificationDecisionProps) {
  const status = verification?.status;
  const approved = status === 'APPROVED';
  const rejected = status === 'REJECTED';
  const pending = status === 'PENDING_REVIEW';
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : pending ? Clock : Shield;
  const title = approved ? 'Verification approved' : rejected ? 'Verification not approved' : pending ? 'Verification under review' : 'Verification not submitted';
  const description = approved
    ? 'Your identity and residency verification is approved.'
    : rejected ? 'Read the reason below, correct the documents, and resubmit for review.'
    : pending ? 'Your documents are awaiting review. You do not need to submit them again.'
    : 'Submit documents to verify your identity and residency.';
  const reviewedAt = verification?.reviewedAt ? new Date(verification.reviewedAt) : null;
  const validDate = reviewedAt && !Number.isNaN(reviewedAt.getTime());
  const message = verification?.adminNotes?.trim();

  return (
    <div className="mb-6 space-y-4 text-[color:var(--workspace-ink)]">
      <div className="flex items-start gap-3" role="status">
        <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${approved ? 'text-emerald-700 dark:text-emerald-300' : rejected ? 'text-rose-700 dark:text-rose-300' : 'text-[color:var(--workspace-muted)]'}`} />
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="max-w-prose text-sm leading-6 text-[color:var(--workspace-muted)]">{description}</p>
          {validDate && <p className="text-xs leading-5 text-[color:var(--workspace-muted)]">Reviewed <time dateTime={verification!.reviewedAt!}>{reviewedAt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</time></p>}
        </div>
      </div>
      {(approved || rejected) && message && (
        <div className="border-t border-[color:var(--workspace-border)] pt-4">
          <h4 className="mb-2 text-sm font-semibold">{rejected ? 'Reason for rejection' : 'Message from admin'}</h4>
          <p className="max-w-prose whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{message}</p>
        </div>
      )}
      {rejected && !message && <p className="text-sm leading-6 text-[color:var(--workspace-muted)]">No review message is available. Contact support if you need clarification before resubmitting.</p>}
    </div>
  );
}
