import { useMemo, useState } from 'react';
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, DollarSign, ShieldAlert } from 'lucide-react';
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
    return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' };
  }
  if (text.includes('dispute') || text.includes('decline') || text.includes('report')) {
    return { icon: ShieldAlert, color: 'text-red-500 bg-red-50' };
  }
  if (text.includes('payout') || text.includes('paid') || text.includes('transaction')) {
    return { icon: DollarSign, color: 'text-purple-500 bg-purple-50' };
  }
  return { icon: Bell, color: 'text-slate-500 bg-slate-100' };
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
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
  const visiblePage = Math.min(page, totalPages);
  const visibleNotifications = useMemo(
    () => notifications.slice((visiblePage - 1) * pageSize, visiblePage * pageSize),
    [notifications, visiblePage],
  );

  return (
    <div className="relative">
      <button onClick={() => { if (!isOpen) setPage(1); onToggle(); }} className={`p-2.5 rounded-xl border transition-all relative ${isDark ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-[#f2efe9]' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800'} ${isOpen ? (isDark ? 'bg-[#2c2b27] border-neutral-700' : 'bg-slate-100 border-slate-300') : ''}`}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${badgeClass} border border-white`} />}
      </button>

      {isOpen && (
        <>
          <div onClick={onClose} className="fixed inset-0 z-30" />
          <div className={`absolute right-0 mt-3 w-85 sm:w-96 rounded-2xl border shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-155 ${isDark ? 'bg-[#202020] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className={`px-4 py-3.5 border-b flex justify-between items-center ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
              <div>
                <span className="block font-bold text-xs">Notifications</span>
                <span className="mt-0.5 block text-[9px] text-slate-400">Account and marketplace updates</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{notifications.length}{hasMore ? '+' : ''} alerts</span>
            </div>
            <div className={`min-h-[292px] max-h-[340px] overflow-y-auto divide-y ${isDark ? 'divide-neutral-800/80' : 'divide-slate-100'}`}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No notifications to display</div>
              ) : visibleNotifications.map((notification) => {
                const iconDetails = getNotificationIcon(notification.title);
                const Icon = iconDetails.icon;
                const iconBg = isDark ? 'bg-neutral-800/80' : iconDetails.color;
                return (
                  <div key={notification.id} onClick={() => onNotificationClick(notification.link)} className={`px-4 py-3.5 cursor-pointer flex space-x-3 transition-colors ${isDark ? 'hover:bg-neutral-800/45' : 'hover:bg-slate-50'} ${!notification.read ? (isDark ? 'bg-violet-950/10' : 'bg-violet-50/35') : ''}`}>
                    <div className={`rounded-lg ${iconBg} h-8 w-8 flex-shrink-0 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${isDark ? 'text-slate-300' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="flex items-start justify-between gap-2 text-xs font-bold">
                        <span className="min-w-0 leading-4">{notification.title}</span>
                        <div className="flex shrink-0 items-center space-x-1.5">
                          <span className="text-[9px] text-slate-400 font-normal">{notification.time}</span>
                          {!notification.read && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badgeClass}`} />}
                        </div>
                      </h5>
                      <p className={`mt-1 line-clamp-2 text-[10.5px] leading-4 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>{notification.desc}</p>
                      {notification.link && (
                        <div className="mt-2 flex justify-start">
                          <span className={`text-[9px] font-bold transition-colors ${isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}>
                            {getNotificationCta(notification.link)} →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`border-t px-3 py-2.5 ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] font-medium text-slate-400">Page {visiblePage} of {totalPages}{hasMore ? '+' : ''}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={visiblePage === 1} aria-label="Previous notification page" className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={visiblePage >= totalPages} aria-label="Next notification page" className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  {hasMore && visiblePage === totalPages && <button type="button" onClick={onLoadMore} className="ml-1 text-[9px] font-bold text-violet-600 dark:text-violet-400">Load older</button>}
                </div>
              </div>
            </div>
            <div className={`px-3.5 py-2.5 border-t flex items-center justify-between ${isDark ? 'border-neutral-800 bg-[#1b1b1b]' : 'border-slate-100 bg-slate-50/60'}`}>
              {unreadCount > 0 ? <button onClick={onMarkAllRead} className={`text-[10px] font-bold transition-colors ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-violet-700 hover:text-violet-900'}`}>Mark all read</button> : <span />}
              <button onClick={onClose} className="text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors dark:hover:text-white">Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
