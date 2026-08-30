"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Send, ChevronLeft, ImagePlus, Loader2, Lock, ShieldCheck, X, Trash2, Search } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { apiGetMessages, apiSendMessage, apiGetConversations } from '../../../api/messages.api';
import { apiHideBooking } from '../../../api/bookings.api';
import { joinBookingRoom, getSocket } from '../../../lib/socket';
import { processMessageImage } from '../../../lib/imageUtils';

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
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ProviderMessagesPage() {
  const { isDark, user, syncUnreadMessages } = useApp();
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get('booking');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      conv.otherPartyName.toLowerCase().includes(q) ||
      conv.title.toLowerCase().includes(q) ||
      (conv.lastMessage && conv.lastMessage.toLowerCase().includes(q))
    );
  });

  // Sync conversation list from backend
  const syncConversations = useCallback(async () => {
    try {
      const res = await apiGetConversations();
      if (res.success) {
        setConversations(res.data || []);
      }
    } catch (e: any) {
      // 401s are handled by the axios interceptor (token refresh + retry)
      if (e?.response?.status !== 401) {
        console.error("Failed to sync conversations:", e);
      }
    }
  }, []);

  const selectedConvRef = useRef<Conversation | null>(null);
  selectedConvRef.current = selectedConv;
  const hasProcessedInitialDeepLink = useRef(false);

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

  // Handle deep-link query parameter (runs ONCE on first load of conversations)
  useEffect(() => {
    if (hasProcessedInitialDeepLink.current || conversations.length === 0) return;

    hasProcessedInitialDeepLink.current = true;
    if (bookingParam) {
      const match = conversations.find(c => c.bookingId === bookingParam);
      if (match) {
        selectConversation(match);
        return;
      }
    }

    if (!selectedConv) {
      selectConversation(conversations[0]);
    }
  }, [bookingParam, conversations, selectConversation, selectedConv]);

  // Real-time listener
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handler = (msg: DbMessage) => {
      if (selectedConvRef.current && msg.bookingId === selectedConvRef.current.bookingId) {
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
  }, [syncConversations, syncUnreadMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processMessageImage(file);
      setAttachedImage(dataUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to attach image.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || !selectedConv || sending) return;
    const content = input.trim() || 'Sent an attachment';
    const img = attachedImage;
    setInput('');
    setAttachedImage(null);
    setSending(true);
    try {
      const res = await apiSendMessage(selectedConv.bookingId, content, img || undefined);
      if (res.success) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === res.data.id);
          return exists ? prev : [...prev, res.data];
        });
        syncConversations();
      }
    } catch (e: any) {
      setInput(content);
      setAttachedImage(img);
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

  const handleHideConversation = async (bookingId: string) => {
    if (!confirm('Remove this conversation from your list?')) return;
    try {
      await apiHideBooking(bookingId);
      setConversations(prev => prev.filter(c => c.bookingId !== bookingId));
      if (selectedConv?.bookingId === bookingId) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to hide conversation:', e);
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
        <div className={`p-3.5 border-b ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`font-extrabold text-sm ${textPrimary}`}>Conversations</h2>
            <span className={`text-[10px] font-semibold ${textMuted}`}>
              {filteredConversations.length} {filteredConversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          {/* Search bar */}
          <div className="mt-2.5 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-7 py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                isDark 
                  ? 'bg-[#22211e] border-neutral-800 text-[#f2efe9] placeholder-neutral-500 focus:border-emerald-500/80' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-800/40">
          {conversations.length === 0 ? (
            <div className={`p-6 text-center text-xs ${textMuted}`}>
              No active conversations yet. Book a service to start chatting.
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className={`p-6 text-center text-xs ${textMuted}`}>
              No conversations found matching "{searchQuery}".
            </div>
          ) : (
            filteredConversations.map(conv => {
              const active = selectedConv?.bookingId === conv.bookingId;
              const hasUnread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.bookingId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative cursor-pointer ${
                    active 
                      ? (isDark ? 'bg-emerald-950/20 border-l-4 border-emerald-500 shadow-sm' : 'bg-emerald-50/90 border-l-4 border-emerald-500 shadow-sm') 
                      : (isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-slate-50/70')
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
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                        {conv.otherPartyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white dark:border-[#1c1b18]" />
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${textPrimary}`}>
                        {conv.otherPartyName}
                      </span>
                      <span className={`text-[9px] font-medium whitespace-nowrap pl-1 ${hasUnread ? 'text-emerald-500 font-bold' : textMuted}`}>
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
                <button onClick={() => setSelectedConv(null)} className={`md:hidden ${textMuted} hover:text-emerald-500`}>
                  <ChevronLeft size={18} />
                </button>
                {selectedConv.otherPartyAvatar ? (
                  <img
                    src={selectedConv.otherPartyAvatar}
                    alt={selectedConv.otherPartyName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-neutral-800"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
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

              {/* Right actions: Status Indicator and Hide button */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                  selectedConv.status === 'COMPLETED'
                    ? (isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                    : selectedConv.status === 'CANCELLED'
                    ? (isDark ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' : 'bg-rose-50 text-rose-700 border-rose-200')
                    : (isDark ? 'bg-blue-950/40 text-blue-400 border-blue-800/40' : 'bg-blue-50 text-blue-700 border-blue-200')
                }`}>
                  {selectedConv.status.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => handleHideConversation(selectedConv.bookingId)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isDark 
                      ? 'border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20' 
                      : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                  }`}
                  title="Remove / Hide conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
              )}
              {error && !loading && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-900/10 border border-rose-900/20 rounded-xl p-3">
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
                          ? 'bg-neutral-800/90 border-neutral-700/60 text-emerald-400' 
                          : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      }`}>
                        <ShieldCheck size={12} className="text-emerald-500" />
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
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                            {selectedConv.otherPartyName.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-sm'
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
                <div>
                  {attachedImage && (
                    <div className="relative inline-block mb-2 p-1.5 border rounded-2xl bg-slate-100 dark:bg-neutral-800/80 dark:border-neutral-700">
                      <img src={attachedImage} alt="Attachment preview" className="h-16 w-16 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setAttachedImage(null)}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition-all cursor-pointer"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-lg transition-colors ${textMuted} hover:text-emerald-500 cursor-pointer`}
                      title="Attach image from device"
                    >
                      <ImagePlus size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message… (Enter to send)"
                      className={`flex-1 resize-none rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${inputBg}`}
                      style={{ maxHeight: '96px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={(!input.trim() && !attachedImage) || sending}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 cursor-pointer"
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
    </div>
  );
}
