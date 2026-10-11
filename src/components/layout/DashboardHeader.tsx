import type { ReactNode } from 'react';
import { Briefcase, MagnifyingGlass as Search, List as Menu, ChatCircle as MessageSquare, Sun, Moon } from '@phosphor-icons/react';
import type { UserSession } from '../auth/LoginContainer';

interface DashboardHeaderProps {
  currentRole: 'seeker' | 'provider' | 'admin';
  pageName: string;
  isDark: boolean;
  user: UserSession | null;
  unreadMessagesCount: number;
  isMobileSearchOpen: boolean;
  theme: { badge: string };
  setIsMobileOpen: (open: boolean) => void;
  navigateToVerification: () => void;
  toggleTheme: () => void;
  onMessages: () => void;
  onMobileSearch: () => void;
  desktopSearch: ReactNode;
  notifications: ReactNode;
  profileMenu: ReactNode;
  mobileSearch: ReactNode;
}

/** Presentational workspace header; account/search effects stay in Header. */
export default function DashboardHeader({ currentRole, pageName, isDark, user, unreadMessagesCount, isMobileSearchOpen, theme, setIsMobileOpen, navigateToVerification, toggleTheme, onMessages, onMobileSearch, desktopSearch, notifications, profileMenu, mobileSearch }: DashboardHeaderProps) {
  return (
    <header className={`workspace-dashboard-header sticky right-0 top-0 z-30 h-[68px] w-full shrink-0 gap-3 px-4 py-3 font-sans sm:px-6 md:px-8 ${isDark ? 'text-white' : 'text-ink'}`}>

      {/* Left identity card: dashboard counterpart to the landing brand card. */}
      <div className={`workspace-header-card workspace-header-context flex min-w-0 items-center gap-2.5 ${currentRole === 'admin' ? 'workspace-header-context--admin' : ''}`}>
        <button
          type="button"
          aria-label="Open workspace navigation"
          onClick={() => setIsMobileOpen(true)}
          className="workspace-header-control grid size-9 shrink-0 place-items-center rounded-full transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {currentRole === 'admin' ? (
            <span className="text-xs font-semibold text-[var(--admin-accent)]">Administrator</span>
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
                <span className={`workspace-header-page-name mt-0.5 block truncate text-[14px] font-bold capitalize leading-none tracking-[-0.025em] ${isDark ? 'text-white' : 'text-ink'}`}>
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

        {currentRole !== 'admin' && (
          <>
            {desktopSearch}

            <span className="workspace-header-divider hidden h-5 w-px lg:block" aria-hidden="true" />

            {/* Mobile Search Toggle Icon */}
            <button
              type="button"
              aria-label="Search people"
              onClick={onMobileSearch}
              className={`workspace-header-control grid size-9 place-items-center rounded-full transition-colors lg:hidden ${
                isMobileSearchOpen
                  ? isDark ? 'bg-brand/15 text-orange-300' : 'bg-orange-100 text-brand-action-hover'
                  : ''
              }`}
              title="Search people"
            >
              <Search className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Global Messages Quick Access */}
        {currentRole !== 'admin' && (
          <button
            type="button"
            onClick={onMessages}
            className={`workspace-header-control relative hidden size-9 cursor-pointer place-items-center rounded-full transition-colors sm:grid ${isDark ? 'text-ink-subtle hover:text-white' : 'text-ink-muted hover:text-ink'}`}
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
          className={`workspace-header-control hidden size-9 place-items-center rounded-full transition-colors sm:grid ${isDark ? 'text-ink-subtle hover:text-white' : 'text-ink-muted hover:text-ink'}`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {notifications}

        {profileMenu}

      </div>

      {currentRole !== 'admin' && mobileSearch}
    </header>
  );
}
