import { api } from '../lib/api/axios';
import type { AdminUserProfileData, AdminUserRecordsResponse, UserRecordKind } from '../components/admin/users/types';

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

export async function apiGetAdminUserProfile(userId: string, signal?: AbortSignal) {
  return (await api.get<{ data: AdminUserProfileData }>(`/admin/users/${encodeURIComponent(userId)}`, { apiCache: 'no-store', signal })).data;
}

export async function apiGetAdminUserRecords(userId: string, kind: UserRecordKind, page: number, signal?: AbortSignal) {
  return (await api.get<AdminUserRecordsResponse>(`/admin/users/${encodeURIComponent(userId)}/records`, { params: { kind, page, limit: 10 }, apiCache: 'no-store', signal })).data;
}

export async function apiGetBanAppealSummary() {
  return (await api.get<{ data: { pending: number } }>('/admin/ban-appeals/summary')).data;
}

export async function apiUpdateTrustScore(userId: string, delta: number, reason: string, currentPassword: string, operationId: string) {
  const response = await api.patch(`/admin/users/${userId}/trust`, { delta, reason, currentPassword, operationId });
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

export async function apiRestoreUser(userId: string, reason: string) {
  const response = await api.patch(`/admin/users/${userId}/restore`, { reason });
  return response.data;
}

export async function apiListBanAppeals(params?: { status?: 'PENDING' | 'APPROVED' | 'REJECTED'; view?: 'pending' | 'history' | 'all'; page?: number; limit?: number }) {
  const response = await api.get('/admin/ban-appeals', { params });
  return response.data;
}

export async function apiDecideBanAppeal(id: string, decision: 'APPROVED' | 'REJECTED', reason: string) {
  const response = await api.patch(`/admin/ban-appeals/${id}`, { decision, reason });
  return response.data;
}

export async function apiRestorePostingPrivilege(userId: string, reason = 'Administrator reviewed the account posting restriction') {
  const response = await api.patch(`/admin/users/${userId}/posting-restore`, { reason });
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

export async function apiListAdminServices(params?: { page?: number; limit?: number; status?: string }) {
  const response = await api.get('/admin/services', { params });
  return response.data;
}

export async function apiRemovePublishedService(id: string, reason: string) {
  const response = await api.post(`/admin/services/${id}/remove-content`, { reason });
  return response.data;
}

export async function apiRestoreRemovedService(id: string, reason: string) {
  const response = await api.post(`/admin/services/${id}/restore-content`, { reason });
  return response.data;
}

export async function apiListAdminPublicRequests(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/content/requests', { params });
  return response.data;
}

export async function apiRemovePublicRequest(id: string, reason: string) {
  const response = await api.post(`/admin/content/requests/${id}/remove`, { reason });
  return response.data;
}

export async function apiListAdminCategories(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/categories', { params });
  return response.data;
}

export async function apiCreateAdminCategory(data: { name: string; reason: string }) {
  const response = await api.post('/admin/categories', data);
  return response.data;
}

export async function apiUpdateAdminCategory(
  id: string,
  data: { name?: string; isActive?: boolean; reason: string },
) {
  const response = await api.patch(`/admin/categories/${id}`, data);
  return response.data;
}

export async function apiListReports(params?: { page?: number; limit?: number; userId?: string }) {
  const response = await api.get('/admin/reports', { params });
  return response.data;
}

export async function apiResolveReport(id: string, outcome: 'dismiss' | 'resolve_safety' | 'cancel_booking' | 'release_provider_and_complete', penaltyAction: 'none' | 'warn' | 'trust_deduct' | 'suspend' | 'ban', adminNotes?: string) {
  const response = await api.patch(`/admin/reports/${id}/resolve`, { outcome, penaltyAction, adminNotes });
  return response.data;
}

export async function apiListModerationCases(params: import('../components/admin/cases/types').CaseFilters & { page: number; limit: number; userId?: string; bookingId?: string }) {
  const response = await api.get('/admin/moderation-cases', { params });
  return response.data;
}

export async function apiGetModerationCase(source: string, id: string, startReview = false) {
  const response = startReview
    ? await api.patch(`/admin/moderation-cases/${source}/${id}/review`)
    : await api.get(`/admin/moderation-cases/${source}/${id}`);
  return response.data;
}

export async function apiListCompletionEscalations(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/completion-escalations', { params });
  return response.data;
}

export async function apiResolveCompletionEscalation(id: string, action: 'release_provider_and_complete' | 'refund_seeker' | 'keep_awaiting', resolution: string) {
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

export async function apiListAdminBookings(params?: { page?: number; limit?: number; status?: string; userId?: string; needsResolution?: boolean }) {
  const response = await api.get('/admin/bookings', { params });
  return response.data;
}

export async function apiCancelAdminBooking(bookingId: string, reason: string) {
  const response = await api.post(`/admin/bookings/${bookingId}/cancel`, { reason });
  return response.data;
}

export async function apiResolveBannedParticipantBooking(bookingId: string, outcome: 'cancel_booking' | 'release_provider_and_complete', reason: string) {
  const response = await api.post(`/admin/bookings/${bookingId}/resolve-banned`, { outcome, reason });
  return response.data;
}

export async function apiListAdminPaymentAttempts(params?: { page?: number; limit?: number; status?: string }) {
  const response = await api.get('/admin/payment-attempts', { params });
  return response.data;
}

export async function apiGetAdminBookingMessages(bookingId: string) {
  const response = await api.get(`/admin/bookings/${bookingId}/messages`);
  return response.data;
}

// ── Cancellation Escalations ──────────────────────────────────────────────────

export async function apiListEscalatedCancellations(params?: { page?: number; limit?: number }) {
  const response = await api.get('/admin/cancellations/escalated', { params });
  return response.data;
}

export async function apiResolveEscalatedCancellation(id: string, approve: boolean, adminNotes?: string, fault: 'none' | 'seeker' | 'provider' = 'none') {
  const response = await api.patch(`/admin/cancellation-requests/${id}/resolve`, { approve, adminNotes, fault });
  return response.data;
}
