import { api } from '../lib/api/axios';

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

export async function apiGetVerificationStatus() {
  const response = await api.get('/verifications/status');
  return response.data;
}

export async function apiGetVerificationPrivacyNotice() {
  const response = await api.get('/verifications/privacy-notice');
  return response.data;
}
