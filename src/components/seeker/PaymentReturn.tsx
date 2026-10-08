'use client';

import GcashPaymentStatus from './GcashPaymentStatus';

export default function PaymentReturn({ paymentIntentId }: { paymentIntentId: string | null }) {
  return <div className="mx-auto flex max-w-2xl justify-center py-5 sm:py-10">
    <GcashPaymentStatus key={paymentIntentId || 'missing'} paymentIntentId={paymentIntentId} />
  </div>;
}
