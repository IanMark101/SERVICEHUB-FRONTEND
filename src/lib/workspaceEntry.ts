import type { UserSession } from '@/components/auth/LoginContainer';

/** Resolve an explicit workspace action without mounting intermediate pages. */
export function getWorkspaceEntryPath(user: Pick<UserSession, 'role' | 'emailVerified' | 'moderationStatus'>): string {
  if (user.moderationStatus === 'BANNED') return '/account-banned';
  if (user.role === 'admin') return '/admin/overview';
  if (user.emailVerified !== true) return '/email-verification-required';
  return user.role === 'provider' ? '/provider/browse-services' : '/seeker/seek-services';
}
