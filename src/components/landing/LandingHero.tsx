'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BatteryFull, BookOpen, MapPin, Menu, Signal, Wifi } from 'lucide-react';
import ParticlesComponent from '@/components/ui/particles-bg';
import styles from './LandingPresenterHero.module.css';
import LandingActionLink from './LandingActionLink';
import LandingServicePreview from './LandingServicePreview';
import useHeroEntrance from './useHeroEntrance';

interface LandingHeroProps { isDark: boolean; }

export default function LandingHero({ isDark }: LandingHeroProps) {
  const entranceScope = useHeroEntrance();
  return (
    <section ref={entranceScope} id="top" className={styles.hero} data-theme={isDark ? 'dark' : 'light'} aria-labelledby="landing-hero-title">
      <ParticlesComponent isDark={isDark} variant="brand" />
      <div className={styles.layout}>
        <div className={styles.copy}>
          <a data-hero-entrance="badge" href="#workspaces" className={styles.badge}>
            <span className={styles.badgeLabel}><MapPin size={13} aria-hidden="true" />Marketplace</span>
            <span>Book services. Find work.</span>
            <ArrowRight size={14} className={styles.badgeArrow} aria-hidden="true" />
          </a>
          <h1 data-hero-entrance="heading" id="landing-hero-title" className={`${styles.title} text-[#0a0a0a] dark:text-white`}>
            ServiceHub
          </h1>
          <p data-hero-entrance="heading" className={styles.tagline}>Find Services Near You</p>
          <p data-hero-entrance="description" className={styles.description}>
            Book a service, post a request, or offer your skills. Choose your search area and connect with verified members.
          </p>
          <div data-hero-entrance="actions" className={styles.actions}>
            <LandingActionLink size="hero">Get started</LandingActionLink>
            <a href="#workspaces" className={styles.secondary}>Explore the workspaces <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <div data-hero-entrance="actions" className={styles.helpBar}>
            <span className={styles.helpPrompt}><BookOpen size={17} aria-hidden="true" />Need a hand getting started?</span>
            <Link href="/help" className={styles.helpLink}>Open Help Center <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </div>
        <div data-hero-entrance="scene" className={styles.scene}>
          <Image src="/images/hero-presenter-updated.png" alt="" width={1122} height={1402} sizes="(max-width: 767px) 260px, (max-width: 1023px) 335px, (max-width: 1199px) 42vw, 560px" preload className={styles.presenter} />
          <figure className={styles.preview} aria-label="Illustrative service details preview">
            <div className={styles.phone} aria-hidden="true">
              <span className={styles.volumeButtons} />
              <span className={styles.powerButton} />
              <div className={styles.screen}>
                <div className={styles.statusBar}>
                  <span>9:41</span>
                  <span className={styles.cameraIsland}><span /></span>
                  <span className={styles.statusIcons}><Signal /><Wifi /><BatteryFull /></span>
                </div>
                <div className={styles.phoneWorkspace}>
                  <div className={styles.workspaceBar}><span>ServiceHub</span><Menu /></div>
                  <div className={styles.modalStage}>
                    <LandingServicePreview isDark={isDark} />
                  </div>
                </div>
                <div className={styles.homeBar}><span /></div>
              </div>
            </div>
          </figure>
          <Image src="/images/hero-presenter-updated.png" alt="" aria-hidden="true" width={1122} height={1402} sizes="(max-width: 767px) 260px, (max-width: 1023px) 335px, (max-width: 1199px) 42vw, 560px" loading="eager" className={`${styles.presenter} ${styles.presenterHand}`} />
        </div>
      </div>
    </section>
  );
}
