'use client';

import { Check, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';
import styles from './LandingComparison.module.css';

const features = [
  { title: 'Nearby service discovery', detail: 'Listings and requests filtered by category and chosen radius.' },
  { title: 'Structured requests and offers', detail: 'Service requirements, proposed prices and terms in one workflow.' },
  { title: 'Booking progress and history', detail: 'Agreements, service status and progress tied to a booking.' },
  { title: 'Reviews from completed services', detail: 'Feedback linked to confirmed work between the participants.' },
  { title: 'Booking-linked dispute records', detail: 'Service concerns and relevant booking records available for review.' },
];

export default function LandingComparison({ isDark }: { isDark: boolean }) {
  const reduce = useReducedMotion();
  return (
    <section id="comparison" aria-labelledby="comparison-heading" data-theme={isDark ? 'dark' : 'light'} className={styles.section}>
      <div className={styles.container} data-landing-anchor>
        <ScrollReveal className={styles.headingGroup}>
          <h2 id="comparison-heading">A clearer way to find and offer services.</h2>
          <p>See what ServiceHub brings together when services would otherwise be arranged across Facebook posts, groups and private messages.</p>
        </ScrollReveal>
        <ScrollReveal className={styles.frame}>
          <table className={styles.table}>
            <caption className="sr-only">Built-in service workflows in ServiceHub compared with arranging services through ordinary Facebook posts and messages</caption>
            <colgroup><col /><col className={styles.facebookColumn} /><col className={styles.serviceHubColumn} /></colgroup>
            <thead>
              <tr>
                <th scope="col">Service features</th>
                <th scope="col" className={styles.platform}>Facebook<span>Posts and messages</span></th>
                <th scope="col" className={[styles.platform, styles.serviceHub].join(' ')}>ServiceHub<span>Centralized workflow</span></th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <motion.tr key={feature.title} initial={false} whileInView={reduce ? undefined : { opacity: [0.8, 1] }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: index * 0.04 }}>
                  <th scope="row"><span className={styles.featureTitle}>{feature.title}</span><span className={styles.featureDetail}>{feature.detail}</span></th>
                  <td><span className={styles.manual}><X size={18} aria-hidden="true" /><span className="sr-only">Arranged manually through posts and messages</span></span></td>
                  <td className={styles.serviceHub}><span className={styles.included}><Check size={18} strokeWidth={2.5} aria-hidden="true" /><span className="sr-only">Built into ServiceHub</span></span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </ScrollReveal>
        <p className={styles.scope}>Checks show built-in ServiceHub workflows. Crosses refer to ordinary Facebook posts and messages, where members arrange these steps themselves.</p>
      </div>
    </section>
  );
}
