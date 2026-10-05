import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { VerificationStatus } from '../types';

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

  const isVerified = user?.verificationStatus === VerificationStatus.APPROVED;
  const isActive = user?.isActive !== false;
  const isAdmin = user?.role === 'admin';

  const canTransact = isAdmin || (isVerified && isActive);

  const navigateToVerification = () => {
    if (!user) return;
    router.push(`/profile/${encodeURIComponent(user.id)}?tab=verification`);
  };

  return {
    canBrowse: true,
    canTransact,
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
