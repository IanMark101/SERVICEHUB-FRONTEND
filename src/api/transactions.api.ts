import { api } from './axios';

export async function apiGetTransactions() {
  const response = await api.get('/transactions');
  return response.data;
}
