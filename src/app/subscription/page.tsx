'use client';
import { Suspense } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouteGuard } from '../../hooks/useRouteGuard';
import SubscriptionPageShell from '../../components/provider/subscription/SubscriptionPageShell';
import BrandLoading from '../../components/ui/BrandLoading';
import SubscriptionWorkspace from '../../components/provider/subscription/SubscriptionWorkspace';
import ProviderPricing from '../../components/provider/subscription/ProviderPricing';
import SubscriptionSkeleton from '../../components/provider/subscription/SubscriptionSkeleton';
import styles from '../../components/provider/subscription/Subscription.module.css';

export default function SubscriptionPage() {
  const { user, setUser, isDark } = useApp();
  const { shouldRender } = useRouteGuard(['user']);
  if (!shouldRender || !user) return <BrandLoading label="Opening your subscription" role="provider" />;
  if (user.role !== 'provider') return <SubscriptionPageShell><section className={`${styles.page} ${styles.enrollment}`} data-theme={isDark ? 'dark' : 'light'}><h1>Plans for providers</h1><p>Customers use ServiceHub for free. Switch to Provider to start your 30-day Free plan or manage a membership.</p><button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => { localStorage.setItem('workspaceRole', 'provider'); setUser({ ...user, role: 'provider' }); }}>Continue as Provider</button></section></SubscriptionPageShell>;
  return <SubscriptionPageShell><Suspense fallback={<div className={`${styles.page} ${styles.providerPage}`} data-theme={isDark ? 'dark' : 'light'}><SubscriptionSkeleton /></div>}><SubscriptionWorkspace Pricing={ProviderPricing} /></Suspense></SubscriptionPageShell>;
}
