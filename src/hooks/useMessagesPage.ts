"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { apiGetMessages, apiSendMessage, apiGetConversations } from '../api/messages.api';
import { apiHideBooking } from '../api/bookings.api';
import { joinBookingRoom, getSocket } from '../lib/socket';
import { processMessageImage } from '../lib/imageUtils';
import type { ConfirmModalState } from '../components/ui/ConfirmModal';
import { getApiErrorMessage, getApiErrorStatus } from '../lib/api/errors';

export interface DbMessage {
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

export function useMessagesPage() {
  const { isDark, user, syncUnreadMessages } = useApp();
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get('booking');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationTotalPages, setConversationTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
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
      const res = await apiGetConversations(conversationPage, 20);
      if (res.success) {
        setConversations(res.data || []);
        setConversationTotalPages(Math.max(1, res.pagination?.totalPages || 1));
      }
    } catch (e: unknown) {
      // 401s are handled by the axios interceptor (token refresh + retry),
      // so only log genuinely unexpected errors to reduce console noise.
      if (getApiErrorStatus(e) !== 401) {
        if (process.env.NODE_ENV === 'development') console.error("Failed to sync conversations:", e);
      }
    }
  }, [conversationPage]);

  const selectedConvRef = useRef<Conversation | null>(null);
  const hasProcessedInitialDeepLink = useRef(false);

  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

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
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to load messages.'));
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
    const timer = window.setTimeout(() => void syncConversations(), 0);
    return () => window.clearTimeout(timer);
  }, [syncConversations]);

  // Handle deep-link query parameter (runs ONCE on first load of conversations)
  useEffect(() => {
    if (hasProcessedInitialDeepLink.current || conversations.length === 0) return;

    const timer = window.setTimeout(() => {
      hasProcessedInitialDeepLink.current = true;
      if (bookingParam) {
        const match = conversations.find(c => c.bookingId === bookingParam);
        if (match) {
          selectConversation(match);
          return;
        }
      }
      if (!selectedConv) selectConversation(conversations[0]);
    }, 0);
    return () => window.clearTimeout(timer);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to attach image.');
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
    } catch (e: unknown) {
      setInput(content);
      setAttachedImage(img);
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
    const targetName = targetConv?.otherPartyName || 'this conversation';

    setConfirmModal({
      isOpen: true,
      title: 'Remove Conversation',
      message: `Are you sure you want to remove your conversation with ${targetName}? It will be hidden from your inbox list.`,
      confirmText: 'Remove',
      cancelText: 'Keep',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          await apiHideBooking(bookingId);
          setConversations(prev => prev.filter(c => c.bookingId !== bookingId));
          if (selectedConv?.bookingId === bookingId) {
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

  const isReadOnly = selectedConv ? ['PENDING_APPROVAL', 'DECLINED', 'CANCELED', 'REMOVED', 'COMPLETED'].includes(selectedConv.status) : false;

  const cardBg = isDark ? 'bg-[#1c1b18] border-neutral-800/70' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-[#f2efe9]' : 'text-slate-800';
  const textMuted = isDark ? 'text-[#9a9690]' : 'text-slate-550';
  const inputBg = isDark ? 'bg-[#2a2927] border-neutral-700 text-[#f2efe9] placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';

  return {
    isDark,
    user,
    conversations,
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
    attachedImage,
    setAttachedImage,
    sending,
    loading,
    error,
    confirmModal,
    setConfirmModal,
    bottomRef,
    textareaRef,
    fileInputRef,
    filteredConversations,
    selectConversation,
    handleImageSelect,
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
