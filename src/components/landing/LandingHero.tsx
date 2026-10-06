'use client';

import Image from 'next/image';
import { ArrowRight, BatteryFull, MapPin, Menu, Signal, Wifi } from 'lucide-react';
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
          <span data-hero-entrance="badge" className={`${styles.badge} inline-flex items-center gap-2 rounded-full border border-[#c86544]/35 bg-[#c86544]/[0.04] px-3.5 py-2 text-xs font-medium text-[#0a0a0a] dark:border-[#e4a18a]/40 dark:bg-[#e4a18a]/[0.06] dark:text-white`}><MapPin size={13} className="text-[#c86544] dark:text-[#e4a18a]" aria-hidden="true" />Built for Cordova, Cebu</span>
          <h1 data-hero-entrance="heading" id="landing-hero-title" className={`${styles.title} text-[#0a0a0a] dark:text-white`}>
            ServiceHub Cordova
          </h1>
          <p data-hero-entrance="heading" className={`${styles.tagline} text-[#0a0a0a] dark:text-white`}>Find local help.<br />Offer your skills.</p>
          <p data-hero-entrance="description" className={styles.description}>
            Find and offer services in Cordova, Cebu, with residency verification and reviews from completed work.
          </p>
          <p data-hero-entrance="description" className={styles.supporting}>Browse services, compare offers, and keep booking progress together.</p>
          <div data-hero-entrance="actions" className={styles.actions}>
            <LandingActionLink size="hero">Get started</LandingActionLink>
            <a href="#workspaces" className={styles.secondary}>Explore the workspaces <ArrowRight size={16} aria-hidden="true" /></a>
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
