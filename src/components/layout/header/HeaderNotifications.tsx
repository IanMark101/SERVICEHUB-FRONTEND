import { Bell, CheckCircle2, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
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
  return { icon: Sparkles, color: 'text-orange-600 bg-orange-50' };
}

function getNotificationCta(link?: string | null) {
  if (!link) return 'View Details';
  const path = link.toLowerCase();
  if (path.includes('messages')) return 'Open Conversation';
  if (path.includes('incoming-requests')) return 'Review Request';
  if (path.includes('incoming-offers')) return 'Review Offers';
  if (path.includes('service-manager')) return 'Manage Listing';
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
  onMarkAllRead
}: HeaderNotificationsProps) {
  return (
    <div className="relative">
      <button onClick={onToggle} className={`p-2.5 rounded-xl border transition-all relative ${isDark ? 'bg-[#22211e] border-neutral-800/80 hover:bg-[#2c2b27] text-[#f2efe9]' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800'} ${isOpen ? (isDark ? 'bg-[#2c2b27] border-neutral-700' : 'bg-slate-100 border-slate-300') : ''}`}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${badgeClass} border border-white`} />}
      </button>

      {isOpen && (
        <>
          <div onClick={onClose} className="fixed inset-0 z-30" />
          <div className={`absolute right-0 mt-3 w-85 sm:w-96 rounded-[20px] border shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-155 ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/50'}`}>
              <span className="font-bold text-xs">Notifications</span>
              <span className="text-[10px] text-slate-400 font-semibold">{notifications.length} alerts</span>
            </div>
            <div className={`max-h-[320px] overflow-y-auto divide-y ${isDark ? 'divide-neutral-800/80' : 'divide-slate-100'}`}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No notifications to display</div>
              ) : notifications.map((notification) => {
                const iconDetails = getNotificationIcon(notification.title);
                const Icon = iconDetails.icon;
                const iconBg = isDark ? 'bg-neutral-800/80' : iconDetails.color;
                return (
                  <div key={notification.id} onClick={() => onNotificationClick(notification.link)} className={`p-4 cursor-pointer flex space-x-3 transition-colors ${isDark ? 'hover:bg-[#2c2b27]/40' : 'hover:bg-slate-50/50'} ${!notification.read ? (isDark ? 'bg-orange-950/10' : 'bg-orange-50/40') : ''}`}>
                    <div className={`p-2 rounded-lg ${iconBg} h-8 w-8 flex-shrink-0 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${isDark ? 'text-slate-300' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs flex justify-between items-center">
                        <span>{notification.title}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] text-slate-400 font-normal">{notification.time}</span>
                          {!notification.read && <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0" />}
                        </div>
                      </h5>
                      <p className={`text-[10.5px] mt-1 leading-normal ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>{notification.desc}</p>
                      {notification.link && (
                        <div className="mt-2 flex justify-start">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border transition-all ${isDark ? 'bg-[#2a2927] border-neutral-700 text-orange-400 hover:text-[#f2efe9]' : 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'}`}>
                            {getNotificationCta(notification.link)} →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`p-2.5 border-t flex items-center justify-between ${isDark ? 'border-neutral-800 bg-[#1c1b18]/25' : 'border-slate-100 bg-slate-50/20'}`}>
              {unreadCount > 0 ? <button onClick={onMarkAllRead} className={`text-[10px] font-bold transition-colors ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-800'}`}>Mark All as Read</button> : <span />}
              <button onClick={onClose} className="text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors">Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
