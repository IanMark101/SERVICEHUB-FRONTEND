import { api } from './axios';

export async function apiGetAdminOverview() {
  const response = await api.get('/admin/overview');
  return response.data;
}

export async function apiListUsers() {
  const response = await api.get('/admin/users');
  return response.data;
}

export async function apiUpdateTrustScore(userId: string, trustScore: number) {
  const response = await api.patch(`/admin/users/${userId}/trust`, { trustScore });
  return response.data;
}

export async function apiSuspendUser(userId: string, reason: string, durationDays: number) {
  const response = await api.patch(`/admin/users/${userId}/suspend`, { reason, durationDays });
  return response.data;
}

export async function apiBanUser(userId: string, reason: string) {
  const response = await api.patch(`/admin/users/${userId}/ban`, { reason });
  return response.data;
}

export async function apiRestoreUser(userId: string) {
  const response = await api.patch(`/admin/users/${userId}/restore`);
  return response.data;
}

export async function apiListPendingVerifications() {
  const response = await api.get('/admin/verifications');
  return response.data;
}

export async function apiReviewVerification(id: string, approve: boolean, adminNotes?: string) {
  const response = await api.patch(`/admin/verifications/${id}`, { approve, adminNotes });
  return response.data;
}

export async function apiListPendingServices() {
  const response = await api.get('/admin/services/pending');
  return response.data;
}

export async function apiReviewService(id: string, approve: boolean, adminNotes?: string) {
  const response = await api.patch(`/admin/services/${id}/review`, { approve, adminNotes });
  return response.data;
}

export async function apiListCategorySuggestions() {
  const response = await api.get('/admin/categories/suggestions');
  return response.data;
}

export async function apiResolveCategorySuggestion(id: string, approve: boolean) {
  const response = await api.patch(`/admin/categories/suggestions/${id}`, { approve });
  return response.data;
}

export async function apiListReports() {
  const response = await api.get('/admin/reports');
  return response.data;
}

export async function apiResolveReport(id: string, action: 'trust_deduct' | 'suspend' | 'approve_refund' | 'dismiss', adminNotes?: string) {
  const response = await api.patch(`/admin/reports/${id}/resolve`, { action, adminNotes });
  return response.data;
}
