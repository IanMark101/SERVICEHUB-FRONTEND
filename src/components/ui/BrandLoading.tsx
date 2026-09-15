import Image from 'next/image';

type BrandLoadingProps = {
  label?: string;
  detail?: string;
  role?: 'seeker' | 'provider' | 'neutral';
  compact?: boolean;
};

export default function BrandLoading({
  label = 'Getting ServiceHub ready',
  detail = 'This should only take a moment.',
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
        <div className="brand-loading__identity">
          <Image src="/logo.svg?v=4" alt="" width={42} height={42} className="brand-loading__mark" priority={!compact} />
          <span>
            <span className="brand-loading__name">ServiceHub</span>
            <span className="brand-loading__place">CORDOVA</span>
          </span>
        </div>
        <p className="brand-loading__label">{label}</p>
        {detail && <p className="brand-loading__detail">{detail}</p>}
        <div className="brand-loading__track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
