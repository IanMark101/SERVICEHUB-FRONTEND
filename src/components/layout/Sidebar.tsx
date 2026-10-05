"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Compass,
  PlusCircle,
  Stack,
  Tray,
  TrendUp,
  Tag,
  ChatCircle,
  UsersThree,
  SignOut,
  CaretLeft,
  CaretRight,
  X,
  Briefcase,
  MagnifyingGlass,
  ClockCounterClockwise,
  ChartBar,
  ShieldCheck,
  Gavel,
  Warning,
  Question,
  Megaphone,
  Sun,
  Moon,
} from '@phosphor-icons/react';
import type { UserSession } from '../auth/LoginContainer';
import { useApp } from '../../context/AppContext';
import UserAvatar from '../ui/UserAvatar';
import useAdminBanAppealCount from '../../hooks/useAdminBanAppealCount';

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
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
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
  user,
}: SidebarProps) {
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

  const menus: Record<SidebarProps['currentRole'], MenuItem[]> = {
    seeker: [
      { id: 'seek-services', label: 'Seek Services', icon: Compass },
      { id: 'post-request', label: 'Post Request', icon: PlusCircle },
      { id: 'incoming-offers', label: 'Offers Received', icon: Tray, badge: pendingBidsCount || undefined },
      { id: 'request-manager', label: 'Request Manager', icon: Stack },
      { id: 'seeker-activity', label: 'Activity', icon: TrendUp },
    ],
    provider: [
      { id: 'browse-services', label: 'Browse Jobs', icon: Compass },
      { id: 'offer-services', label: 'Offer Services', icon: PlusCircle },
      { id: 'incoming-requests', label: 'Incoming Requests', icon: Tray, badge: pendingRequestsCount || undefined },
      { id: 'service-manager', label: 'Service Manager', icon: Stack },
      { id: 'provider-activity', label: 'Activity', icon: TrendUp },
      { id: 'transaction-history', label: 'Payment Records', icon: ClockCounterClockwise },
    ],
    admin: [
      { id: 'overview', label: 'Overview', icon: ChartBar },
      { id: 'users', label: 'User Management', icon: UsersThree },
      { id: 'ban-appeals', label: 'Ban Appeals', icon: Gavel, badge: pendingAppeals || undefined },
      { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
      { id: 'content-cases', label: 'Content Reports & Appeals', icon: Warning },
      { id: 'categories', label: 'Category Suggestions', icon: Tag },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'reports', label: 'Disputes & Reports', icon: Warning },
      { id: 'reviews', label: 'Review Moderation', icon: ShieldCheck },
      { id: 'audit-logs', label: 'Audit Log', icon: ClockCounterClockwise },
    ],
  };

  const sharedMenu: MenuItem[] = [
    { id: 'community-hub', label: 'Community Hub', icon: UsersThree },
    { id: 'messages', label: 'Messages', icon: ChatCircle, badge: unreadMessagesCount || undefined },
  ];

  const showLabels = !isCollapsed || isMobileOpen;
  const activeItemClass = currentRole === 'provider'
    ? 'bg-[#e7f4ec] text-[#056b4f] dark:bg-[#059669]/20 dark:text-[#9be5c2]'
    : currentRole === 'seeker'
      ? 'bg-[#f7ede8] text-[#92452b] dark:bg-[#c86544]/20 dark:text-[#f3b69f]'
      : 'bg-[var(--admin-active)] text-[var(--admin-accent)]';

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleRoleChange = (role: 'seeker' | 'provider') => {
    localStorage.setItem('workspaceRole', role);
    setCurrentRole(role);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const isCommunity = item.id === 'community-hub';

    if (isCommunity) {
      return (
        <button
          type="button"
          key={item.id}
          onClick={() => handleTabClick(item.id)}
          aria-current={isActive ? 'page' : undefined}
          aria-label={showLabels ? undefined : item.label}
          title={showLabels ? undefined : item.label}
          className={`group/btn relative flex min-h-11 w-full items-center overflow-hidden rounded-xl bg-[#0a0a0a] text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_14px_-3px_rgba(0,0,0,0.4)] ring-1 ring-black/20 transition-all hover:scale-[1.01] hover:bg-[#161616] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] motion-reduce:transition-none motion-reduce:hover:scale-100 dark:bg-[#2b2825] dark:text-[#f2dfd4] dark:shadow-[0_6px_16px_-8px_rgba(0,0,0,0.55)] dark:ring-white/10 dark:hover:bg-[#37312d] ${
            showLabels ? 'gap-3 px-3 text-left' : 'justify-center px-0'
          } ${
            isActive ? 'ring-2 ring-white/30 dark:ring-[#c86544]/50' : ''
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl dark:hidden"
            style={{
              background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.16), transparent 60%)',
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full"
          />
          <Icon size={18} className="relative z-10 shrink-0 text-current" aria-hidden="true" />
          {showLabels && <span className="relative z-10 min-w-0 flex-1 truncate">{item.label}</span>}
          {item.badge !== undefined && (
            showLabels
              ? (
                <span className="relative z-10 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-white/10 dark:text-[#f2dfd4]">
                  {item.badge}
                </span>
              )
              : <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--workspace-focus)]" aria-hidden="true" />
          )}
        </button>
      );
    }

    return (
      <button
        type="button"
        key={item.id}
        onClick={() => handleTabClick(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={showLabels ? undefined : item.label}
        title={showLabels ? undefined : item.label}
        className={`group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${showLabels ? '' : 'justify-center px-0'} ${
          isActive
            ? activeItemClass
            : 'text-ink-muted hover:bg-[#f5f4f2] hover:text-ink dark:text-ink-muted dark:hover:bg-white/[0.07] dark:hover:text-white'
        }`}
      >
        <Icon size={18} className="shrink-0" aria-hidden="true" />
        {showLabels && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
        {item.badge !== undefined && (
          showLabels
            ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/70 text-current dark:bg-black/20' : 'bg-[#eceae6] text-ink-muted dark:bg-white/10 dark:text-white'}`}>{item.badge}</span>
            : <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--workspace-focus)]" aria-hidden="true" />
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="workspace-sidebar flex h-full min-h-0 flex-col rounded-[18px] border border-[#e6e2dc] bg-[#fffdfa] text-ink shadow-[0_14px_36px_-28px_rgba(23,23,22,0.3)] dark:border-white/10 dark:bg-[#1a1918] dark:text-white dark:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55)]">
      <div className="workspace-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4">
        <div className={`flex items-center gap-2.5 ${showLabels ? 'px-1' : 'flex-col px-0'}`}>
          <Image src="/logo.svg?v=6" alt="" width={36} height={36} className="size-9 shrink-0 rounded-xl bg-white p-1" />
          {showLabels && (
            <div className="min-w-0 flex-1 leading-none">
              <span className="block truncate text-[13px] font-bold tracking-[-0.025em]">ServiceHub</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#aa5032] dark:text-[#e9a58c]">Cordova</span>
            </div>
          )}
          {isMobileOpen ? (
            <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Close workspace navigation" className="grid size-8 place-items-center rounded-lg border border-black/10 text-ink-muted hover:bg-[#f5f4f2] hover:text-ink dark:border-white/10 dark:text-ink-muted dark:hover:bg-white/[0.07] dark:hover:text-white md:hidden">
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden size-8 shrink-0 place-items-center rounded-lg border border-black/10 text-ink-muted transition-colors hover:bg-[#f5f4f2] hover:text-ink dark:border-white/10 dark:text-ink-muted dark:hover:bg-white/[0.07] dark:hover:text-white md:grid">
              {isCollapsed ? <CaretRight size={16} aria-hidden="true" /> : <CaretLeft size={16} aria-hidden="true" />}
            </button>
          )}
        </div>

        {currentRole !== 'admin' && (
          <div className="mt-7">
            {showLabels && <p className="px-2 text-[10px] font-semibold text-ink-muted dark:text-ink-muted">Switch workspace</p>}
            <div className={`mt-2 rounded-xl border border-black/8 bg-[#f8f6f2] p-1 dark:border-white/10 dark:bg-white/[0.04] ${showLabels ? 'grid grid-cols-2 gap-1' : 'space-y-1'}`} aria-label="Choose workspace">
              {([
                { role: 'seeker' as const, label: 'Seeker', icon: MagnifyingGlass },
                { role: 'provider' as const, label: 'Provider', icon: Briefcase },
              ]).map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  aria-pressed={currentRole === role}
                  aria-label={showLabels ? undefined : `Switch to ${label} workspace`}
                  title={showLabels ? undefined : `Switch to ${label} workspace`}
                  className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${currentRole === role ? role === 'seeker' ? 'bg-[#f7ede8] text-[#92452b] dark:bg-[#c86544]/20 dark:text-[#f3b69f]' : 'bg-[#e7f4ec] text-[#056b4f] dark:bg-[#059669]/20 dark:text-[#9be5c2]' : 'text-ink-muted hover:bg-white hover:text-ink dark:text-ink-muted dark:hover:bg-white/[0.06] dark:hover:text-white'}`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {showLabels && label}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav aria-label={currentRole === 'admin' ? 'Administration' : `${currentRole} workspace`} className="mt-7">
            {showLabels && <p className={`mb-2 px-2 text-[10px] font-semibold ${currentRole === 'admin' ? 'text-[color:var(--admin-muted)]' : 'text-ink-muted dark:text-ink-muted'}`}>{currentRole === 'admin' ? 'Administration' : 'Workspace'}</p>}
          <div className="space-y-1">{menus[currentRole].map(renderMenuItem)}</div>
        </nav>

        {currentRole !== 'admin' && (
          <nav aria-label="Community and messages" className="mt-6 border-t border-black/10 pt-5 dark:border-white/10">
            {showLabels && <p className="mb-2 px-2 text-[10px] font-semibold text-ink-muted dark:text-ink-muted">Connect</p>}
            <div className="space-y-1">{sharedMenu.map(renderMenuItem)}</div>
          </nav>
        )}
      </div>

      <div className="shrink-0 border-t border-black/10 px-3 py-3 dark:border-white/10">
        <Link href="/help" target="_blank" rel="noopener noreferrer" aria-label={showLabels ? undefined : 'Help Center'} title={showLabels ? undefined : 'Help Center'} className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-[12px] font-medium text-ink-muted transition-colors hover:bg-[#f5f4f2] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] dark:text-ink-muted dark:hover:bg-white/[0.06] dark:hover:text-white ${showLabels ? '' : 'justify-center px-0'}`}>
          <Question size={18} aria-hidden="true" />
          {showLabels && <span>Help Center</span>}
        </Link>
        {user && (
          <Link href={currentRole === 'admin' ? '/admin/user-profile' : `/profile/${encodeURIComponent(user.id)}`} aria-label="View your marketplace profile" className={`group/profile mt-2 flex items-center gap-2.5 border-t border-black/10 pt-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] dark:border-white/10 ${showLabels ? 'px-1' : 'justify-center'}`}>
            <UserAvatar src={user.avatarUrl} name={`${user.firstName || ''} ${user.lastName || ''}`} alt="" size={32} role={currentRole} />
            {showLabels && (
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-ink transition-colors group-hover/profile:text-[var(--workspace-focus)] dark:text-white">{user.firstName} {user.lastName}</p>
                <p className="mt-0.5 text-[10px] capitalize text-ink-muted dark:text-ink-muted">{currentRole}</p>
              </div>
            )}
          </Link>
        )}
        <button type="button" onClick={toggleTheme} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-medium text-ink-muted dark:text-ink-muted sm:hidden">
          {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button type="button" onClick={onSignOut} aria-label={showLabels ? undefined : 'Sign Out'} title={showLabels ? undefined : 'Sign Out'} className={`mt-2 flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-medium text-ink-muted transition-colors hover:bg-[#f5f4f2] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] dark:text-ink-muted dark:hover:bg-white/[0.06] dark:hover:text-white ${showLabels ? '' : 'justify-center px-0'}`}>
          <SignOut size={18} aria-hidden="true" />
          {showLabels && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`fixed bottom-2 left-2 top-2 z-25 hidden transition-[width] duration-200 md:block ${isCollapsed ? 'w-16' : 'w-60'}`} aria-label="Workspace sidebar">
        {sidebarContent}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Close workspace navigation" className="absolute inset-0 bg-[#171716]/65 backdrop-blur-sm" />
          <aside className="relative h-full w-full max-w-[18rem] p-2" aria-label="Mobile workspace sidebar">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
