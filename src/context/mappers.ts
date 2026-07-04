import {
  ServiceListing,
  JobRequest,
  Bid,
  JobEngagement,
  Transaction,
  Notification
} from '../types';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';

export function mapBookingToEngagement(b: any): JobEngagement {
  const title = b.service?.title || b.offer?.request?.title || b.directRequest?.service?.title || 'Job Engagement';
  const statusMap: Record<string, string> = {
    'WAITING': 'queued',
    'ONGOING': 'in_progress',
    'ACCEPTED': 'in_progress',
    'AWAITING_CONFIRMATION': 'awaiting_seeker_approval',
    'DISPUTED': 'disputed',
    'DECLINED': 'canceled',
    'CANCELED': 'canceled',
    'REMOVED': 'canceled',
    'COMPLETED': 'completed'
  };
  return {
    id: b.id,
    title,
    seekerId: b.seekerId,
    seekerName: b.seeker?.name || 'Seeker',
    providerId: b.providerId,
    providerName: b.provider?.name || 'Provider',
    providerAvatar: b.provider?.avatarUrl || DEFAULT_AVATAR,
    serviceId: b.serviceId || null,
    price: Number(b.directRequest?.agreedPrice || b.offer?.offeredPrice || b.service?.price || 0),
    status: (statusMap[b.status] || 'pending_provider') as JobEngagement['status'],
    paymentMethod: b.paymentMethod === 'GCash' ? 'GCash' : 'On-site Cash',
    createdAt: b.createdAt?.split('T')[0] || '',
    completedAt: b.updatedAt?.split('T')[0] || '',
    disputeReason: b.reports?.[0]?.description || '',
    started: b.started,
    cancellationRequests: b.cancellationRequests || []
  };
}

export function mapCompletedServiceToEngagement(cs: any): JobEngagement {
  const booking = cs.booking;
  const title = booking?.service?.title || booking?.offer?.request?.title || booking?.directRequest?.service?.title || 'Completed Job';
  return {
    id: cs.bookingId || cs.id,
    title,
    seekerId: cs.seekerId,
    seekerName: cs.seeker?.name || 'Seeker',
    providerId: cs.providerId,
    providerName: cs.provider?.name || 'Provider',
    providerAvatar: cs.provider?.avatarUrl || DEFAULT_AVATAR,
    serviceId: booking?.serviceId || null,
    price: Number(cs.finalPrice),
    status: 'completed',
    paymentMethod: booking?.paymentMethod === 'GCash' ? 'GCash' : 'On-site Cash',
    createdAt: cs.completedAt?.split('T')[0] || '',
    completedAt: cs.completedAt?.split('T')[0] || '',
    completedServiceId: cs.id,
    reviews: cs.reviews
  };
}

export function mapServiceToListing(item: any): ServiceListing {
  return {
    id: item.id,
    providerId: item.providerId || item.provider?.id,
    providerName: item.provider?.name || 'Provider',
    providerAvatar: item.provider?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: item.title,
    category: item.category?.name || 'General',
    description: item.description,
    price: Number(item.price),
    queueSize: item.queueEntries?.length || 0,
    isPaused: !item.isAvailable,
    proofOfSkillUrl: '',
    rating: item.provider?.trustScore ? item.provider.trustScore / 20 : 5.0,
  };
}

export function mapRequestToJobRequest(r: any): JobRequest {
  return {
    id: r.id,
    seekerId: r.seekerId || r.seeker?.id,
    seekerName: r.seeker?.name || 'Seeker',
    seekerAvatar: r.seeker?.avatarUrl || DEFAULT_AVATAR,
    title: r.title,
    category: r.category?.name || 'General',
    urgency: (r.urgency || 'medium') as 'low' | 'medium' | 'high',
    budget: Number(r.budgetMax || r.budgetMin || 0),
    description: r.description,
    status: r.status === 'OPEN' ? 'open' : r.status === 'IN_PROGRESS' ? 'filled' : 'open',
    createdAt: r.createdAt?.split('T')[0] || '',
  };
}

export function mapOfferToBid(o: any): Bid {
  return {
    id: o.id,
    requestId: o.requestId,
    providerId: o.providerId || o.provider?.id,
    providerName: o.provider?.name || 'Provider',
    providerAvatar: o.provider?.avatarUrl || DEFAULT_AVATAR,
    providerRating: o.provider?.trustScore ? o.provider.trustScore / 20 : 5.0,
    price: Number(o.offeredPrice),
    message: o.message || '',
    status: o.status === 'PENDING' ? 'pending' : o.status === 'ACCEPTED' ? 'accepted' : 'declined',
    createdAt: o.createdAt?.split('T')[0] || '',
  };
}

export function mapDbNotification(n: any): Notification {
  const createdAt = new Date(n.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  let time = 'Just now';
  if (diffMins < 60) time = `${diffMins} mins ago`;
  else if (diffMins < 1440) time = `${Math.floor(diffMins / 60)} hours ago`;
  else time = `${Math.floor(diffMins / 1440)} days ago`;

  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    desc: n.body,
    time,
    read: n.isRead,
  };
}

export function mapDbTransaction(t: any): Transaction {
  return {
    id: t.id,
    jobId: t.relatedBookingId || t.id,
    seekerId: '',
    providerId: t.walletOwnerId,
    amount: Number(t.amount),
    paymentMethod: 'GCash',
    serviceTitle: t.description || 'Service Transaction',
    createdAt: t.createdAt?.split('T')[0] || '',
  };
}
