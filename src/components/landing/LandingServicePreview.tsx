import ServiceDetailsPanel from '@/components/seeker/seek-services/ServiceDetailsPanel';
import ContentCaseTrigger from '@/components/moderation/ContentCaseTrigger';
import details from '@/components/ui/ListingDetails.module.css';
import ScaledPreview from './ScaledPreview';
import { previewServices } from './workspacePreviewData';
import styles from './LandingServicePreview.module.css';

const noop = () => {};

/** The current mobile service details panel, with inert sample controls. */
export default function LandingServicePreview({ isDark }: { isDark: boolean }) {
  return <ScaledPreview width={400} className={styles.device} label="Current mobile service details with fictional sample data">
    <ServiceDetailsPanel listing={previewServices[0]} compact titleId="hero-service-details-title"
      onClose={noop} onBookListing={noop} onJoinWaitlist={noop} joiningWaitlistId={null}
      isOwned={false} isDark={isDark} router={{ push: noop }} prefetchProviderSummary={noop}
      reportAction={<ContentCaseTrigger label="Report listing" isDark={isDark} className={details.report} />} />
  </ScaledPreview>;
}
