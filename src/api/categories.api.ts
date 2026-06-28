import { api } from './axios';

export async function apiGetCategories() {
  const response = await api.get('/categories');
  return response.data;
}

export async function apiSuggestCategory(data: { name: string; description: string }) {
  const response = await api.post('/categories/suggest', data);
  return response.data;
}

export async function apiGetMyCategorySuggestions() {
  const response = await api.get('/categories/suggestions/mine');
  return response.data;
}
