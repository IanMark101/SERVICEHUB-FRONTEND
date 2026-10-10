import { api } from '../lib/api/axios';

export async function apiGetCategories() {
  const response = await api.get('/categories');
  return response.data;
}
