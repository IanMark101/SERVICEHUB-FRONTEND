import { api } from '../lib/api/axios';

export type EarningsStatus = 'all' | 'earned' | 'held' | 'pending' | 'failed' | 'refunded' | 'review';
export interface EarningsFilters { period: 'today' | 'week' | 'month' | 'custom'; status: EarningsStatus; from?: string; to?: string }
export interface EarningsRecord {
  id: string; bookingId: string | null; reference: string | null; serviceTitle: string;
  customerName: string; providerName: string; amount: number; platformFeeAmount: number;
  providerNetAmount: number; commissionRateBps: number; status: Exclude<EarningsStatus, 'all'>;
  isTestMode: boolean; recordedAt: string; paidAt: string | null;
}
export interface PlatformEarnings {
  summary: { earnedTotal: number; today: number; week: number; month: number; pendingFees: number };
  period: { transactions: number; paidTransactions: number; earnedFees: number; averageFee: number };
  range: { from: string; to: string; timezone: string };
  pagination: { page: number; limit: number; total: number; totalPages: number };
  trend: Array<{ date: string; amount: number }>;
  items: EarningsRecord[];
}
export async function apiGetPlatformEarnings(filters: EarningsFilters, page: number, signal?: AbortSignal): Promise<PlatformEarnings> {
  const response = await api.get('/admin/earnings', { params: { ...filters, page, limit: 12 }, signal, timeout: 20_000, apiCache: 'no-store' });
  if (!response.data.success || !response.data.data?.summary || !Array.isArray(response.data.data.items)) throw new Error('Earnings could not be loaded.');
  return response.data.data;
}
