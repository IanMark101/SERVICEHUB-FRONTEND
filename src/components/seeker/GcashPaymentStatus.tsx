'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Loader2, TriangleAlert, X } from 'lucide-react';
import { apiConfirmOnlineBooking, apiInitiatePayment } from '../../api/bookings.api';
import { useApp } from '../../context/AppContext';
import { getServicePaymentMethods } from '../../lib/paymentUtils';
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import useDialogFocus from '../../hooks/useDialogFocus';
import {
  clearGcashCheckout, isPayMongoCheckoutUrl, navigateGcashWindow, paymentReturnPath,
  prepareGcashWindow, readGcashCheckout, rememberGcashCheckout, type PendingGcashCheckout,
} from '../../lib/paymentCheckout';
import form from '../ui/TransactionForm.module.css';
import styles from './GcashPaymentStatus.module.css';

type Phase = 'checking' | 'pending' | 'succeeded' | 'failed' | 'expired' | 'review' | 'unavailable';

export default function GcashPaymentStatus({ paymentIntentId, initialCheckout, onClose }: {
  paymentIntentId: string | null;
  initialCheckout?: PendingGcashCheckout;
  onClose?: () => void;
}) {
  const router = useRouter();
  const { user, services = [], isDark } = useApp();
  const [checkout, setCheckout] = useState<PendingGcashCheckout | null>(() => initialCheckout?.seekerId === user?.id ? initialCheckout || null : null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [checkVersion, setCheckVersion] = useState(0);
  const dialogRef = useDialogFocus(Boolean(onClose), retrying, () => onClose?.(), 'dialog');

  useApiCacheRefresh(['bookings'], change => {
    // Socket events prompt a fresh owned-attempt check; they do not prove payment.
    if (['socket', 'reconnect', 'online'].includes(change.reason)) setCheckVersion(value => value + 1);
  }, phase === 'pending' || phase === 'unavailable');

  useEffect(() => {
    if (!user?.id || !paymentIntentId) return;
    const stored = readGcashCheckout(user.id, paymentIntentId);
    const setupTimer = window.setTimeout(() => { if (stored) setCheckout(stored); }, 0);
    let active = true;
    let inFlight = false;
    let checks = 0;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      if (!active || inFlight) return;
      if (document.hidden) {
        timer = setTimeout(() => { void check(); }, 12_000);
        return;
      }
      inFlight = true;
      checks += 1;
      try {
        const result = await apiConfirmOnlineBooking({ paymentIntentId });
        if (!active) return;
        const status = result.success ? result.data?.status : undefined;
        if (status === 'SUCCEEDED') {
          clearGcashCheckout(paymentIntentId);
          setPhase('succeeded');
        } else if (status === 'FAILED' || status === 'EXPIRED') {
          setPhase(status === 'FAILED' ? 'failed' : 'expired');
        } else if (status === 'REFUND_REQUIRED' || status === 'REFUNDED') {
          setPhase('review');
        } else if (status === 'PENDING') {
          setPhase('pending');
          if (checks < 12) timer = setTimeout(() => { void check(); }, 12_000);
        } else {
          setPhase('unavailable');
        }
      } catch {
        if (active) setPhase('unavailable');
      } finally {
        inFlight = false;
      }
    };

    const checkOnReturn = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        void check();
      }
    };
    document.addEventListener('visibilitychange', checkOnReturn);
    window.addEventListener('focus', checkOnReturn);
    window.addEventListener('storage', checkOnReturn);
    void check();
    return () => {
      active = false;
      clearTimeout(setupTimer);
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', checkOnReturn);
      window.removeEventListener('focus', checkOnReturn);
      window.removeEventListener('storage', checkOnReturn);
    };
  }, [user?.id, paymentIntentId, checkVersion]);

  const service = services.find(entry => entry.id === checkout?.serviceId);
  const cashAvailable = checkout?.offerId ? true : service ? getServicePaymentMethods(service).cash : false;
  const returnHref = checkout?.offerId ? '/seeker/incoming-offers'
    : checkout?.serviceId ? `/seeker/seek-services?serviceId=${encodeURIComponent(checkout.serviceId)}` : '/seeker/seek-services';
  const providerUrl = isPayMongoCheckoutUrl(checkout?.redirectUrl) ? checkout.redirectUrl : null;
  const failed = phase === 'failed' || phase === 'expired';

  const tryAgain = async () => {
    if (!checkout || !paymentIntentId || retrying || !failed) return;
    const popup = prepareGcashWindow();
    setRetrying(true);
    setRetryError('');
    try {
      const result = await apiInitiatePayment({
        retryPaymentIntentId: paymentIntentId,
        serviceId: checkout.serviceId, offerId: checkout.offerId,
        ...(checkout.quantity !== undefined ? { quantity: checkout.quantity } : {}), paymentMethodType: 'gcash',
      });
      const nextIntentId = result.data?.paymentIntentId;
      if (!result.success || !nextIntentId || nextIntentId === paymentIntentId) {
        popup?.close();
        setRetryError('The previous attempt is still being checked. Check its status before paying again.');
        setCheckVersion(value => value + 1);
        return;
      }
      if (result.data.redirectUrl && !isPayMongoCheckoutUrl(result.data.redirectUrl)) throw new Error('Invalid checkout link');
      rememberGcashCheckout({ ...checkout, paymentIntentId: nextIntentId, redirectUrl: result.data.redirectUrl, expectedAmount: result.data.expectedAmount ?? checkout.expectedAmount });
      navigateGcashWindow(popup, result.data.redirectUrl);
      if (!onClose) router.replace(paymentReturnPath(nextIntentId));
    } catch {
      popup?.close();
      setRetryError('A new GCash attempt could not be started. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  const title = !paymentIntentId ? 'No GCash payment to check'
    : phase === 'succeeded' ? 'GCash payment confirmed'
      : failed ? 'GCash payment was not completed'
        : phase === 'review' ? 'This payment needs review'
          : phase === 'unavailable' ? 'Payment status is temporarily unavailable'
            : phase === 'pending' ? 'Waiting for payment confirmation'
              : 'Checking your GCash payment';
  const description = phase === 'succeeded'
    ? 'Your booking was created and added to the provider’s paid work queue.'
    : failed ? 'No booking was created and no payment was recorded as successful.'
      : phase === 'review' ? 'ServiceHub is checking this payment and its reversal record. Wait for the result before paying again.'
        : phase === 'unavailable' ? 'We cannot confirm the payment right now. Check its status before paying again.'
          : !paymentIntentId ? 'Return to a service listing or offer to start a new payment.'
            : 'No booking or queue position exists until ServiceHub verifies a successful GCash payment.';
  const Heading = onClose ? 'h2' : 'h1';

  return (
    <div ref={dialogRef} tabIndex={onClose ? -1 : undefined} role={onClose ? 'dialog' : undefined}
      aria-modal={onClose ? true : undefined} aria-labelledby="gcash-status-title"
      className={`${form.panel} ${styles.panel}`} data-theme={isDark ? 'dark' : 'light'} data-workspace="seeker">
      {onClose && <header className={form.header}>
        <h3>GCash payment</h3>
        <button type="button" onClick={onClose} disabled={retrying} aria-label="Close payment status" className={form.close}><X size={18} aria-hidden="true" /></button>
      </header>}
      <div className={form.body}>
        <div aria-live="polite" aria-atomic="true" className={styles.status}>
          {phase === 'succeeded' ? <CheckCircle2 size={28} aria-hidden="true" />
            : failed || phase === 'review' || phase === 'unavailable' || !paymentIntentId ? <TriangleAlert size={28} aria-hidden="true" />
              : <Loader2 size={28} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
          <Heading id="gcash-status-title">{title}</Heading>
          <p>{description}</p>
        </div>
        {(checkout?.title || checkout?.providerName || Number.isFinite(checkout?.expectedAmount)) && <dl className={styles.summary} aria-label="Payment summary">
          {checkout?.title && <div><dt>{checkout.offerId ? 'Request' : 'Service'}</dt><dd>{checkout.title}</dd></div>}
          {checkout?.providerName && <div><dt>Provider</dt><dd>{checkout.providerName}</dd></div>}
          {Number.isFinite(checkout?.expectedAmount) && <div><dt>Total</dt><dd>₱{Number(checkout?.expectedAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>}
        </dl>}
        <p className={form.hint}>{phase === 'succeeded'
          ? 'ServiceHub verified the payment. You can close the PayMongo tab.'
          : failed ? 'You can close the old PayMongo tab and try a new payment below.'
            : phase === 'review' ? 'Do not start another payment until this attempt is resolved.'
              : 'Complete GCash via PayMongo Test Mode in the other tab, then return here. Payment status updates automatically.'}</p>
      </div>
      <footer className={form.footer}>
        {retryError && <p role="alert" className={form.error}>{retryError}</p>}
        <div className={styles.actions}>
          {phase === 'pending' && providerUrl && <a href={providerUrl} target="_blank" rel="noopener noreferrer" className={`${form.button} ${form.primary}`}>
            Open PayMongo Test Mode <ArrowUpRight size={16} aria-hidden="true" />
          </a>}
          {failed && checkout && <button type="button" onClick={() => { void tryAgain(); }} disabled={retrying} className={`${form.button} ${form.primary}`}>
            {retrying ? 'Starting a new attempt…' : 'Try GCash Again'}
          </button>}
          {failed && cashAvailable && <Link href={returnHref} onClick={onClose} className={form.button}>Choose On-site Cash</Link>}
          {(phase === 'pending' || phase === 'unavailable') && paymentIntentId && <button type="button" onClick={() => setCheckVersion(value => value + 1)} className={form.button}>Check payment status</button>}
          {phase === 'succeeded' ? <Link href="/seeker/seeker-activity" onClick={onClose} className={`${form.button} ${form.primary}`}>View booking in Activity</Link>
            : onClose ? <button type="button" onClick={onClose} disabled={retrying} className={form.button}>Close for now</button>
              : <Link href={returnHref} className={form.button}>{checkout?.offerId ? 'Back to Offers Received' : 'Back to service'}</Link>}
        </div>
        {onClose && phase !== 'succeeded' && <p className={form.hint}>Closing this dialog does not cancel payment.</p>}
      </footer>
    </div>
  );
}
