import { ArrowUpRight, Briefcase, Clock, MapPin, ShieldCheck, Star, UserRound, X } from 'lucide-react';
import TrustScoreBadge from '@/components/ui/TrustScoreBadge';
import GCashLogo from '@/components/ui/GCashLogo';
import details from '@/components/ui/ListingDetails.module.css';
import styles from './LandingServicePreview.module.css';

/** Miniature of the Seeker details modal; decorative controls have no booking effects. */
export default function LandingServicePreview({ isDark }: { isDark: boolean }) {
  return (
    <div className={`${details.panel} ${styles.panel}`} data-theme={isDark ? 'dark' : 'light'}>
      <div className={styles.header}>
        <div className={styles.topbar}>
          <span className={styles.category}>Aircon Service</span>
          <X className={styles.close} aria-hidden="true" />
        </div>
        <p className={styles.title}>AIRCON FIX</p>
        <div className={styles.priceLine}><span className={styles.price}>₱500</span><span>fixed price</span></div>
      </div>
      <div className={styles.body}>
        <div className={styles.identity}>
          <div className={styles.person}>
            <span className={styles.avatar}><UserRound aria-hidden="true" /></span>
            <div>
              <p className={styles.name}>Local service provider</p>
              <p className={styles.verified}><ShieldCheck aria-hidden="true" />Verified resident</p>
              <div className={styles.reputation}>
                <span><Star className={styles.star} aria-hidden="true" />5.0 (1)</span>
                <TrustScoreBadge score={65} />
              </div>
            </div>
          </div>
          <span className={styles.profile}>View Profile<ArrowUpRight aria-hidden="true" /></span>
        </div>
        <div>
          <p className={styles.label}>About This Service</p>
          <p className={styles.description}>Air-conditioning repair and servicing for your home.</p>
        </div>
        <div className={styles.duration}>
          <span className={styles.label}>Estimated duration</span>
          <span><Clock aria-hidden="true" />90 minutes</span>
        </div>
        <div>
          <p className={styles.label}>Accepted Payment Methods</p>
          <div className={styles.payments}>
            <span><MapPin aria-hidden="true" />On-site Cash</span>
            <span><GCashLogo /><span>· Test Mode</span></span>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.cancel}>Cancel</span>
        <span className={styles.book}><Briefcase aria-hidden="true" />Book This Service</span>
      </div>
    </div>
  );
}
