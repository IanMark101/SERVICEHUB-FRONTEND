import { Search, X } from 'lucide-react';
import type { User } from '../../../types';

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
    <div className={`sm:hidden absolute top-full left-0 right-0 p-3 border-b shadow-xl z-50 transition-all ${isDark ? 'bg-[#191919] border-neutral-800' : 'bg-white border-slate-200'}`}>
      <div className="relative flex items-center">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b4b0a9] pointer-events-none"><Search className="w-3.5 h-3.5" /></span>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onShowResultsChange(Boolean(event.target.value.trim()));
          }}
          placeholder="Search users..."
          className={`w-full border rounded-xl pl-9 pr-9 py-2 text-xs transition-all ${isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9] placeholder-[#b4b0a9] focus:outline-none focus:ring-1 focus:ring-amber-500/30' : `bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${ringClass}`}`}
        />
        <button type="button" onClick={onClose} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
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
                  <img src={result.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(result))}&background=random`} alt={getDisplayName(result)} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-neutral-700" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-xs truncate">{getDisplayName(result)}</div>
                      <span className={`text-[9px] font-extrabold uppercase ${result.role === 'provider' ? 'text-emerald-500' : 'text-orange-500'}`}>{result.role}</span>
                    </div>
                    {email ? <div className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">{email}</div> : result.location ? <div className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">📍 {result.location}</div> : null}
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
