"use client";

import React from 'react';
import Image from 'next/image';
import { Search, X, ChevronRight, Briefcase } from 'lucide-react';
import { isConversationClosed, type Conversation, type ConversationGroup, useMessagesPage } from '../../hooks/useMessagesPage';

type MessagesState = ReturnType<typeof useMessagesPage>;
type Accent = 'orange' | 'emerald';

const accentStyles = {
  orange: {
    selected: 'bg-orange-50/80 border-orange-200 text-orange-950 dark:bg-orange-950/25 dark:border-orange-500/30 dark:text-orange-200 shadow-2xs',
    activeIndicator: 'bg-orange-500',
    focus: 'focus-visible:ring-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-500',
    avatar: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
    threadSelected: 'border-orange-500/70 bg-orange-50 text-orange-900 shadow-xs dark:bg-orange-950/40 dark:border-orange-500/60 dark:text-orange-200 ring-1 ring-orange-500/20',
    threadInactive: 'border-slate-200/80 bg-white text-ink-secondary hover:bg-slate-50 hover:border-slate-300 dark:border-neutral-800 dark:bg-charcoal dark:text-ink-secondary dark:hover:bg-charcoal/70',
  },
  emerald: {
    selected: 'bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/25 dark:border-emerald-500/30 dark:text-emerald-200 shadow-2xs',
    activeIndicator: 'bg-emerald-500',
    focus: 'focus-visible:ring-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-600',
    avatar: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    threadSelected: 'border-emerald-500/70 bg-emerald-50 text-emerald-900 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-500/60 dark:text-emerald-200 ring-1 ring-emerald-500/20',
    threadInactive: 'border-slate-200/80 bg-white text-ink-secondary hover:bg-slate-50 hover:border-slate-300 dark:border-neutral-800 dark:bg-charcoal dark:text-ink-secondary dark:hover:bg-charcoal/70',
  },
} as const;

function relativeTime(time?: string) {
  if (!time) return '';
  const date = new Date(time);
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(elapsed / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(elapsed / 86400000);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ContactRow({
  group,
  selected,
  onSelect,
  accent,
  isDark,
}: {
  group: ConversationGroup;
  selected: boolean;
  onSelect: () => void;
  accent: Accent;
  isDark: boolean;
}) {
  const styles = accentStyles[accent];
  const activeCount = group.bookings.filter((b) => !isConversationClosed(b.status)).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`group relative mx-2 my-1 flex w-[calc(100%-1rem)] items-start gap-3 rounded-2xl p-3 text-left border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${styles.focus} ${
        selected
          ? styles.selected
          : 'border-transparent hover:bg-slate-50/80 dark:hover:bg-charcoal/40 text-ink-secondary dark:text-ink-secondary'
      }`}
    >
      {/* Active selection accent bar */}
      {selected && (
        <span
          className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${styles.activeIndicator}`}
          aria-hidden="true"
        />
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        {group.otherPartyAvatar ? (
          <Image
            unoptimized
            width={42}
            height={42}
            src={group.otherPartyAvatar}
            alt=""
            className="h-10.5 w-10.5 rounded-full object-cover ring-1 ring-slate-200/90 dark:ring-neutral-800"
          />
        ) : (
          <span
            className={`flex h-10.5 w-10.5 items-center justify-center rounded-full text-xs font-black ring-1 ring-slate-200/90 dark:ring-neutral-800 ${styles.avatar}`}
          >
            {group.otherPartyName.charAt(0).toUpperCase()}
          </span>
        )}
        {group.unreadCount > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 ${
              isDark ? 'border-charcoal-inset' : 'border-white'
            } ${styles.badge}`}
          />
        )}
      </div>

      {/* Info Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate text-xs font-bold text-ink dark:text-white">
            {group.otherPartyName}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-ink-muted dark:text-ink-muted">
            {relativeTime(group.lastMessageTime)}
          </span>
        </div>

        {/* Count & Status Badge */}
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate text-[10px] font-semibold text-ink-muted dark:text-ink-muted">
            {group.bookings.length} {group.bookings.length === 1 ? 'job' : 'jobs'}
            {activeCount > 0 ? ` · ${activeCount} active` : ' · past jobs'}
          </span>
        </div>

        {/* Message snippet */}
        <p
          className="mt-1 truncate text-[11px] leading-snug text-ink-muted dark:text-ink-secondary"
          title={group.lastMessage || group.bookings[0]?.title}
        >
          {group.lastMessage || group.bookings[0]?.title}
        </p>
      </div>

      {group.unreadCount > 0 && (
        <span
          className={`shrink-0 self-center rounded-full px-1.5 py-0.5 text-[9.5px] font-black text-white shadow-2xs ${styles.badge}`}
        >
          {group.unreadCount}
        </span>
      )}
    </button>
  );
}

