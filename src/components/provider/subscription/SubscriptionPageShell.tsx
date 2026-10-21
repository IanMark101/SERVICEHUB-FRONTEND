'use client';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import styles from './SubscriptionPageShell.module.css';

export default function SubscriptionPageShell({ children }: { children: React.ReactNode }) {
  const { isDark } = useApp();
  return <div className={`workspace-shell workspace-shell--provider ${styles.shell}`} data-theme={isDark ? 'dark' : 'light'}>
    <Link href="/provider" className={styles.close} aria-label="Close subscription" title="Close subscription"><X size={22} aria-hidden="true" /></Link>
    <main className={styles.content}>{children}</main>
  </div>;
}
