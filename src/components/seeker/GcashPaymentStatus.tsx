'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, CheckCircle2, Loader2, TriangleAlert, X } from 'lucide-react';
import { apiConfirmOnlineBooking, apiInitiatePayment } from '../../api/bookings.api';
import { useApp } from '../../context/AppContext';
import { useApiCacheRefresh } from '../../hooks/useApiCacheRefresh';
import useDialogFocus from '../../hooks/useDialogFocus';
import { clearGcashCheckout, isPayMongoCheckoutUrl, paymentReturnPath, readGcashCheckout, rememberGcashCheckout, type PendingGcashCheckout } from '../../lib/paymentCheckout';
import form from '../ui/TransactionForm.module.css';
import GCashLogo from '../ui/GCashLogo';
import styles from './GcashPaymentStatus.module.css';

type Phase = 'review' | 'checking' | 'pending' | 'succeeded' | 'failed' | 'expired' | 'review-required' | 'refunded' | 'unavailable';
interface Props { paymentIntentId: string | null; initialCheckout?: PendingGcashCheckout; onClose?: () => void }
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function GcashPaymentStatus(props: Props) {
  const { user, isDark } = useApp();
  // Reset local receipt and async state whenever the account or attempt changes.
  return <PaymentFlow key={`${user?.id}:${props.paymentIntentId}`} {...props} userId={user?.id} isDark={isDark} />;
}

