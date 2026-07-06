export type UserRole = 'admin' | 'user';

export interface RoutePolicy {
  allowedRoles: UserRole[];
  redirectPath: string;
}

export const ROUTE_POLICIES: Record<string, RoutePolicy> = {
  admin: {
    allowedRoles: ['admin'],
    redirectPath: '/dashboard', // Standard user dashboard entry
  },
  seeker: {
    allowedRoles: ['user'],
    redirectPath: '/admin/overview', // Admin overview entry
  },
  provider: {
    allowedRoles: ['user'],
    redirectPath: '/admin/overview', // Admin overview entry
  },
};