export function PeopleInbox({ state, accent }: { state: MessagesState; accent: Accent }) {
  const styles = accentStyles[accent];
  const {
    isDark,
    selectedConv,
    conversationGroups,
    filteredConversationGroups,
    searchQuery,
    setSearchQuery,
    conversationPage,
    setConversationPage,
    conversationTotalPages,
    selectGroup,
  } = state;

  return (
    <aside
      className={`${selectedConv ? 'hidden xl:flex' : 'flex'} w-full shrink-0 flex-col border-r border-slate-200/90 dark:border-neutral-800/80 xl:w-80 bg-slate-50/40 dark:bg-charcoal/50`}
      aria-label="People in your inbox"
    >
      {/* Top Header */}
      <div className="shrink-0 border-b border-slate-200/90 p-4 dark:border-neutral-800/80 bg-white/60 dark:bg-transparent">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black tracking-tight text-ink dark:text-white">
            Messages
          </h2>
          <span className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted">
            {filteredConversationGroups.length === 1 ? '1 contact' : `${filteredConversationGroups.length} contacts`}
          </span>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle dark:text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search people or jobs"
            placeholder="Search people or jobs..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={`w-full rounded-xl border py-2 pl-9 pr-8 text-xs outline-none transition-all focus-visible:ring-2 ${styles.focus} ${
              isDark
                ? 'border-neutral-800 bg-charcoal-surface text-white placeholder-ink-muted focus:bg-charcoal'
                : 'border-slate-200 bg-white text-ink placeholder-ink-subtle shadow-2xs focus:bg-white'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-subtle hover:text-ink-secondary dark:text-ink-muted dark:hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Conversations Scroll Feed */}
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {conversationGroups.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted dark:text-ink-muted">
            <p className="font-semibold text-ink-secondary dark:text-ink-secondary">No conversations yet</p>
            <p className="mt-1 text-[11px] leading-relaxed">
              A chat appears automatically after a booking request or quote offer is accepted.
            </p>
          </div>
        ) : filteredConversationGroups.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted dark:text-ink-muted">
            <p className="font-semibold text-ink-secondary dark:text-ink-secondary">No matches found</p>
            <p className="mt-1 text-[11px]">No contacts or jobs match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          filteredConversationGroups.map((group) => (
            <ContactRow
              key={group.otherPartyId}
              group={group}
              selected={selectedConv?.otherPartyId === group.otherPartyId}
              onSelect={() => selectGroup(group)}
              accent={accent}
              isDark={isDark}
            />
          ))
        )}
      </div>

      {/* Pagination if applicable */}
      {conversationTotalPages > 1 && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200/90 px-3.5 py-2 text-[11px] font-semibold text-ink-secondary dark:border-neutral-800 dark:text-ink-secondary">
          <button
            type="button"
            disabled={conversationPage <= 1}
            onClick={() => setConversationPage((page) => Math.max(1, page - 1))}
            className="rounded-lg border px-2.5 py-1 transition-colors hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-[10px]">
            Page {conversationPage} of {conversationTotalPages}
          </span>
          <button
            type="button"
            disabled={conversationPage >= conversationTotalPages}
            onClick={() => setConversationPage((page) => Math.min(conversationTotalPages, page + 1))}
            className="rounded-lg border px-2.5 py-1 transition-colors hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </aside>
  );
}