function PaymentFlow({ paymentIntentId, initialCheckout, onClose, userId, isDark }: Props & { userId?: string; isDark: boolean }) {
  const router = useRouter();
  const ownedInitial = initialCheckout?.seekerId === userId && initialCheckout?.paymentIntentId === paymentIntentId ? initialCheckout : null;
  const [checkout, setCheckout] = useState<PendingGcashCheckout | null>(ownedInitial);
  const [restored, setRestored] = useState(Boolean(ownedInitial));
  const [phase, setPhase] = useState<Phase>(ownedInitial?.checkoutOpened === false ? 'review' : 'checking');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [checkVersion, setCheckVersion] = useState(0);
  const dialogRef = useDialogFocus(Boolean(onClose), retrying, () => onClose?.(), 'dialog');
  const verifying = restored && ['checking', 'pending', 'unavailable'].includes(phase);

  useEffect(() => {
    if (ownedInitial || !userId || !paymentIntentId) return;
    const timer = window.setTimeout(() => {
      const stored = readGcashCheckout(userId, paymentIntentId);
      setCheckout(stored);
      setPhase(stored?.checkoutOpened === false ? 'review' : 'checking');
      setRestored(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [userId, paymentIntentId, ownedInitial]);

  useApiCacheRefresh(['bookings'], change => {
    // A live update prompts server verification; it never proves payment.
    if (['socket', 'reconnect', 'online'].includes(change.reason)) setCheckVersion(value => value + 1);
  }, phase === 'pending' || phase === 'unavailable');

  useEffect(() => {
    if (!userId || !paymentIntentId || !verifying) return;
    let active = true;
    let inFlight = false;
    let checks = 0;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      if (!active || inFlight) return;
      if (document.hidden) { timer = setTimeout(() => { void check(); }, 12_000); return; }
      inFlight = true;
      checks += 1;
      try {
        const result = await apiConfirmOnlineBooking({ paymentIntentId });
        if (!active) return;
        const status = result.success ? result.data?.status : undefined;
        const serverCheckout = result.success ? result.data?.checkout as PendingGcashCheckout | undefined : undefined;
        if (serverCheckout?.seekerId === userId && serverCheckout?.paymentIntentId === paymentIntentId) {
          setCheckout(current => ({ ...current, ...serverCheckout, checkoutOpened: true }));
        }
        if (status === 'SUCCEEDED') { clearGcashCheckout(paymentIntentId); setPhase('succeeded'); }
        else if (status === 'FAILED' || status === 'EXPIRED') setPhase(status === 'FAILED' ? 'failed' : 'expired');
        else if (status === 'REFUND_REQUIRED') setPhase('review-required');
        else if (status === 'REFUNDED') setPhase('refunded');
        else if (status === 'PENDING') {
          setPhase('pending');
          if (checks < 12) timer = setTimeout(() => { void check(); }, 12_000);
        } else setPhase('unavailable');
      } catch { if (active) setPhase('unavailable'); }
      finally { inFlight = false; }
    };
    const checkOnReturn = () => { if (!document.hidden) { clearTimeout(timer); void check(); } };
    document.addEventListener('visibilitychange', checkOnReturn);
    window.addEventListener('focus', checkOnReturn);
    window.addEventListener('storage', checkOnReturn);
    void check();
    return () => {
      active = false; clearTimeout(timer);
      document.removeEventListener('visibilitychange', checkOnReturn);
      window.removeEventListener('focus', checkOnReturn);
      window.removeEventListener('storage', checkOnReturn);
    };
  }, [userId, paymentIntentId, verifying, checkVersion]);

  const failed = phase === 'failed' || phase === 'expired';
  const review = phase === 'review';
  const succeeded = phase === 'succeeded';
  const providerUrl = isPayMongoCheckoutUrl(checkout?.redirectUrl) ? checkout.redirectUrl : null;
  const returnHref = checkout?.offerId ? '/seeker/incoming-offers' : checkout?.serviceId ? `/seeker/seek-services?serviceId=${encodeURIComponent(checkout.serviceId)}` : '/seeker/seek-services';
  const bookingHref = '/seeker/seeker-activity' + (checkout?.bookingId ? `?tab=all&booking=${encodeURIComponent(checkout.bookingId)}` : '');
  const hasAmount = typeof checkout?.expectedAmount === 'number' && Number.isFinite(checkout.expectedAmount);
  const formattedTotal = hasAmount ? money.format(checkout!.expectedAmount!) : 'Unavailable';
  const title = !paymentIntentId ? 'Payment not found' : !userId ? 'Sign in to check payment' : review ? 'Review payment' : succeeded ? 'Payment successful' : phase === 'refunded' ? 'Payment refunded' : failed ? 'Payment not completed' : phase === 'review-required' ? 'Payment under review' : phase === 'unavailable' ? 'Unable to check payment' : 'Waiting for payment';
  const description = !paymentIntentId ? 'Open a service or offer to start checkout.' : !userId ? 'Use the account that started this payment.' : review ? 'Check your total before continuing.' : succeeded ? 'Your booking is confirmed.' : phase === 'refunded' ? 'Your refund is recorded.' : failed ? 'This attempt did not confirm a booking. You can try again.' : phase === 'review-required' ? 'Wait for the result before making another payment.' : phase === 'unavailable' ? 'Check again before making another payment.' : 'Finish in the GCash tab. This page updates automatically.';

  function continuePayment() {
    if (!checkout || !providerUrl) return;
    const updated = { ...checkout, checkoutOpened: true };
    setCheckout(updated); rememberGcashCheckout(updated); setPhase('checking');
  }

  async function tryAgain() {
    if (!checkout || !paymentIntentId || retrying || !failed) return;
    setRetrying(true); setRetryError('');
    try {
      const result = await apiInitiatePayment({ retryPaymentIntentId: paymentIntentId, serviceId: checkout.serviceId, offerId: checkout.offerId, ...(checkout.quantity !== undefined ? { quantity: checkout.quantity } : {}), paymentMethodType: 'gcash' });
      const nextIntentId = result.data?.paymentIntentId;
      if (!result.success || !nextIntentId || nextIntentId === paymentIntentId) {
        setRetryError('This attempt is still being checked. Check its status before trying again.');
        setPhase('checking'); setCheckVersion(value => value + 1); return;
      }
      if (result.data.redirectUrl && !isPayMongoCheckoutUrl(result.data.redirectUrl)) throw new Error('Invalid checkout link');
      rememberGcashCheckout({ ...checkout, paymentIntentId: nextIntentId, redirectUrl: result.data.redirectUrl, expectedAmount: result.data.expectedAmount ?? checkout.expectedAmount, commission: result.data.commission, isTestMode: result.data.isTestMode, checkoutOpened: false });
      if (!onClose) router.replace(paymentReturnPath(nextIntentId));
    } catch { setRetryError('Could not start a new payment. Try again.'); }
    finally { setRetrying(false); }
  }

  const Heading = onClose ? 'h2' : 'h1';
  return <div ref={dialogRef} tabIndex={onClose ? -1 : undefined} role={onClose ? 'dialog' : undefined} aria-modal={onClose ? true : undefined} aria-labelledby="gcash-status-title"
    className={`${form.panel} ${styles.panel}`} data-theme={isDark ? 'dark' : 'light'} data-workspace="seeker" data-presentation={onClose ? 'dialog' : 'page'} data-state={phase}>
    {onClose && <button type="button" onClick={onClose} disabled={retrying} aria-label="Close payment" className={`${form.close} ${styles.close}`}><X size={18} aria-hidden="true" /></button>}
    <div className={styles.content}>
      <section className={styles.main}>
        <div className={styles.status} aria-live="polite" aria-atomic="true">
          {!review && <span className={styles.statusIcon}>{succeeded ? <CheckCircle2 size={32} aria-hidden="true" /> : failed || phase === 'review-required' || phase === 'refunded' || phase === 'unavailable' || !paymentIntentId || !userId ? <TriangleAlert size={28} aria-hidden="true" /> : <Loader2 size={28} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}</span>}
          <Heading id="gcash-status-title">{title}</Heading><p>{description}</p>
        </div>
        {review && <div className={styles.method}><div><span className={styles.selected}><Check size={14} aria-hidden="true" /></span><strong>GCash</strong></div><GCashLogo /></div>}
        {!review && <div className={styles.paidAmount}><span>{succeeded ? 'Amount paid' : phase === 'refunded' ? 'Refunded amount' : 'Booking total'}</span><strong>{formattedTotal}</strong><span className={styles.methodLabel}><GCashLogo />{checkout?.isTestMode !== false && <span>Test Mode</span>}</span></div>}
        <dl className={styles.booking} aria-label="Booking details">
          <div><dt>{checkout?.offerId ? 'Request' : 'Service'}</dt><dd>{checkout?.title || 'Service booking'}</dd></div>
          {checkout?.providerName && <div><dt>Provider</dt><dd>{checkout.providerName}</dd></div>}
          {checkout?.quantity !== undefined && checkout.quantity > 1 && <div><dt>Quantity</dt><dd>{checkout.quantity}</dd></div>}
        </dl>
        {!review && <PaymentDetails checkout={checkout} paymentIntentId={paymentIntentId} />}
        {retryError && <p role="alert" className={form.error}>{retryError}</p>}
        <div className={styles.actions}>
          {succeeded ? <Link href={bookingHref} onClick={onClose} className={`${form.button} ${form.primary}`}>View booking</Link>
            : failed && checkout ? <button type="button" onClick={() => { void tryAgain(); }} disabled={retrying} className={`${form.button} ${form.primary}`}>{retrying ? 'Preparing…' : 'Try again'}</button>
            : (review || phase === 'pending') && providerUrl && (!review || hasAmount) ? <a href={providerUrl} target="_blank" rel="noopener noreferrer" onClick={continuePayment} className={`${form.button} ${form.primary}`}>{review ? 'Continue with GCash' : 'Open GCash'}<ArrowUpRight size={16} aria-hidden="true" /></a> : null}
          {(phase === 'pending' || phase === 'unavailable') && paymentIntentId && userId && <button type="button" onClick={() => { setPhase('checking'); setCheckVersion(value => value + 1); }} className={form.button}>Check status</button>}
          {!succeeded && (onClose ? <button type="button" onClick={onClose} disabled={retrying} className={form.button}>{review ? 'Cancel' : 'Close'}</button> : <Link href={returnHref} className={form.button}>{checkout?.offerId ? 'Back to offers' : 'Back to service'}</Link>)}
        </div>
        {review && (!providerUrl || !hasAmount) && <p role="alert" className={form.error}>Checkout details are unavailable. Return to the service or offer and try again.</p>}
        {checkout?.isTestMode !== false && <p className={styles.testNotice}>Test Mode · No real money is transferred.</p>}
      </section>
      {review && <aside className={styles.summary} aria-labelledby="gcash-summary-title"><h3 id="gcash-summary-title">Payment summary</h3>
        <dl aria-label="Payment summary"><div><dt>Agreed total</dt><dd>{formattedTotal}</dd></div><div className={styles.total}><dt>Total you pay</dt><dd>{formattedTotal}</dd></div></dl>
        {checkout?.commission && <p className={styles.feeNote}>The {checkout.commission.ratePercent}% platform fee is included.</p>}
        <PaymentDetails checkout={checkout} paymentIntentId={paymentIntentId} feeOnly />
      </aside>}
    </div>
  </div>;
}

function PaymentDetails({ checkout, paymentIntentId, feeOnly = false }: { checkout: PendingGcashCheckout | null; paymentIntentId: string | null; feeOnly?: boolean }) {
  if (feeOnly && !checkout?.commission) return null;
  return <details className={styles.details}><summary>{feeOnly ? 'Fee details' : 'Payment details'}</summary><dl>
    {checkout?.commission && <><div><dt>Platform fee ({checkout.commission.ratePercent}%)</dt><dd>{money.format(checkout.commission.platformFeeAmount)}</dd></div><div><dt>Provider share</dt><dd>{money.format(checkout.commission.providerNetAmount)}</dd></div></>}
    {!feeOnly && <><div><dt>Reference</dt><dd>{checkout?.reference || paymentIntentId || 'Unavailable'}</dd></div>{checkout?.paidAt && <div><dt>Paid on</dt><dd>{new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(checkout.paidAt))} · PH time</dd></div>}</>}
  </dl></details>;
}
