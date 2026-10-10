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
import styles from './Sidebar.module.css';

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

interface MenuSection {
  label: string;
  items: MenuItem[];
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

  const menus: Record<'seeker' | 'provider', MenuItem[]> = {
    seeker: [
      { id: 'seek-services', label: 'Seek Services', icon: Compass },
      { id: 'post-request', label: 'Post Request', icon: PlusCircle },
      { id: 'incoming-offers', label: 'Offers Received', icon: Tray, badge: pendingBidsCount || undefined },
      { id: 'request-manager', label: 'Request Manager', icon: Stack },
      { id: 'seeker-activity', label: 'Activity', icon: TrendUp },
    ],
    provider: [
      { id: 'browse-services', label: 'Browse Service Requests', icon: Compass },
      { id: 'offer-services', label: 'Offer Services', icon: PlusCircle },
      { id: 'incoming-requests', label: 'Incoming Requests', icon: Tray, badge: pendingRequestsCount || undefined },
      { id: 'service-manager', label: 'Service Manager', icon: Stack },
      { id: 'provider-activity', label: 'Activity', icon: TrendUp },
      { id: 'transaction-history', label: 'Payment Records', icon: ClockCounterClockwise },
    ],
  };

  const adminSections: MenuSection[] = [
    {
      label: 'Dashboard',
      items: [{ id: 'overview', label: 'Overview', icon: ChartBar }],
    },
    {
      label: 'Accounts & Verification',
      items: [
        { id: 'users', label: 'User Management', icon: UsersThree },
        { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
      ],
    },
    {
      label: 'Reports & Moderation',
      items: [
        { id: 'content-cases', label: 'Content Reports & Appeals', icon: Warning },
        { id: 'reports', label: 'Disputes & Reports', icon: Warning },
        { id: 'reviews', label: 'Review Moderation', icon: ShieldCheck },
        { id: 'ban-appeals', label: 'Ban Appeals', icon: Gavel, badge: pendingAppeals || undefined },
      ],
    },
    {
      label: 'Marketplace & Updates',
      items: [
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
      ],
    },
    {
      label: 'Activity Records',
      items: [{ id: 'audit-logs', label: 'Audit Log', icon: ClockCounterClockwise }],
    },
  ];

  const sharedMenu: MenuItem[] = [
    { id: 'community-hub', label: 'Community Hub', icon: UsersThree },
    { id: 'messages', label: 'Messages', icon: ChatCircle, badge: unreadMessagesCount || undefined },
  ];

  const showLabels = !isCollapsed || isMobileOpen;
  const isStandardWorkspace = currentRole !== 'admin';
  const activeItemClass = 'bg-[var(--admin-active)] text-[var(--admin-accent)]';

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

    return (
      <button
        type="button"
        key={item.id}
        onClick={() => handleTabClick(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={showLabels ? undefined : item.label}
        title={showLabels ? undefined : item.label}
        className={isStandardWorkspace ? styles.item : `group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${showLabels ? '' : 'justify-center px-0'} ${
          isActive
            ? activeItemClass
            : 'text-ink-muted hover:bg-[#f5f4f2] hover:text-ink dark:text-ink-muted dark:hover:bg-charcoal dark:hover:text-white'
        }`}
      >
        <Icon size={18} className="shrink-0" aria-hidden="true" />
        {showLabels && <span className={isStandardWorkspace ? styles.itemLabel : 'min-w-0 flex-1 py-2 leading-4'}>{item.label}</span>}
        {item.badge !== undefined && (
          showLabels
            ? <span className={isStandardWorkspace ? styles.badge : `rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/70 text-current dark:bg-charcoal/20' : 'bg-[#eceae6] text-ink-muted dark:bg-charcoal dark:text-white'}`}>{item.badge}</span>
            : <span className={isStandardWorkspace ? styles.unreadDot : 'absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--workspace-focus)]'} aria-hidden="true" />
        )}
        {isStandardWorkspace && isActive && <span className={styles.activeDot} aria-hidden="true" />}
      </button>
    );
  };

  const sidebarContent = (
    <div data-workspace={currentRole} data-collapsed={!showLabels} className={isStandardWorkspace ? styles.panel : 'workspace-sidebar flex h-full min-h-0 flex-col rounded-[18px] border border-[#e6e2dc] bg-[#fffdfa] text-ink shadow-[0_14px_36px_-28px_rgba(23,23,22,0.3)] dark:border-white/10 dark:bg-charcoal-sidebar dark:text-white dark:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55)]'}>
      <div className={isStandardWorkspace ? styles.scroll : 'workspace-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4'}>
        <div className={isStandardWorkspace ? styles.brand : `flex items-center gap-2.5 ${showLabels ? 'px-1' : 'flex-col px-0'}`}>
          <Image src="/logo.svg?v=7" alt="" width={36} height={36} className="size-9 shrink-0 rounded-xl bg-white p-1" />
          {showLabels && (
            <div className={isStandardWorkspace ? styles.brandText : 'min-w-0 flex-1 leading-none'}>
              <span className={isStandardWorkspace ? styles.brandName : 'block truncate text-[13px] font-bold tracking-[-0.025em]'}>ServiceHub</span>
            </div>
          )}
          {isMobileOpen ? (
            <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Close workspace navigation" className={isStandardWorkspace ? `${styles.control} ${styles.mobileClose}` : 'grid size-8 place-items-center rounded-lg border border-black/10 text-ink-muted hover:bg-[#f5f4f2] hover:text-ink dark:border-white/10 dark:text-ink-muted dark:hover:bg-charcoal dark:hover:text-white md:hidden'}>
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={isStandardWorkspace ? `${styles.control} ${styles.collapseControl}` : 'hidden size-8 shrink-0 place-items-center rounded-lg border border-black/10 text-ink-muted transition-colors hover:bg-[#f5f4f2] hover:text-ink dark:border-white/10 dark:text-ink-muted dark:hover:bg-charcoal dark:hover:text-white md:grid'}>
              {isCollapsed ? <CaretRight size={16} aria-hidden="true" /> : <CaretLeft size={16} aria-hidden="true" />}
            </button>
          )}
        </div>

        {currentRole !== 'admin' && (
          <div className={styles.switchSection}>
            {showLabels && <p className={styles.sectionLabel}>Switch workspace</p>}
            <div className={styles.switcher} aria-label="Choose workspace">
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
                  className={styles.switchButton}
                >
                  <Icon size={15} aria-hidden="true" />
                  {showLabels && label}
                </button>
              ))}
            </div>
          </div>
        )}

