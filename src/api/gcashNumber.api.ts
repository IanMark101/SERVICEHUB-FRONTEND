import { api } from '../lib/api/axios';

export interface GCashNumberPreference { gcashNumber: string | null }

function readPreference(body: { success?: boolean; data?: GCashNumberPreference }): GCashNumberPreference {
  const number = body?.data?.gcashNumber;
  if (body?.success !== true || (number !== null && (typeof number !== 'string' || !/^09\d{9}$/.test(number)))) {
    throw new Error('Your GCash number could not be loaded. Please try again.');
  }
  return { gcashNumber: number };
}

export async function apiGetGCashNumber(signal?: AbortSignal): Promise<GCashNumberPreference> {
  return readPreference((await api.get('/auth/gcash-number', { signal, timeout: 15_000 })).data);
}

export async function apiSaveGCashNumber(gcashNumber: string | null, signal?: AbortSignal): Promise<GCashNumberPreference> {
  return readPreference((await api.put('/auth/gcash-number', { gcashNumber }, { signal, timeout: 15_000 })).data);
}
