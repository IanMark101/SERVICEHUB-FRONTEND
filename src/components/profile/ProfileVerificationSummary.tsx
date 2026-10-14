import Link from 'next/link';
import { ArrowRight, Clock3, LockKeyhole, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ProfileVerificationSummaryProps {
  status?: string | null;
  isOwnProfile: boolean;
}

export default function ProfileVerificationSummary({ status, isOwnProfile }: ProfileVerificationSummaryProps) {
  const approved = status === 'APPROVED';
  const pending = status === 'PENDING_REVIEW' || status === 'PENDING';
  const rejected = status === 'REJECTED';
  const unverified = status === 'UNVERIFIED' || status === 'NOT_SUBMITTED';
  const unavailable = !approved && !pending && !rejected && !unverified;
  const needsAction = isOwnProfile && rejected;
  const tone = approved ? 'approved' : pending ? 'pending' : needsAction ? 'attention' : 'neutral';
  const Icon = approved ? ShieldCheck : pending ? Clock3 : needsAction ? ShieldAlert : Shield;
  const label = approved ? 'Verified' : pending ? 'Under review' : needsAction ? 'Action needed' : unavailable ? 'Unavailable' : 'Not verified';
  const title = approved ? 'Identity and residency verified'
    : pending ? 'Verification under review'
    : needsAction ? 'Your submission needs attention'
    : unavailable ? 'Verification status unavailable'
    : 'Identity and residency not yet verified';
  const description = approved
    ? isOwnProfile ? 'Your identity and residency verification is approved.' : 'This member’s identity and residency verification is approved.'
    : pending
      ? isOwnProfile ? 'Your documents are awaiting review. You do not need to submit them again.' : 'This member’s verification is awaiting review.'
      : needsAction ? 'Open Account Settings to read the review feedback and resubmit your documents.'
      : unavailable ? 'This profile’s verification status is not available right now.'
      : isOwnProfile ? 'Submit your identity and residency documents in Account Settings to begin verification.' : 'This member has not completed identity and residency verification.';
  const action = needsAction ? 'Review feedback' : unverified ? 'Start verification' : 'Manage verification';

  return (
    <section className="profile-section profile-verification-summary" aria-label="Verification status">
      <div className="profile-verification-summary__heading">
        <h2 className="text-lg font-bold">Verification status</h2>
        <span className="profile-verification-summary__badge" data-tone={tone}>{label}</span>
      </div>
      <div className="profile-verification-summary__body">
        <div className="profile-verification-summary__status">
          <span className="profile-verification-summary__icon" data-tone={tone} aria-hidden="true"><Icon size={23} strokeWidth={1.75} /></span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-6">{title}</h3>
            <p className="mt-1 max-w-prose text-sm leading-6 text-[color:var(--workspace-muted)]">{description}</p>
          </div>
        </div>
        {isOwnProfile && (
          <div className="profile-verification-summary__action">
            <Link href="/account/settings#verification" className="workspace-primary-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold">
              {action}<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <p className="mt-2 text-xs leading-5 text-[color:var(--workspace-muted)]">Documents and review details are in Account Settings.</p>
          </div>
        )}
      </div>
      <p className="profile-verification-summary__privacy">
        <LockKeyhole size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>Only verification status is shared on this profile. Identity documents and review messages remain private.</span>
      </p>
    </section>
  );
}
