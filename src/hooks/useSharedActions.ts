import React from 'react';
import {
  JobEngagement,
  Message
} from '../types';
import { apiSendMessage } from '../api/messages.api';
import { apiMarkNotificationsRead } from '../api/notifications.api';
import { getAccessToken } from '../lib/api/axios';
import { getApiErrorStatus } from '../lib/api/errors';

interface SharedActionsDeps {
  jobEngagements: JobEngagement[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  applyNotificationRead: (userId: string, notificationId?: string, unread?: number, readBefore?: string) => void;
}

export function useSharedActions({
  jobEngagements,
  setMessages,
  applyNotificationRead
}: SharedActionsDeps) {

  const sendMessage = async (senderId: string, receiverId: string, text: string) => {
    try {
      const firstBooking = jobEngagements[0]?.id;
      if (firstBooking) {
        const res = await apiSendMessage(firstBooking, text);
        if (res.success) {
          const m = res.data;
          const newMessage: Message = {
            id: m.id,
            senderId,
            receiverId,
            text: m.content,
            createdAt: m.createdAt,
          };
          setMessages(prev => [...prev, newMessage]);
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error("Failed to send message via API:", err);
    }
  };

  const markNotificationsRead = async (userId: string, notificationId?: string) => {
    try {
      // Skip API call if no auth token is available (e.g. during role switch transitions)
      const token = getAccessToken();
      if (!token) return;

      const res = await apiMarkNotificationsRead(notificationId);
      if (res.success) {
        // A request completed after sign-out or account switching is stale.
        if (getAccessToken() !== token) return;
        applyNotificationRead(userId, notificationId, res.data?.unread, res.data?.readBefore);
        return;
      }
    } catch (err: unknown) {
      // Silently ignore 401 errors during workspace transitions — the axios interceptor
      // will attempt a token refresh automatically on the next valid request
      if (getApiErrorStatus(err) !== 401) {
        if (process.env.NODE_ENV === 'development') console.error("Backend API failed in markNotificationsRead:", err);
      }
    }
  };

  return {
    sendMessage,
    markNotificationsRead
  };
}
