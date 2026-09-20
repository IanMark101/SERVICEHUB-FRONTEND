import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Briefcase, MagnifyingGlass as Search, List as Menu, ChatCircle as MessageSquare, Sun, Moon } from '@phosphor-icons/react';
import { UserSession } from '../auth/LoginContainer';
import { resolveNotificationLink } from '../../lib/notificationRoutes';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { apiSearchUsers } from '../../api/users.api';
import type { User as AppUser } from '../../types';
import HeaderNotifications from './header/HeaderNotifications';
import HeaderProfileMenu from './header/HeaderProfileMenu';
import HeaderMobileSearch from './header/HeaderMobileSearch';
import HeaderDesktopSearch from './header/HeaderDesktopSearch';

const pageNames: Record<string, string> = {
  'seek-services': 'Seek Services',
  'post-request': 'Post Request',
  'incoming-offers': 'Offers Received',
  'request-manager': 'Request Manager',
  'seeker-activity': 'Activity',
  'browse-services': 'Browse Jobs',
  'offer-services': 'Offer Services',
  'incoming-requests': 'Incoming Requests',
  'service-manager': 'Service Manager',
  'provider-activity': 'Activity',
  'transaction-history': 'Payment Records',
  messages: 'Messages',
  'community-hub': 'Community Hub',
};

interface HeaderProps {
  currentRole: 'seeker' | 'provider' | 'admin';
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  setIsMobileOpen: (open: boolean) => void;
  user: UserSession | null;
  onSignOut: () => void;
  onViewProfile?: (user: UserSession) => void;
}

function getResponseStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) return undefined;
  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === 'number' ? response.status : undefined;
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
  const { notifications, markNotificationsRead, isDark, toggleTheme, unreadMessagesCount, users, services, jobRequests, hasMoreNotifications, loadMoreNotifications } = useApp();
  const { navigateToVerification } = useTransactionPermission();

  // Use the real authenticated user ID directly from session
  const userId = user?.id || '';
  const userNotifications = notifications.filter(n => n.userId === userId);
  const unreadCount = userNotifications.filter(n => !n.read).length;
  const pageName = pageNames[activeTab] || activeTab.replaceAll('-', ' ');


  // Theme styling helpers based on active role
  const roleThemes = {
    seeker: {
      accent: 'text-orange-600',
      ring: 'focus:ring-orange-500 focus:border-orange-500',
      borderHover: 'hover:border-orange-500/50',
      badge: 'bg-orange-700 text-white',
      badgeBg: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    provider: {
      accent: 'text-emerald-600',
      ring: 'focus:ring-emerald-500 focus:border-emerald-500',
      borderHover: 'hover:border-emerald-500/50',
      badge: 'bg-emerald-700 text-white',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    admin: {
      accent: 'text-slate-900 dark:text-neutral-100',
      ring: 'focus:ring-slate-500 focus:border-slate-500',
      borderHover: 'hover:border-slate-500/50',
      badge: 'bg-slate-950 text-white dark:bg-neutral-100 dark:text-neutral-950',
      badgeBg: 'bg-slate-950 text-white border-slate-950',
    },
  };

  const theme = roleThemes[currentRole];

  // Resolve a safe display name from various possible server shapes
  const getDisplayName = (r: AppUser) => {
    const first = r.firstName || '';
    const last = r.lastName || '';
    const full = `${first} ${last}`.trim();
    if (full) return full;
    return 'Unknown user';
  };

  const router = useRouter();

  useEffect(() => {
    const query = userSearch.trim();
    if (!query) return;

    const timer = window.setTimeout(async () => {
      setUserSearchLoading(true);

      // Try global search API first (non-admin endpoint) if enabled. If it returns results, use them.
      if (serverSearchEnabled) {
        try {
          const res = await apiSearchUsers({ search: query, page: 1, limit: 6 });
          if (res && res.success && Array.isArray(res.data)) {
            setUserSearchResults(res.data as AppUser[]);
            setShowUserSearchResults((res.data as AppUser[]).length > 0);
            setUserSearchLoading(false);
            return;
          }
        } catch (error: unknown) {
          // If endpoint missing (404), disable further server calls to avoid console noise
          if (getResponseStatus(error) === 404) {
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

        setUserSearchResults(filtered);
        setShowUserSearchResults(filtered.length > 0);
        setUserSearchLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [userSearch, users, services, jobRequests, userId, serverSearchEnabled]);

  const handleSearchChange = (query: string) => {
    setUserSearch(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      setUserSearchLoading(false);
      setShowUserSearchResults(false);
    }
  };

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
    <header className={`workspace-dashboard-header sticky right-0 top-0 z-30 h-[68px] w-full gap-3 px-4 py-3 font-sans sm:px-6 md:px-8 ${isDark ? 'text-[#f2efe9]' : 'text-[#171716]'}`}>

      {/* Left identity card: dashboard counterpart to the landing brand card. */}
      <div className="workspace-header-card workspace-header-context flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          aria-label="Open workspace navigation"
          onClick={() => setIsMobileOpen(true)}
          className={`workspace-header-control grid size-8 shrink-0 place-items-center rounded-full transition-colors md:hidden`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {currentRole === 'admin' ? (
            <span className={`text-xs font-semibold ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>Administrator</span>
          ) : (
            <>
              <span className="workspace-header-role-mark hidden size-8 shrink-0 place-items-center rounded-[10px] sm:grid" aria-hidden="true">
                {currentRole === 'seeker'
                  ? <Search size={16} weight="bold" />
                  : <Briefcase size={16} weight="bold" />}
              </span>
              <div className="min-w-0 leading-tight">
                <span className="workspace-header-role-label block truncate text-[9.5px] font-bold uppercase tracking-[0.12em]">
                  {currentRole === 'seeker' ? 'Seeker workspace' : 'Provider workspace'}
                </span>
                <span className={`mt-0.5 block truncate text-[14px] font-bold capitalize leading-none tracking-[-0.025em] ${isDark ? 'text-[#f5f4f2]' : 'text-[#171716]'}`}>
                  {pageName}
                </span>
              </div>
            </>
          )}

          {user && user.role !== 'admin' && user.verificationStatus !== 'APPROVED' && (
            <button
              type="button"
              onClick={navigateToVerification}
              title="Click to go to verification profile"
              className={`cursor-pointer px-2 py-0.5 text-[9px] font-extrabold rounded-md border hidden items-center gap-1.5 transition-all select-none hover:scale-[1.02] active:scale-[0.98] 2xl:flex ${
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
            </button>
          )}
        </div>
      </div>

      {/* One coherent utility bar, following the landing header's nav pill. */}
      <div className="workspace-header-toolbar workspace-header-actions flex min-w-0 shrink-0 items-center gap-1.5">

        <HeaderDesktopSearch
          model={{
            userSearchRef,
            userSearch,
            setUserSearch: handleSearchChange,
            setShowUserSearchResults,
            showUserSearchResults,
            userSearchLoading,
            userSearchResults,
            isDark,
            getDisplayName,
            handleOpenUserProfile
          }}
        />

        <span className="workspace-header-divider hidden h-5 w-px lg:block" aria-hidden="true" />

        {/* Mobile Search Toggle Icon */}
        <button
          type="button"
          aria-label="Search people"
          onClick={() => {
            setIsMobileSearchOpen(!isMobileSearchOpen);
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
          className={`workspace-header-control grid size-9 place-items-center rounded-full transition-colors lg:hidden ${
            isMobileSearchOpen
              ? isDark ? 'bg-[#c86544]/15 text-[#e9a58c]' : 'bg-[#f5ebe6] text-[#aa5032]'
              : ''
          }`}
          title="Search people"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Hub Indicator */}
        {currentRole !== 'admin' && (
          <button
            type="button"
            aria-label="Open Community Hub"
            title="Community Hub"
            aria-current={activeTab === 'community-hub' ? 'page' : undefined}
            onClick={() => setActiveTab('community-hub')}
            className="workspace-landing-cta group/btn relative ml-6 inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-[#0a0a0a] px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_14px_-3px_rgba(0,0,0,0.4)] ring-1 ring-black/20 transition-all hover:scale-[1.02] hover:bg-[#161616] active:scale-[0.97] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-neutral-100"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full dark:hidden"
              style={{
                background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.16), transparent 60%)',
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full"
            />
            <span className="relative z-10">Community Hub</span>
            <ArrowRight size={13} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
        )}

        {/* Global Messages Quick Access */}
        {currentRole !== 'admin' && (
          <button
            type="button"
            onClick={() => router.push(currentRole === 'seeker' ? '/seeker/messages' : '/provider/messages')}
            className={`workspace-header-control relative hidden size-9 cursor-pointer place-items-center rounded-full transition-colors sm:grid ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
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
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          className={`workspace-header-control grid size-9 place-items-center rounded-full transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
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
          hasMore={hasMoreNotifications}
          onLoadMore={loadMoreNotifications}
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
        onQueryChange={handleSearchChange}
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