function getBookingStatusDot(status: string) {
  if (['COMPLETED'].includes(status)) {
    return 'bg-emerald-500';
  }
  if (['CANCELED', 'DECLINED', 'REMOVED'].includes(status)) {
    return 'bg-rose-500';
  }
  if (['IN_PROGRESS', 'WAITING', 'CONFIRMED'].includes(status)) {
    return 'bg-blue-500 animate-pulse';
  }
  return 'bg-amber-500';
}

function ThreadButton({
  booking,
  selected,
  onSelect,
  accent,
}: {
  booking: Conversation;
  selected: boolean;
  onSelect: () => void;
  accent: Accent;
}) {
  const styles = accentStyles[accent];
  const statusDot = getBookingStatusDot(booking.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={booking.title}
      className={`group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-[11px] font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${styles.focus} ${
        selected ? styles.threadSelected : styles.threadInactive
      }`}
      title={`${booking.title} · ${booking.status.replaceAll('_', ' ')}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${statusDot}`} aria-hidden="true" />
      <span className="truncate max-w-[140px] sm:max-w-[200px]">{booking.title}</span>
      {booking.unreadCount > 0 && (
        <span
          className={`rounded-full px-1.5 text-[9.5px] font-black text-white ${styles.badge}`}
        >
          {booking.unreadCount}
        </span>
      )}
    </button>
  );
}

export function BookingThreads({ state, accent }: { state: MessagesState; accent: Accent }) {
  const { selectedGroup, selectedConv, selectConversation } = state;
  if (!selectedGroup || !selectedConv) return null;

  const active = selectedGroup.bookings.filter((booking) => !isConversationClosed(booking.status));
  const past = selectedGroup.bookings.filter((booking) => isConversationClosed(booking.status));
  const selectedIsPast = isConversationClosed(selectedConv.status);

  return (
    <nav
      className="shrink-0 border-b border-slate-200/80 px-4 py-2.5 dark:border-neutral-800/80 bg-slate-50/50 dark:bg-charcoal/60 transition-colors"
      aria-label={`Jobs with ${selectedGroup.otherPartyName}`}
    >
      {/* Thread Ribbon Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Briefcase size={13} className="text-ink-subtle dark:text-ink-subtle shrink-0" aria-hidden="true" />
          <span className="min-w-0 [overflow-wrap:anywhere] text-[11px] font-bold text-ink dark:text-ink">
            Jobs with {selectedGroup.otherPartyName}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-slate-200/70 dark:bg-charcoal px-2 py-0.5 text-[10px] font-semibold text-ink-muted dark:text-ink-muted">
          {selectedGroup.bookings.length} {selectedGroup.bookings.length === 1 ? 'total' : 'total'}
        </span>
      </div>

      {/* Active Jobs Strip */}
      {active.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Active jobs"
        >
          {active.map((booking) => (
            <ThreadButton
              key={booking.bookingId}
              booking={booking}
              selected={selectedConv.bookingId === booking.bookingId}
              onSelect={() => selectConversation(booking)}
              accent={accent}
            />
          ))}
        </div>
      )}

      {/* Past Jobs Expandable Details */}
      {past.length > 0 && (
        <details
          key={selectedGroup.otherPartyId}
          open={selectedIsPast || undefined}
          className={`group/past ${active.length > 0 ? 'mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-neutral-800/60' : ''}`}
        >
          <summary className="list-none flex items-center gap-1.5 cursor-pointer select-none py-1 text-[11px] font-bold text-ink-muted hover:text-ink dark:text-ink-muted dark:hover:text-ink focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            <ChevronRight
              size={12}
              className="transition-transform duration-150 group-open/past:rotate-90 text-ink-subtle shrink-0"
              aria-hidden="true"
            />
            <span>Past jobs ({past.length})</span>
          </summary>
          <div
            className="flex gap-2 overflow-x-auto pb-1 pt-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Past jobs"
          >
            {past.map((booking) => (
              <ThreadButton
                key={booking.bookingId}
                booking={booking}
                selected={selectedConv.bookingId === booking.bookingId}
                onSelect={() => selectConversation(booking)}
                accent={accent}
              />
            ))}
          </div>
        </details>
      )}
    </nav>
  );
}
