'use client';
import type { ProviderPricingProps } from './SubscriptionWorkspace';
import ProviderPlanCards from './ProviderPlanCards';
import { providerPlans } from '../../../lib/providerPlans';
import styles from './ProviderPricing.module.css';

export default function ProviderPricing({ membership, disabled, onChoose }: ProviderPricingProps) {
  return <section className={styles.pricing} aria-labelledby="provider-pricing-title">
    <header className={styles.intro}>
      <h1 id="provider-pricing-title">Choose your provider plan</h1>
      <p>Try Free for 30 days. Continue with Basic or grow with Pro.</p>
    </header>
    <ProviderPlanCards renderAction={id => {
      const current = membership.marketplaceAccess && membership.plan === id;
      const unavailable = id === 'FREE' || (membership.marketplaceAccess && membership.plan === 'PRO' && id === 'BASIC');
      const label = current ? 'Current plan' : id === 'FREE' ? 'Free period used' : unavailable ? 'After Pro expires' : membership.plan === id ? 'Renew membership' : providerPlans.find(p => p.id === id)!.action;
      return <button type="button" className={`${styles.planButton} ${id === 'BASIC' ? styles.primaryButton : ''}`} disabled={disabled || current || unavailable}
        onClick={() => { if (id !== 'FREE') onChoose(id); }}>{label}</button>;
    }} />
    <p className={styles.note}>Cash has no platform fee. Customers always use ServiceHub for free.</p>
    <details className={styles.comparison}>
      <summary>Compare all features</summary>
      <div className={styles.tableWrap}><table><caption className="sr-only">Provider membership comparison</caption>
        <thead><tr><th scope="col">Included</th><th scope="col">Free</th><th scope="col">Basic</th><th scope="col">Pro</th></tr></thead>
        <tbody>{[
          ['Access', '30 days', 'Monthly', 'Monthly'], ['Active listings', '1', '3', 'Unlimited'],
          ['GCash fee', '10%', '8%', '5%'], ['Analytics', 'Basic', 'Full', 'Full'],
          ['Bookings and offers', 'Included', 'Included', 'Included'], ['Messaging and reviews', 'Included', 'Included', 'Included'],
          ['Cash and GCash', 'Included', 'Included', 'Included'], ['Priority featured placement', 'No', 'No', 'Eligible listings'],
        ].map(row => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1).map((value, index) => <td key={index}>{value}</td>)}</tr>)}</tbody>
      </table></div>
    </details>
  </section>;
}
