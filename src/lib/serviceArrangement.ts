export type BookingLocationMode = 'PROVIDER_VISITS' | 'SEEKER_VISITS';
export type ServiceLocationMode = BookingLocationMode | 'BOTH';

export const arrangementLabel: Record<ServiceLocationMode, string> = {
  PROVIDER_VISITS: 'Provider visits the seeker',
  SEEKER_VISITS: 'Seeker visits the provider',
  BOTH: 'Either arrangement',
};

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
