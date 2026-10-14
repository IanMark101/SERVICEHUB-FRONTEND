'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listingPhotoUrl, type ListingPhoto } from '../../lib/listingPhotos';
import styles from './ListingPhotos.module.css';

export default function ListingPhotoGallery({ photos = [], title }: { photos?: ListingPhoto[]; title: string }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const index = Math.min(active, photos.length - 1);
  if (!photos.length) return null;
  const move = (step: number) => setActive((index + step + photos.length) % photos.length);
  return <section className={styles.gallery} aria-label={`Photos of ${title}`} aria-roledescription="carousel" onKeyDown={event => {
    if (photos.length < 2) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
  }}>
    <div className={styles.stage}>
      {failed.includes(photos[index].id) ? <p className={styles.hint}>Photo unavailable. {photos.length > 1 ? 'Try another photo.' : 'Please try again later.'}</p> : <Image key={photos[index].id} unoptimized src={listingPhotoUrl(photos[index].url, 1600)} width={photos[index].width} height={photos[index].height} className={styles.photo} alt={`${title} — photo ${index + 1} of ${photos.length}`} onError={() => setFailed(current => [...current, photos[index].id])} />}
      {photos.length > 1 && <><button type="button" className={styles.nav} data-side="previous" aria-label="Previous photo" onClick={() => move(-1)}><ChevronLeft size={20} /></button><button type="button" className={styles.nav} data-side="next" aria-label="Next photo" onClick={() => move(1)}><ChevronRight size={20} /></button></>}
    </div>
    <div className={styles.galleryFooter}>
      {photos.length > 1 && <div className={styles.thumbs}>{photos.map((photo, number) => <button type="button" key={photo.id} className={styles.thumb} aria-label={`Show photo ${number + 1}`} aria-pressed={number === index} onClick={() => setActive(number)}><Image unoptimized src={listingPhotoUrl(photo.url, 160, true)} width={160} height={100} alt="" /></button>)}</div>}
      <span className={styles.counter} aria-live="polite">Photo {index + 1} of {photos.length}</span>
    </div>
  </section>;
}
