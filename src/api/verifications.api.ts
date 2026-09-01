import { api } from '../lib/api/axios';

export async function apiUploadVerificationImage(image: string) {
  const response = await api.post('/upload/verification', { image });
  return response.data;
}

export async function apiSubmitVerification(proofs: { storageKey: string; documentType: string }[]) {
  const response = await api.post('/verifications/submit', { proofs });
  return response.data;
}

export async function apiGetVerificationStatus() {
  const response = await api.get('/verifications/status');
  return response.data;
}
