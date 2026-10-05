import { useEffect, useId, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle as CheckCircle2,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  CurrencyDollar as DollarSign,
  ShieldWarning as ShieldAlert,
  X,
} from '@phosphor-icons/react';
import type { Notification } from '../../../types';

interface HeaderNotificationsProps {
  isDark: boolean;
  isOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  badgeClass: string;
  onToggle: () => void;
  onClose: () => void;
  onNotificationClick: (link?: string | null) => void;
  onMarkAllRead: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

function getNotificationIcon(title: string) {
  const text = title.toLowerCase();
  if (text.includes('accept') || text.includes('approve') || text.includes('verified')) {
    return CheckCircle2;
  }
  if (text.includes('dispute') || text.includes('decline') || text.includes('report')) {
    return ShieldAlert;
  }
  if (text.includes('payout') || text.includes('paid') || text.includes('transaction')) {
    return DollarSign;
  }
  return Bell;
}

function getNotificationCta(link?: string | null) {
  if (!link) return 'View Details';
  const path = link.toLowerCase();
  if (path.includes('messages')) return 'Open Conversation';
  if (path.includes('incoming-requests')) return 'Review Request';
  if (path.includes('incoming-offers')) return 'Review Offers';
  if (path.includes('service-manager')) return 'Manage Listing';
  if (path.includes('/admin/services')) return 'Review Listing';
  if (path.includes('suggest-category')) return 'View Category';
  if (path.includes('account-settings') || path.includes('settings')) return 'Open Settings';
  if (path.includes('verification')) return 'Open Verification';
  if (path.includes('reviews')) return 'View Review';
  if (path.includes('transaction-history') || path.includes('transaction')) return 'View Transaction';
  if (path.includes('activity')) return 'View Booking';
  return 'View Details';
}

export default function HeaderNotifications({
  isDark,
  isOpen,
  notifications,
  unreadCount,
  badgeClass,
  onToggle,
  onClose,
  onNotificationClick,
  onMarkAllRead,
  hasMore,
  onLoadMore
}: HeaderNotificationsProps) {
  const pageSize = 3;
  const panelId = useId();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(
    () => notifications.filter((notification) => (
      filter === 'All'
      || (filter === 'Unread' ? !notification.read : notification.link?.toLowerCase().includes(filter.toLowerCase()))
    )),
    [filter, notifications],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visiblePage = Math.min(page, totalPages);
  const visibleNotifications = useMemo(
    () => filtered.slice((visiblePage - 1) * pageSize, visiblePage * pageSize),
    [filtered, visiblePage],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <button type="button" aria-controls={panelId} aria-label={isOpen ? 'Close notifications' : `Open notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={isOpen} onClick={() => { if (!isOpen) setPage(1); onToggle(); }} className={`workspace-header-control relative grid size-9 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${isOpen ? 'bg-[var(--feedback-soft)] text-[var(--feedback-accent)]' : ''}`}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${badgeClass} border border-white`} />}
      </button>

      {isOpen && (
        <>
          <div onClick={onClose} className="fixed inset-0 z-30" />
          <div id={panelId} role="dialog" aria-label="Notifications" className={`notification-panel fixed left-3 right-3 top-[4.75rem] z-40 flex max-h-[min(70dvh,28rem)] flex-col overflow-hidden rounded-2xl border shadow-[0_22px_54px_-28px_rgba(23,23,22,0.55)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:max-h-[min(28rem,calc(100dvh-6rem))] sm:w-[23rem] ${isDark ? 'bg-[#202020] border-neutral-800 text-white' : 'bg-white border-slate-200 text-ink'}`}>
            <div className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3.5 ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
              <div>
                <span className="block font-bold text-xs">Notifications</span>
                <span className="mt-0.5 block text-[9px] text-ink-subtle">Updates about your account and bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ink-subtle font-semibold">
                  {unreadCount > 0 ? `${unreadCount} unread` : `${notifications.length}${hasMore ? '+' : ''} alerts`}
                </span>
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={onClose}
                  className={`grid size-8 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${isDark ? 'hover:bg-white/8' : 'hover:bg-slate-100'}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className={`notification-filters flex shrink-0 flex-nowrap gap-1.5 overflow-x-auto border-b px-3 py-2.5 ${isDark ? 'border-neutral-800' : 'border-slate-100'}`} aria-label="Filter notifications">
              {['All', 'Unread', 'Seeker', 'Provider', 'Community'].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => { setFilter(item); setPage(1); }}
                  className={`min-h-7 shrink-0 whitespace-nowrap rounded-[10px] border px-2.5 text-[10px] font-semibold leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${
                    filter === item
                      ? 'border-[var(--feedback-border)] bg-[var(--feedback-soft)] text-[var(--feedback-accent)]'
                      : isDark
                        ? 'border-neutral-700 bg-neutral-800/70 text-ink-subtle hover:border-neutral-600 hover:text-neutral-100'
                        : 'border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:text-ink'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={`min-h-24 flex-1 overflow-y-auto overscroll-contain divide-y ${isDark ? 'divide-neutral-800/80' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-[color:var(--workspace-muted)]">{filter === 'All' ? 'No notifications yet.' : `No ${filter.toLowerCase()} notifications.`}</div>
              ) : visibleNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.title);
                return (
                  <button type="button" key={notification.id} onClick={() => onNotificationClick(notification.link)} className={`w-full px-4 py-3 cursor-pointer flex space-x-3 text-left transition-colors ${isDark ? 'hover:bg-neutral-800/45' : 'hover:bg-slate-50'} ${!notification.read ? (isDark ? 'bg-neutral-800/35' : 'bg-slate-50') : ''}`}>
                    <div className="rounded-lg bg-[var(--feedback-soft)] text-[var(--feedback-accent)] h-8 w-8 flex-shrink-0 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="flex items-start justify-between gap-2 text-xs font-bold">
                        <span className="min-w-0 leading-4">{notification.title}</span>
                        <div className="flex shrink-0 items-center space-x-1.5">
                          <span className="text-[9px] text-ink-subtle font-normal">{notification.time}</span>
                          {!notification.read && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badgeClass}`} />}
                        </div>
                      </h5>
                      <p className={`mt-1 line-clamp-2 text-[10.5px] leading-4 ${isDark ? 'text-ink-muted' : 'text-ink-muted'}`}>{notification.desc}</p>
                      {notification.link && (
                        <div className="mt-1.5 flex justify-start">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold transition-colors text-[var(--feedback-accent)]">
                            {getNotificationCta(notification.link)}
                            <ArrowRight className="size-3" weight="bold" aria-hidden="true" />
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className={`shrink-0 border-t px-3 py-2.5 ${isDark ? 'border-neutral-800 bg-[#1b1b1b]' : 'border-slate-100 bg-slate-50/60'}`}>
              <div className="flex min-h-8 items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-[9px] font-medium text-ink-subtle">Page {visiblePage} of {totalPages}{hasMore ? '+' : ''}</span>
                  {unreadCount > 0 && (
                    <button type="button" onClick={onMarkAllRead} className={`mt-0.5 text-[10px] font-bold transition-colors ${isDark ? 'text-neutral-300 hover:text-white' : 'text-ink-secondary hover:text-ink'}`}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={visiblePage === 1} aria-label="Previous notification page" className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-ink-muted disabled:opacity-30 dark:border-neutral-700 dark:text-ink-secondary">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={visiblePage >= totalPages} aria-label="Next notification page" className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-ink-muted disabled:opacity-30 dark:border-neutral-700 dark:text-ink-secondary">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  {hasMore && visiblePage === totalPages && <button type="button" onClick={onLoadMore} className="ml-1 text-[9px] font-bold text-ink-secondary hover:text-ink dark:text-ink-secondary dark:hover:text-white">Load older</button>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
