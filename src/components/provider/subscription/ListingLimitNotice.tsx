'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Subscription.module.css';
export function notifyListingLimit() { window.dispatchEvent(new Event('servicehub:listing-limit')); }
export default function ListingLimitNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const show = () => setVisible(true); window.addEventListener('servicehub:listing-limit', show); return () => window.removeEventListener('servicehub:listing-limit', show); }, []);
  if (!visible) return null;
  return <div className={styles.page}><div role="alert" className={styles.error}><div><strong>You’ve reached the 3-service listing limit on the Free plan.</strong><p>Upgrade to Pro to create unlimited service listings.</p></div><Link className={`${styles.button} ${styles.primary}`} href="/subscription">View Pro Plan</Link><button type="button" className={styles.button} onClick={() => setVisible(false)} aria-label="Dismiss listing limit message">Dismiss</button></div></div>;
}
