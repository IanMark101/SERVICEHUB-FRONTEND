import { api } from '../lib/api/axios';

export async function apiRegister(data: any) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function apiLogin(data: any) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

export async function apiLogout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function apiRefresh() {
  const response = await api.post('/auth/refresh');
  return response.data;
}

export async function apiGetMe() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function apiVerifyEmail(token: string) {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
}

export async function apiResendVerification(email: string) {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
}

export async function apiForgotPassword(email: string) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function apiResetPassword(data: any) {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
}

export async function apiGoogleLogin(token: string) {
  const response = await api.post('/auth/google-login', { token });
  return response.data;
}

export async function apiGetPublicProfile(userId: string) {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
}

export async function apiUpdateProfile(data: {
  name?: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
}) {
  const response = await api.put('/auth/profile', data);
  return response.data;
}

export async function apiChangePassword(data: { currentPassword?: string; newPassword?: string }) {
  const response = await api.post('/auth/change-password', data);
  return response.data;
}

