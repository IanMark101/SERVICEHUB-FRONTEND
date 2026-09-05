import { api } from '../lib/api/axios';

export async function apiGetAdminOverview() {
  const response = await api.get('/admin/overview');
  return response.data;
}

export async function apiListAdminAuditLogs(params?: { page?: number; limit?: number; action?: string }) {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
}

export async function apiListAdminReviews(params?: { page?: number; limit?: number; visibility?: 'VISIBLE' | 'HIDDEN' }) {
  const response = await api.get('/admin/reviews', { params });
  return response.data;
}

export async function apiModerateReview(id: string, action: 'hide' | 'restore', reason: string) {
  const response = await api.patch(`/admin/reviews/${id}/moderation`, { action, reason });
  return response.data;
}

export async function apiAccessReportEvidence(id: string, action: 'view' | 'download' = 'view') {
  const response = await api.get(`/admin/reports/${id}/evidence/access`, { params: { action } });
  return response.data;
}

export async function apiListAnnouncements(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/announcements', { params });
  return response.data;
}

export async function apiCreateAnnouncement(data: { title: string; body: string; isPublished?: boolean }) {
  const response = await api.post('/admin/announcements', data);
  return response.data;
}

export async function apiUpdateAnnouncement(id: string, data: { title?: string; body?: string; isPublished?: boolean }) {
  const response = await api.patch(`/admin/announcements/${id}`, data);
  return response.data;
}

export async function apiListUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
  const response = await api.get('/admin/users', { params });
  return response.data;
}

export async function apiUpdateTrustScore(userId: string, delta: number, reason: string) {
  const response = await api.patch(`/admin/users/${userId}/trust`, { delta, reason });
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

export async function apiRestoreUser(userId: string, reason = 'Administrator restored account') {
  const response = await api.patch(`/admin/users/${userId}/restore`, { reason });
  return response.data;
}

export async function apiRestorePostingPrivilege(userId: string, reason = 'Administrator completed manual listing review') {
  const response = await api.patch(`/admin/users/${userId}/posting-restore`, { reason });
  return response.data;
}

export async function apiPromoteUserToAdmin(userId: string, reason: string, currentPassword: string) {
  const response = await api.patch(`/admin/users/${userId}/promote`, { reason, currentPassword });
  return response.data;
}

export async function apiListPendingVerifications(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/verifications', { params });
  return response.data;
}

export async function apiReviewVerification(id: string, approve: boolean, adminNotes?: string) {
  const response = await api.patch(`/admin/verifications/${id}`, { approve, adminNotes });
  return response.data;
}

export async function apiAccessVerificationProof(
  verificationId: string,
  proofId: string,
  action: 'view' | 'download' = 'view',
) {
  const response = await api.get(`/admin/verifications/${verificationId}/proofs/${proofId}/access`, {
    params: { action },
  });
  return response.data;
}

export async function apiListPendingServices(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/services/pending', { params });
  return response.data;
}

export async function apiReviewService(id: string, approve: boolean, adminNotes?: string) {
  const response = await api.patch(`/admin/services/${id}/review`, { approve, adminNotes });
  return response.data;
}

export async function apiListCategorySuggestions(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/categories/suggestions', { params });
  return response.data;
}

export async function apiResolveCategorySuggestion(id: string, approve: boolean, adminNotes?: string) {
  const response = await api.patch(`/admin/categories/suggestions/${id}`, { approve, adminNotes });
  return response.data;
}

export async function apiListReports(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/reports', { params });
  return response.data;
}

export async function apiResolveReport(id: string, action: 'warn' | 'trust_deduct' | 'suspend' | 'ban' | 'approve_refund' | 'release_provider_and_complete' | 'dismiss', adminNotes?: string) {
  const response = await api.patch(`/admin/reports/${id}/resolve`, { action, adminNotes });
  return response.data;
}

export async function apiListCompletionEscalations(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/completion-escalations', { params });
  return response.data;
}

export async function apiResolveCompletionEscalation(id: string, action: 'release_provider_and_complete' | 'keep_awaiting', resolution: string) {
  const response = await api.patch(`/admin/completion-escalations/${id}/resolve`, { action, resolution });
  return response.data;
}

export async function apiListPaymentReconciliation(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/payments/reconciliation', { params });
  return response.data;
}

export async function apiRetryPaymentReconciliation(id: string) {
  const response = await api.post(`/admin/payments/reconciliation/${id}/retry`);
  return response.data;
}

export async function apiListAdminBookings(params?: { page?: number; limit?: number; status?: string }) {
  const response = await api.get('/admin/bookings', { params });
  return response.data;
}

export async function apiCancelAdminBooking(bookingId: string, reason: string) {
  const response = await api.post(`/admin/bookings/${bookingId}/cancel`, { reason });
  return response.data;
}

export async function apiListAdminPaymentAttempts(params?: { page?: number; limit?: number; status?: string }) {
  const response = await api.get('/admin/payment-attempts', { params });
  return response.data;
}

export async function apiListAccountDeletionRequests(params?: { page?: number; limit?: number; status?: string }) {
  const response = await api.get('/admin/account-deletions', { params });
  return response.data;
}

export async function apiFinalizeAccountDeletion(userId: string, reason: string) {
  const response = await api.post(`/admin/account-deletions/${userId}/finalize`, { reason });
  return response.data;
}

// ── Cancellation Escalations ──────────────────────────────────────────────────

export async function apiListEscalatedCancellations(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/cancellations/escalated', { params });
  return response.data;
}

export async function apiResolveEscalatedCancellation(id: string, approve: boolean, adminNotes?: string) {
  const response = await api.patch(`/admin/cancellation-requests/${id}/resolve`, { approve, adminNotes });
  return response.data;
}
