import { api } from '../lib/api/axios';

export type ReviewViolation = 'MANIPULATION' | 'HARASSMENT' | 'FABRICATED' | 'IRRELEVANT' | 'OTHER_POLICY';
export interface TrustCaseItem {
  id: string; userId: string; respondentId?: string; description: string; response?: string;
  status: 'PENDING' | 'UPHELD' | 'REJECTED'; decisionReason?: string;
  user: { name: string }; respondent?: { name: string };
  review?: { id: string; rating: number; text?: string; completedService: { bookingId?: string } };
  trustEvent?: { id: string; reason: string; delta: number; bookingId?: string };
}
export async function apiListTrustCases(admin = false, page = 1): Promise<{ data: TrustCaseItem[]; pagination: { totalPages: number } }> {
  return (await api.get(admin ? '/admin/trust-cases' : '/reviews/trust-cases', { params: { page }, apiCache: 'no-store' })).data;
}
export async function apiRespondTrustCase(id: string, response: string) {
  return (await api.patch(`/reviews/trust-cases/${id}/response`, { response })).data;
}
export async function apiDecideTrustCase(id: string, input: { uphold: boolean; reason: string; violation?: ReviewViolation }) {
  return (await api.patch(`/admin/trust-cases/${id}`, input)).data;
}
export async function apiTrustCorrections(id: string): Promise<{ data: { id: string; delta: number; reason: string }[] }> {
  return (await api.get(`/admin/users/${id}/trust-corrections`, { apiCache: 'no-store' })).data;
}
