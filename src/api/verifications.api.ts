import { api } from '../lib/api/axios';

export interface VerificationStatusData {
  id: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export async function apiUploadVerificationImage(image: string) {
  const response = await api.post('/upload/verification', { image });
  return response.data;
}

export async function apiSubmitVerification(
  proofs: { storageKey: string; documentType: string }[],
  privacyNoticeVersion: string,
) {
  const response = await api.post('/verifications/submit', {
    proofs,
    privacyNoticeVersion,
    privacyAcknowledged: true,
  });
  return response.data;
}

export async function apiGetVerificationStatus(): Promise<{ success: boolean; data: VerificationStatusData | null }> {
  const response = await api.get('/verifications/status', { timeout: 15_000 });
  return response.data;
}

export async function apiGetVerificationPrivacyNotice() {
  const response = await api.get('/verifications/privacy-notice', { timeout: 15_000 });
  return response.data;
}
