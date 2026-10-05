import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { UserRole } from '../lib/routePolicy';

export function useRouteGuard(allowedRoles: UserRole[]) {
  const router = useRouter();
  const { isAuthenticated, authLoading, authError, user } = useApp();

  // In the AppContext, normal users might have user.role as 'seeker' or 'provider'
  // but their actual database account tier is either 'user' or 'admin'.
  const userRoleType: UserRole = user?.role === 'admin' ? 'admin' : 'user';
  const allowedKey = allowedRoles.join(',');
  const stableAllowedRoles = useMemo(() => allowedKey.split(',') as UserRole[], [allowedKey]);

  useEffect(() => {
    if (!authLoading && !authError) {
      if (!isAuthenticated) {
        const sessionExpired = typeof window !== 'undefined'
          && window.sessionStorage.getItem('servicehub:auth-notice') === 'session-expired';
        router.replace(sessionExpired ? '/login?reason=session-expired' : '/login');
      } else if (user) {
        if (user.moderationStatus === 'BANNED') {
          router.replace('/account-banned');
          return;
        }
        if (user.role !== 'admin' && user.emailVerified !== true) {
          router.replace('/email-verification-required');
          return;
        }
        const hasAccess = stableAllowedRoles.includes(userRoleType);
        if (!hasAccess) {
          router.replace('/access-denied');
        }
      }
    }
  }, [isAuthenticated, authLoading, authError, user, userRoleType, stableAllowedRoles, router]);

  const shouldRender = !authLoading && !authError && isAuthenticated && user
    && user.moderationStatus !== 'BANNED'
    && (user.role === 'admin' || user.emailVerified === true)
    && stableAllowedRoles.includes(userRoleType);
  return { shouldRender };
}
