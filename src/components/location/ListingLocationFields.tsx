'use client';

import type { LocationPoint } from '../../lib/location';
import { listingUsesArea, involvesProviderTravel, type ServiceLocationMode } from '../../lib/serviceArrangement';
import ServiceArrangementField from './ServiceArrangementField';
import LocationField from './LocationField';
import TransportationField from './TransportationField';
import styles from './Location.module.css';

export type ListingLocationValues = {
  publicMapPin?: boolean;
  serviceLocation?: LocationPoint | null;
  serviceLocationMode?: ServiceLocationMode;
  venueAddress?: string | null;
  coverageRadiusKm?: number | null;
  transportationFee?: string;
};

export default function ListingLocationFields({ value, onChange, isDark, disabled = false, showTransportation = true, arrangementLayout = 'stacked', locationError }: {
  value: ListingLocationValues; onChange: (patch: Partial<ListingLocationValues>) => void;
  isDark: boolean; disabled?: boolean; showTransportation?: boolean; arrangementLayout?: 'stacked' | 'responsive';
  locationError?: string;
}) {
  const mode = value.serviceLocationMode ?? 'PROVIDER_VISITS';
  return <div className={styles.listingFields}>
    <ServiceArrangementField workspace="provider" value={mode} onChange={serviceLocationMode => onChange({ serviceLocationMode, ...(listingUsesArea(mode) !== listingUsesArea(serviceLocationMode) ? { serviceLocation:null, venueAddress:'', publicMapPin:false } : {}) })} disabled={disabled} layout={arrangementLayout} />
    <LocationField required error={locationError} selectionMode={listingUsesArea(mode) ? 'area' : 'pin'} label={listingUsesArea(mode) ? 'Where are you based?' : 'Where is your shop or workplace?'} workspace="provider" value={value.serviceLocation ?? null} onChange={serviceLocation => onChange({ serviceLocation, ...(serviceLocation.latitude !== value.serviceLocation?.latitude || serviceLocation.longitude !== value.serviceLocation?.longitude ? { publicMapPin:false } : {}) })} disabled={disabled}
      hint={mode === 'REMOTE' ? 'Choose your city or barangay so local seekers can find you. The work happens online; no meeting place is needed.' : mode === 'PROVIDER_VISITS' ? 'Choose your city or barangay. Review each seeker’s job location before agreeing to travel. There is no fixed travel limit.' : 'Mark the place seekers can visit. They review your location before confirming. Private directions are shared after booking.'} />
    {mode !== 'REMOTE' && value.serviceLocation && <label className={styles.publicPinConsent}>
      <input type="checkbox" checked={value.publicMapPin ?? false} disabled={disabled} onChange={event => onChange({ publicMapPin:event.target.checked })} />
      <span><strong>Show this exact pin on the public map</strong><small>{value.publicMapPin ? 'Seekers will see the same point you marked. Your private directions stay hidden.' : 'Optional. Share only a shop or area reference you are happy for everyone to see. Otherwise, the map shows an approximate area.'}</small></span>
    </label>}
    {!listingUsesArea(mode) && <label className={styles.fieldGroup}>
      <span className={styles.label}>Address or directions for the seeker (optional)</span>
      <textarea className={styles.field} rows={2} maxLength={500} placeholder="e.g. Shop 2, beside the barangay hall" value={value.venueAddress ?? ''} disabled={disabled} onChange={event => onChange({ venueAddress: event.target.value })} />
    </label>}
    {involvesProviderTravel(mode) && <>
      {showTransportation && <TransportationField isDark={isDark} value={value.transportationFee ?? ''} onChange={transportationFee => onChange({ transportationFee })} disabled={disabled} />}
    </>}
  </div>;
}
