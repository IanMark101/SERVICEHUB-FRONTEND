import { ChevronDown, HelpCircle, LogOut, Settings, User } from 'lucide-react';
import type { UserSession } from '../../auth/LoginContainer';

interface HeaderProfileMenuProps {
  currentRole: 'seeker' | 'provider' | 'admin';
  user: UserSession | null;
  isDark: boolean;
  isOpen: boolean;
  borderHoverClass: string;
  onToggle: () => void;
  onClose: () => void;
  onViewProfile?: (user: UserSession) => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export default function HeaderProfileMenu({ currentRole, user, isDark, isOpen, borderHoverClass, onToggle, onClose, onViewProfile, onOpenSettings, onSignOut }: HeaderProfileMenuProps) {
  if (!user) return null;
  return (
    <div className="relative">
      <button onClick={onToggle} className={`flex items-center space-x-2 p-1 rounded-xl border border-transparent ${borderHoverClass} transition-all ${isOpen ? (isDark ? 'bg-[#22211e] border-neutral-800' : 'bg-slate-50 border-slate-200') : ''}`}>
        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User')}&background=random`} alt="Profile Avatar" className={`w-7 h-7 rounded-full object-cover border ${currentRole === 'seeker' ? 'border-orange-500/30' : 'border-emerald-600/30'}`} />
        <span className={`hidden sm:inline-block text-xs font-bold truncate max-w-[80px] ${isDark ? 'text-[#f2efe9]' : 'text-slate-700'}`}>{user.firstName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {isOpen && (
        <>
          <div onClick={onClose} className="fixed inset-0 z-30" />
          <div className={`absolute right-0 mt-3 w-52 rounded-[20px] border shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-155 ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/45'}`}>
              <p className="text-[10px] text-slate-400 font-semibold">Signed in as</p>
              <p className="text-xs font-bold truncate mt-0.5">{user.firstName} {user.lastName}</p>
              <span className="inline-block px-1.5 py-0.5 text-[8.5px] font-extrabold rounded bg-slate-100 text-slate-600 mt-1 uppercase tracking-wider">{currentRole}</span>
            </div>
            <div className="py-1">
              <button onClick={() => { onClose(); onViewProfile?.(user); }} className={`w-full flex items-center px-4 py-2 text-xs font-semibold transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-[#2c2b27]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}><User className="w-3.5 h-3.5 mr-2.5 text-slate-400" />View Profile</button>
              <button onClick={() => { onClose(); onOpenSettings(); }} className={`w-full flex items-center px-4 py-2 text-xs font-semibold transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-[#2c2b27]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}><Settings className="w-3.5 h-3.5 mr-2.5 text-slate-400" />Account Settings</button>
              <button onClick={() => { onClose(); window.open('/help', '_blank'); }} className={`w-full flex items-center px-4 py-2 text-xs font-semibold transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-[#2c2b27]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}><HelpCircle className="w-3.5 h-3.5 mr-2.5 text-orange-500" />Help & Documentation</button>
            </div>
            <div className={`border-t py-1 ${isDark ? 'border-neutral-800 bg-[#1c1b18]/45' : 'border-slate-100 bg-slate-50/40'}`}>
              <button onClick={onSignOut} className="w-full flex items-center px-4 py-2 text-xs font-bold text-red-600 hover:text-red-500 hover:bg-red-950/20 transition-colors"><LogOut className="w-3.5 h-3.5 mr-2.5" />Sign Out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
