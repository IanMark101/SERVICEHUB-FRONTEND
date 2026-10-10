'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, CheckCircle2, Lock, MessagesSquare, ShieldCheck, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';
import styles from './LandingRefinement.module.css';

const reviewSequence = [
  { title: 'The service is completed', detail: 'The Provider submits the finished work.', icon: CheckCircle2 },
  { title: 'The Seeker confirms the result', detail: 'Completion is recorded with the booking.', icon: BadgeCheck },
  { title: 'Both sides can leave a review', detail: 'Feedback joins the member rating and trust history.', icon: Star },
];

export default function LandingTrust({ isDark }: { isDark: boolean }) {
  const reduce = useReducedMotion();
  return (
    <section id="trust" className={styles.section} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="trust-heading">
      <div className={[styles.container, styles.trustLayout].join(' ')} data-landing-anchor>
        <div>
          <ScrollReveal>
            <h2 id="trust-heading" className={styles.heading}>Know who you&apos;re working with.</h2>
            <p className={styles.intro}>Check verification, completed-service reviews and trust history before choosing who to work with.</p>
          </ScrollReveal>
          <div className={styles.trustFacts}>
            <div className={styles.trustFact}>
              <ShieldCheck size={21} aria-hidden="true" />
              <div><h3>Verified participation</h3><p>Email and residency verification are required before requesting or offering services.</p></div>
            </div>
            <div className={styles.trustFact}>
              <MessagesSquare size={21} aria-hidden="true" />
              <div><h3>Conversations connected to the work</h3><p>Booking chat opens after acceptance, keeping task discussions with the service agreement.</p></div>
            </div>
          </div>
          <Link className={styles.textLink} href="/help/verification/why-verification-is-required">Verification and messaging <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <section id="reviews" className={styles.trustVisual} aria-labelledby="reviews-summary-heading">
          <h3 id="reviews-summary-heading">Reviews follow completed service.</h3>
          <ol className={styles.reviewSequence}>
            {reviewSequence.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.li key={item.title} data-role={index === 0 ? 'provider' : index === 1 ? 'seeker' : undefined} initial={false} whileInView={reduce ? undefined : { opacity: [0.7, 1], y: [12, 0] }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}>
                  <span className={styles.reviewIcon}><Icon size={20} aria-hidden="true" /></span>
                  <div><h4>{item.title}</h4><p>{item.detail}</p></div>
                </motion.li>
              );
            })}
          </ol>
          <Link className={styles.textLink} href="/help/reviews/how-reviews-and-ratings-work">How reviews work <ArrowRight size={15} aria-hidden="true" /></Link>
          <p className={styles.privacyNote}><Lock size={14} aria-hidden="true" />Verification documents stay private to authorized reviewers.</p>
        </section>
      </div>
    </section>
  );
}
