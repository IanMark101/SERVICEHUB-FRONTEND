import { formatDistance } from '../../../lib/location';
import { Alarm, ArrowRight, CalendarBlank, CheckCircle, Eye, ShieldCheck } from '@phosphor-icons/react';
import type { JobRequest } from '../../../types';
import { getRequestPaymentMethods } from '../../../lib/paymentUtils';
import { requestUrgencyRank } from '../../../lib/requestUrgency';
import UserAvatar from '../../ui/UserAvatar';
import TrustScoreBadge from '../../ui/TrustScoreBadge';
import MarketplaceRating from '../../ui/MarketplaceRating';
import ContentCaseAction from '../../moderation/ContentCaseAction';
import { Banknote, Smartphone } from 'lucide-react';
import { formatUrgencyDisplay } from './browseJobs.utils';

interface JobRequestCardProps {
  request: JobRequest;
  proposalCount: number;
  isOwned: boolean;
  offerState: 'accepted' | 'submitted' | null;
  isDark: boolean;
  onProfile: (reviews?: boolean) => void;
  onDetails: () => void;
  onSendOffer: () => void;
}

export default function JobRequestCard({ request, proposalCount, isOwned, offerState, isDark, onProfile, onDetails, onSendOffer }: JobRequestCardProps) {
  const methods = getRequestPaymentMethods(request);
  const urgency = requestUrgencyRank(request.urgency);
  return (
    <article data-marketplace-card aria-label={request.title} className={`marketplace-card group relative min-w-0 rounded-2xl p-4 sm:p-5 border transition-colors duration-200 flex flex-col justify-between h-full ${isDark ? 'bg-charcoal-surface border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'}`}>
      <div className="marketplace-card-body min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className={`max-w-full break-words px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${isDark ? 'text-neutral-300 bg-charcoal/80 border-neutral-700/80' : 'text-ink-muted bg-slate-100 border-slate-200/80'}`}>{request.category}</span>
            {isOwned && <span className="text-[10px] text-ink-muted">(Your request)</span>}
          </div>
          <span className="text-[11px] text-ink-muted">{proposalCount} proposal{proposalCount === 1 ? '' : 's'}</span>
        </div>
        <div className="space-y-1">
          <h3 className={`min-h-10 uppercase font-semibold text-sm leading-snug line-clamp-2 break-words [overflow-wrap:anywhere] ${isDark ? 'text-white' : 'text-ink'}`}>{request.title}</h3>

        </div>
        <div className="marketplace-identity flex flex-wrap items-center justify-between gap-2">
          <button type="button" disabled={!request.seekerId} onClick={() => onProfile()} aria-label={`View ${request.seekerName}'s profile`} title={`View ${request.seekerName}'s profile`} className="group/author flex flex-1 min-w-0 items-center gap-2.5 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:cursor-default">
            <UserAvatar src={request.seekerAvatar} name={request.seekerName} alt="" size={36} role="seeker" className="shrink-0 ring-1 ring-slate-200 dark:ring-neutral-700" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className={`truncate text-xs font-semibold leading-tight group-hover/author:text-emerald-700 dark:group-hover/author:text-emerald-400 ${isDark ? 'text-white' : 'text-ink'}`}>{request.seekerName}</span>
                {request.seekerVerificationStatus === 'APPROVED' && <span title="Verified resident" aria-label="Verified resident" className="inline-flex shrink-0 text-emerald-700 dark:text-emerald-400"><ShieldCheck size={14} weight="fill" aria-hidden="true" /></span>}
              </div>
              <span className="mt-1 block"><TrustScoreBadge score={request.seekerTrustScore} /></span>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" disabled={!request.seekerId} onClick={() => onProfile(true)} aria-label={`View service seeker reviews for ${request.seekerName}`} title="View seeker reviews" className="shrink-0 rounded transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <MarketplaceRating rating={request.seekerRating} reviewCount={request.seekerReviewCount} context="seeker" />
            </button>
            {!isOwned && <ContentCaseAction caseType="REPORT" contentType="SERVICE_REQUEST" resourceId={request.id} label="Report request" variant="icon" isDark={isDark} />}
          </div>
        </div>
        <div className="marketplace-value pt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 dark:border-neutral-800">
          <div className="flex flex-wrap items-baseline gap-1"><span className={`text-base font-bold tabular-nums ${isDark ? 'text-white' : 'text-ink'}`}>{request.targetServiceId && !request.budget ? 'Quote required' : `₱${request.budget.toLocaleString()}`}</span><span className="text-xs text-ink-muted">{request.targetServiceId ? 'listed rate' : 'budget'}</span></div>
          <span className="inline-flex items-center gap-1 text-[10px] text-ink-muted"><CalendarBlank size={14} aria-hidden="true" />{request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : 'Recently posted'}</span>
        </div>
          <p className="min-h-10 text-xs line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere] text-ink-muted">{request.description}</p>
        <div className={`inline-flex max-w-full items-start gap-1 text-[11px] leading-relaxed ${urgency === 4 ? 'text-red-700 dark:text-red-400' : urgency >= 2 ? 'text-amber-800 dark:text-amber-400' : 'text-ink-muted'}`}><Alarm size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="break-words [overflow-wrap:anywhere]">Needed: {formatUrgencyDisplay(request.urgency)}</span></div>
        {request.locationLabel && <p className="text-xs text-ink-muted break-words">{request.locationLabel}{request.distanceKm != null && <> · {formatDistance(request.distanceKm)}</>}</p>}
        {!!request.transportationFee && <p className="text-xs text-ink-muted">Additional travel budget: ₱{request.transportationFee.toLocaleString()}</p>}
        {request.targetServiceId && <p className="text-[11px] text-ink-muted">Requested from your listing</p>}
        <div className="space-y-1.5 pb-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">Payment methods</p>
          {!request.paymentMethods && !request.preferredPaymentMethod ? <p className="text-[11px] text-ink-muted">Payment methods not specified</p> : <div className="flex flex-wrap gap-1.5">
            {([['cash', 'On-site Cash', Banknote], ['gcash', 'GCash · Test Mode', Smartphone]] as const).filter(([key]) => methods[key]).map(([key, label, Icon]) => <span key={key} className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] text-ink-muted ${isDark ? 'bg-charcoal/80 border-neutral-700/80' : 'bg-slate-50 border-slate-200/80'}`}><Icon size={12} aria-hidden="true" />{label}</span>)}
          </div>}
        </div>
      </div>
      <div className="marketplace-card-actions mt-3.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
        <div className="flex gap-2">
          <button type="button" onClick={onDetails} aria-label={`Inspect ${request.title} details`} className={`min-h-11 px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${isOwned ? 'flex-1' : 'shrink-0'} ${isDark ? 'border-neutral-700 bg-charcoal/50 text-neutral-200 hover:bg-charcoal' : 'border-slate-200 bg-slate-50 text-ink-secondary hover:bg-slate-100'}`}><Eye size={14} aria-hidden="true" />Details</button>
          {!isOwned && (offerState ? <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"><CheckCircle size={14} aria-hidden="true" />{offerState === 'accepted' ? 'Offer accepted' : 'Proposal Submitted'}</span> : <button type="button" onClick={onSendOffer} className="flex-1 min-h-11 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl marketplace-primary text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><span>Send Offer</span><ArrowRight size={14} aria-hidden="true" /></button>)}
        </div>
        {isOwned && <p className="mt-2 text-center text-[10px] text-ink-muted">Your own request · cannot send an offer</p>}
      </div>
    </article>
  );
}
