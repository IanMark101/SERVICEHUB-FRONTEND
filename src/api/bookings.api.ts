import { api } from '../lib/api/axios';

export async function apiBookDirect(data: { serviceId: string; agreedPrice: number; schedule?: string; message?: string }) {
  const response = await api.post('/bookings/direct', data);
  return response.data;
}

export async function apiInitiatePayment(data: { serviceId: string; amount: number; description?: string; paymentMethodType?: string; returnUrl?: string }) {
  const response = await api.post('/bookings/initiate-payment', data);
  return response.data;
}

export async function apiConfirmOnlineBooking(data: { serviceId: string; paymentIntentId: string; offerId?: string }) {
  const response = await api.post('/bookings/confirm-online', data);
  return response.data;
}

export async function apiJoinWaitlist(serviceId: string) {
  const response = await api.post('/bookings/waitlist', { serviceId });
  return response.data;
}

export async function apiCancelQueue(id: string) {
  const response = await api.delete(`/bookings/queue/${id}`);
  return response.data;
}

export async function apiCompleteJob(id: string) {
  const response = await api.patch(`/bookings/queue/${id}/complete`);
  return response.data;
}

export async function apiConfirmCompletion(bookingId: string) {
  const response = await api.post(`/bookings/${bookingId}/confirm`);
  return response.data;
}

export async function apiGetMyEngagements() {
  const response = await api.get('/bookings/my-engagements');
  return response.data;
}

export async function apiRespondDirectRequest(requestId: string, accept: boolean) {
  const response = await api.patch(`/bookings/direct/${requestId}/respond`, { accept });
  return response.data;
}

export async function apiBookDirectFromOffer(offerId: string) {
  const response = await api.post('/bookings/direct-from-offer', { offerId });
  return response.data;
}

export async function apiStartJob(queueId: string) {
  const response = await api.patch(`/bookings/queue/${queueId}/start`);
  return response.data;
}

export async function apiProviderRemoveQueue(queueId: string) {
  const response = await api.delete(`/bookings/queue/${queueId}/provider`);
  return response.data;
}

export async function apiDisputeJob(bookingId: string, reason: string, description?: string, evidenceUrl?: string) {
  const response = await api.post(`/bookings/${bookingId}/dispute`, { reason, description, evidenceUrl });
  return response.data;
}

export async function apiCancelBooking(bookingId: string, reason?: string) {
  const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
  return response.data;
}

export async function apiRespondCancellationRequest(requestId: string, approve: boolean, providerNote?: string) {
  const response = await api.patch(`/bookings/cancellation-requests/${requestId}/respond`, { approve, providerNote });
  return response.data;
}

export async function apiEscalateCancellationRequest(requestId: string) {
  const response = await api.post(`/bookings/cancellation-requests/${requestId}/escalate`);
  return response.data;
}

export async function apiAdminResolveCancellation(requestId: string, approve: boolean, adminNote?: string) {
  const response = await api.patch(`/admin/cancellation-requests/${requestId}/resolve`, { approve, adminNote });
  return response.data;
}
