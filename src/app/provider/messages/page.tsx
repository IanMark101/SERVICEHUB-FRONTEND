"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Send, ChevronLeft, ImagePlus, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { apiGetMessages, apiSendMessage, apiGetConversations } from '../../../api/messages.api';
import { joinBookingRoom, getSocket } from '../../../lib/socket';

interface DbMessage {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
  isSystem: boolean;
  sender: { id: string; name: string; avatarUrl?: string };
}

interface Conversation {
  bookingId: string;
  title: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyAvatar?: string;
  otherPartyRole: 'Provider' | 'Seeker';
  status: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

function getRelativeTime(timeStr?: string) {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default function ProviderMessagesPage() {
  const { isDark, user, syncUnreadMessages } = useApp();
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get('booking');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync conversation list from backend
  const syncConversations = useCallback(async () => {
    try {
      const res = await apiGetConversations();
      if (res.success) {
        setConversations(res.data || []);
      }
    } catch (e) {
      console.error("Failed to sync conversations:", e);
    }
  }, []);

  // Load messages for chosen conversation
  const loadMessages = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetMessages(bookingId);
      if (res.success) {
        setMessages(res.data || []);
        syncUnreadMessages();
      } else {
        setError(res.error || 'Failed to load messages.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [syncUnreadMessages]);

  // Select conversation & join room
  const selectConversation = useCallback((conv: Conversation) => {
    setSelectedConv(conv);
    setMessages([]);
    setError('');
    loadMessages(conv.bookingId);
    joinBookingRoom(conv.bookingId);

    // Optimistically zero unread count
    setConversations(prev =>
      prev.map(c => c.bookingId === conv.bookingId ? { ...c, unreadCount: 0 } : c)
    );
  }, [loadMessages]);

  // Load conversations initial load
  useEffect(() => {
    syncConversations();
  }, [syncConversations]);

  // Handle deep-link query parameter
  useEffect(() => {
    if (bookingParam && conversations.length > 0) {
      const match = conversations.find(c => c.bookingId === bookingParam);
      if (match && selectedConv?.bookingId !== bookingParam) {
        selectConversation(match);
      }
    }
  }, [bookingParam, conversations, selectConversation, selectedConv]);

  // Real-time listener
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handler = (msg: DbMessage) => {
      if (selectedConv && msg.bookingId === selectedConv.bookingId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === msg.id);
          return exists ? prev : [...prev, msg];
        });
      }
      syncConversations();
      syncUnreadMessages();
    };

    const notifHandler = () => {
      syncConversations();
      syncUnreadMessages();
    };

    sock.on('new_message', handler);
    sock.on('message_notification', notifHandler);

    return () => {
      sock.off('new_message', handler);
      sock.off('message_notification', notifHandler);
    };
  }, [selectedConv, syncConversations, syncUnreadMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const res = await apiSendMessage(selectedConv.bookingId, content);
      if (res.success) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === res.data.id);
          return exists ? prev : [...prev, res.data];
        });
        syncConversations();
      }
    } catch (e: any) {
      setInput(content);
      setError(e?.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isReadOnly = selectedConv ? ['PENDING_APPROVAL', 'DECLINED', 'CANCELED', 'REMOVED', 'COMPLETED'].includes(selectedConv.status) : false;

  const cardBg = isDark ? 'bg-[#1c1b18] border-neutral-800/70' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-[#f2efe9]' : 'text-slate-800';
  const textMuted = isDark ? 'text-[#9a9690]' : 'text-slate-550';
  const inputBg = isDark ? 'bg-[#2a2927] border-neutral-700 text-[#f2efe9] placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden flex h-[600px] ${cardBg}`}>
      {/* Conversation Sidebar */}
      <aside className={`w-80 flex-shrink-0 border-r flex flex-col ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-orange-500" />
            <h2 className={`font-semibold text-sm ${textPrimary}`}>Conversations</h2>
          </div>
          <p className={`text-xs mt-0.5 ${textMuted}`}>{conversations.length} transaction chats</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-800/40">
          {conversations.length === 0 ? (
            <div className={`p-6 text-center text-xs ${textMuted}`}>
              No active conversations yet. Book a service to start chatting.
            </div>
          ) : (
            conversations.map(conv => {
              const active = selectedConv?.bookingId === conv.bookingId;
              const hasUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.bookingId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative ${
                    active ? (isDark ? 'bg-orange-950/20' : 'bg-orange-50/70') : (isDark ? 'hover:bg-neutral-800/20' : 'hover:bg-slate-50/50')
                  }`}
                >
                  {/* Left: Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.otherPartyAvatar ? (
                      <img
                        src={conv.otherPartyAvatar}
                        alt={conv.otherPartyName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-neutral-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                        {conv.otherPartyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-600 rounded-full border-2 border-white dark:border-[#1c1b18]" />
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${textPrimary}`}>
                        {conv.otherPartyName}
                      </span>
                      <span className={`text-[9px] font-medium whitespace-nowrap pl-1 ${hasUnread ? 'text-orange-500 font-bold' : textMuted}`}>
                        {getRelativeTime(conv.lastMessageTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded-md ${
                        conv.otherPartyRole === 'Provider'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                        {conv.otherPartyRole}
                      </span>
                      <span className={`text-[10px] truncate max-w-[120px] font-semibold ${isDark ? 'text-[#b4b0a9]' : 'text-slate-655'}`} title={conv.title}>
                        {conv.title}
                      </span>
                    </div>

                    {conv.lastMessage && (
                      <p className={`text-[10.5px] mt-1.5 truncate leading-relaxed ${
                        hasUnread ? (isDark ? 'text-[#f2efe9] font-bold' : 'text-slate-800 font-bold') : textMuted
                      }`}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {!selectedConv ? (
          <div className={`flex-1 flex items-center justify-center text-center p-8 ${textMuted}`}>
            <div>
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">Select a conversation to start messaging</p>
              <p className="text-[11px] max-w-xs mt-1">Chats are auto-created when your booking request or quote offer is accepted.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`flex items-center gap-3 px-4 py-3.5 border-b justify-between ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className={`md:hidden ${textMuted} hover:text-orange-500`}>
                  <ChevronLeft size={18} />
                </button>
                {selectedConv.otherPartyAvatar ? (
                  <img
                    src={selectedConv.otherPartyAvatar}
                    alt={selectedConv.otherPartyName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-neutral-800"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                    {selectedConv.otherPartyName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-extrabold leading-none ${textPrimary}`}>{selectedConv.otherPartyName}</p>
                    <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded-md ${
                      selectedConv.otherPartyRole === 'Provider'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    }`}>
                      {selectedConv.otherPartyRole}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-0.5 ${textMuted}`}>Job: {selectedConv.title}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                ['COMPLETED'].includes(selectedConv.status)
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : ['CANCELED', 'DECLINED', 'REMOVED'].includes(selectedConv.status)
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              }`}>
                {selectedConv.status.replace('_', ' ')}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-slate-50/30 dark:bg-[#151412]/20">
              {loading && (
                <div className={`flex justify-center py-8 ${textMuted}`}>
                  <Loader2 size={20} className="animate-spin text-orange-500" />
                </div>
              )}
              {error && !loading && (
                <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-900/10 border border-orange-900/20 rounded-xl p-3">
                  <Lock size={14} />
                  {error}
                </div>
              )}
              {!loading && !error && messages.length === 0 && (
                <div className={`text-center text-xs ${textMuted} py-8`}>No messages yet. Say hello! 👋</div>
              )}
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id;

                // Render system message differently
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2 select-none animate-in fade-in zoom-in-95 duration-200">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                        isDark 
                          ? 'bg-neutral-800/90 border-neutral-700/60 text-orange-400' 
                          : 'bg-orange-50 border-orange-100 text-orange-700'
                      }`}>
                        <ShieldCheck size={12} className="text-orange-500" />
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-150`}>
                    {!isMe && (
                      <div className="flex-shrink-0 mr-2 mt-auto">
                        {selectedConv.otherPartyAvatar ? (
                          <img
                            src={selectedConv.otherPartyAvatar}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-neutral-800"
                            alt=""
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-[10px] font-bold">
                            {selectedConv.otherPartyName.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-orange-600 text-white rounded-br-sm'
                        : isDark 
                        ? 'bg-neutral-800 text-[#f2efe9] rounded-bl-sm border border-neutral-750' 
                        : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                    }`}>
                      {msg.imageUrl && <img src={msg.imageUrl} alt="attachment" className="rounded-lg mb-1.5 max-w-full" />}
                      {msg.content}
                      <span className={`block text-[9px] mt-1.5 opacity-60 ${isMe ? 'text-right' : ''}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input / Read-Only Panel */}
            <div className={`p-3 border-t ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
              {isReadOnly ? (
                <div className={`p-3 rounded-xl border flex items-center justify-center space-x-2 text-center text-xs font-semibold ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-455' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <Lock size={14} className="text-slate-450" />
                  <span>This conversation is read-only because the transaction is closed.</span>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <button className={`p-2 rounded-lg transition-colors ${textMuted} hover:text-orange-500`} title="Attach image (URL)">
                    <ImagePlus size={16} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    className={`flex-1 resize-none rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-orange-500 transition-all ${inputBg}`}
                    style={{ maxHeight: '96px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
