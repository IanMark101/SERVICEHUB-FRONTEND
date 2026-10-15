export type BookingLocationMode = 'PROVIDER_VISITS' | 'SEEKER_VISITS' | 'REMOTE';
export type ServiceLocationMode = BookingLocationMode | 'BOTH';

export const arrangementLabel: Record<ServiceLocationMode, string> = {
  PROVIDER_VISITS: 'Provider visits the seeker',
  SEEKER_VISITS: 'Seeker visits the provider',
  BOTH: 'Either arrangement',
  REMOTE: 'Online / remote',
};

export const listingUsesArea = (mode?: ServiceLocationMode) => mode === 'PROVIDER_VISITS' || mode === 'REMOTE';
export const requestUsesArea = (mode?: ServiceLocationMode) => mode === 'SEEKER_VISITS' || mode === 'REMOTE';
export const involvesProviderTravel = (mode?: ServiceLocationMode) => mode === 'PROVIDER_VISITS' || mode === 'BOTH';

export function requestLocationText(mode: ServiceLocationMode = 'PROVIDER_VISITS') {
  return mode === 'REMOTE'
    ? { label: 'Delivery', hint: 'Online — no discovery pin or job address is needed.' }
    : { label: 'Discovery location', hint: 'Nearby providers find your request around this point. Choose the actual job address when accepting an offer.' };
}

export function availableArrangements(mode: ServiceLocationMode = 'PROVIDER_VISITS'): BookingLocationMode[] {
  return mode === 'BOTH' ? ['PROVIDER_VISITS', 'SEEKER_VISITS'] : [mode];
}

export function offerArrangements(requestMode?: ServiceLocationMode, listingMode?: ServiceLocationMode): BookingLocationMode[] {
  const requested = availableArrangements(requestMode);
  return listingMode ? requested.filter(mode => availableArrangements(listingMode).includes(mode)) : requested;
}

export function directTransportationFee(mode: BookingLocationMode, fee?: number | null): number {
  return mode === 'PROVIDER_VISITS' ? fee ?? 0 : 0;
}
