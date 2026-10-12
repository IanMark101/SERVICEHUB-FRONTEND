import { z } from 'zod';
import type { MarketplaceLocation } from './location';

const MapPinSchema = z.object({
  id:z.string().min(1), title:z.string(), label:z.string(),
  area:z.object({ latitude:z.number().finite().min(-90).max(90), longitude:z.number().finite().min(-180).max(180), approximate:z.literal(true) }),
});
export type MarketplaceMapPin = z.infer<typeof MapPinSchema>;
export function parseMapPins(value:unknown):MarketplaceMapPin[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => { const parsed = MapPinSchema.safeParse(item); return parsed.success ? [parsed.data] : []; });
}

/** Draw a public area inside the search circle, using only its coarse grid center. */
export function mapAreaAnchor(area:MarketplaceMapPin['area'], location:MarketplaceLocation) {
  const rad = Math.PI / 180;
  const lat1 = location.point.latitude * rad, lat2 = area.latitude * rad;
  const delta = (area.longitude - location.point.longitude) * rad;
  const hav = Math.sin((lat2-lat1)/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(delta/2)**2;
  const distance = 2 * 6371.0088 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, hav))));
  if (distance <= location.radiusKm * .95) return area;
  const bearing = Math.atan2(Math.sin(delta)*Math.cos(lat2), Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(delta));
  const angular = location.radiusKm * .95 / 6371.0088;
  const latitude = Math.asin(Math.sin(lat1)*Math.cos(angular)+Math.cos(lat1)*Math.sin(angular)*Math.cos(bearing));
  const longitude = location.point.longitude + Math.atan2(Math.sin(bearing)*Math.sin(angular)*Math.cos(lat1),Math.cos(angular)-Math.sin(lat1)*Math.sin(latitude)) / rad;
  return { latitude:latitude/rad, longitude:((longitude+540)%360)-180 };
}
