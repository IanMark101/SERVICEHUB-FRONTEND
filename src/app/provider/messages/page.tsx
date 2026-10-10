"use client";

import React from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Send,
  ChevronLeft,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useMessagesPage } from '../../../hooks/useMessagesPage';
import { PeopleInbox, BookingThreads } from '../../../components/messages/ConversationNavigation';

export default function ProviderMessagesPage() {
  const state = useMessagesPage();
  const {
    isDark,
    user,
    selectedConv,
    setSelectedConv,
    messages,
    input,
    setInput,
    sending,
    loading,
    error,
    confirmModal,
    setConfirmModal,
    bottomRef,
    messageScrollRef,
    handleMessageScroll,
    textareaRef,
    handleSend,
    handleKeyDown,
    handleHideConversation,
    isReadOnly,
    cardBg,
    textPrimary,
    textMuted,
    inputBg,
  } = state;

  return (
    <div
      className={`rounded-3xl border shadow-sm overflow-hidden flex h-[calc(100dvh-7.5rem)] min-h-0 max-h-[820px] transition-all duration-200 ${cardBg}`}
    >
      <PeopleInbox state={state} accent="emerald" />

      {/* Chat Area */}
      <main
        className={`${
          selectedConv ? 'flex' : 'hidden xl:flex'
        } flex-1 flex-col min-w-0 bg-white dark:bg-charcoal`}
      >
        {!selectedConv ? (
          <div className={`flex-1 flex items-center justify-center text-center p-8 ${textMuted}`}>
            <div className="max-w-sm">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare size={24} />
              </div>
              <p className="text-sm font-bold text-ink dark:text-ink">
                Select a conversation to start messaging
              </p>
              <p className="text-xs text-ink-muted dark:text-ink-muted mt-1 leading-relaxed">
                Chats are automatically created when your booking request or quote offer is accepted.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Top Header */}
            <div
              className={`flex shrink-0 flex-wrap items-center gap-3 px-4 py-3 border-b justify-between transition-colors ${
                isDark ? 'border-neutral-800/80 bg-charcoal/70' : 'border-slate-200/90 bg-white'
              }`}
            >
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedConv(null)}
                  className={`xl:hidden shrink-0 rounded-lg p-1.5 ${textMuted} hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-charcoal`}
                >
                  <ChevronLeft size={18} />
                </button>

                {selectedConv.otherPartyAvatar ? (
                  <Image
                    unoptimized
                    width={40}
                    height={40}
                    src={selectedConv.otherPartyAvatar}
                    alt={selectedConv.otherPartyName}
                    className="size-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-neutral-800 shrink-0"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm shrink-0 ring-1 ring-slate-200 dark:ring-neutral-800">
                    {selectedConv.otherPartyName.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className={`min-w-0 text-sm font-black tracking-tight truncate leading-tight ${textPrimary}`}>
                      {selectedConv.otherPartyName}
                    </p>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        selectedConv.otherPartyRole === 'Provider'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                          : 'bg-orange-500/10 text-brand-text dark:text-orange-400 border-orange-500/25'
                      }`}
                    >
                      {selectedConv.otherPartyRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-ink-muted dark:text-ink-muted">
                    <span className="text-[11px] font-medium text-ink-subtle dark:text-ink-subtle">Job:</span>
                    <span className="font-semibold text-ink-secondary dark:text-ink-secondary truncate max-w-[200px] sm:max-w-md">
                      {selectedConv.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    ['COMPLETED'].includes(selectedConv.status)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                      : ['CANCELED', 'DECLINED', 'REMOVED'].includes(selectedConv.status)
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
                      : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40'
                  }`}
                >
                  {['COMPLETED'].includes(selectedConv.status) ? (
                    <CheckCircle2 size={12} className="shrink-0" />
                  ) : ['CANCELED', 'DECLINED', 'REMOVED'].includes(selectedConv.status) ? (
                    <XCircle size={12} className="shrink-0" />
                  ) : (
                    <Clock size={12} className="shrink-0" />
                  )}
                  <span>{selectedConv.status.replace(/_/g, ' ')}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleHideConversation(selectedConv.bookingId)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-neutral-800 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-900/40 text-ink-subtle'
                      : 'border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-ink-muted'
                  }`}
                  aria-label={`Hide booking ${selectedConv.title}`}
                  title="Hide this booking"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Contextual Job Switcher Ribbon */}
            <BookingThreads state={state} accent="emerald" />

            {/* Messages Scroll View */}
            <div
              ref={messageScrollRef}
              onScroll={handleMessageScroll}
              className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 bg-slate-50/40 dark:bg-charcoal/40"
            >
              {loading && (
                <div className={`flex justify-center py-10 ${textMuted}`}>
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                </div>
              )}

              {error && !loading && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300">
                  <Lock size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && messages.length === 0 && (
                isReadOnly ? (
                  <div className="flex flex-col items-center justify-center my-auto py-10 px-4 text-center max-w-sm mx-auto">
                    <div
                      className={`size-12 rounded-2xl grid place-items-center mb-3 shadow-2xs border ${
                        selectedConv.status === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-200/80 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400'
                          : 'bg-rose-50 border-rose-200/80 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400'
                      }`}
                    >
                      <ShieldCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-ink dark:text-ink">
                      {selectedConv.status === 'COMPLETED' ? 'Service Completed' : 'Booking Cancelled'}
                    </p>
                    <p className="text-xs text-ink-muted dark:text-ink-muted mt-1 leading-relaxed">
                      This service thread is closed. Previous messages are preserved for your records.
                    </p>
                  </div>
                ) : (
                  <div className={`text-center text-xs ${textMuted} my-auto py-10`}>
                    No messages yet. Say hello! 👋
                  </div>
                )
              )}

              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;

                // Render system message differently
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2 select-none animate-in fade-in zoom-in-95 duration-200">
                      <div
                        className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-colors flex items-center gap-1.5 shadow-2xs ${
                          isDark
                            ? 'bg-charcoal/90 border-neutral-700/60 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                        }`}
                      >
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start items-end gap-2'} animate-in fade-in slide-in-from-bottom-1 duration-150`}
                  >
                    {!isMe && (
                      <div className="shrink-0 mb-0.5">
                        {selectedConv.otherPartyAvatar ? (
                          <Image
                            unoptimized
                            width={28}
                            height={28}
                            src={selectedConv.otherPartyAvatar}
                            className="size-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-neutral-800"
                            alt=""
                          />
                        ) : (
                          <div className="size-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black ring-1 ring-slate-200 dark:ring-neutral-800">
                            {selectedConv.otherPartyName.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`min-w-0 max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-xs'
                          : isDark
                          ? 'bg-charcoal text-white rounded-bl-xs border border-neutral-800'
                          : 'bg-white text-ink rounded-bl-xs border border-slate-200/90'
                      }`}
                    >
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{msg.content}</p>
                      <span className={`block text-[9.5px] mt-1.5 font-medium ${isMe ? 'opacity-75 text-right' : 'text-ink-subtle dark:text-ink-subtle'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input / Read-Only Panel */}
            <div className={`shrink-0 p-3.5 border-t ${isDark ? 'border-neutral-800/80 bg-charcoal' : 'border-slate-200 bg-white'}`}>
              {isReadOnly ? (
                <div
                  className={`px-4 py-3 rounded-2xl border flex items-center justify-center gap-2 text-center text-xs font-semibold ${
                    isDark
                      ? 'bg-charcoal/90 border-neutral-800 text-ink-subtle'
                      : 'bg-slate-100/80 border-slate-200 text-ink-muted shadow-2xs'
                  }`}
                >
                  <Lock size={14} className="text-amber-500 shrink-0" />
                  <span>This conversation is read-only because the transaction is closed.</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message… (Enter to send)"
                      aria-label="Message"
                      maxLength={2000}
                      className={`min-w-0 flex-1 resize-none rounded-2xl border px-4 py-2.5 text-xs sm:text-[13px] outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all ${inputBg}`}
                      style={{ maxHeight: '110px' }}
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      aria-label="Send message"
                      className="size-10 grid place-items-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
                    >
                      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <ConfirmModal state={confirmModal} onClose={() => setConfirmModal(null)} />
    </div>
  );
}
