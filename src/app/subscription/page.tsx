'use client';
import { Suspense } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouteGuard } from '../../hooks/useRouteGuard';
import SubscriptionPageShell from '../../components/provider/subscription/SubscriptionPageShell';
import BrandLoading from '../../components/ui/BrandLoading';
import SubscriptionWorkspace from '../../components/provider/subscription/SubscriptionWorkspace';
import ProviderPricing from '../../components/provider/subscription/ProviderPricing';

export default function SubscriptionPage() {
  const { user } = useApp();
  const { shouldRender } = useRouteGuard(['user']);
  if (!shouldRender || !user) return <BrandLoading label="Opening your subscription" role="provider" />;
  return <SubscriptionPageShell><Suspense fallback={<p role="status">Loading your subscription…</p>}><SubscriptionWorkspace Pricing={ProviderPricing} /></Suspense></SubscriptionPageShell>;
}
