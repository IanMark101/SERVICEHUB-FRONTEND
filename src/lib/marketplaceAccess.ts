import type { UserSession } from '../components/auth/LoginContainer';

type MarketplaceAccount = Pick<UserSession, 'role' | 'verificationStatus' | 'emailVerified' | 'isActive' | 'moderationStatus'>;

export const SUSPENSION_BROWSING_NOTICE = 'You can browse ServiceHub while suspended. Posting, booking, sending or accepting offers, payments, reviews, and starting a job are unavailable until your suspension ends.';

/** Match the API's new-transaction gate. Existing booking resolution has its own policy. */
export function marketplaceAccess(user: MarketplaceAccount | null | undefined) {
  const isSuspended = user?.moderationStatus === 'SUSPENDED';
  const canTransact = Boolean(user && (user.role === 'admin' || (
    user.verificationStatus === 'APPROVED' && user.emailVerified === true
    && user.isActive !== false && user.moderationStatus === 'ACTIVE'
  )));
  return { canTransact, isSuspended };
}
