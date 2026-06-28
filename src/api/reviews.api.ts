import { api } from './axios';

export async function apiSubmitReview(data: {
  completedServiceId: string;
  rating: number;
  text: string;
  tags?: string[];
}) {
  const response = await api.post('/reviews', data);
  return response.data;
}

export async function apiGetProviderReviews(providerId: string) {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data;
}
