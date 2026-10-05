import { JobEngagement } from '../../../types';
import { SeekerActivitySort, SeekerActivityTab } from './types';

export function countSeekerActivityStatus(
  engagements: JobEngagement[],
  status: JobEngagement['status'] | 'action_required' | 'before_work',
  currentUserId?: string,
) {
  if (status === 'action_required') {
    return engagements.filter((engagement) => seekerNeedsAction(engagement, currentUserId)).length;
  }

  if (status === 'before_work') return engagements.filter((engagement) => engagement.status === 'pending_provider' || (engagement.status === 'in_progress' && !engagement.started)).length;

  if (status === 'in_progress') return engagements.filter((engagement) => engagement.status === 'in_progress' && !!engagement.started).length;

  return engagements.filter((engagement) => engagement.status === status).length;
}

export function seekerNeedsAction(engagement: JobEngagement, currentUserId?: string) {
  const cancellation = engagement.cancellationRequests?.[0];
  return engagement.status === 'awaiting_seeker_approval' || !!(
    currentUserId && cancellation && cancellation.requestedBy !== currentUserId &&
    (cancellation.status === 'PENDING' || (cancellation.status === 'UNDER_REVIEW' && !cancellation.adminId))
  );
}

interface FilterSeekerActivityOptions {
  activeTab: SeekerActivityTab;
  engagements: JobEngagement[];
  searchQuery: string;
  sortBy: SeekerActivitySort;
  categoryForEngagement: (engagement: JobEngagement) => string;
  currentUserId?: string;
}

export function filterSeekerActivityEngagements({
  activeTab,
  engagements,
  searchQuery,
  sortBy,
  categoryForEngagement,
  currentUserId,
}: FilterSeekerActivityOptions) {
  let list = engagements;

  switch (activeTab) {
    case 'action_required':
      list = engagements.filter((engagement) => seekerNeedsAction(engagement, currentUserId));
      break;
    case 'pending':
      list = engagements.filter((engagement) => engagement.status === 'pending_provider' || (engagement.status === 'in_progress' && !engagement.started));
      break;
    case 'active':
      list = engagements.filter((engagement) => engagement.status === 'in_progress' && !!engagement.started);
      break;
    case 'waiting':
      list = engagements.filter((engagement) => engagement.status === 'queued');
      break;
    case 'disputed':
      list = engagements.filter((engagement) => engagement.status === 'disputed');
      break;
    case 'completed':
      list = engagements.filter((engagement) => engagement.status === 'completed');
      break;
    case 'canceled':
      list = engagements.filter((engagement) => engagement.status === 'canceled');
      break;
    default:
      list = engagements;
  }

  const normalizedQuery = searchQuery.toLowerCase();
  if (searchQuery.trim() !== '') {
    list = list.filter((engagement) =>
      engagement.title.toLowerCase().includes(normalizedQuery) ||
      engagement.providerName.toLowerCase().includes(normalizedQuery) ||
      categoryForEngagement(engagement).toLowerCase().includes(normalizedQuery)
    );
  }

  return [...list].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    if (sortBy === 'newest') return dateB - dateA;
    if (sortBy === 'oldest') return dateA - dateB;
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
    return 0;
  });
}
