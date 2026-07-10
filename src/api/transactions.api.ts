import { api } from '../lib/api/axios';

export async function apiGetTransactions() {
  const response = await api.get('/transactions');
  return response.data;
}
