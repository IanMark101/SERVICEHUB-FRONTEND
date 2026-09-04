import { JobEngagement } from '../../../types';
import { SeekerActivitySort, SeekerActivityTab } from './types';

export function countSeekerActivityStatus(
  engagements: JobEngagement[],
  status: JobEngagement['status'] | 'action_required'
) {
  if (status === 'action_required') {
    return engagements.filter((engagement) => engagement.status === 'awaiting_seeker_approval').length;
  }

  return engagements.filter((engagement) => engagement.status === status).length;
}

interface FilterSeekerActivityOptions {
  activeTab: SeekerActivityTab;
  engagements: JobEngagement[];
  searchQuery: string;
  sortBy: SeekerActivitySort;
  categoryForEngagement: (engagement: JobEngagement) => string;
}

export function filterSeekerActivityEngagements({
  activeTab,
  engagements,
  searchQuery,
  sortBy,
  categoryForEngagement
}: FilterSeekerActivityOptions) {
  let list = engagements;

  switch (activeTab) {
    case 'action_required':
      list = engagements.filter((engagement) => engagement.status === 'awaiting_seeker_approval');
      break;
    case 'pending':
      list = engagements.filter((engagement) => engagement.status === 'pending_provider');
      break;
    case 'active':
      list = engagements.filter((engagement) => engagement.status === 'in_progress');
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
