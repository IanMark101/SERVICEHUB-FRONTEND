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
        <p className="brand-loading__label">{label}</p>
        <div className="brand-loading__track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
