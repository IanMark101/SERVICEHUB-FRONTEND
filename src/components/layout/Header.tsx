import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, MessageSquare, Sun, Moon, X } from 'lucide-react';
import { UserSession } from '../auth/LoginContainer';
import { useToast } from '../ui/Toast';
import { resolveNotificationLink } from '../../lib/notificationRoutes';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { apiSearchUsers } from '../../api/users.api';
import type { User as AppUser } from '../../types';
import HeaderNotifications from './header/HeaderNotifications';
import HeaderProfileMenu from './header/HeaderProfileMenu';
import HeaderMobileSearch from './header/HeaderMobileSearch';
import HeaderDesktopSearch from './header/HeaderDesktopSearch';

interface HeaderProps {
  currentRole: 'seeker' | 'provider' | 'admin';
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  setIsMobileOpen: (open: boolean) => void;
  user: UserSession | null;
  onSignOut: () => void;
  onViewProfile?: (user: UserSession) => void;
}

export default function Header({
  currentRole,
  activeTab,
  setActiveTab,
  setIsMobileOpen,
  user,
  onSignOut,
  onViewProfile
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [showUserSearchResults, setShowUserSearchResults] = useState<boolean>(false);
  const [userSearchResults, setUserSearchResults] = useState<AppUser[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState<boolean>(false);
  const [serverSearchEnabled, setServerSearchEnabled] = useState<boolean>(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const userSearchRef = useRef<HTMLDivElement | null>(null);

  // Bind to App Context
  const { notifications, markNotificationsRead, isDark, toggleTheme, unreadMessagesCount, users, services, jobRequests } = useApp();
  const { navigateToVerification } = useTransactionPermission();

  // Use the real authenticated user ID directly from session
  const userId = user?.id || '';
  const userNotifications = notifications.filter(n => n.userId === userId);
  const unreadCount = userNotifications.filter(n => !n.read).length;


  // Theme styling helpers based on active role
  const roleThemes = {
    seeker: {
      accent: 'text-orange-600',
      ring: 'focus:ring-orange-500 focus:border-orange-500',
      borderHover: 'hover:border-orange-500/50',
      badge: 'bg-orange-600 text-white',
      badgeBg: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    provider: {
      accent: 'text-emerald-600',
      ring: 'focus:ring-emerald-500 focus:border-emerald-500',
      borderHover: 'hover:border-emerald-500/50',
      badge: 'bg-emerald-600 text-white',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    admin: {
      accent: 'text-red-500',
      ring: 'focus:ring-red-500 focus:border-red-500',
      borderHover: 'hover:border-red-500/50',
      badge: 'bg-red-600 text-white',
      badgeBg: 'bg-red-50 text-red-500 border-red-100',
    }
  };

  const theme = roleThemes[currentRole];

  // Resolve a safe display name from various possible server shapes
  const getDisplayName = (r: AppUser) => {
    const first = r.firstName || '';
    const last = r.lastName || '';
    const full = `${first} ${last}`.trim();
    if (full) return full;
    const anyR = r as any;
    return anyR.name || anyR.fullName || anyR.displayName || 'Unknown';
  };

  // Helper to format tab ID into human-readable Title
  const getPageTitle = (tabId: string) => {
    if (!tabId) return 'ServiceHub';
    if (tabId === 'seek-services') return 'Seek Services';
    if (tabId === 'browse-services') return 'Browse Jobs';
    if (tabId === 'incoming-offers') return 'Service Requests';
    if (tabId === 'provider-activity' || tabId === 'seeker-activity') return 'Activity Tracker';
    if (tabId === 'transaction-history') return 'Transaction History';

    return tabId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const router = useRouter();

  useEffect(() => {
    const query = userSearch.trim();
    if (!query) {
      setUserSearchResults([]);
      setUserSearchLoading(false);
      return;
    }

    setUserSearchLoading(true);
    const timer = window.setTimeout(async () => {
      // Debug: log query
      // eslint-disable-next-line no-console

      // Try global search API first (non-admin endpoint) if enabled. If it returns results, use them.
      if (serverSearchEnabled) {
        try {
          const res = await apiSearchUsers({ search: query, page: 1, limit: 6 });
          // eslint-disable-next-line no-console
          if (res && res.success && Array.isArray(res.data)) {
            // eslint-disable-next-line no-console
            setUserSearchResults(res.data as AppUser[]);
            setShowUserSearchResults((res.data as AppUser[]).length > 0);
            setUserSearchLoading(false);
            return;
          }
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.warn('[Header] apiSearchUsers error, falling back to client search', e);
          // If endpoint missing (404), disable further server calls to avoid console noise
          if (e?.response?.status === 404) {
            setServerSearchEnabled(false);
          }
        }
      }

      const normalizedQuery = query.toLowerCase();
      const userCandidates = [
        ...users,
        ...services.map((service) => ({
          id: service.providerId || `service_${service.id}`,
          firstName: (service.providerName || '').split(' ')[0] || service.providerName || 'Provider',
          lastName: (service.providerName || '').split(' ').slice(1).join(' ') || '',
          email: '',
          role: 'provider' as const,
          avatarUrl: service.providerAvatar,
          bio: '',
          phone: '',
          rating: service.rating || 0,
          reviews: [],
          isVerified: true,
          proofOfResidencyUrl: undefined,
          proofOfSkillUrl: undefined,
          trustScore: undefined,
          verificationStatus: undefined,
          emailVerified: undefined,
          isActive: true,
        })),
        ...jobRequests.map((request) => ({
          id: request.seekerId || `request_${request.id}`,
          firstName: (request.seekerName || '').split(' ')[0] || request.seekerName || 'Seeker',
          lastName: (request.seekerName || '').split(' ').slice(1).join(' ') || '',
          email: '',
          role: 'seeker' as const,
          avatarUrl: request.seekerAvatar,
          bio: '',
          phone: '',
          rating: 0,
          reviews: [],
          isVerified: false,
          proofOfResidencyUrl: undefined,
          proofOfSkillUrl: undefined,
          trustScore: undefined,
          verificationStatus: undefined,
          emailVerified: undefined,
          isActive: true,
        })),
      ];

      const filtered = userCandidates
        .filter((u) => u.id !== userId)
        .filter((u) => {
          const fullName = `${u.firstName} ${u.lastName}`.trim().toLowerCase();
          return (
            fullName.includes(normalizedQuery) ||
            (u.email || '').toLowerCase().includes(normalizedQuery) ||
            u.role.toLowerCase().includes(normalizedQuery) ||
            (u.bio || '').toLowerCase().includes(normalizedQuery)
          );
        })
        .filter((u, index, self) => self.findIndex((item) => item.id === u.id) === index)
          .slice(0, 6);

        // eslint-disable-next-line no-console
        setUserSearchResults(filtered);
        setShowUserSearchResults(filtered.length > 0);
        setUserSearchLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [userSearch, currentRole, users, services, jobRequests, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setShowUserSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenUserProfile = (selectedUser: AppUser) => {
    setUserSearch('');
    setShowUserSearchResults(false);
    setIsMobileSearchOpen(false);

    const targetUrl = currentRole === 'admin'
      ? `/admin/users?search=${encodeURIComponent(selectedUser.email || `${selectedUser.firstName} ${selectedUser.lastName}`)}`
      : `/${currentRole}/user-profile?id=${selectedUser.id}`;

    if (onViewProfile) {
      onViewProfile({
        id: selectedUser.id,
        email: selectedUser.email,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        role: selectedUser.role,
        avatarUrl: selectedUser.avatarUrl,
        bio: selectedUser.bio,
        phone: selectedUser.phone,
        trustScore: selectedUser.trustScore,
        verificationStatus: selectedUser.verificationStatus,
        emailVerified: selectedUser.emailVerified,
        isActive: selectedUser.isActive,
      });
    }

    router.push(targetUrl);
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    setShowProfileMenu(false);
  };

  const handleNotificationClick = (link?: string | null) => {
    setShowNotifications(false);
    markNotificationsRead(userId);
    const targetRoute = resolveNotificationLink(link, currentRole);
    if (!targetRoute) return;

    if (targetRoute.startsWith('/')) {
      router.push(targetRoute);
    } else {
      setActiveTab(targetRoute);
    }
  };

  return (
    <header className={`sticky top-0 right-0 z-30 w-full h-20 backdrop-blur-md border-b flex items-center justify-between px-6 sm:px-8 py-3.5 select-none transition-all duration-200 ${isDark ? 'bg-[#191919]/95 border-neutral-800/80 text-[#f2efe9]' : 'bg-white/95 border-slate-300 text-slate-800'
      }`}>

      {/* Left side: Hamburger (Mobile) & Workspace Indicator badge */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className={`md:hidden p-2 rounded-xl border transition-colors ${isDark ? 'border-neutral-800 bg-[#22211e] text-[#b4b0a9] hover:text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700'
            }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border uppercase tracking-wider flex items-center gap-1.5 ${isDark
              ? (currentRole === 'seeker' 
                  ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' 
                  : currentRole === 'admin'
                  ? 'bg-red-950/20 text-red-400 border-red-900/30'
                  : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30')
              : theme.badgeBg
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentRole === 'seeker' 
                ? 'bg-orange-500' 
                : currentRole === 'admin' 
                ? 'bg-red-500' 
                : 'bg-emerald-500'
            }`} />
            {currentRole} Workspace
          </span>

          {user && user.role !== 'admin' && user.verificationStatus !== 'APPROVED' && (
            <span
              onClick={navigateToVerification}
              title="Click to go to verification profile"
              className={`cursor-pointer px-2.5 py-1 text-[9px] font-extrabold rounded-lg border flex items-center gap-1.5 transition-all select-none hover:scale-[1.02] active:scale-[0.98] ${
                user.verificationStatus === 'PENDING_REVIEW'
                  ? isDark
                    ? 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                  : isDark
                    ? 'bg-red-950/20 border-red-900/30 text-red-400'
                    : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${user.verificationStatus === 'PENDING_REVIEW' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{user.verificationStatus === 'PENDING_REVIEW' ? 'Verification Under Review' : 'Limited Mode'}</span>
            </span>
          )}

          <span className="text-slate-300 hidden sm:inline-block">/</span>
          <h1 className={`text-sm sm:text-base font-extrabold tracking-wide hidden sm:block ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>
            {getPageTitle(activeTab)}
          </h1>
        </div>
      </div>

      <HeaderDesktopSearch
        model={{
          userSearchRef,
          userSearch,
          setUserSearch,
          setShowUserSearchResults,
          showUserSearchResults,
          userSearchLoading,
          userSearchResults,
          isDark,
          theme,
          getDisplayName,
          handleOpenUserProfile
        }}
      />

      {/* Right side: Notifications & Profile Avatar dropdowns */}
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">

        {/* Mobile Search Toggle Icon */}
        <button
          type="button"
          onClick={() => {
            setIsMobileSearchOpen(!isMobileSearchOpen);
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
          className={`sm:hidden p-2.5 rounded-xl border transition-all ${
            isMobileSearchOpen
              ? isDark ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-orange-50 border-orange-200 text-orange-600'
              : isDark ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-[#b4b0a9]' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600'
          }`}
          title="Search Users"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Hub Indicator */}
        {currentRole !== 'admin' && activeTab !== 'community-hub' && (
          <button
            type="button"
            onClick={() => setActiveTab('community-hub')}
            className={`hidden lg:flex items-center space-x-1.5 px-3.5 py-2 border text-xs font-semibold rounded-xl transition-all ${isDark
                ? 'border-neutral-800 hover:bg-[#22211e] text-[#f2efe9]'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
          >
            <span>Community Hub</span>
          </button>
        )}

        {/* Global Messages Quick Access */}
        {currentRole !== 'admin' && (
          <button
            type="button"
            onClick={() => router.push(currentRole === 'seeker' ? '/seeker/messages' : '/provider/messages')}
            className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${isDark
                ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-[#f2efe9]'
                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}
            title="Direct Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full ${theme.badge} text-[9px] font-bold flex items-center justify-center border border-white shadow-sm`}>
                {unreadMessagesCount}
              </span>
            )}
          </button>
        )}

        {/* Global Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all ${isDark
              ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-amber-400'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800'
            }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <HeaderNotifications
          isDark={isDark}
          isOpen={showNotifications}
          notifications={userNotifications}
          unreadCount={unreadCount}
          badgeClass={theme.badge}
          onToggle={handleToggleNotifications}
          onClose={() => setShowNotifications(false)}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={() => markNotificationsRead(userId)}
        />

        <HeaderProfileMenu
          currentRole={currentRole}
          user={user}
          isDark={isDark}
          isOpen={showProfileMenu}
          borderHoverClass={theme.borderHover}
          onToggle={() => {
            setShowProfileMenu(!showProfileMenu);
            setShowNotifications(false);
          }}
          onClose={() => setShowProfileMenu(false)}
          onViewProfile={onViewProfile}
          onOpenSettings={() => router.push(`/${currentRole}/account-settings`)}
          onSignOut={onSignOut}
        />

      </div>

      <HeaderMobileSearch
        isOpen={isMobileSearchOpen}
        isDark={isDark}
        query={userSearch}
        showResults={showUserSearchResults}
        loading={userSearchLoading}
        results={userSearchResults}
        ringClass={theme.ring}
        getDisplayName={getDisplayName}
        onQueryChange={setUserSearch}
        onShowResultsChange={setShowUserSearchResults}
        onClose={() => {
          setUserSearch('');
          setShowUserSearchResults(false);
          setIsMobileSearchOpen(false);
        }}
        onOpenUser={handleOpenUserProfile}
      />
    </header>
  );
}
