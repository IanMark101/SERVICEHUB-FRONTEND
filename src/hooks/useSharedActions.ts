import React from 'react';
import {
  JobEngagement,
  Message,
  Notification
} from '../types';
import { apiSendMessage } from '../api/messages.api';
import { apiMarkNotificationsRead } from '../api/notifications.api';

interface SharedActionsDeps {
  jobEngagements: JobEngagement[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export function useSharedActions({
  jobEngagements,
  setMessages,
  setNotifications
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
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API failed in sendMessage, falling back to mock:", err);
    }

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderId,
      receiverId,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markNotificationsRead = async (userId: string) => {
    try {
      const res = await apiMarkNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
        return;
      }
    } catch (err) {
      console.warn("Backend API failed in markNotificationsRead, falling back to mock:", err);
    }
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  return {
    sendMessage,
    markNotificationsRead
  };
}
