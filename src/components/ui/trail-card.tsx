'use client';

// Adapted from Ravi Katiyar's 21st.dev Trail Card supplied with this task.
// ServiceHub keeps its image/title composition and uses marketplace information.
import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ImageBroken } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { listingPhotoUrl, type ListingPhoto } from '../../lib/listingPhotos';
import styles from './TrailCard.module.css';

export function TrailCard({ photo, title, location, category, children, isDark, className, tools, status }: {
  photo?: ListingPhoto; title: string; location?: string; category: string; children: ReactNode; isDark: boolean; className?: string;
  tools?: ReactNode; status?: string;
}) {
  const [failedPhoto, setFailedPhoto] = useState('');
  const hasPhoto = Boolean(photo && failedPhoto !== photo.id);
  return <article data-marketplace-card aria-label={title} className={cn(styles.card, className)} data-theme={isDark ? 'dark' : 'light'}>
    <header className={styles.header} data-photo={hasPhoto}>
      <div className={styles.cover}>{photo && hasPhoto ? <Image unoptimized src={listingPhotoUrl(photo.url, 720, true)} width={720} height={450} loading="lazy" alt={`${title}, cover photo`} className={styles.image} onError={() => setFailedPhoto(photo.id)} />
        : <div className={styles.placeholder} role="img" aria-label={photo ? 'Photo unavailable' : 'No photo added'}><span className={styles.placeholderMark}><ImageBroken size={30} weight="light" className={styles.placeholderIcon} aria-hidden="true" /></span></div>}</div>
      {status && <span className={styles.coverStatus} title={status}>{status}</span>}
      {tools && <div className={styles.coverTools}>{tools}</div>}
      <div className={styles.heading}><span className={styles.category}>{category}</span><h3>{title}</h3>{location && <p>{location}</p>}</div>
    </header>
    <div className={styles.body}>{children}</div>
  </article>;
}

export function TrailCardStats({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className={styles.stats}>{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}
