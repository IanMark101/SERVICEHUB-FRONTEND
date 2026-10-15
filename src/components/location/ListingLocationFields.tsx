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
    <ServiceArrangementField workspace="provider" value={mode} onChange={serviceLocationMode => onChange({ serviceLocationMode, ...(serviceLocationMode !== mode && (serviceLocationMode === 'REMOTE' || mode === 'REMOTE' || listingUsesArea(mode) !== listingUsesArea(serviceLocationMode)) ? { serviceLocation:null, venueAddress:'', publicMapPin:false } : {}) })} disabled={disabled} layout={arrangementLayout} />
    <LocationField required={mode !== 'REMOTE'} error={locationError} selectionMode={listingUsesArea(mode) ? 'area-search' : 'pin'} label={mode === 'REMOTE' ? 'Based in (optional)' : listingUsesArea(mode) ? 'Your base city or barangay' : 'Where is your shop or workplace?'} workspace="provider" value={value.serviceLocation ?? null} onChange={serviceLocation => onChange({ serviceLocation, ...(listingUsesArea(mode) || serviceLocation.latitude !== value.serviceLocation?.latitude || serviceLocation.longitude !== value.serviceLocation?.longitude ? { publicMapPin:false } : {}) })} onClear={mode === 'REMOTE' ? () => onChange({serviceLocation:null,publicMapPin:false}) : undefined} disabled={disabled}
      hint={mode === 'REMOTE' ? 'Work is delivered online. You can leave this blank, or add a city or barangay to show where you are based.' : mode === 'PROVIDER_VISITS' ? 'Select your base city or barangay so nearby seekers can find you. The seeker provides the job location when booking; you decide whether to travel.' : 'Mark the place seekers can visit. They review your location before confirming. Private directions are shared after booking.'} />
    {!listingUsesArea(mode) && value.serviceLocation && <label className={styles.publicPinConsent}>
      <input type="checkbox" checked={value.publicMapPin ?? false} disabled={disabled} onChange={event => onChange({ publicMapPin:event.target.checked })} />
      <span><strong>Show my shop’s exact location publicly</strong><small>{value.publicMapPin ? 'Everyone can see this shop pin. Your private directions stay hidden.' : 'Optional for a shop seekers can visit. Leave unchecked to show only an approximate area.'}</small></span>
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
