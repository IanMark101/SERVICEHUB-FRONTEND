'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Subscription.module.css';
export function notifyListingLimit() { window.dispatchEvent(new Event('servicehub:listing-limit')); }
export default function ListingLimitNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const show = () => setVisible(true); window.addEventListener('servicehub:listing-limit', show); return () => window.removeEventListener('servicehub:listing-limit', show); }, []);
  if (!visible) return null;
  return <div className={styles.page}><div role="alert" className={styles.error}><div><strong>Check your provider membership</strong><p>Free allows 1 active listing, Basic allows 3, and Pro allows unlimited listings. An active membership is required to publish.</p></div><Link className={`${styles.button} ${styles.primary}`} href="/subscription">View plans</Link><button type="button" className={styles.button} onClick={() => setVisible(false)} aria-label="Dismiss listing limit message">Dismiss</button></div></div>;
}
