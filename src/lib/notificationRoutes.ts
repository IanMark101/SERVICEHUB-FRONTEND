/**
 * Resolves and normalizes notification destination links.
 * Guarantees that notifications seamlessly navigate to the appropriate workspace and page
 * without opening broken/empty states or misrouting between Seeker/Provider contexts.
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
    } else {
      link = `/${link}`;
    }
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
  }

  // Ensure query parameters preserve tab & booking highlighting
  if (link.includes('activity')) {
    if (!link.includes('tab=')) {
      const joinChar = link.includes('?') ? '&' : '?';
      link = `${link}${joinChar}tab=all`;
    }
  }

  return link;
}
