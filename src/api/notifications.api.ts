import { api } from './axios';

export async function apiGetNotifications() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function apiMarkNotificationsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}