        <nav aria-label={currentRole === 'admin' ? 'Administration' : `${currentRole} workspace`} className={isStandardWorkspace ? styles.navigation : 'mt-7'}>
          {currentRole === 'admin' ? (
            adminSections.map((section, index) => (
              <div
                key={section.label}
                role="group"
                aria-label={section.label}
                className={index === 0 ? undefined : `border-t border-[var(--workspace-border)] ${showLabels ? 'mt-3 pt-3' : 'mt-2 pt-2'}`}
              >
                <h2 className={showLabels ? 'mb-2 px-3 text-[10px] font-semibold text-ink-muted' : 'sr-only'}>{section.label}</h2>
                <div className="space-y-1">{section.items.map(renderMenuItem)}</div>
              </div>
            ))
          ) : (
            <>
              {showLabels && <p className={styles.sectionLabel}>Workspace</p>}
              <div className={styles.menu}>{menus[currentRole].map(renderMenuItem)}</div>
            </>
          )}
        </nav>

        {currentRole !== 'admin' && (
          <nav aria-label="Community and messages" className={styles.connect}>
            {showLabels && <p className={styles.sectionLabel}>Connect</p>}
            <div className={styles.menu}>{sharedMenu.map(renderMenuItem)}</div>
          </nav>
        )}
      </div>

      <div className={isStandardWorkspace ? styles.footer : 'shrink-0 border-t border-black/10 px-3 py-3 dark:border-white/10'}>
        <Link href="/help" target="_blank" rel="noopener noreferrer" aria-label={showLabels ? undefined : 'Help Center'} title={showLabels ? undefined : 'Help Center'} className={isStandardWorkspace ? styles.item : `flex min-h-10 items-center gap-3 rounded-xl px-3 text-[12px] font-medium text-ink-muted transition-colors hover:bg-[#f5f4f2] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] dark:text-ink-muted dark:hover:bg-charcoal dark:hover:text-white ${showLabels ? '' : 'justify-center px-0'}`}>
          <Question size={18} aria-hidden="true" />
          {showLabels && <span>Help Center</span>}
        </Link>
        {user && (
          <Link href={currentRole === 'admin' ? '/admin/user-profile' : `/profile/${encodeURIComponent(user.id)}`} aria-label="View your marketplace profile" className={isStandardWorkspace ? styles.profile : `group/profile mt-2 flex items-center gap-2.5 border-t border-black/10 pt-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] dark:border-white/10 ${showLabels ? 'px-1' : 'justify-center'}`}>
            <UserAvatar src={user.avatarUrl} name={`${user.firstName || ''} ${user.lastName || ''}`} alt="" size={32} role={currentRole} />
            {showLabels && (
              <div className={isStandardWorkspace ? styles.profileText : 'min-w-0 flex-1'}>
                <p className={isStandardWorkspace ? styles.profileName : 'truncate text-[11px] font-semibold text-ink transition-colors group-hover/profile:text-[var(--workspace-focus)] dark:text-white'}>{user.firstName} {user.lastName}</p>
                <p className={isStandardWorkspace ? styles.profileRole : 'mt-0.5 text-[10px] capitalize text-ink-muted dark:text-ink-muted'}>{currentRole}</p>
              </div>
            )}
          </Link>
        )}
        <button type="button" onClick={toggleTheme} className={isStandardWorkspace ? `${styles.item} ${styles.themeButton}` : 'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-medium text-ink-muted dark:text-ink-muted sm:hidden'}>
          {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button type="button" onClick={onSignOut} aria-label={showLabels ? undefined : 'Sign Out'} title={showLabels ? undefined : 'Sign Out'} className={isStandardWorkspace ? `${styles.item} ${styles.signOut}` : `mt-2 flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-medium text-ink-muted transition-colors hover:bg-[#f5f4f2] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] dark:text-ink-muted dark:hover:bg-charcoal dark:hover:text-white ${showLabels ? '' : 'justify-center px-0'}`}>
          <SignOut size={18} aria-hidden="true" />
          {showLabels && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside data-collapsed={isCollapsed} className={isStandardWorkspace ? styles.frame : `fixed bottom-2 left-2 top-2 z-25 hidden transition-[width] duration-200 md:block ${isCollapsed ? 'w-16' : 'w-60'}`} aria-label="Workspace sidebar">
        {sidebarContent}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Close workspace navigation" className="absolute inset-0 bg-charcoal/65 backdrop-blur-sm" />
          <aside className={isStandardWorkspace ? styles.mobileFrame : 'relative h-full w-full max-w-[18rem] p-2'} aria-label="Mobile workspace sidebar">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
