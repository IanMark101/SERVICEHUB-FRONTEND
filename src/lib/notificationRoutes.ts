/**
 * Resolves and normalizes notification destination links.
 * Guarantees that notifications seamlessly navigate to the appropriate workspace and page
 * without opening broken/empty states or misrouting between Seeker/Provider/Admin contexts.
 */
export function resolveNotificationLink(
  rawLink: string | null | undefined,
  currentRole: 'seeker' | 'provider' | 'admin'
): string | null {
  if (!rawLink) return null;

  let link = rawLink.trim();
  if (!link) return null;

  // Normalize legacy or un-slashed bare links
  if (!link.startsWith('/')) {
    if (link === 'seeker-activity' || link === 'provider-activity') {
      link = `/${currentRole}/${currentRole}-activity`;
    } else if (link === 'incoming-offers') {
      link = `/seeker/incoming-offers`;
    } else if (link === 'incoming-requests') {
      link = `/provider/incoming-requests`;
    } else if (link === 'messages') {
      link = `/${currentRole}/messages`;
    } else if (link === 'user-profile') {
      link = `/${currentRole}/user-profile`;
    } else if (link === 'account-settings' || link === 'settings') {
      link = `/${currentRole}/account-settings`;
    } else if (link === 'service-manager' || link === 'manage-services') {
      link = `/provider/service-manager`;
    } else {
      link = `/${link}`;
    }
  }

  // Rewrite legacy or mismatched path aliases
  if (link.startsWith('/provider/manage-services') || link.startsWith('/manage-services')) {
    link = link.replace('/provider/manage-services', '/provider/service-manager')
               .replace('/manage-services', '/provider/service-manager');
  }

  if (link.startsWith('/profile') || link.startsWith('/settings')) {
    link = link.replace('/profile', `/${currentRole}/user-profile`)
               .replace('/settings', `/${currentRole}/account-settings`);
  }

  // Handle cross-workspace redirection smoothly if role context differs
  if (currentRole === 'provider' && link.startsWith('/seeker/seeker-activity')) {
    link = link.replace('/seeker/seeker-activity', '/provider/provider-activity');
  } else if (currentRole === 'seeker' && link.startsWith('/provider/provider-activity')) {
    link = link.replace('/provider/provider-activity', '/seeker/seeker-activity');
  } else if (currentRole === 'provider' && link.startsWith('/seeker/messages')) {
    link = link.replace('/seeker/messages', '/provider/messages');
  } else if (currentRole === 'seeker' && link.startsWith('/provider/messages')) {
    link = link.replace('/provider/messages', '/seeker/messages');
  } else if (currentRole === 'seeker' && link.startsWith('/provider/user-profile')) {
    link = link.replace('/provider/user-profile', '/seeker/user-profile');
  } else if (currentRole === 'provider' && link.startsWith('/seeker/user-profile')) {
    link = link.replace('/seeker/user-profile', '/provider/user-profile');
  } else if (currentRole === 'seeker' && link.startsWith('/provider/account-settings')) {
    link = link.replace('/provider/account-settings', '/seeker/account-settings');
  } else if (currentRole === 'provider' && link.startsWith('/seeker/account-settings')) {
    link = link.replace('/seeker/account-settings', '/provider/account-settings');
  }

  // Ensure query parameters preserve tab & booking highlighting for activity views
  if (link.includes('activity')) {
    if (!link.includes('tab=')) {
      const joinChar = link.includes('?') ? '&' : '?';
      link = `${link}${joinChar}tab=all`;
    }
  }

  return link;
}
