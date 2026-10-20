export type BookingLocationMode = 'PROVIDER_VISITS' | 'SEEKER_VISITS' | 'REMOTE';
export type ServiceLocationMode = BookingLocationMode | 'BOTH';

export const arrangementLabel: Record<ServiceLocationMode, string> = {
  PROVIDER_VISITS: 'At customer’s place',
  SEEKER_VISITS: 'At provider’s place',
  BOTH: 'Either location',
  REMOTE: 'Online',
};

export function arrangementOptionLabel(mode: ServiceLocationMode, workspace: 'seeker' | 'provider') {
  if ((workspace === 'seeker' && mode === 'PROVIDER_VISITS') || (workspace === 'provider' && mode === 'SEEKER_VISITS')) return 'At your place';
  return arrangementLabel[mode];
}

export const listingUsesArea = (mode?: ServiceLocationMode) => mode === 'PROVIDER_VISITS' || mode === 'REMOTE';
export const requestUsesArea = (mode?: ServiceLocationMode) => mode === 'SEEKER_VISITS' || mode === 'REMOTE';
export const involvesProviderTravel = (mode?: ServiceLocationMode) => mode === 'PROVIDER_VISITS' || mode === 'BOTH';

export function requestLocationText(mode: ServiceLocationMode = 'PROVIDER_VISITS') {
  return mode === 'REMOTE'
    ? { label: 'Work location', hint: 'No travel required.' }
    : { label: 'Map location', hint: 'Approximate public location. Service address is shared privately when booking.' };
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
