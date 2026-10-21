'use client';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import type { ProviderPricingProps } from './SubscriptionWorkspace';
import styles from './ProviderPricing.module.css';

// Independently implemented from the public preview of UI Layouts' PricingSection5:
// https://21st.dev/@uilayout.contact/components/pricing
// The registry requires authentication. This is not represented as an installed copy.
const plans = [
  { id: 'FREE', name: 'Free', description: 'Everything you need to get started.', fee: '10%',
    features: ['Provider analytics', 'Up to 3 active service listings', 'Normal listing visibility'] },
  { id: 'PRO', name: 'Pro', description: 'Keep more earnings. Grow your services.', fee: '5%',
    features: ['Provider analytics', 'Unlimited active service listings', 'Priority for featured placement'] },
] as const;

export default function ProviderPricing({ currentPlan, monthlyPrice, disabled, onUpgrade }: ProviderPricingProps) {
  const reducedMotion = useReducedMotion();
  return <section className={styles.pricing} aria-labelledby="provider-pricing-title">
    <header className={styles.intro}>
      <h1 id="provider-pricing-title">{'Choose your plan'.split(' ').map((word, index) => <motion.span key={index} initial={false} animate={{ filter: 'blur(0px)', y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: .55, delay: index * .07, ease: [.16, 1, .3, 1] }} className={reducedMotion ? undefined : styles.word}>{word}{' '}</motion.span>)}</h1>
      <p>Keep more of your earnings with Pro, or start with Free.</p>
    </header>
    <div className={styles.cards}>
      {plans.map((plan, index) => {
        const pro = plan.id === 'PRO';
        const isCurrent = plan.id === currentPlan;
        return <motion.article key={plan.id} className={`${styles.card} ${pro ? styles.pro : ''}`} aria-label={`${plan.name} plan`} initial={false} animate={{ filter: 'blur(0px)', y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: .6, delay: .15 + index * .12, ease: [.16, 1, .3, 1] }}>
          <div className={styles.top}><h2>{plan.name}</h2>{pro && <span className={styles.recommended}>Recommended</span>}</div>
          <p className={styles.description}>{plan.description}</p>
          <div className={styles.price} role="group" aria-label={`₱${pro ? monthlyPrice : 0} per month`}><span className={styles.currency}>₱</span><NumberFlow className={styles.amount} value={pro ? monthlyPrice : 0} format={{ maximumFractionDigits: 0 }} /><span className={styles.billing}>/month</span></div>
          <button type="button" className={`${styles.planButton} ${pro ? styles.proButton : ''}`} disabled={disabled || isCurrent || !pro} onClick={pro && !isCurrent ? onUpgrade : undefined}>
            {isCurrent ? 'Current Plan' : pro ? 'Upgrade to Pro' : 'Free Plan'}
          </button>
          <div className={styles.features}><h3><strong>{plan.fee}</strong> GCash fee</h3><ul>{plan.features.map(feature => <li key={feature}><span className={styles.check}><Check size={14} aria-hidden="true" /></span>{feature}</li>)}</ul></div>
        </motion.article>;
      })}
    </div>
  </section>;
}
