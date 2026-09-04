import { api } from '../lib/api/axios';
import { invalidateProviderSummaryCache } from './ai.api';

export async function apiSubmitReview(data: {
  completedServiceId: string;
  rating: number;
  text: string;
  tags?: string[];
}) {
  const response = await api.post('/reviews', data);
  invalidateProviderSummaryCache(response.data?.data?.targetId);
  return response.data;
}

export async function apiGetProviderReviews(providerId: string) {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data;
}

export async function apiUpdateReview(
  id: string,
  data: {
    rating?: number;
    text?: string;
    tags?: string[];
  }
) {
  const response = await api.patch(`/reviews/${id}`, data);
  invalidateProviderSummaryCache(response.data?.data?.targetId);
  return response.data;
}
