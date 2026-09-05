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
    seekerAvatar: b.seeker?.avatarUrl || DEFAULT_AVATAR,
    seekerTrustScore: typeof b.seeker?.trustScore === 'number' ? b.seeker.trustScore : undefined,
    seekerVerificationStatus: b.seeker?.verificationStatus,
    seekerLocation: b.seeker?.location || 'Cordova, Cebu',
    providerId: b.providerId,
    providerName: b.provider?.name || 'Provider',
    providerAvatar: b.provider?.avatarUrl || DEFAULT_AVATAR,
    providerTrustScore: typeof b.provider?.trustScore === 'number' ? b.provider.trustScore : undefined,
    providerVerificationStatus: b.provider?.verificationStatus,
    providerLocation: b.provider?.location || 'Cordova, Cebu',
    serviceId: b.serviceId || null,
    price: Number(b.directRequest?.agreedPrice || b.offer?.offeredPrice || b.service?.price || 0),
    status: (statusMap[b.status] || 'pending_provider') as JobEngagement['status'],
    paymentMethod: b.paymentMethod === 'GCash' ? 'GCash' : 'On-site Cash',
    createdAt: b.createdAt || '',
    completedAt: b.updatedAt || '',
    description: b.directRequest?.message || b.offer?.message || b.description || '',
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
    seekerAvatar: cs.seeker?.avatarUrl || DEFAULT_AVATAR,
    seekerTrustScore: typeof cs.seeker?.trustScore === 'number' ? cs.seeker.trustScore : undefined,
    seekerVerificationStatus: cs.seeker?.verificationStatus,
    seekerLocation: cs.seeker?.location || 'Cordova, Cebu',
    providerId: cs.providerId,
    providerName: cs.provider?.name || 'Provider',
    providerAvatar: cs.provider?.avatarUrl || DEFAULT_AVATAR,
    providerTrustScore: typeof cs.provider?.trustScore === 'number' ? cs.provider.trustScore : undefined,
    providerVerificationStatus: cs.provider?.verificationStatus,
    providerLocation: cs.provider?.location || 'Cordova, Cebu',
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
  const reviews = item.provider?.reviewsReceived || [];
  const reviewCount = reviews.length;
  let avgRating = 5.0;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    avgRating = Number((sum / reviewCount).toFixed(1));
  } else if (typeof item.rating === 'number' && item.rating <= 5) {
    avgRating = item.rating;
  }

  const rawTrust = item.provider?.trustScore ?? (typeof item.trustScore === 'number' ? item.trustScore : 100);

  return {
    id: item.id,
    providerId: item.providerId || item.provider?.id,
    providerName: item.provider?.name || 'Provider',
    providerAvatar: item.provider?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: item.title,
    category: item.category?.name || 'General',
    description: item.description,
    price: Number(item.price),
    queueSize: (item.queueEntries?.length || 0) + (item.bookings?.length || 0),
    queueLimit: item.queueLimit || 5,
    isPaused: !item.isAvailable,
    proofOfSkillUrl: '',
    rating: avgRating,
    providerTrustScore: rawTrust,
    reviewCount: reviewCount,
    // serviceType and priceType are passed through from the DB so UI can display
    // session-based badges and pricing unit labels (e.g. ₱200 / session).
    serviceType: item.serviceType || 'ONE_TIME',
    priceType: item.priceType || 'FIXED',
    estimatedDurationMins: Number(item.estimatedDurationMins || item.estimatedDuration || 60),
    status: item.status || (item.isAvailable ? 'ACTIVE' : 'INACTIVE'),
    adminNotes: item.adminNotes || null,
    rejectionCount: item.rejectionCount || 0,
    paymentMethods: item.paymentMethods ? {
      cash: !!item.paymentMethods.cash,
      gcash: !!item.paymentMethods.gcash,
      maya: !!item.paymentMethods.maya,
      card: !!item.paymentMethods.card
    } : undefined
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
    urgency: r.urgency || 'Medium Urgency (Next 1-2 days)',
    budget: Number(r.budgetMax || r.budgetMin || 0),
    description: r.description,
    status: r.status,
    createdAt: r.createdAt?.split('T')[0] || '',
    offersCount: r.offers?.length || 0
  };
}

export function mapOfferToBid(o: any): Bid {
  const reviews = o.provider?.reviewsReceived || [];
  let avgRating = 5.0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    avgRating = Number((sum / reviews.length).toFixed(1));
  }

  return {
    id: o.id,
    requestId: o.requestId,
    providerId: o.providerId || o.provider?.id,
    serviceId: o.serviceId,
    providerName: o.provider?.name || 'Provider',
    providerAvatar: o.provider?.avatarUrl || DEFAULT_AVATAR,
    providerRating: avgRating,
    price: Number(o.offeredPrice),
    message: o.message || '',
    status: o.status === 'PENDING' || o.status === 'PENDING_PAYMENT' ? 'pending' : o.status === 'ACCEPTED' ? 'accepted' : 'declined',
    createdAt: o.createdAt?.split('T')[0] || '',
    requestTitle: o.request?.title,
    seekerName: o.request?.seeker?.name,
    category: typeof o.request?.category === 'object' ? o.request?.category?.name : o.request?.category,
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
    link: n.link || null,
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
