import type { Bid } from '../../types';
import { isOfferClosed, offerSituation } from '../../lib/offerStatus';
import ActivityProgressTimes, { isActivityTimestamp, type ActivityProgressTime } from './ActivityProgressTimes';

export default function OfferProgressHistory({ offer }: { offer: Bid }) {
  const rows: ActivityProgressTime[] = [{
    id: 'sent', label: 'Offer sent', actor: `Provider · ${offer.providerName}`,
    occurredAt: offer.createdAt, state: isActivityTimestamp(offer.createdAt) ? 'recorded' : 'missing',
  }];
  if (isOfferClosed(offer)) {
    rows.push({ id: 'decision', label: offerSituation(offer).title,
      occurredAt: offer.decisionAt, state: isActivityTimestamp(offer.decisionAt) ? 'recorded' : 'missing' });
  }
  return <ActivityProgressTimes label="Offer progress times" rows={rows} />;
}
