"use client";

import type { RefObject } from 'react';
import { Search, X } from 'lucide-react';
import type { User } from '../../../types';

export default function HeaderDesktopSearch({ model }: { model: any }) {
  const {
    userSearchRef,
    userSearch,
    setUserSearch,
    setShowUserSearchResults,
    showUserSearchResults,
    userSearchLoading,
    userSearchResults,
    isDark,
    theme,
    getDisplayName,
    handleOpenUserProfile
  } = model as {
    userSearchRef: RefObject<HTMLDivElement | null>;
    userSearch: string;
    setUserSearch: (value: string) => void;
    setShowUserSearchResults: (value: boolean) => void;
    showUserSearchResults: boolean;
    userSearchLoading: boolean;
    userSearchResults: User[];
    isDark: boolean;
    theme: any;
    getDisplayName: (user: User) => string;
    handleOpenUserProfile: (user: User) => void;
  };

  return (
    <>
      {/* Middle: Global User Search Bar (Responsive from sm up) */}
      <div ref={userSearchRef} className="hidden sm:block flex-1 min-w-[150px] max-w-[220px] md:max-w-xs lg:max-w-sm relative mx-2 sm:mx-4">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b4b0a9] pointer-events-none">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setShowUserSearchResults(Boolean(e.target.value.trim()));
          }}
          onFocus={() => setShowUserSearchResults(Boolean(userSearch.trim()))}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowUserSearchResults(false);
            }
          }}
          placeholder="Search users..."
          className={`w-full border rounded-xl pl-9 pr-8 py-2 text-xs transition-all ${isDark
              ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9] placeholder-[#b4b0a9] focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/50'
              : `bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${theme.ring}`
            }`}
        />
        {userSearch && (
          <button
            type="button"
            onClick={() => {
              setUserSearch('');
              setShowUserSearchResults(false);
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {showUserSearchResults && (
          <div className={`absolute left-0 right-0 mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden max-h-72 overflow-y-auto ${isDark ? 'bg-[#191919] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'}`}>
            {userSearchLoading ? (
              <div className="px-4 py-3 text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Searching users...</span>
              </div>
            ) : userSearchResults.length > 0 ? (
              <div>
                <div className={`px-3 py-1.5 text-[9.5px] font-extrabold uppercase tracking-wider border-b flex items-center justify-between ${
                  isDark ? 'bg-[#22211e] border-neutral-800 text-[#b4b0a9]' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  <span>Results</span>
                  <span>{userSearchResults.length} found</span>
                </div>
                {userSearchResults.map((result) => {
                  const emailToShow = result.email && result.email !== 'N/A' ? result.email : '';
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleOpenUserProfile(result);
                      }}
                      onClick={() => handleOpenUserProfile(result)}
                      className={`w-full text-left px-3.5 py-2.5 transition-colors border-b last:border-b-0 cursor-pointer ${isDark ? 'border-neutral-800/60 hover:bg-[#242424]' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={result.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(result))}&background=random`}
                          alt={`${getDisplayName(result)} avatar`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(result))}&background=random`;
                          }}
                          className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-neutral-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-xs truncate text-slate-900 dark:text-[#f2efe9]">{getDisplayName(result)}</div>
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              result.role === 'provider'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                            }`}>
                              {result.role}
                            </span>
                          </div>
                          {emailToShow ? (
                            <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">{emailToShow}</div>
                          ) : result.location ? (
                            <div className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                              📍 {result.location}, Cordova
                            </div>
                          ) : null}
                          {result.bio && result.bio !== 'N/A' && (
                            <div className="mt-0.5 text-[10px] text-slate-400 dark:text-neutral-400 italic line-clamp-1">"{result.bio}"</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-slate-500 dark:text-neutral-400">No users found.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
