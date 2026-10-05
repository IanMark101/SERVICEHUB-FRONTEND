import Image from 'next/image';

export default function GCashLogo() {
  return (
    <span className="inline-flex shrink-0 items-center rounded bg-white px-1.5 py-1">
      <Image src="/images/payments/gcash-logo.avif" alt="GCash" width={72} height={17} unoptimized />
    </span>
  );
}
