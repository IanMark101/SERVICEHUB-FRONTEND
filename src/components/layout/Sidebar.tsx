'use client';

import type { UserSession } from '../auth/LoginContainer';
import { useApp } from '../../context/AppContext';
import useAdminBanAppealCount from '../../hooks/useAdminBanAppealCount';
import SidebarView from './SidebarView';

interface SidebarProps {
  currentRole: 'seeker' | 'provider' | 'admin';
  setCurrentRole: (role: 'seeker' | 'provider' | 'admin') => void;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onSignOut: () => void;
  user: UserSession | null;
}


export default function Sidebar(props: SidebarProps) {
  const { user, currentRole } = props;
  const { bids, jobRequests, jobEngagements, unreadMessagesCount, isDark, toggleTheme } = useApp();
  const currentUserId = user?.id || '';
  const pendingAppeals = useAdminBanAppealCount(currentRole === 'admin' && user?.role === 'admin');
  const pendingBidsCount = bids.filter(
    (bid) => bid.status === 'pending' && (bid.seekerId === currentUserId || jobRequests.some(
      (request) => request.id === bid.requestId && request.seekerId === currentUserId,
    )),
  ).length;
  const pendingRequestsCount = jobEngagements.filter(
    (engagement) => engagement.providerId === currentUserId && engagement.status === 'pending_provider',
  ).length;

  return <SidebarView {...props} isDark={isDark} toggleTheme={toggleTheme} pendingBidsCount={pendingBidsCount} pendingRequestsCount={pendingRequestsCount} pendingAppeals={pendingAppeals} unreadMessagesCount={unreadMessagesCount} />;
}
