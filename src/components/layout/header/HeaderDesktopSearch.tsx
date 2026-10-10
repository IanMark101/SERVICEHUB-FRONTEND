"use client";

import type { RefObject } from 'react';
import { MapPin, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import type { User } from '../../../types';
import UserAvatar from '../../ui/UserAvatar';

interface HeaderDesktopSearchModel {
  userSearchRef: RefObject<HTMLDivElement | null>;
  userSearch: string;
  setUserSearch: (value: string) => void;
  setShowUserSearchResults: (value: boolean) => void;
  showUserSearchResults: boolean;
  userSearchLoading: boolean;
  userSearchResults: User[];
  isDark: boolean;
  getDisplayName: (user: User) => string;
  handleOpenUserProfile: (user: User) => void;
}

export default function HeaderDesktopSearch({ model }: { model: HeaderDesktopSearchModel }) {
  const {
    userSearchRef,
    userSearch,
    setUserSearch,
    setShowUserSearchResults,
    showUserSearchResults,
    userSearchLoading,
    userSearchResults,
    isDark,
    getDisplayName,
    handleOpenUserProfile
  } = model;

  return (
    <>
      {/* Middle: Global User Search Bar (Responsive from sm up) */}
      <div ref={userSearchRef} className="workspace-header-search relative hidden lg:block">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted dark:text-ink-muted pointer-events-none">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          aria-label="Search people"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showUserSearchResults}
          aria-controls="workspace-people-search-results"
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
          placeholder="Search people..."
          className={`workspace-header-control h-9 w-full rounded-full py-1.5 pl-9 pr-8 text-xs transition-colors ${isDark
              ? 'text-white placeholder:text-ink-muted focus:outline-none'
              : 'text-ink placeholder:text-ink-muted focus:outline-none'
            }`}
        />
        {userSearch && (
          <button
            type="button"
            onClick={() => {
              setUserSearch('');
              setShowUserSearchResults(false);
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-ink-subtle hover:text-ink-muted dark:hover:text-ink"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {showUserSearchResults && (
          <div id="workspace-people-search-results" role="listbox" aria-label="People search results" className={`absolute left-0 right-0 mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden max-h-72 overflow-y-auto ${isDark ? 'bg-charcoal border-neutral-800 text-white' : 'bg-white border-slate-200 text-ink'}`}>
            {userSearchLoading ? (
              <div className="px-4 py-3 text-xs text-ink-muted dark:text-ink-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Searching users...</span>
              </div>
            ) : userSearchResults.length > 0 ? (
              <div>
                <div className={`px-3 py-1.5 text-[9.5px] font-extrabold uppercase tracking-wider border-b flex items-center justify-between ${
                  isDark ? 'bg-charcoal-surface border-neutral-800 text-ink-muted' : 'bg-slate-50 border-slate-100 text-ink-subtle'
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
                      className={`w-full text-left px-3.5 py-2.5 transition-colors border-b last:border-b-0 cursor-pointer ${isDark ? 'border-neutral-800/60 hover:bg-charcoal' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <UserAvatar src={result.avatarUrl} name={getDisplayName(result)} alt={`${getDisplayName(result)} avatar`} size={36} role={result.role === 'provider' ? 'provider' : 'seeker'} shape="soft" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-xs truncate text-ink dark:text-white">{getDisplayName(result)}</div>
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              result.role === 'provider'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-orange-500/10 text-brand-text dark:text-orange-400 border border-orange-500/20'
                            }`}>
                              {result.role}
                            </span>
                          </div>
                          {emailToShow ? (
                            <div className="text-[10px] text-ink-muted dark:text-ink-muted truncate">{emailToShow}</div>
                          ) : result.location ? (
                            <div className="flex items-center gap-1 text-[10px] text-ink-subtle dark:text-ink-subtle truncate">
                              <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                              <span>{result.location}</span>
                            </div>
                          ) : null}
                          {result.bio && result.bio !== 'N/A' && (
                            <div className="mt-0.5 text-[10px] text-ink-subtle dark:text-ink-muted line-clamp-1">{result.bio}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-ink-muted dark:text-ink-muted">No users found.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
