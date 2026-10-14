'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { listingPhotoUrl, type ListingPhoto } from '../../lib/listingPhotos';
import styles from './ListingPhotos.module.css';

export default function ListingPhotoGallery({ photos = [], title, presentation = 'detail' }: { photos?: ListingPhoto[]; title: string; presentation?: 'detail' | 'managed' }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const index = Math.min(active, photos.length - 1);
  if (!photos.length) return null;
  const move = (step: number) => setActive((index + step + photos.length) % photos.length);
  const managed = presentation === 'managed';
  const controls = photos.length > 1 && <><button type="button" className={styles.nav} data-side="previous" aria-label="Previous photo" onClick={() => move(-1)}><CaretLeft size={20} aria-hidden="true" /></button><button type="button" className={styles.nav} data-side="next" aria-label="Next photo" onClick={() => move(1)}><CaretRight size={20} aria-hidden="true" /></button></>;
  const counter = <span className={styles.counter} aria-live="polite" aria-atomic="true">Photo {index + 1} of {photos.length}</span>;
  return <section className={styles.gallery} data-presentation={presentation} aria-label={`Photos of ${title}`} aria-roledescription="carousel" onKeyDown={event => {
    if (photos.length < 2) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
  }}>
    {managed && <div className={styles.galleryToolbar}>{counter}<div className={styles.galleryControls}>{controls}</div></div>}
    <div className={styles.stage}>
      {failed.includes(photos[index].id) ? <p className={styles.hint}>Photo unavailable. {photos.length > 1 ? 'Try another photo.' : 'Please try again later.'}</p> : <Image key={photos[index].id} unoptimized src={listingPhotoUrl(photos[index].url, 1600)} width={photos[index].width} height={photos[index].height} className={styles.photo} alt={`${title} — photo ${index + 1} of ${photos.length}`} onError={() => setFailed(current => [...current, photos[index].id])} />}
      {!managed && controls}
    </div>
    <div className={styles.galleryFooter}>
      {photos.length > 1 && <div className={styles.thumbs}>{photos.map((photo, number) => <button type="button" key={photo.id} className={styles.thumb} aria-label={`Show photo ${number + 1}`} aria-pressed={number === index} onClick={() => setActive(number)}><Image unoptimized src={listingPhotoUrl(photo.url, 160, true)} width={160} height={100} alt="" /></button>)}</div>}
      {!managed && counter}
    </div>
  </section>;
}
