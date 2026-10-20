'use client';

import { useId } from 'react';
import type { LocationPoint } from '../../lib/location';
import { listingUsesArea, involvesProviderTravel, type ServiceLocationMode } from '../../lib/serviceArrangement';
import ServiceArrangementField from './ServiceArrangementField';
import DiscoveryLocationField from './DiscoveryLocationField';
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

export default function ListingLocationFields({ value, onChange, isDark, userId, reuseSaved = false, disabled = false, showTransportation = true, locationError }: {
  userId?: string; reuseSaved?: boolean;
  value: ListingLocationValues; onChange: (patch: Partial<ListingLocationValues>) => void;
  isDark: boolean; disabled?: boolean; showTransportation?: boolean;
  locationError?: string;
}) {
  const mode = value.serviceLocationMode ?? 'PROVIDER_VISITS';
  const venueId = useId();
  return <div className={styles.listingFields}>
    <ServiceArrangementField workspace="provider" value={mode} onChange={serviceLocationMode => onChange({ serviceLocationMode, publicMapPin:false })} disabled={disabled} />
    {mode !== 'REMOTE' && <DiscoveryLocationField userId={userId} reuseSaved={reuseSaved} workspace="provider" value={value.serviceLocation ?? null} onChange={serviceLocation => onChange({ serviceLocation, publicMapPin:false })} disabled={disabled} error={locationError} />}
    {!listingUsesArea(mode) && <label className={styles.fieldGroup}>
      <span id={`${venueId}-label`} className={styles.label}>Business address (required)</span>
      <textarea aria-labelledby={`${venueId}-label`} aria-describedby={`${venueId}-hint`} className={styles.field} rows={2} minLength={5} maxLength={500} required placeholder="e.g. Shop 2, beside the barangay hall, Ibabao, Cordova" value={value.venueAddress ?? ''} disabled={disabled} onChange={event => onChange({ venueAddress: event.target.value })} />
      <small id={`${venueId}-hint`} className={styles.hint}>Shared privately after booking.</small>
    </label>}
    {involvesProviderTravel(mode) && <>
      {showTransportation && <TransportationField isDark={isDark} value={value.transportationFee ?? ''} onChange={transportationFee => onChange({ transportationFee })} disabled={disabled} />}
    </>}
  </div>;
}
