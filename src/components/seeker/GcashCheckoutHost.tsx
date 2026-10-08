'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { GCASH_CHECKOUT_EVENT, type PendingGcashCheckout } from '../../lib/paymentCheckout';
import GcashPaymentStatus from './GcashPaymentStatus';
import form from '../ui/TransactionForm.module.css';

/** One payment dialog across listing and offer flows, independent of page navigation. */
export default function GcashCheckoutHost() {
  const { user } = useApp();
  const pathname = usePathname();
  const [opened, setOpened] = useState<PendingGcashCheckout | null>(null);

  useEffect(() => {
    const checkoutChanged = (event: Event) => {
      const checkout = (event as CustomEvent<PendingGcashCheckout | undefined>).detail;
      if (checkout && checkout.seekerId === user?.id) {
        setOpened(checkout);
      }
    };
    window.addEventListener(GCASH_CHECKOUT_EVENT, checkoutChanged);
    return () => {
      window.removeEventListener(GCASH_CHECKOUT_EVENT, checkoutChanged);
    };
  }, [user?.id]);

  // The return page renders the same status component itself. Another account
  // must never see the previous seeker's persisted payment context.
  if (!user || pathname === '/seeker/payment-return' || typeof document === 'undefined') return null;
  const active = opened?.seekerId === user.id ? opened : null;

  return createPortal(active ? <div className={form.overlay}>
    <GcashPaymentStatus key={active.paymentIntentId} paymentIntentId={active.paymentIntentId}
      initialCheckout={active} onClose={() => setOpened(null)} />
  </div> : null, document.body);
}
