import { api } from './axios';

export async function apiGetMessages(completedServiceId: string) {
  const response = await api.get(`/messages/${completedServiceId}`);
  return response.data;
}

export async function apiSendMessage(completedServiceId: string, content: string, imageUrl?: string) {
  const response = await api.post(`/messages/${completedServiceId}`, { content, imageUrl });
  return response.data;
}
