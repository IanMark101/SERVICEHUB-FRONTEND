import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { VerificationStatus } from '../types';
import { marketplaceAccess } from '../lib/marketplaceAccess';

export interface UserPermissions {
  canBrowse: boolean;
  canTransact: boolean;
  canCreateListings: boolean;
  canBookServices: boolean;
  canAcceptBookings: boolean;
  canMessage: boolean;
  canReview: boolean;
  canReport: boolean;
}

export function useTransactionPermission() {
  const { user } = useApp();
  const router = useRouter();

  const { canTransact, isSuspended } = marketplaceAccess(user);

  const navigateToVerification = () => {
    if (!user) return;
    router.push(`/profile/${encodeURIComponent(user.id)}?tab=verification`);
  };

  return {
    canBrowse: true,
    canTransact,
    isSuspended,
    canCreateListings: canTransact,
    canBookServices: canTransact,
    canAcceptBookings: canTransact,
    canMessage: true,
    canReview: canTransact,
    canReport: true,
    verificationStatus: user?.verificationStatus || VerificationStatus.UNVERIFIED,
    navigateToVerification
  };
}
