import { ReviewCell, ReviewTable } from '../ReviewQueue';
import { CASE_TYPES, CONCERNS, caseStatusLabel, dateLabel, money, stateLabel } from './labels';
import type { ModerationCase } from './types';

export default function BookingCaseTable({ items, history, onOpen }: { items: ModerationCase[]; history: boolean; onOpen: (key: string) => void }) {
  return <ReviewTable columns={['Case', 'Participants', 'Payment', 'Action']} label="Booking cases">
    {items.map(item => <tr key={`${item.source}:${item.id}`}>
      <ReviewCell label="Case">
        <span className="review-type">{CASE_TYPES[item.type]}</span>
        <h3 className="review-title">{item.booking.title}</h3>
        {!['CANCELLATION_ESCALATION', 'COMPLETION_ESCALATION'].includes(item.type) && <p className="review-meta">{CONCERNS[item.concern] || stateLabel(item.concern)}</p>}
        <p className="review-meta"><time dateTime={history && item.resolvedAt ? item.resolvedAt : item.createdAt}>{history && item.resolvedAt ? `Closed ${dateLabel(item.resolvedAt)}` : dateLabel(item.createdAt)}</time></p>
        <span className={`review-status ${['PENDING', 'UNDER_REVIEW'].includes(item.status) ? 'review-status-open' : ''}`}>{caseStatusLabel(item).replace(' — ', ' · ')}</span>
      </ReviewCell>
      <ReviewCell label="Participants">
        <div className="review-person"><small>Service seeker</small><span>{item.booking.seeker.name}</span></div>
        <div className="review-person"><small>Service provider</small><span>{item.booking.provider.name}</span></div>
      </ReviewCell>
      <ReviewCell label="Payment">
        <strong>{money(item.booking.amount)}</strong>
        <p className="review-meta">{item.booking.paymentMethod}</p>
        <p className="review-meta">{stateLabel(item.booking.paymentStatus)}</p>
        {item.resolutionOperation?.status === 'FAILED_RETRYABLE' && <span className="review-status review-status-open">Decision needs retry</span>}
      </ReviewCell>
      <ReviewCell label="Action" action><button type="button" className="review-action" onClick={() => onOpen(`${item.source}:${item.id}`)}>Open case</button></ReviewCell>
    </tr>)}
  </ReviewTable>;
}
