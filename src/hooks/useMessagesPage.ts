"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCacheRefresh } from './useApiCacheRefresh';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { apiGetMessages, apiSendMessage, apiGetConversationGroups, apiGetConversationGroupForBooking } from '../api/messages.api';
import { apiHideBooking } from '../api/bookings.api';
import { joinBookingRoom, getSocket } from '../lib/socket';
import type { ConfirmModalState } from '../components/ui/ConfirmModal';
import { getApiErrorMessage, getApiErrorStatus } from '../lib/api/errors';

export interface DbMessage {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  isSystem: boolean;
  sender: { id: string; name: string; avatarUrl?: string };
}

export interface Conversation {
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

export interface ConversationGroup {
  otherPartyId: string;
  otherPartyName: string;
  otherPartyAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  bookings: Conversation[];
}

export const isConversationClosed = (status: string) =>
  ['PENDING_APPROVAL', 'DECLINED', 'CANCELED', 'REMOVED', 'COMPLETED'].includes(status);

export function useMessagesPage() {
  const { isDark, user } = useApp();
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get('booking');

  const [conversationGroups, setConversationGroups] = useState<ConversationGroup[]>([]);
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationTotalPages, setConversationTotalPages] = useState(1);
  const [initialSyncComplete, setInitialSyncComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageScrollRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedConvRef = useRef<Conversation | null>(null);
  const messageLoadIdRef = useRef(0);
  const resolvedMessageBooking = useRef<string | null>(null);

  const conversations = conversationGroups.flatMap(group => group.bookings);
  const selectedGroup = conversationGroups.find(group => group.otherPartyId === selectedConv?.otherPartyId);
  const filteredConversationGroups = conversationGroups.filter(group => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      group.otherPartyName.toLowerCase().includes(q) ||
      group.bookings.some(booking => booking.title.toLowerCase().includes(q) || booking.lastMessage?.toLowerCase().includes(q))
    );
  });

  // Sync conversation list from backend
  const syncConversations = useCallback(async () => {
    try {
      const res = await apiGetConversationGroups(conversationPage, 20);
      if (res.success) {
        const next: ConversationGroup[] = res.data || [];
        setConversationGroups(prev => {
          const selected = selectedConvRef.current;
          const pinned = selected && !next.some(group => group.otherPartyId === selected.otherPartyId)
            ? prev.find(group => group.otherPartyId === selected.otherPartyId)
            : null;
          return pinned ? [pinned, ...next] : next;
        });
        setSelectedConv(prev => next.flatMap(group => group.bookings).find(booking => booking.bookingId === prev?.bookingId) || prev);
        setConversationTotalPages(Math.max(1, res.pagination?.totalPages || 1));
      }
    } catch (e: unknown) {
      // 401s are handled by the axios interceptor (token refresh + retry),
      // so only log genuinely unexpected errors to reduce console noise.
      if (getApiErrorStatus(e) !== 401) {
        if (process.env.NODE_ENV === 'development') console.error("Failed to sync conversations:", e);
      }
    } finally {
      setInitialSyncComplete(true);
    }
  }, [conversationPage]);

  const hasProcessedInitialDeepLink = useRef(false);

  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // Load messages for chosen conversation
  const loadMessages = useCallback(async (bookingId: string) => {
    const loadId = ++messageLoadIdRef.current;
    setLoading(resolvedMessageBooking.current !== bookingId);
    setError('');
    try {
      const res = await apiGetMessages(bookingId);
      if (loadId !== messageLoadIdRef.current) return;
      if (res.success) {
        setMessages(res.data || []);
        resolvedMessageBooking.current = bookingId;
      } else {
        setError(res.error || 'Failed to load messages.');
      }
    } catch (e: unknown) {
      if (loadId === messageLoadIdRef.current) setError(getApiErrorMessage(e, 'Failed to load messages.'));
    } finally {
      if (loadId === messageLoadIdRef.current) setLoading(false);
    }
  }, []);

  useApiCacheRefresh(['messages'], async change => {
    if (['focus', 'online', 'reconnect'].includes(change.reason) && selectedConvRef.current) {
      await Promise.all([syncConversations(), loadMessages(selectedConvRef.current.bookingId)]);
    } else await syncConversations();
  });

  // Select conversation & join room
  const selectConversation = useCallback((conv: Conversation) => {
    shouldStickToBottomRef.current = true;
    setSelectedConv(conv);
    resolvedMessageBooking.current = null;
    setMessages([]);
    setError('');
    loadMessages(conv.bookingId);
    joinBookingRoom(conv.bookingId);

    // Optimistically zero unread count
    setConversationGroups(prev => prev.map(group => {
      if (group.otherPartyId !== conv.otherPartyId) return group;
      return {
        ...group,
        unreadCount: Math.max(0, group.unreadCount - conv.unreadCount),
        bookings: group.bookings.map(booking => booking.bookingId === conv.bookingId ? { ...booking, unreadCount: 0 } : booking),
      };
    }));
  }, [loadMessages]);

  const selectGroup = useCallback((group: ConversationGroup) => {
    const target = group.bookings.find(booking => booking.bookingId === selectedConvRef.current?.bookingId)
      || group.bookings.find(booking => !isConversationClosed(booking.status))
      || group.bookings[0];
    if (target) selectConversation(target);
  }, [selectConversation]);

  // Load conversations initial load
  useEffect(() => {
    const timer = window.setTimeout(() => void syncConversations(), 0);
    return () => window.clearTimeout(timer);
  }, [syncConversations]);

  // Handle deep-link query parameter (runs ONCE on first load of conversations)
  useEffect(() => {
    if (hasProcessedInitialDeepLink.current || !initialSyncComplete) return;

    const timer = window.setTimeout(() => {
      hasProcessedInitialDeepLink.current = true;
      if (bookingParam) {
        const match = conversations.find(c => c.bookingId === bookingParam);
        if (match) {
          selectConversation(match);
          return;
        }
        void apiGetConversationGroupForBooking(bookingParam).then((res) => {
          const group = res.data as ConversationGroup | undefined;
          const linked = group?.bookings.find(booking => booking.bookingId === bookingParam);
          if (!group || !linked) return;
          setConversationGroups(prev => prev.some(existing => existing.otherPartyId === group.otherPartyId) ? prev : [group, ...prev]);
          selectConversation(linked);
        }).catch(() => {
          if (conversations[0]) selectConversation(conversations[0]);
        });
        return;
      }
      if (!selectedConv && conversationGroups[0]) selectGroup(conversationGroups[0]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [bookingParam, conversationGroups, conversations, initialSyncComplete, selectConversation, selectGroup, selectedConv]);

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
    };

    // Central socket invalidation refreshes inbox and unread counts once.
    // This listener only inserts the active thread's message immediately.
    sock.on('new_message', handler);

    return () => {
      sock.off('new_message', handler);
    };
  }, []);

  const handleMessageScroll = () => {
    const pane = messageScrollRef.current;
    if (!pane) return;
    shouldStickToBottomRef.current = pane.scrollHeight - pane.scrollTop - pane.clientHeight <= 80;
  };

  // Keep the conversation pane at the bottom only while the reader is already there.
  useEffect(() => {
    const pane = messageScrollRef.current;
    if (pane && shouldStickToBottomRef.current) pane.scrollTop = pane.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    shouldStickToBottomRef.current = true;
    const content = input.trim();
    setInput('');
    setError('');
    setSending(true);
    try {
      const res = await apiSendMessage(selectedConv.bookingId, content);
      if (res.success) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === res.data.id);
          return exists ? prev : [...prev, res.data];
        });
      }
    } catch (e: unknown) {
      setInput(content);
      setError(getApiErrorMessage(e, 'Failed to send message.'));
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

  const handleHideConversation = (bookingId: string) => {
    const targetConv = conversations.find(c => c.bookingId === bookingId);
    const targetTitle = targetConv?.title || 'this job';

    setConfirmModal({
      isOpen: true,
      title: 'Hide booking',
      message: `Hide ${targetTitle} from your Activity and Messages views? Other bookings with this person will remain visible.`,
      confirmText: 'Hide booking',
      cancelText: 'Keep',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          await apiHideBooking(bookingId);
          setConversationGroups(prev => prev.flatMap(group => {
            const bookings = group.bookings.filter(booking => booking.bookingId !== bookingId);
            if (bookings.length === 0) return [];
            const latest = bookings[0];
            return [{
              ...group,
              bookings,
              lastMessage: latest.lastMessage,
              lastMessageTime: latest.lastMessageTime,
              unreadCount: bookings.reduce((total, booking) => total + booking.unreadCount, 0),
            }];
          }));
          if (selectedConv?.bookingId === bookingId) {
            messageLoadIdRef.current += 1;
            setSelectedConv(null);
            setMessages([]);
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') console.error('Failed to hide conversation:', e);
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const isReadOnly = selectedConv ? isConversationClosed(selectedConv.status) : false;

  const cardBg = isDark ? 'bg-charcoal-inset border-neutral-800/70' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-[#f2efe9]' : 'text-slate-800';
  const textMuted = isDark ? 'text-[#9a9690]' : 'text-slate-550';
  const inputBg = isDark ? 'bg-charcoal border-neutral-700 text-[#f2efe9] placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  return {
    isDark,
    user,
    conversations,
    conversationGroups,
    selectedGroup,
    conversationPage,
    setConversationPage,
    conversationTotalPages,
    searchQuery,
    setSearchQuery,
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
    filteredConversationGroups,
    selectConversation,
    selectGroup,
    handleSend,
    handleKeyDown,
    handleHideConversation,
    isReadOnly,
    cardBg,
    textPrimary,
    textMuted,
    inputBg
  };
}
