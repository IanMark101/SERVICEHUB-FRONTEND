'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, ClipboardCheck, Lock, MessagesSquare, ShieldCheck, Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import sectionStyles from './LandingRefinement.module.css';
import styles from './LandingTrust.module.css';

const reviewSequence = [
  { title: 'The Provider submits the work', detail: 'Finished work awaits the Seeker’s confirmation.', icon: ClipboardCheck, role: 'provider' },
  { title: 'The Seeker confirms the result', detail: 'Completion is recorded with the booking.', icon: BadgeCheck, role: 'seeker' },
  { title: 'Both sides can leave a review', detail: 'Feedback joins the member rating and trust history.', icon: Star, role: 'both' },
];

export default function LandingTrust({ isDark }: { isDark: boolean }) {
  return (
    <section id="trust" className={[sectionStyles.section, styles.trustSection].join(' ')} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="trust-heading">
      <div className={[sectionStyles.container, styles.layout].join(' ')} data-landing-anchor>
        <ScrollReveal>
          <h2 id="trust-heading" className={sectionStyles.heading}>Know who you&apos;re working with.</h2>
          <p className={sectionStyles.intro}>Check verification, completed-service reviews and trust history before choosing who to work with.</p>
          <div className={styles.facts}>
            <div className={styles.fact}>
              <ShieldCheck size={21} aria-hidden="true" />
              <div>
                <h3>Verified participation</h3>
                <p>Email and residency verification are required before requesting or offering services.</p>
              </div>
            </div>
            <div className={styles.fact}>
              <MessagesSquare size={21} aria-hidden="true" />
              <div>
                <h3>Conversations connected to the work</h3>
                <p>Booking chat opens after acceptance, keeping task discussions with the service agreement.</p>
              </div>
            </div>
          </div>
          <Link className={[sectionStyles.textLink, styles.verificationLink].join(' ')} href="/help/verification/why-verification-is-required">Verification and messaging <ArrowRight size={15} aria-hidden="true" /></Link>
        </ScrollReveal>
        <ScrollReveal>
          <section id="reviews" className={styles.reviewCard} aria-labelledby="reviews-summary-heading">
            <div data-landing-anchor>
              <h3 id="reviews-summary-heading">Reviews follow completed service.</h3>
            </div>
            <ol className={styles.sequence} aria-label="How a booking becomes eligible for reviews">
              {reviewSequence.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} data-role={item.role}>
                    <span className={styles.stepIcon}><Icon size={20} aria-hidden="true" /></span>
                    <div><h4>{item.title}</h4><p>{item.detail}</p></div>
                  </li>
                );
              })}
            </ol>
            <Link className={sectionStyles.textLink} href="/help/reviews/how-reviews-and-ratings-work">How reviews work <ArrowRight size={15} aria-hidden="true" /></Link>
            <p className={styles.privacy}><Lock size={14} aria-hidden="true" /><span>Verification documents stay private to authorized reviewers.</span></p>
          </section>
        </ScrollReveal>
      </div>
    </section>
  );
}
