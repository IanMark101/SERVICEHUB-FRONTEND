import { api } from '../lib/api/axios';

export async function apiGetTransactions(page = 1, limit = 20) {
  const response = await api.get('/transactions', { params: { page, limit } });
  return response.data;
}
