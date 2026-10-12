import { z } from 'zod';
import type { MarketplaceLocation } from './location';

const MapPinSchema = z.object({
  id:z.string().min(1), title:z.string(), label:z.string(),
  providerName:z.string().optional(),
  area:z.object({ latitude:z.number().finite().min(-90).max(90), longitude:z.number().finite().min(-180).max(180), approximate:z.literal(true) }),
});
export type MarketplaceMapPin = z.infer<typeof MapPinSchema>;
export function parseMapPins(value:unknown):MarketplaceMapPin[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => { const parsed = MapPinSchema.safeParse(item); return parsed.success ? [parsed.data] : []; });
}

export type MarketplaceMapViewport = {
  center:{ latitude:number; longitude:number };
  bounds:{ north:number; south:number; east:number; west:number };
};

/** Cover the visible map with existing 30 km API queries, independent of the search radius. */
export function providerMapQueries(view:MarketplaceMapViewport) {
  const { north,south,east,west } = view.bounds;
  if (![north,south,east,west,view.center.latitude,view.center.longitude].every(Number.isFinite) || north < south) {
    return { centers:[], limited:false };
  }
  const latitudeSpan = north - south;
  const longitudeSpan = east >= west ? east - west : east + 360 - west;
  // A 38 km square fits inside a 30 km query circle, including coarse grid rounding.
  const rows = Math.max(1,Math.ceil(latitudeSpan * 111.2 / 38));
  const equatorward = south <= 0 && north >= 0 ? 0 : Math.min(Math.abs(north),Math.abs(south));
  const columns = Math.max(1,Math.ceil(longitudeSpan * 111.2 * Math.cos(equatorward * Math.PI / 180) / 38));
  const wrap = (longitude:number) => ((longitude + 180) % 360 + 360) % 360 - 180;
  if (rows * columns > 16) {
    return { centers:[{ latitude:view.center.latitude,longitude:wrap(view.center.longitude) }],limited:true };
  }
  const centers = [];
  for (let row=0;row<rows;row++) for (let column=0;column<columns;column++) {
    centers.push({ latitude:south + latitudeSpan * (row + .5) / rows,
      longitude:wrap(west + longitudeSpan * (column + .5) / columns) });
  }
  return { centers,limited:false };
}

/** Recheck previously discovered areas too, even after they leave the viewport. */
export function providerMapRefreshCenters(centers:MarketplaceMapViewport['center'][], pins:MarketplaceMapPin[]) {
  const next = [...centers];
  for (const { area } of pins) {
    // Leave room for the public area's rounding: its exact position stays private.
    if (!next.some(center => mapDistanceKm(center,area) < 28)) next.push({ latitude:area.latitude,longitude:area.longitude });
  }
  return next;
}

function mapDistanceKm(a:MarketplaceMapViewport['center'], b:MarketplaceMapViewport['center']) {
  const rad = Math.PI / 180;
  const hav = Math.sin((b.latitude-a.latitude)*rad/2)**2 + Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin((b.longitude-a.longitude)*rad/2)**2;
  return 2 * 6371.0088 * Math.asin(Math.sqrt(Math.min(1,Math.max(0,hav))));
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
