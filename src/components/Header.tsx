import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Menu,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import { UserSession } from './auth/LoginContainer';
import { useToast } from './Toast';
import { resolveNotificationLink } from '../lib/notificationRoutes';
import { useApp } from '../context/AppContext';
import { useTransactionPermission } from '../hooks/useTransactionPermission';
import { apiSearchUsers } from '../api/users.api';
import type { User as AppUser } from '../types';

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

  // Helper to map icon components dynamically based on notification details
  const getNotificationIcon = (title: string) => {
    const text = title.toLowerCase();
    if (text.includes('accept') || text.includes('approve') || text.includes('verified')) {
      return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' };
    }
    if (text.includes('dispute') || text.includes('decline') || text.includes('report')) {
      return { icon: ShieldAlert, color: 'text-red-500 bg-red-50' };
    }
    if (text.includes('payout') || text.includes('paid') || text.includes('transaction')) {
      return { icon: DollarSign, color: 'text-purple-500 bg-purple-50' };
    }
    return { icon: Sparkles, color: 'text-orange-600 bg-orange-50' };
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
      console.log('[Header] search query:', query);

      // Try global search API first (non-admin endpoint) if enabled. If it returns results, use them.
      if (serverSearchEnabled) {
        try {
          const res = await apiSearchUsers({ search: query, page: 1, limit: 6 });
          // eslint-disable-next-line no-console
          console.log('[Header] apiSearchUsers response:', res);
          if (res && res.success && Array.isArray(res.data)) {
            // eslint-disable-next-line no-console
            console.log('[Header] apiSearchUsers results length:', (res.data || []).length);
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
        console.log('[Header] client filtered results count:', filtered.length, filtered.map(f => ({ id: f.id, name: `${f.firstName} ${f.lastName}` }))); 
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
      return;
    }

    if (currentRole === 'admin') {
      router.push(`/admin/users?id=${selectedUser.id}`);
    } else {
      router.push(`/${currentRole}/user-profile?id=${selectedUser.id}`);
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    setShowProfileMenu(false);

    if (nextState) {
      markNotificationsRead(userId);
    }
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
          <span className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border uppercase tracking-wider ${isDark
              ? (currentRole === 'seeker' 
                  ? 'bg-orange-950/20 text-orange-400 border-orange-900/30' 
                  : currentRole === 'admin'
                  ? 'bg-red-950/20 text-red-400 border-red-900/30'
                  : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30')
              : theme.badgeBg
            }`}>
            {currentRole} Workspace
          </span>

          {user && user.role !== 'admin' && user.verificationStatus !== 'APPROVED' && (
            <span
              onClick={navigateToVerification}
              title="Click to go to verification profile"
              className={`cursor-pointer px-2.5 py-1 text-[9px] font-extrabold rounded-lg border flex items-center gap-1.5 transition-all select-none hover:scale-[1.02] active:scale-[0.98] ${
                user.verificationStatus === 'PENDING_REVIEW'
                  ? isDark
                    ? 'bg-amber-955/20 border-amber-900/30 text-amber-400'
                    : 'bg-amber-50 border-amber-250 text-amber-700'
                  : isDark
                    ? 'bg-red-955/20 border-red-900/30 text-red-450'
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

      {/* Middle: Global User Search Bar */}
      <div ref={userSearchRef} className="hidden md:block w-80 relative mx-4">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b4b0a9]">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setShowUserSearchResults(Boolean(e.target.value.trim()));
          }}
          onFocus={() => setShowUserSearchResults(Boolean(userSearch.trim()))}
          placeholder="Search users..."
          className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs transition-all ${isDark
              ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9] placeholder-[#b4b0a9] focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/50'
              : `bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${theme.ring}`
            }`}
        />

        {showUserSearchResults && (
          <div className={`absolute left-0 right-0 mt-2 z-50 rounded-2xl border shadow-xl overflow-hidden ${isDark ? 'bg-[#191919] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'}`}>
            {userSearchLoading ? (
              <div className="px-3 py-3 text-xs text-slate-500 dark:text-neutral-400">Searching users...</div>
            ) : userSearchResults.length > 0 ? (
              userSearchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleOpenUserProfile(result)}
                  className={`w-full text-left px-3 py-3 border-b last:border-b-0 transition-colors ${isDark ? 'hover:bg-[#22211e]' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={result.avatarUrl || 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=200'}
                        alt={`${getDisplayName(result)} avatar`}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate">{getDisplayName(result)}</div>
                        {result.email && result.email !== 'N/A' && (
                          <div className="text-[10px] text-slate-500 dark:text-neutral-500 truncate">{result.email}</div>
                        )}
                        {result.bio && result.bio !== 'N/A' && (
                          <div className="text-[10px] text-slate-400 dark:text-neutral-500 truncate mt-1">{result.bio}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-[10px] uppercase tracking-wide font-bold ${result.role === 'provider' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {result.role}
                      </div>
                      {result.phone && result.phone !== 'N/A' && (
                        <div className="text-[10px] text-slate-400 mt-1">{result.phone}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-500 dark:text-neutral-400">No users found.</div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Notifications & Profile Avatar dropdowns */}
      <div className="flex items-center space-x-3 sm:space-x-4">

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

        {/* Global Messages Button */}
        {currentRole !== 'admin' && (
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`p-2.5 rounded-xl border transition-all relative ${isDark
                ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-[#f2efe9]'
                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-655 hover:text-slate-800'
              } ${activeTab === 'messages' ? (isDark ? 'bg-[#2c2b27] border-neutral-700' : 'bg-slate-100 border-slate-300') : ''}`}
            title="Messages"
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

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className={`p-2.5 rounded-xl border transition-all relative ${isDark
                ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-[#f2efe9]'
                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-650 hover:text-slate-800'
              } ${showNotifications ? (isDark ? 'bg-[#2c2b27] border-neutral-700' : 'bg-slate-100 border-slate-300') : ''}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${theme.badge} border border-white`} />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              <div onClick={() => setShowNotifications(false)} className="fixed inset-0 z-30" />

              <div className={`absolute right-0 mt-3 w-85 sm:w-96 rounded-[20px] border shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-155 ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'}`}>
                  <span className="font-bold text-xs">Notifications</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{userNotifications.length} alerts</span>
                </div>

                <div className={`max-h-[320px] overflow-y-auto divide-y ${isDark ? 'divide-neutral-800/80' : 'divide-slate-100'}`}>
                  {userNotifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications to display
                    </div>
                  ) : (
                    userNotifications.map((notif) => {
                      const iconDetails = getNotificationIcon(notif.title);
                      const IconComponent = iconDetails.icon;
                      const iconBg = isDark ? 'bg-neutral-800/80' : iconDetails.color;

                      let ctaText = "View Details";
                      if (notif.link) {
                        const path = notif.link.toLowerCase();
                        if (path.includes("messages")) ctaText = "Open Conversation";
                        else if (path.includes("incoming-offers")) ctaText = "View Offer";
                        else if (path.includes("verification")) ctaText = "Open Verification";
                        else if (path.includes("reviews")) ctaText = "View Review";
                        else if (path.includes("transaction-history") || path.includes("transaction")) ctaText = "View Transaction";
                        else if (path.includes("activity")) ctaText = "View Booking";
                      }

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.link)}
                          className={`p-4 cursor-pointer flex space-x-3 transition-colors ${isDark ? 'hover:bg-[#2c2b27]/40' : 'hover:bg-slate-50/50'} ${!notif.read ? (isDark ? 'bg-orange-950/10' : 'bg-orange-50/40') : ''}`}
                        >
                          <div className={`p-2 rounded-lg ${iconBg} h-8 w-8 flex-shrink-0 flex items-center justify-center`}>
                            <IconComponent className={`w-4 h-4 ${isDark ? 'text-slate-300' : ''}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-xs flex justify-between items-center">
                              <span>{notif.title}</span>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] text-slate-400 font-normal">{notif.time}</span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0" />
                                )}
                              </div>
                            </h5>
                            <p className={`text-[10.5px] mt-1 leading-normal ${isDark ? 'text-[#b4b0a9]' : 'text-slate-550'}`}>{notif.desc}</p>
                            {notif.link && (
                              <div className="mt-2 flex justify-start">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border transition-all ${
                                  isDark 
                                    ? 'bg-[#2a2927] border-neutral-700 text-orange-400 hover:text-[#f2efe9]' 
                                    : 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'
                                }`}>
                                  {ctaText} →
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={`p-2.5 border-t text-center ${isDark ? 'border-neutral-800 bg-[#1c1b18]/25' : 'border-slate-100 bg-slate-50/20'}`}>
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors">
                    Close Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className={`flex items-center space-x-2 p-1 rounded-xl border border-transparent ${theme.borderHover} transition-all ${showProfileMenu ? (isDark ? 'bg-[#22211e] border-neutral-800' : 'bg-slate-50 border-slate-200') : ''
                }`}
            >
              <img
                src={user.avatarUrl}
                alt="Profile Avatar"
                className={`w-7 h-7 rounded-full object-cover border ${currentRole === 'seeker' ? 'border-orange-500/30' : 'border-emerald-600/30'
                  }`}
              />
              <span className={`hidden sm:inline-block text-xs font-bold truncate max-w-[80px] ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>
                {user.firstName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div onClick={() => setShowProfileMenu(false)} className="fixed inset-0 z-30" />

                <div className={`absolute right-0 mt-3 w-52 rounded-[20px] border shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-155 ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200'
                  }`}>
                  <div className={`p-4 border-b ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/45'}`}>
                    <p className="text-[10px] text-slate-400 font-semibold">Signed in as</p>
                    <p className="text-xs font-bold truncate mt-0.5">{user.firstName} {user.lastName}</p>
                    <span className="inline-block px-1.5 py-0.5 text-[8.5px] font-extrabold rounded bg-slate-100 text-slate-600 mt-1 uppercase tracking-wider">
                      {currentRole}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onViewProfile) onViewProfile(user);
                      }}
                      className={`w-full flex items-center px-4 py-2 text-xs font-semibold transition-colors ${isDark ? 'text-slate-350 hover:text-white hover:bg-[#2c2b27]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      <User className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        alert('Account Settings will be configured in Phase 6.');
                      }}
                      className={`w-full flex items-center px-4 py-2 text-xs font-semibold transition-colors ${isDark ? 'text-slate-350 hover:text-white hover:bg-[#2c2b27]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      <Settings className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                      Account Settings
                    </button>
                  </div>

                  <div className={`border-t py-1 ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/40'}`}>
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center px-4 py-2 text-xs font-bold text-red-655 hover:text-red-550 hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
