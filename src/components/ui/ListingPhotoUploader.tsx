'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { MAX_LISTING_PHOTOS, discardListingPhoto, listingPhotoUrl, uploadListingPhoto, type ListingPhoto } from '../../lib/listingPhotos';
import { getApiErrorMessage } from '../../lib/api/errors';
import styles from './ListingPhotos.module.css';

export default function ListingPhotoUploader({ value, onChange, onBusyChange, disabled = false, workspace = 'seeker', purpose = 'listing' }: {
  value: ListingPhoto[]; onChange: (photos: ListingPhoto[]) => void; onBusyChange: (busy: boolean) => void; disabled?: boolean; workspace?: 'seeker' | 'provider'; purpose?: 'listing' | 'inquiry';
}) {
  const id = useId(); const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null); const created = useRef(new Set<string>());
  const change = useRef(onChange);
  useEffect(() => { change.current = onChange; }, [onChange]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => () => controller.current?.abort(), []);
  const add = async (files: File[]) => {
    if (busy || disabled || !files.length) return;
    if (files.length > MAX_LISTING_PHOTOS - value.length) { setError('You can add up to 3 photos. Remove one before adding more.'); return; }
    const request = new AbortController(); controller.current = request;
    setBusy(true); onBusyChange(true); setError('');
    const next = [...value]; const failures: string[] = [];
    try {
      for (const file of files) {
        if (request.signal.aborted) break;
        try { const photo = await uploadListingPhoto(file, request.signal); created.current.add(photo.id); next.push(photo); }
        catch (cause) { if (!request.signal.aborted) failures.push(getApiErrorMessage(cause, cause instanceof Error ? cause.message : 'Could not upload this photo. Try again.')); }
      }
      if (!request.signal.aborted) { change.current(next); setError(failures.join(' ')); }
    } finally { if (!request.signal.aborted) { setBusy(false); onBusyChange(false); } }
  };
  return <div className={styles.upload} data-form-tone={workspace}>
    <span id={`${id}-label`} className={styles.label}>Photos (optional, up to 3)</span>
    {!!value.length && <div className={styles.items}>{value.map((photo, index) => <div key={photo.id} className={styles.item}>
      <Image unoptimized src={listingPhotoUrl(photo.url, 320, true)} width={320} height={200} alt={`Listing photo ${index + 1}`} className={styles.preview} />
      {index === 0 && purpose === 'listing' && <span className={styles.cover}>Cover</span>}
      <div className={styles.itemActions}>
        {index > 0 && purpose === 'listing' && <button type="button" className={styles.action} disabled={busy || disabled} onClick={() => onChange([photo, ...value.filter(item => item.id !== photo.id)])}>Use as cover</button>}
        <button type="button" className={styles.action} aria-label={`Remove photo ${index + 1}`} disabled={busy || disabled} onClick={() => {
          onChange(value.filter(item => item.id !== photo.id)); setError('');
          if (created.current.delete(photo.id)) void discardListingPhoto(photo.id).catch(() => {});
        }}>Remove</button>
      </div>
    </div>)}</div>}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={busy || disabled || value.length >= 3} aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void add(files); }} />
    <button type="button" className={styles.add} disabled={busy || disabled || value.length >= 3} onClick={() => input.current?.click()}><ImagePlus size={17} aria-hidden="true" />{busy ? 'Uploading photos…' : value.length >= 3 ? '3 photos added' : 'Add photos'}</button>
    <p id={`${id}-help`} className={styles.hint}>{value.length}/3 · JPG, PNG, WebP · 5 MB max{purpose === 'listing' && ' · Public photos'}</p>
    {busy && <p role="status" className={styles.hint}>Finish uploading before you publish or save.</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
