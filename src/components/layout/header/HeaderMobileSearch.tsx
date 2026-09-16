import { MapPin, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import type { User } from '../../../types';
import UserAvatar from '../../ui/UserAvatar';

interface HeaderMobileSearchProps {
  isOpen: boolean;
  isDark: boolean;
  query: string;
  showResults: boolean;
  loading: boolean;
  results: User[];
  ringClass: string;
  getDisplayName: (user: User) => string;
  onQueryChange: (query: string) => void;
  onShowResultsChange: (show: boolean) => void;
  onClose: () => void;
  onOpenUser: (user: User) => void;
}

export default function HeaderMobileSearch({ isOpen, isDark, query, showResults, loading, results, ringClass, getDisplayName, onQueryChange, onShowResultsChange, onClose, onOpenUser }: HeaderMobileSearchProps) {
  if (!isOpen) return null;

  return (
    <div className={`absolute left-0 right-0 top-full z-50 border-b p-3 shadow-xl lg:hidden ${isDark ? 'border-white/10 bg-[#201f1c]' : 'border-black/10 bg-[#fffdfa]'}`}>
      <div className="relative flex items-center">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b4b0a9] pointer-events-none"><Search className="w-3.5 h-3.5" /></span>
        <input
          aria-label="Search people"
          type="text"
          autoFocus
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onShowResultsChange(Boolean(event.target.value.trim()));
          }}
          placeholder="Search people..."
          className={`w-full rounded-xl border py-2 pl-9 pr-9 text-xs transition-colors ${isDark ? `border-white/10 bg-[#171716] text-[#f5f4f2] placeholder:text-[#8f8a82] focus:outline-none focus:ring-2 ${ringClass}` : `border-black/10 bg-[#fffdfa] text-[#171716] placeholder:text-[#8b857e] focus:outline-none focus:ring-2 ${ringClass}`}`}
        />
        <button type="button" aria-label="Close user search" onClick={onClose} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>

      {showResults && (
        <div className={`mt-2 rounded-xl border shadow-xl overflow-hidden max-h-60 overflow-y-auto ${isDark ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'}`}>
          {loading ? (
            <div className="px-3 py-3 text-xs text-slate-500 dark:text-neutral-400">Searching users...</div>
          ) : results.length > 0 ? results.map((result) => {
            const email = result.email && result.email !== 'N/A' ? result.email : '';
            return (
              <button
                key={result.id}
                type="button"
                onMouseDown={(event) => { event.preventDefault(); onOpenUser(result); }}
                onTouchEnd={(event) => { event.preventDefault(); onOpenUser(result); }}
                onClick={() => onOpenUser(result)}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b last:border-b-0 cursor-pointer ${isDark ? 'border-neutral-800/60 hover:bg-[#2c2b27]' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar src={result.avatarUrl} name={getDisplayName(result)} alt={`${getDisplayName(result)} avatar`} size={32} role={result.role === 'provider' ? 'provider' : 'seeker'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-xs truncate">{getDisplayName(result)}</div>
                      <span className={`text-[9px] font-extrabold uppercase ${result.role === 'provider' ? 'text-emerald-500' : 'text-orange-500'}`}>{result.role}</span>
                    </div>
                    {email ? <div className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">{email}</div> : result.location ? <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-neutral-500 truncate"><MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" /><span>{result.location}</span></div> : null}
                  </div>
                </div>
              </button>
            );
          }) : <div className="px-3 py-3 text-xs text-slate-500 dark:text-neutral-400">No users found.</div>}
        </div>
      )}
    </div>
  );
}
