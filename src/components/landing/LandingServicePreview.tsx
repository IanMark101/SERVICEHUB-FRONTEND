import ServiceDetailsPanel from '@/components/seeker/seek-services/ServiceDetailsPanel';
import ContentCaseTrigger from '@/components/moderation/ContentCaseTrigger';
import details from '@/components/ui/ListingDetails.module.css';
import type { ServiceListing } from '@/types';
import ScaledPreview from './ScaledPreview';
import styles from './LandingServicePreview.module.css';

const noop = () => {};

// Fictional hero example. An empty avatar uses the live panel's "J" fallback.
const previewService: ServiceListing = {
  id: 'preview-laptop-repair', providerId: 'preview-john', providerName: 'John Sefuesca', providerAvatar: '',
  title: 'LAPTOP REPAIR SERVICES', category: 'Computer & Laptop Repair',
  description: 'Diagnostics and repair for laptops. Arrange the work with your provider.',
  price: 1500, priceType: 'FIXED', estimatedDurationMins: 60,
  locationLabel: 'Day-as, Cordova, Cebu', distanceKm: 1.3, coverageRadiusKm: 5, transportationFee: 75,
  queueSize: 0, queueLimit: 5, providerWaitingCount: 0, isPaused: false, proofOfSkillUrl: '',
  rating: 5, reviewCount: 2, providerTrustScore: 61, providerVerificationStatus: 'APPROVED',
  paymentMethods: { cash: true, gcash: false }, status: 'ACTIVE', serviceType: 'ONE_TIME',
};

/** The current mobile service details panel, with inert sample controls. */
export default function LandingServicePreview({ isDark }: { isDark: boolean }) {
  return <ScaledPreview width={360} className={styles.device} label="Current mobile service details with fictional sample data">
    <ServiceDetailsPanel listing={previewService} compact titleId="hero-service-details-title"
      onClose={noop} onBookListing={noop} onJoinWaitlist={noop} joiningWaitlistId={null}
      isOwned={false} isDark={isDark} router={{ push: noop }} prefetchProviderSummary={noop}
      reportAction={<ContentCaseTrigger label="Report listing" isDark={isDark} className={details.report} />} />
  </ScaledPreview>;
}
