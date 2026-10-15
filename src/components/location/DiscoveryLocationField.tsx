'use client';

import { useEffect } from 'react';
import { LocationSchema, type LocationPoint } from '../../lib/location';
import LocationField from './LocationField';

const storageKey = (userId: string) => `servicehub:listing-discovery:${userId}`;
export function readDiscoveryLocation(userId?: string): LocationPoint | null {
  if (!userId) return null;
  try {
    const result = LocationSchema.safeParse(JSON.parse(localStorage.getItem(storageKey(userId)) || 'null'));
    return result.success ? { latitude: result.data.latitude, longitude: result.data.longitude, label: result.data.label } : null;
  } catch { return null; }
}

export default function DiscoveryLocationField({ userId, value, onChange, workspace, disabled, error, reuseSaved = false }: {
  userId?: string; value: LocationPoint | null; onChange: (point: LocationPoint) => void;
  workspace: 'provider' | 'seeker'; disabled?: boolean; error?: string; reuseSaved?: boolean;
}) {
  useEffect(() => {
    if (!reuseSaved || !userId || value) return;
    const saved = readDiscoveryLocation(userId);
    if (saved) onChange(saved);
  }, [reuseSaved, userId, value, onChange]);
  return <LocationField label="Discovery location" purpose="discovery" required value={value} workspace={workspace} disabled={disabled} error={error}
    hint={`Your ${workspace === 'provider' ? 'service' : 'request'} appears near this point on the public map. Only an approximate area is shown. The job address is handled separately when booking.`}
    onChange={point => {
      const discovery = { latitude: point.latitude, longitude: point.longitude, label: point.label };
      if (userId) try { localStorage.setItem(storageKey(userId), JSON.stringify(discovery)); } catch { /* Posting works without browser storage. */ }
      onChange(discovery);
    }} />;
}
