'use client';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { providerPlans } from '../../../lib/providerPlans';
import type { ProviderPlan } from '../../../api/subscriptions.api';
import styles from './ProviderPricing.module.css';

export default function ProviderPlanCards({ renderAction }: { renderAction: (plan: ProviderPlan) => ReactNode }) {
  return <div className={styles.cards}>
    {providerPlans.map(plan => <article key={plan.id} className={`${styles.card} ${plan.id === 'BASIC' ? styles.recommendedCard : ''}`} aria-label={`${plan.name} plan`}>
      <div className={styles.top}><h2>{plan.name}</h2>{plan.id === 'BASIC' && <span className={styles.recommended}>Recommended</span>}</div>
      <p className={styles.description}>{plan.description}</p>
      <p className={styles.price}><span className={styles.currency}>₱</span><span className={styles.amount}>{plan.price}</span><span className={styles.billing}>/ {plan.duration}</span></p>
      <div className={styles.action}>{renderAction(plan.id)}</div>
      <div className={styles.features}>
        <p className={styles.fee}><strong>{plan.fee}%</strong> GCash fee</p>
        <ul>{plan.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true" /><span>{feature}</span></li>)}</ul>
      </div>
    </article>)}
  </div>;
}
