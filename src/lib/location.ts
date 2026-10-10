import { z } from 'zod';
import { isFallbackCategory } from './category-catalog';

export const LocationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  label: z.string().trim().min(2).max(160),
  address: z.string().trim().max(500).optional(),
});
export type LocationPoint = z.infer<typeof LocationSchema>;
export const SEARCH_RADII = [1, 2, 5, 10, 15, 20, 30] as const;
export type MarketplaceLocation = { point: LocationPoint; radiusKm: number };
export function parseMarketplaceLocation(value: unknown): MarketplaceLocation | null {
  const result = z.object({ point: LocationSchema, radiusKm: z.number().min(1).max(30).default(10) }).safeParse(value);
  return result.success ? { point: { latitude: result.data.point.latitude, longitude: result.data.point.longitude, label: result.data.point.label }, radiusKm: result.data.radiusKm } : null;
}
export function nextSearchRadius(radiusKm: number) {
  return SEARCH_RADII.find(radius => radius > radiusKm);
}

export function marketplaceSubject(workspace: 'seeker' | 'provider', search: string, category: string) {
  if (!search.trim() && isFallbackCategory(category)) return `${workspace === 'seeker' ? 'services' : 'requests'} in Other Services`;
  const subject = search.trim() || (category !== 'All Categories' ? category : '');
  return subject ? `${subject} ${workspace === 'seeker' ? 'services' : 'requests'}` : workspace === 'seeker' ? 'Provider services' : 'Seeker requests';
}
export function formatDistance(distance?: number) {
  return distance == null ? '' : distance < 0.1 ? 'Less than 0.1 km away' : `${distance.toFixed(1)} km away`;
}
