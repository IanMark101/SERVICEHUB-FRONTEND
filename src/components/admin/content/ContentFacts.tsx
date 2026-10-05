import type { ContentItem, ContentSnapshot } from '@/api/contentWorkspace.api';

export const contentTypeLabel = (type: string) => type === 'SERVICE_LISTING' ? 'Provider service' : 'Seeker request';
export const contentDate = (value: string) => new Date(value).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const contentMoney = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(value);
export function ContentFacts({ item }: { item: ContentItem | ContentSnapshot }) {
  return <dl className="cw-facts">
    <div><dt>Category</dt><dd>{item.category}</dd></div>
    {item.price !== null && <div><dt>Price</dt><dd>{contentMoney(item.price)}{item.priceType === 'PER_HOUR' ? ' / hour' : item.priceType === 'PER_DAY' ? ' / day' : item.priceType === 'PER_PROJECT' ? ' / project' : ''}</dd></div>}
    {item.budgetMin !== null && item.budgetMax !== null && <div><dt>Budget</dt><dd>{contentMoney(item.budgetMin)}{item.budgetMin !== item.budgetMax ? ` – ${contentMoney(item.budgetMax)}` : ''}</dd></div>}
    {item.urgency && <div><dt>When needed</dt><dd>{item.urgency}</dd></div>}
  </dl>;
}
