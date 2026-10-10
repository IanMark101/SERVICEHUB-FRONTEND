import { api } from '../lib/api/axios';

export async function apiGetTransactions(page = 1, limit = 20) {
  const response = await api.get('/transactions', { params: { page, limit } });
  return response.data;
}

export type PaymentRecordFilter = 'all' | 'completed' | 'refunded' | 'cancelled';
export interface ProviderPaymentRecord {
  id: string;
  bookingId: string | null;
  serviceTitle: string;
  seekerName: string;
  paymentMethod: string;
  outcome: Exclude<PaymentRecordFilter, 'all'>;
  paymentStatus: string;
  amount: number;
  earnedAmount: number;
  recordedAt: string;
}
export interface ProviderPaymentRecords {
  items: ProviderPaymentRecord[];
  summary: { earnedTotal: number; cashTotal: number; onlineTotal: number; completedCount: number };
  pagination: { page: number; limit: number; total: number; totalPages: number };
  linkedRecordFound: boolean;
}

export async function apiGetProviderPaymentRecords(
  params: { page: number; limit: number; date?: string; status: PaymentRecordFilter; booking?: string },
  signal?: AbortSignal,
): Promise<ProviderPaymentRecords> {
  const response = await api.get('/transactions/provider-records', {
    params, signal, timeout: 15_000, apiCache: 'no-store',
  });
  if (!response.data.success || !Array.isArray(response.data.data?.items) || !response.data.data.summary) {
    throw new Error('Payment records could not be loaded.');
  }
  return response.data.data;
}
