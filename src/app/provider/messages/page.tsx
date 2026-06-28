"use client";
// Provider messages page re-uses the same full-featured MessagesPage component
// The role-aware logic (user?.role === 'seeker' vs 'provider') is handled inside.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, ChevronLeft, Lock, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { apiGetMessages, apiSendMessage } from '../../../api/messages.api';
import { joinBookingRoom, getSocket } from '../../../lib/socket';

interface DbMessage {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string; avatarUrl?: string };
}

interface Conversation {
  bookingId: string;
  label: string;
  otherPartyName: string;
  paymentUnlocked: boolean;
  status: string;
}

export default function ProviderMessagesPage() {
  const { isDark, jobEngagements, user } = useApp();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter engagements where this user is the provider
  const conversations: Conversation[] = jobEngagements
    .filter(je =>
      je.providerId === user?.id &&
      ['in_progress', 'ongoing', 'awaiting_seeker_approval', 'completed', 'queued'].includes(je.status)
    )
    .map(je => ({
      bookingId: je.id,
      label: je.title,
      otherPartyName: je.seekerName,
      paymentUnlocked: ['in_progress', 'ongoing', 'awaiting_seeker_approval', 'completed'].includes(je.status),
      status: je.status,
    }));

  const loadMessages = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetMessages(bookingId);
      if (res.success) {
        setMessages(res.data || []);
      } else {
        setError(res.error || 'Failed to load messages.');
      }
    } catch (e: any) {
      const code = e?.response?.data?.code;
      if (code === 'MESSAGES_LOCKED') {
        setError('Messages are unlocked only after payment is confirmed.');
      } else {
        setError(e?.response?.data?.error || 'Failed to load messages.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const selectConversation = useCallback((conv: Conversation) => {
    setSelectedConv(conv);
    setMessages([]);
    setError('');
    if (conv.paymentUnlocked) {
      loadMessages(conv.bookingId);
      joinBookingRoom(conv.bookingId);
    }
  }, [loadMessages]);

  useEffect(() => {
    const sock = getSocket();
    if (!sock || !selectedConv) return;
    const handler = (msg: DbMessage) => {
      if (msg.bookingId === selectedConv.bookingId) {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      }
    };
    sock.on('new_message', handler);
    return () => { sock.off('new_message', handler); };
  }, [selectedConv]);

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
        setMessages(prev => prev.some(m => m.id === res.data.id) ? prev : [...prev, res.data]);
      }
    } catch (e: any) {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const cardBg = isDark ? 'bg-[#1c1b18] border-neutral-800/70' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-[#f2efe9]' : 'text-slate-800';
  const textMuted = isDark ? 'text-[#9a9690]' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#2a2927] border-neutral-700 text-[#f2efe9] placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden flex h-[600px] ${cardBg}`}>
      {/* Sidebar */}
      <aside className={`w-72 flex-shrink-0 border-r flex flex-col ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-500" />
            <h2 className={`font-semibold text-sm ${textPrimary}`}>Messages</h2>
          </div>
          <p className={`text-xs mt-0.5 ${textMuted}`}>{conversations.length} active booking{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className={`p-6 text-center text-xs ${textMuted}`}>No active booking conversations yet.</div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.bookingId}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left p-3 border-b transition-colors ${isDark ? 'border-neutral-800/40 hover:bg-neutral-800/40' : 'border-slate-100 hover:bg-slate-50'} ${selectedConv?.bookingId === conv.bookingId ? (isDark ? 'bg-emerald-900/20' : 'bg-emerald-50') : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold flex-shrink-0">
                    {conv.otherPartyName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${textPrimary}`}>{conv.otherPartyName}</p>
                    <p className={`text-[10px] truncate ${textMuted}`}>{conv.label}</p>
                  </div>
                  {!conv.paymentUnlocked && <Lock size={12} className="text-neutral-500 flex-shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {!selectedConv ? (
          <div className={`flex-1 flex items-center justify-center ${textMuted}`}>
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : !selectedConv.paymentUnlocked ? (
          <div className={`flex-1 flex items-center justify-center text-center p-8 ${textMuted}`}>
            <div>
              <Lock size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold mb-1">Chat Locked</p>
              <p className="text-xs max-w-xs">Messaging unlocks after payment confirmation or booking acceptance.</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                {selectedConv.otherPartyName.charAt(0)}
              </div>
              <div>
                <p className={`text-sm font-semibold ${textPrimary}`}>{selectedConv.otherPartyName}</p>
                <p className={`text-[10px] ${textMuted}`}>{selectedConv.label}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {loading && <div className={`flex justify-center py-8 ${textMuted}`}><Loader2 size={20} className="animate-spin" /></div>}
              {error && !loading && <div className="text-xs text-orange-400 bg-orange-900/10 border border-orange-900/20 rounded-lg p-3 flex gap-2"><Lock size={14} />{error}</div>}
              {!loading && !error && messages.length === 0 && <div className={`text-center text-xs ${textMuted} py-8`}>No messages yet. Start the conversation! 👋</div>}
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold mr-1.5 flex-shrink-0 mt-auto">{msg.sender.name.charAt(0)}</div>}
                    <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${isMe ? 'bg-emerald-600 text-white rounded-br-sm' : isDark ? 'bg-neutral-800 text-[#f2efe9] rounded-bl-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      {msg.content}
                      <span className={`block text-[9px] mt-1 opacity-60 ${isMe ? 'text-right' : ''}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className={`p-3 border-t ${isDark ? 'border-neutral-800/70' : 'border-slate-200'}`}>
              <div className="flex items-end gap-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message… (Enter to send)"
                  className={`flex-1 resize-none rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${inputBg}`}
                />
                <button onClick={handleSend} disabled={!input.trim() || sending} className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
