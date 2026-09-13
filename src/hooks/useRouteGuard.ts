import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { UserRole } from '../lib/routePolicy';

export function useRouteGuard(allowedRoles: UserRole[]) {
  const router = useRouter();
  const { isAuthenticated, authLoading, user } = useApp();

  // In the AppContext, normal users might have user.role as 'seeker' or 'provider'
  // but their actual database account tier is either 'user' or 'admin'.
  const userRoleType: UserRole = user?.role === 'admin' ? 'admin' : 'user';
  const allowedKey = allowedRoles.join(',');
  const stableAllowedRoles = useMemo(() => allowedKey.split(',') as UserRole[], [allowedKey]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user) {
        const hasAccess = stableAllowedRoles.includes(userRoleType);
        if (!hasAccess) {
          if (userRoleType === 'admin') {
            router.push('/admin/overview');
          } else {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [isAuthenticated, authLoading, user, userRoleType, stableAllowedRoles, router]);

  const shouldRender = !authLoading && isAuthenticated && user && stableAllowedRoles.includes(userRoleType);
  return { shouldRender };
}
