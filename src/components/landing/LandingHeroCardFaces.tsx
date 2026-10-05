import React from 'react';
import {
  CheckCircle,
  Lightning,
  MagnifyingGlass,
  MapPin,
  ShieldCheck,
  Toolbox,
  Wrench,
} from '@phosphor-icons/react';
import styles from './LandingMarketplacePreview.module.css';

// Three distinct ServiceHub showcase panels share the existing hero card choreography.
export function AcceptedBookingFace() {
  return (
    <div className={styles.editorialOrange}>
      <div className={styles.editorialOrangeMotif} aria-hidden="true">
        <span className={styles.editorialOrangeRoute} />
        <span className={styles.editorialOrangePin}><MapPin size={48} weight="duotone" /></span>
        <span className={`${styles.editorialOrangeNode} ${styles.editorialOrangeNodeSeek}`}><MagnifyingGlass size={17} weight="bold" /></span>
        <span className={`${styles.editorialOrangeNode} ${styles.editorialOrangeNodeOffer}`}><Wrench size={17} weight="bold" /></span>
      </div>
      <span className={styles.editorialOrangeLabel}>
        <MapPin size={12} weight="bold" aria-hidden="true" /> Built for Cordova, Cebu
      </span>
      <h2 className={styles.editorialOrangeHeadline}>
        <span>CLEAR OFFERS.</span>
        <span>YOUR CHOICE.</span>
      </h2>
      <p className={styles.editorialOrangeSupport}>Compare proposed prices and terms before accepting an offer.</p>
    </div>
  );
}

export function MessagesFace() {
  return (
    <div className={styles.editorialCharcoal}>
      <div className={styles.editorialTrustTop}>
        <h2 className={styles.editorialTrustHeadline}>
          TRUST IS EARNED<br />THROUGH<br />COMPLETED WORK.
        </h2>
        <span className={styles.editorialTrustSeal} aria-hidden="true">
          <span className={styles.editorialTrustCore}><ShieldCheck size={62} weight="duotone" /></span>
          <span className={`${styles.editorialTrustNode} ${styles.editorialTrustNodeTop}`}><CheckCircle size={15} weight="fill" /></span>
          <span className={`${styles.editorialTrustNode} ${styles.editorialTrustNodeSide}`}><CheckCircle size={15} weight="fill" /></span>
          <span className={`${styles.editorialTrustNode} ${styles.editorialTrustNodeBottom}`}><CheckCircle size={15} weight="fill" /></span>
        </span>
      </div>
      <div className={styles.editorialTrustFacts}>
        <p className={styles.editorialTrustFact}><CheckCircle size={15} weight="fill" className={styles.editorialTrustIcon} aria-hidden="true" /> Verified Cordova residents</p>
        <p className={styles.editorialTrustFact}><CheckCircle size={15} weight="fill" className={styles.editorialTrustIcon} aria-hidden="true" /> Reviews after completed services</p>
        <p className={styles.editorialTrustFact}><CheckCircle size={15} weight="fill" className={styles.editorialTrustIcon} aria-hidden="true" /> Trust from real ServiceHub activity</p>
      </div>
    </div>
  );
}

export function MarketplaceConnectionFace() {
  return (
    <div className={styles.connectionFace}>
      <div className={styles.connectionHeader}>
        <span className={styles.connectionBrand}><MapPin size={13} weight="fill" aria-hidden="true" /> ServiceHub Cordova</span>
        <span>Example booking</span>
      </div>
      <div className={styles.connectionDiagram}>
        <svg className={styles.connectionRoutes} viewBox="0 0 484 184" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.connectionRouteSeeker} d="M 120 50 C 170 0 207 3 246 36" />
          <path className={styles.connectionRouteProvider} d="M 244 150 C 303 187 342 182 371 135" />
        </svg>
        <div className={`${styles.connectionRole} ${styles.connectionSeeker}`}>
          <span className={styles.connectionRoleIcon}><MagnifyingGlass size={22} weight="duotone" aria-hidden="true" /></span>
          <span className={styles.connectionRoleCopy}><strong>Seeker</strong><span>Needs help</span></span>
        </div>
        <div className={styles.connectionService}>
          <span className={styles.connectionServiceEyebrow}><Lightning size={15} weight="fill" aria-hidden="true" /> Agreed work</span>
          <strong>One booking record</strong>
          <span className={styles.connectionServiceTime}>Follow each step</span>
        </div>
        <div className={`${styles.connectionRole} ${styles.connectionProvider}`}>
          <span className={styles.connectionRoleIcon}><Toolbox size={22} weight="duotone" aria-hidden="true" /></span>
          <span className={styles.connectionRoleCopy}><strong>Provider</strong><span>Offers skills</span></span>
        </div>
      </div>
      <div className={styles.connectionFooter}>
        <p>Keep the agreement and progress together.</p>
        <span className={styles.connectionRate}>Stay informed</span>
      </div>
    </div>
  );
}

