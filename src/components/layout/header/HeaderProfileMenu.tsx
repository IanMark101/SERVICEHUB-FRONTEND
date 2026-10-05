import { CaretDown as ChevronDown, Question, SignOut as LogOut, Gear as Settings, User } from '@phosphor-icons/react';
import type { UserSession } from '../../auth/LoginContainer';
import UserAvatar from '../../ui/UserAvatar';

interface HeaderProfileMenuProps {
  currentRole: 'seeker' | 'provider' | 'admin';
  user: UserSession | null;
  isDark: boolean;
  isOpen: boolean;
  borderHoverClass: string;
  showHelpCenter?: boolean;
  onToggle: () => void;
  onClose: () => void;
  onViewProfile?: (user: UserSession) => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export default function HeaderProfileMenu({ currentRole, user, isDark, isOpen, borderHoverClass, showHelpCenter = false, onToggle, onClose, onViewProfile, onOpenSettings, onSignOut }: HeaderProfileMenuProps) {
  if (!user) return null;
  return (
    <div className="relative">
      <button type="button" onClick={onToggle} aria-label="Open account menu" aria-expanded={isOpen} className={`workspace-header-control flex h-9 shrink-0 items-center gap-2 rounded-full p-1 pr-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-focus)] ${borderHoverClass} ${isOpen ? (isDark ? 'bg-white/10' : 'bg-[#f5ebe6]') : ''}`}>
        <UserAvatar src={user.avatarUrl} name={`${user.firstName || ''} ${user.lastName || ''}`} alt="Profile avatar" size={28} role={currentRole} />
        <span className={`hidden max-w-[80px] truncate text-xs font-semibold xl:inline-block ${isDark ? 'text-white' : 'text-ink'}`}>{user.firstName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />
      </button>
      {isOpen && (
        <>
          <div onClick={onClose} className="fixed inset-0 z-30" />
          <div className={`absolute right-0 mt-3 w-52 rounded-[20px] border shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-155 ${isDark ? 'bg-[#22211e] border-neutral-800 text-white' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/45'}`}>
              <p className="text-[10px] text-ink-subtle font-semibold">Signed in as</p>
              <p className="text-xs font-bold truncate mt-0.5">{user.firstName} {user.lastName}</p>
              <span className={`inline-block px-1.5 py-0.5 text-[8.5px] font-extrabold rounded mt-1 uppercase tracking-wider ${currentRole === 'admin' ? 'bg-[var(--admin-soft)] text-[var(--admin-accent)]' : 'bg-slate-100 text-ink-muted'}`}>{currentRole}</span>
            </div>
            <div className="py-1">
              <button onClick={() => { onClose(); onViewProfile?.(user); }} className={`flex w-full items-center px-4 py-1.5 text-[10px] font-medium leading-4 transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-[#2c2b27]' : 'text-ink-muted hover:text-ink hover:bg-slate-50'}`}><User className="mr-2 h-3 w-3 text-ink-subtle" />View Profile</button>
              <button onClick={() => { onClose(); onOpenSettings(); }} className={`flex w-full items-center px-4 py-1.5 text-[10px] font-medium leading-4 transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-[#2c2b27]' : 'text-ink-muted hover:text-ink hover:bg-slate-50'}`}><Settings className="mr-2 h-3 w-3 text-ink-subtle" />Account Settings</button>
              {showHelpCenter && (
                <button onClick={() => { onClose(); window.open('/help', '_blank'); }} className={`flex w-full items-center whitespace-nowrap px-4 py-1.5 text-[10px] font-medium leading-4 transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-[#2c2b27]' : 'text-ink-muted hover:text-ink hover:bg-slate-50'}`}><Question className="mr-2 h-3 w-3 text-ink-subtle" />Help Center</button>
              )}
            </div>
            <div className={`border-t py-1 ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/40'}`}>
              <button onClick={onSignOut} className="flex w-full items-center px-4 py-1.5 text-[10px] font-semibold leading-4 text-red-600 transition-colors hover:bg-red-950/20 hover:text-red-500"><LogOut className="mr-2 h-3 w-3" />Sign Out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
