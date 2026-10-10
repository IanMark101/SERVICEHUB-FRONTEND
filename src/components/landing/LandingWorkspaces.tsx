'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, BriefcaseBusiness, ClipboardList, Search, Handshake, ListChecks, WalletCards, UsersRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import ScrollReveal from './ScrollReveal';
import styles from './LandingRefinement.module.css';

export default function LandingWorkspaces({ isDark }: { isDark: boolean }) {
  const reduce = useReducedMotion();
  return (
    <section id="workspaces" className={styles.section} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="workspaces-heading">
      <div className={styles.container} data-landing-anchor>
        <ScrollReveal>
          <h2 id="workspaces-heading" className={[styles.heading, styles.centerHeading].join(' ')}>One account. Both sides of service.</h2>
          <p className={[styles.intro, styles.centerIntro].join(' ')}>Find the help you need or offer your skills. Your profile, verification and trust history stay with you.</p>
        </ScrollReveal>
        <div className={styles.workspaceGrid}>
          <motion.div className={styles.workspace} data-role="seeker" initial={false} whileHover={reduce ? undefined : { y: -4 }} whileInView={reduce ? undefined : { opacity: [0.8, 1], x: [-18, 0] }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            <div className={styles.workspaceTitle}><span><Search size={23} aria-hidden="true" /></span><h3>Seeker</h3></div>
            <p>Find local providers and keep your service arrangements organized.</p>
            <ul>
              <li><Search size={16} aria-hidden="true" />Browse nearby services</li>
              <li><ClipboardList size={16} aria-hidden="true" />Post requests and compare offers</li>
              <li><ListChecks size={16} aria-hidden="true" />Follow bookings and confirm completion</li>
            </ul>
          </motion.div>
          <div className={styles.workspaceIdentity} aria-label="One shared ServiceHub identity">
            <motion.svg className={styles.workspaceConnector} viewBox="0 0 110 64" aria-hidden="true" initial={false}>
              <motion.path d="M0 32H55" fill="none" stroke="var(--lp-seeker)" strokeWidth="2" initial={false} whileInView={reduce ? undefined : { pathLength: [0, 1] }} viewport={{ once: true }} transition={{ duration: .8, ease: 'easeOut' }} />
              <motion.path d="M110 32H55" fill="none" stroke="var(--lp-provider)" strokeWidth="2" initial={false} whileInView={reduce ? undefined : { pathLength: [0, 1] }} viewport={{ once: true }} transition={{ duration: .8, delay: .2, ease: 'easeOut' }} />
            </motion.svg>
            <motion.span className={styles.identityMark} initial={false} whileInView={reduce ? undefined : { scale: [0.92, 1] }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Image src="/logo.svg?v=7" width={32} height={32} alt="" />
            </motion.span>
            <ArrowLeftRight size={23} aria-hidden="true" />
            <span className={styles.identityCaption}>One profile</span>
          </div>
          <motion.div className={styles.workspace} data-role="provider" initial={false} whileHover={reduce ? undefined : { y: -4 }} whileInView={reduce ? undefined : { opacity: [0.8, 1], x: [18, 0] }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            <div className={styles.workspaceTitle}><span><BriefcaseBusiness size={23} aria-hidden="true" /></span><h3>Provider</h3></div>
            <p>Offer your services and manage the work you agree to take on.</p>
            <ul>
              <li><BriefcaseBusiness size={16} aria-hidden="true" />Publish and manage service listings</li>
              <li><Handshake size={16} aria-hidden="true" />Browse Service Requests and send offers</li>
              <li><WalletCards size={16} aria-hidden="true" />Track completed bookings and recorded earnings</li>
            </ul>
          </motion.div>
        </div>
        <section id="community" className={styles.communityNote} aria-labelledby="community-summary-heading">
          <div>
            <div className={styles.communityHeading}><UsersRound size={20} aria-hidden="true" /><h3 id="community-summary-heading">Stay connected through the Community Hub.</h3></div>
            <p>Find official announcements, recently added services and the provider directory after signing in.</p>
          </div>
          <Link className={styles.textLink} href="/help/getting-started/seeker-vs-provider">Explore the workspaces <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
      </div>
    </section>
  );
}
