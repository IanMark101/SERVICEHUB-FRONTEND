'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import styles from './LandingCommunity.module.css';

interface LandingCommunityProps {
  isDark: boolean;
}

const items = [
  {
    title: 'Official Community Updates',
    copy: 'Read announcements and service updates shared by ServiceHub administrators.',
  },
  {
    title: 'Recently Added Services',
    copy: 'Discover published services that were recently added to the marketplace.',
  },
  {
    title: 'Provider of the Week',
    copy: 'See weekly provider recognition based on trust score, completed work, and client ratings.',
  },
];

export default function LandingCommunity({ isDark }: LandingCommunityProps) {
  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      data-theme={isDark ? 'dark' : 'light'}
      className={`${styles.section} scroll-mt-20`}
    >
      <ScrollReveal className={styles.panel}>
        <div className={styles.composition}>
          <div className={styles.intro}>
            <h2 id="community-heading" className={styles.heading}>
              See what is happening <span>across ServiceHub.</span>
            </h2>
            <p className={styles.copy}>Follow local service activity in the Community Hub after signing in.</p>
            <div className={styles.actions}>
              <Link href="/login" className={styles.signIn}>
                <span>Sign in to view the Community Hub</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className={styles.features}>
            <p className={styles.featuresTitle}>Inside the Community Hub</p>
            <ul className={styles.featureList} aria-label="Community Hub features">
              {items.map(item => (
                <li key={item.title} className={styles.feature}>
                  <h3>{item.title}</h3><p>{item.copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
