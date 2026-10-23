'use client';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import ProviderPlanCards from '../provider/subscription/ProviderPlanCards';
import { providerPlans } from '../../lib/providerPlans';
import cardStyles from '../provider/subscription/ProviderPricing.module.css';
import styles from './LandingPricing.module.css';

export default function LandingPricing({ isDark }: { isDark: boolean }) {
  const { user, isAuthenticated, authLoading, setUser } = useApp();
  const member = !authLoading && isAuthenticated && user && user.role !== 'admin';
  return <section id="provider-plans" className={styles.section} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="landing-pricing-heading">
    <div className={styles.container}>
      <div className={styles.heading}><h2 id="landing-pricing-heading">Simple plans for service providers</h2><p>Start with 30 days free. Choose the membership that fits your work.</p><span>Customers use ServiceHub for free.</span></div>
      <ProviderPlanCards renderAction={id => <Link href={member ? '/subscription' : user?.role === 'admin' ? '/help' : '/register'}
        className={`${cardStyles.planButton} ${id === 'BASIC' ? cardStyles.primaryButton : ''}`} onClick={() => {
          if (user?.role === 'admin') return;
          localStorage.setItem('workspaceRole', 'provider');
          if (member && user) setUser({ ...user, role: 'provider' });
        }}>{providerPlans.find(plan => plan.id === id)!.action}</Link>} />
      <div className={styles.foot}><p>No automatic charges. Cash has no platform commission.</p><Link href={member ? '/subscription' : '/help/payments/provider-plans-and-subscriptions'}>Compare all features</Link></div>
    </div>
  </section>;
}
