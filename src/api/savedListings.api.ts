import { api } from '../lib/api/axios';
import type { mapRequestToJobRequest, mapServiceToListing } from '../context/mappers';

export type SavedListingType = 'SERVICE_LISTING' | 'SERVICE_REQUEST';
type SavedBase = { id: string; listingId: string; savedAt: string };
export type SavedListingItem = SavedBase & (
  { contentType: 'SERVICE_LISTING'; listing: Parameters<typeof mapServiceToListing>[0] | null } |
  { contentType: 'SERVICE_REQUEST'; listing: Parameters<typeof mapRequestToJobRequest>[0] | null }
);
export interface SavedListingsPage {
  items: SavedListingItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export async function apiGetSavedListings(contentType: SavedListingType, page = 1): Promise<SavedListingsPage> {
  const response = await api.get('/saved', { params: { contentType, page, limit: 12 }, apiCache: 'no-store' });
  return response.data.data;
}
export async function apiGetSavedStatus(contentType: SavedListingType, ids: string[]): Promise<string[]> {
  if (!ids.length) return [];
  const response = await api.get('/saved/status', { params: { contentType, ids: ids.join(',') }, apiCache: 'no-store' });
  return response.data.data;
}
export async function apiSetListingSaved(contentType: SavedListingType, listingId: string, saved: boolean) {
  const path = `/saved/${contentType}/${encodeURIComponent(listingId)}`;
  if (saved) await api.put(path);
  else await api.delete(path);
}
