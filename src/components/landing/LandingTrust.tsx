'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import styles from './LandingTrust.module.css';

const topics = {
  overview: {
    label: 'Overview',
    items: [
      { title: 'Verified participation', detail: 'Email and residency verification are required before requesting or offering services.' },
      { title: 'Conversations connected to the work', detail: 'Booking chat opens after acceptance, keeping task discussions with the service agreement.' },
      { title: 'Reviews follow completed service.', detail: 'The Provider submits the work. The Customer confirms completion before either side can review.' },
      { title: 'Ratings and trust are separate', detail: 'Reviews describe the service experience. A low star rating alone does not reduce Trust Score.' },
      { title: 'Documented decisions', detail: 'Trust penalties require documented findings. Members can view their history and appeal a penalty.' },
      { title: 'One account, shared trust', detail: 'Your Customer and Provider workspaces use the same verification and Trust Score.' },
    ],
  },
  reviews: {
    label: 'Reviews',
    items: [
      { title: 'The Provider submits the work', detail: 'Finished work awaits the Customer’s confirmation.' },
      { title: 'The Customer confirms the result', detail: 'Completion is recorded with the booking.' },
      { title: 'Both sides can leave a review', detail: 'Feedback contributes to the member’s star rating, separately from Trust Score.' },
      { title: 'Responses and disputes', detail: 'Members can respond publicly to a review or dispute it for administrator review.' },
    ],
  },
  score: {
    label: 'Trust score',
    items: [
      { title: 'A neutral starting point', detail: 'Every account starts at 50. Trust Score stays between 0 and 100.' },
      { title: 'Approved verification: +5', detail: 'Your first approved verification earns 5 points, once per account.' },
      { title: 'Eligible completed booking: +3', detail: 'Each eligible participant earns 3 points after a completed booking is settled.' },
      { title: 'A limit on repeat rewards', detail: 'One completion per account pair earns points in a rolling 7-day period, including when roles are switched.' },
      { title: 'Evidence before deductions', detail: 'Documented at-fault cancellation after work starts deducts 5 points; serious misconduct deducts 10. One penalty per booking and participant.' },
      { title: 'A way to challenge a decision', detail: 'View the reason in Trust History and appeal a penalty. Star ratings never add or deduct trust points.' },
    ],
  },
} as const;

type TrustTopic = keyof typeof topics;
const topicKeys: TrustTopic[] = ['overview', 'reviews', 'score'];

export default function LandingTrust({ isDark }: { isDark: boolean }) {
  const [activeTopic, setActiveTopic] = useState<TrustTopic>('overview');
  const tabRefs = useRef<Partial<Record<TrustTopic, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const showLinkedReviews = () => {
      if (window.location.hash === '#reviews') setActiveTopic('reviews');
    };
    showLinkedReviews();
    window.addEventListener('hashchange', showLinkedReviews);
    window.addEventListener('popstate', showLinkedReviews);
    return () => {
      window.removeEventListener('hashchange', showLinkedReviews);
      window.removeEventListener('popstate', showLinkedReviews);
    };
  }, []);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, topic: TrustTopic) {
    const index = topicKeys.indexOf(topic);
    let next: TrustTopic;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      next = topicKeys[(index + (event.key === 'ArrowRight' ? 1 : -1) + topicKeys.length) % topicKeys.length];
    } else if (event.key === 'Home') {
      next = topicKeys[0];
    } else if (event.key === 'End') {
      next = topicKeys[topicKeys.length - 1];
    } else {
      return;
    }
    event.preventDefault();
    setActiveTopic(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="trust" className={styles.section} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="trust-heading">
      <div className={styles.layout} data-landing-anchor>
        <ScrollReveal className={styles.intro} direction="left" distance={64}>
          <h2 id="trust-heading" className={styles.heading}>Know who you&apos;re <span>working with.</span></h2>
          <p className={styles.copy}>Check verification, completed-service reviews and trust history before choosing who to work with.</p>
          <p className={styles.note}>A review shares an experience. Trust grows through verified participation and eligible completed work.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryLink} href="/help/verification/why-verification-is-required">Verification and messaging <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className={styles.secondaryLink} href="/help/reviews/how-reviews-and-ratings-work">How reviews work <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right" distance={64}>
          <section id="reviews" className={styles.explorer} aria-label="Verification, reviews and trust explained">
            <div className={styles.tabs} role="tablist" aria-label="Trust topics" data-landing-anchor>
              {topicKeys.map(topic => (
                <button key={topic} ref={element => { tabRefs.current[topic] = element; }}
                  type="button" role="tab" id={`trust-tab-${topic}`} aria-controls={`trust-panel-${topic}`}
                  aria-selected={activeTopic === topic} tabIndex={activeTopic === topic ? 0 : -1}
                  className={styles.tab} onClick={() => setActiveTopic(topic)}
                  onKeyDown={event => handleTabKeyDown(event, topic)}>{topics[topic].label}</button>
              ))}
            </div>
            <div className={styles.content}>
              {topicKeys.map(topic => (
                <div key={topic} id={`trust-panel-${topic}`} role="tabpanel" aria-labelledby={`trust-tab-${topic}`}
                  tabIndex={0} hidden={activeTopic !== topic} className={styles.topicPanel}>
                  {topic === 'reviews' ? (
                    <ol className={styles.facts} aria-label="How a booking becomes eligible for reviews">
                      {topics[topic].items.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></li>)}
                    </ol>
                  ) : (
                    <div className={styles.facts}>
                      {topics[topic].items.map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></div>)}
                    </div>
                  )}
                </div>
              ))}
              <div className={styles.panelFooter}>
                <p className={styles.privacy}><Lock size={15} aria-hidden="true" /><span>Verification documents stay private to authorized reviewers.</span></p>
                <Link className={styles.guideLink} href="/help/trust-reputation/how-trust-score-changes">Read the trust score rules <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </section>
  );
}
