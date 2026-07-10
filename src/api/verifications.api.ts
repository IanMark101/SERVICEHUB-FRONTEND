import { api } from '../lib/api/axios';

export async function apiSubmitVerification(proofs: { fileUrl: string; documentType: string }[]) {
  const response = await api.post('/verifications/submit', { proofs });
  return response.data;
}

export async function apiGetVerificationStatus() {
  const response = await api.get('/verifications/status');
  return response.data;
}
