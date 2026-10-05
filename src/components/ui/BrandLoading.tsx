type BrandLoadingProps = {
  label?: string;
  role?: 'seeker' | 'provider' | 'neutral';
  compact?: boolean;
};

export default function BrandLoading({
  label = 'Loading ServiceHub',
  role = 'neutral',
  compact = false,
}: BrandLoadingProps) {
  return (
    <div
      className={`brand-loading brand-loading--${role} ${compact ? 'brand-loading--compact' : 'brand-loading--page'}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="brand-loading__content">
        <div className="brand-loading__wordmark" aria-hidden="true">
          <span className="brand-loading__wordmark-base">ServiceHub</span>
          <span className="brand-loading__wordmark-reveal">ServiceHub</span>
        </div>
        <p className="brand-loading__label" aria-hidden="true">Loading</p>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
