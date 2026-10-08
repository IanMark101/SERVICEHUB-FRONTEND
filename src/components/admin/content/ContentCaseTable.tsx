import type { ContentCase, ContentItem } from '@/api/contentWorkspace.api';
import { ReviewCell, ReviewTable } from '../ReviewQueue';
import { CONTENT_DECISIONS, CONTENT_PENALTIES } from './ContentCaseWorkroom';
import { contentDate, contentTypeLabel, contentStateLabel } from './ContentFacts';

export default function ContentCaseTable({ cases, content, view, onCase, onContent }: {
  cases: ContentCase[]; content: ContentItem[]; view: 'review' | 'content' | 'history';
  onCase: (id: string) => void; onContent: (item: ContentItem) => void;
}) {
  const stateColumn = view === 'content' ? 'Marketplace visibility' : view === 'history' ? 'Admin decision' : 'Case status';
  return <ReviewTable columns={['Content', view === 'content' ? 'Content owner' : 'People involved', stateColumn, 'Action']} label={view === 'content' ? 'Marketplace content records' : 'Content cases'}>
    {view === 'content' ? content.map(item => <tr key={`${item.contentType}:${item.id}`}>
      <ReviewCell label="Content"><span className="review-type">{contentTypeLabel(item.contentType)}</span><h3 className="review-title">{item.title}</h3><p className="review-meta">{item.category}</p><p className="review-meta"><time>{contentDate(item.updatedAt)}</time></p></ReviewCell>
      <ReviewCell label="Content owner"><span>{item.owner.name}</span></ReviewCell>
      <ReviewCell label="Marketplace visibility"><span className="review-status">{item.visibility}</span><p className="review-meta">{contentStateLabel(item.status, item.moderationReasonCode === 'ADMIN_REMOVED')}</p></ReviewCell>
      <ReviewCell label="Action" action><button type="button" className="review-action" onClick={() => onContent(item)}>Inspect content</button></ReviewCell>
    </tr>) : cases.map(item => <tr key={item.id}>
      <ReviewCell label="Content"><span className="review-type">{item.caseType === 'REPORT' ? 'Content report' : 'Owner appeal'}</span><h3 className="review-title">{item.title}</h3><p className="review-meta">{contentTypeLabel(item.contentType)}{item.category ? ` · ${item.category}` : ''}</p><p className="review-meta"><time>{contentDate(item.decidedAt || item.createdAt)}</time></p></ReviewCell>
      <ReviewCell label="People involved"><div className="review-person"><small>{item.caseType === 'REPORT' ? 'Reported by' : 'Appealed by'}</small><span>{item.submitter.name}</span></div>{item.ownerName && <div className="review-person"><small>Content owner</small><span>{item.ownerName}</span></div>}</ReviewCell>
      <ReviewCell label={stateColumn}>{view === 'history' ? <><span className="review-status">{item.decision ? CONTENT_DECISIONS[item.decision].title : 'Legacy explanation only'}</span>{item.penalty && item.penalty !== 'none' && <p className="review-meta">Account action: {CONTENT_PENALTIES[item.penalty]}</p>}</> : <span className="review-status review-status-open">Needs review</span>}</ReviewCell>
      <ReviewCell label="Action" action><button type="button" className="review-action" onClick={() => onCase(item.id)}>{view === 'history' ? 'View outcome' : 'Review case'}</button></ReviewCell>
    </tr>)}
  </ReviewTable>;
}
