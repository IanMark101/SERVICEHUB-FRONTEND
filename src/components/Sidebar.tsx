import React from 'react';
import {
  Compass,
  PlusCircle,
  Layers,
  Inbox,
  TrendingUp,
  Tag,
  MessageSquare,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  Search,
  History,
  BarChart2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { UserSession } from './auth/LoginContainer';
import { useApp } from '../context/AppContext';

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

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

export default function Sidebar({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onSignOut,
  user
}: SidebarProps) {

  // Bind to App Context
  const { bids, jobRequests, jobEngagements, isDark, unreadMessagesCount } = useApp();

  // Resolve current mock user ID
  const mockUserId = user?.id || '';

  // Dynamic Badge Calculations
  const pendingBidsCount = bids.filter(b => b.status === 'pending' && jobRequests.some(r => r.id === b.requestId && r.seekerId === mockUserId)).length;
  const pendingRequestsCount = jobEngagements.filter(je => je.providerId === mockUserId && je.status === 'pending_provider').length;

  // Role styling configs
  const roleThemes = {
    seeker: {
      accent: isDark ? 'text-orange-400' : 'text-orange-600',
      bgActive: isDark ? 'bg-orange-950/20' : 'bg-orange-50/70',
      borderActive: 'border-orange-500',
      badge: isDark ? 'bg-orange-950/40 text-orange-400 border-orange-900/30' : 'bg-orange-50 text-orange-600 border-orange-200'
    },
    provider: {
      accent: isDark ? 'text-emerald-400' : 'text-emerald-600',
      bgActive: isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/70',
      borderActive: 'border-emerald-500',
      badge: isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    admin: {
      accent: isDark ? 'text-red-400' : 'text-red-655',
      bgActive: isDark ? 'bg-red-950/20' : 'bg-red-50/70',
      borderActive: 'border-red-500',
      badge: isDark ? 'bg-red-950/40 text-red-400 border-red-900/30' : 'bg-red-50 text-red-655 border-red-200'
    }
  };

  const theme = roleThemes[currentRole];

  // Define tab menus with computed badges
  const menus: Record<'seeker' | 'provider' | 'admin', MenuItem[]> = {
    seeker: [
      { id: 'seek-services', label: 'Seek Services', icon: Compass },
      { id: 'post-request', label: 'Post Request', icon: PlusCircle },
      { id: 'incoming-offers', label: 'Service Requests', icon: Inbox, badge: pendingBidsCount > 0 ? pendingBidsCount : undefined },
      { id: 'request-manager', label: 'Request Manager', icon: Layers },
      { id: 'seeker-activity', label: 'Activity', icon: TrendingUp },
      { id: 'suggest-category', label: 'Suggest Category', icon: Tag },
    ],
    provider: [
      { id: 'browse-services', label: 'Browse Jobs', icon: Compass },
      { id: 'offer-services', label: 'Offer Services', icon: PlusCircle },
      { id: 'incoming-requests', label: 'Incoming Requests', icon: Inbox, badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
      { id: 'service-manager', label: 'Service Manager', icon: Layers },
      { id: 'provider-activity', label: 'Activity', icon: TrendingUp },
      { id: 'transaction-history', label: 'Earnings', icon: History },
    ],
    admin: [
      { id: 'overview', label: 'Overview', icon: BarChart2 },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
      { id: 'services', label: 'Pending Services', icon: Briefcase },
      { id: 'categories', label: 'Category Suggestions', icon: Tag },
      { id: 'reports', label: 'Disputes & Reports', icon: AlertTriangle },
    ]
  };

  const sharedMenu: MenuItem[] = [
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: 'community-hub', label: 'Community Hub', icon: Users },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleRoleChange = (role: 'seeker' | 'provider') => {
    localStorage.setItem('workspaceRole', role);
    setCurrentRole(role);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleTabClick(item.id)}
        className={`w-full flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl transition-all group relative ${isActive
          ? `${theme.accent} ${theme.bgActive} border-l-4 ${theme.borderActive}`
          : isDark
            ? 'text-[#b4b0a9] hover:text-[#f2efe9] hover:bg-[#2c2b27]/40'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive
          ? ''
          : isDark
            ? 'text-neutral-500 group-hover:text-[#b4b0a9]'
            : 'text-slate-400 group-hover:text-slate-500'
          }`} />

        {(!isCollapsed || isMobileOpen) && (
          <span className="ml-3 tracking-wide transition-opacity duration-200 truncate">{item.label}</span>
        )}

        {/* Badge Indicator */}
        {item.badge !== undefined && (!isCollapsed || isMobileOpen) && (
          <span className={`ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-full border ${theme.badge}`}>
            {item.badge}
          </span>
        )}

        {/* Collapsed Badge Dot indicator */}
        {item.badge !== undefined && isCollapsed && !isMobileOpen && (
          <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${currentRole === 'seeker' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
        )}

        {/* Tooltip on Hover when Collapsed */}
        {isCollapsed && !isMobileOpen && (
          <div className={`absolute left-16 hidden group-hover:block text-xs py-1 px-2.5 rounded-lg border shadow-lg whitespace-nowrap z-50 ${isDark
            ? 'bg-[#22211e] text-[#f2efe9] border-neutral-800/80'
            : 'bg-slate-900 text-white border-slate-800'
            }`}>
            {item.label}
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className={`h-full flex flex-col justify-between py-5 px-3 select-none transition-colors duration-200 ${isDark
      ? 'bg-[#1c1b18] border-r border-neutral-800/80 text-[#f2efe9]'
      : 'bg-white border-r border-slate-200 text-slate-800'
      }`}>

      {/* Brand & Workspace Role Switcher */}
      <div>
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-lg text-white font-extrabold text-base flex items-center justify-center transition-all ${
              currentRole === 'seeker' ? 'bg-orange-600' : currentRole === 'admin' ? 'bg-red-600' : 'bg-emerald-600'
            }`}>
              S
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
                ServiceHub
              </span>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {!isMobileOpen && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden md:flex p-1.5 rounded-lg border transition-all ${isDark
                ? 'border-neutral-800 bg-[#22211e] hover:bg-[#2c2b27] text-[#b4b0a9] hover:text-white'
                : 'border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700'
                }`}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Mobile Drawer Close */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className={`md:hidden p-1.5 rounded-lg border transition-all ${isDark
                ? 'border-neutral-800 bg-[#22211e] hover:bg-[#2c2b27] text-[#b4b0a9] hover:text-white'
                : 'border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700'
                }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Role Switcher */}
        {currentRole !== 'admin' ? (
          <div className="mb-6 px-1">
            {(!isCollapsed || isMobileOpen) ? (
              <div className={`p-1 rounded-2xl border transition-all ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleRoleChange('seeker')}
                    className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${currentRole === 'seeker'
                      ? isDark
                        ? 'bg-[#1c1b18] text-orange-400 shadow-sm border border-neutral-800/40'
                        : 'bg-white text-orange-600 shadow-sm border border-slate-100'
                      : isDark
                        ? 'text-[#b4b0a9] hover:text-[#f2efe9]'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Search className="w-3.5 h-3.5 mr-2" />
                    Seeker
                  </button>
                  <button
                    onClick={() => handleRoleChange('provider')}
                    className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${currentRole === 'provider'
                      ? isDark
                        ? 'bg-[#1c1b18] text-emerald-400 shadow-sm border border-neutral-800/40'
                        : 'bg-white text-emerald-600 shadow-sm border border-slate-100'
                      : isDark
                        ? 'text-[#b4b0a9] hover:text-[#f2efe9]'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 mr-2" />
                    Provider
                  </button>
                </div>
              </div>
            ) : (
              // Collapsed quick switcher icons
              <div className={`flex flex-col items-center space-y-1.5 p-1 rounded-xl border transition-all ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                <button
                  onClick={() => handleRoleChange('seeker')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${currentRole === 'seeker'
                    ? isDark ? 'bg-[#1c1b18] text-orange-400 shadow-sm' : 'bg-white text-orange-600 shadow-sm'
                    : isDark ? 'text-[#b4b0a9] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  title="Switch to Seeker"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleRoleChange('provider')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${currentRole === 'provider'
                    ? isDark ? 'bg-[#1c1b18] text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm'
                    : isDark ? 'text-[#b4b0a9] hover:text-[#f2efe9]' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  title="Switch to Provider"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          (!isCollapsed || isMobileOpen) && (
            <div className="mb-6 px-1">
              <div className={`px-3 py-2.5 rounded-xl border text-center text-[10px] font-extrabold tracking-wider uppercase border-red-500/25 bg-red-500/5 text-red-500`}>
                🛡️ Admin Area
              </div>
            </div>
          )
        )}

        {/* Role Menu Headers and Listings */}
        <div className="space-y-5">
          <div>
            <div className="space-y-0.5">
              {menus[currentRole].map(renderMenuItem)}
            </div>
          </div>

          {currentRole !== 'admin' && (
            <div className={`border-t pt-4 ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>
              <div className="space-y-0.5">
                {sharedMenu.map(renderMenuItem)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`space-y-2 pt-4 border-t ${isDark ? 'border-neutral-800/80' : 'border-slate-200'}`}>

        {/* User Mini Profile */}
        {(!isCollapsed || isMobileOpen) && user && (
          <div className={`mx-1 p-2 rounded-xl border flex items-center space-x-2.5 transition-colors duration-200 ${isDark ? 'bg-[#22211e] border-neutral-800/80' : 'bg-slate-50 border-slate-200/60'
            }`}>
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className={`w-8 h-8 rounded-full object-cover border-2 ${currentRole === 'seeker'
                ? isDark ? 'border-orange-500/40' : 'border-orange-600/30'
                : isDark ? 'border-emerald-500/40' : 'border-emerald-600/30'
                }`}
            />
            <div className="min-w-0 flex-1">
              <h4 className={`text-xs font-bold truncate ${isDark ? 'text-[#f2efe9]' : 'text-slate-800'}`}>{user.firstName} {user.lastName}</h4>
              <p className={`text-[9px] truncate tracking-wider uppercase font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-450'}`}>{currentRole}</p>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className={`w-full flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl text-red-655 hover:text-red-500 border border-transparent transition-all group ${isDark ? 'hover:bg-red-950/20 hover:border-red-950/30' : 'hover:bg-red-50 hover:border-red-100'
            }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {(!isCollapsed || isMobileOpen) && (
            <span className="ml-3">Sign Out</span>
          )}
        </button>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:block h-screen fixed top-0 left-0 border-r z-25 transition-all duration-300 ${isDark ? 'bg-[#1c1b18] border-neutral-800/80' : 'bg-white border-slate-200'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Clicker */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Sidebar */}
          <aside className={`relative flex-1 flex flex-col max-w-xs w-full h-full transform transition-transform duration-300 ease-in-out ${isDark ? 'bg-[#1c1b18]' : 'bg-white'
            }`}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
