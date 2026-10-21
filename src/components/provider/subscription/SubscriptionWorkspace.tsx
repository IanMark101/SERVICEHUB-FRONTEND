'use client';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getSubscription, startProCheckout, confirmProPayment, cancelProCheckout, cancelPro, type ProviderSubscription, type SubscriptionPayment } from '../../../api/subscriptions.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import GCashLogo from '../../ui/GCashLogo';
import ConfirmModal from '../../ui/ConfirmModal';
import { subscriptionPaymentLabels, safeSubscriptionCheckout } from '../../../lib/subscriptions';
import styles from './Subscription.module.css';

export interface ProviderPricingProps {
  currentPlan: 'FREE' | 'PRO'; monthlyPrice: number; disabled: boolean; onUpgrade: () => void;
}
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'long', timeZone: 'Asia/Manila' }) : '—';
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

/** Connects the pricing view to server-verified subscription and payment state. */
export default function SubscriptionWorkspace({ Pricing }: { Pricing: ComponentType<ProviderPricingProps> }) {
  const { user, isDark } = useApp();
  const userId = user && user.role !== 'admin' ? user.id : undefined;
  const returnIntent = useSearchParams().get('payment_intent_id');
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ userId?: string; data: ProviderSubscription | null; payment: SubscriptionPayment | null; error: string }>({ data: null, payment: null, error: '' });
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState('');
  const [opened, setOpened] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const actionLock = useRef(false);
  const identity = useRef<AbortController | null>(null);
  useEffect(() => {
    queueMicrotask(() => { setReview(false); setBusy(''); setOpened(false); setCancelDialog(false); });
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController(); identity.current = controller;
    void getSubscription(controller.signal).then(async data => {
      if (controller.signal.aborted) return;
      const pending = data.payments.find(payment => payment.paymentStatus === 'PENDING') ?? null;
      setState({ userId, data, payment: pending, error: '' });
      if (returnIntent || pending?.paymentIntentId) {
        try {
          const payment = await confirmProPayment(returnIntent || pending!.paymentIntentId!);
          const fresh = await getSubscription(controller.signal);
          if (!controller.signal.aborted) { setState({ userId, data: fresh, payment, error: '' }); setOpened(Boolean(returnIntent)); }
        } catch (error) { if (!controller.signal.aborted) setState(current => ({ ...current, error: getApiErrorMessage(error, 'We couldn’t verify this payment. Check again before paying.') })); }
      }
    }).catch(error => { if (!controller.signal.aborted) setState({ userId, data: null, payment: null, error: getApiErrorMessage(error, 'Your subscription could not load. Please try again.') }); });
    return () => { controller.abort(); actionLock.current = false; };
  }, [userId, revision, returnIntent]);
  const current = state.userId === userId;
  const data = current ? state.data : null;
  const payment = current ? state.payment : null;
  const error = current ? state.error : '';

  async function action(name: string, run: () => Promise<void>) {
    if (actionLock.current || !userId || !identity.current) return;
    const owner = identity.current;
    actionLock.current = true; setBusy(name);
    setState(value => ({ ...value, error: '' }));
    try { await run(); } catch (cause) {
      if (!owner.signal.aborted) setState(value => ({ ...value, error: getApiErrorMessage(cause, 'This action failed. Please try again.') }));
    } finally { if (!owner.signal.aborted) { actionLock.current = false; setBusy(''); } }
  }
  async function refreshPayment() {
    if (!payment?.paymentIntentId) return;
    const owner = identity.current;
    const checked = await confirmProPayment(payment.paymentIntentId);
    const fresh = await getSubscription();
    if (!owner?.signal.aborted) { setState(value => ({ ...value, data: fresh, payment: checked })); setReview(false); }
  }
  useEffect(() => {
    if (!opened || payment?.paymentStatus !== 'PENDING' || !payment.paymentIntentId || !userId) return;
    const controller = new AbortController(); const owner = identity.current; let count = 0; let running = false;
    const check = async () => {
      if (controller.signal.aborted || owner?.signal.aborted || document.hidden || running || actionLock.current || count >= 12) return;
      running = true; count++;
      try {
        const checked = await confirmProPayment(payment.paymentIntentId!);
        if (controller.signal.aborted || owner?.signal.aborted) return;
        const fresh = checked.paymentStatus === 'SUCCEEDED' ? await getSubscription() : null;
        if (!controller.signal.aborted && !owner?.signal.aborted) setState(value => ({ ...value, ...(fresh ? { data: fresh } : {}), payment: checked }));
      } catch { /* Keep the manual Check payment action available after network failures. */ }
      finally { running = false; }
    };
    const interval = window.setInterval(() => void check(), 8000);
    const focus = () => void check(); window.addEventListener('focus', focus);
    return () => { controller.abort(); clearInterval(interval); window.removeEventListener('focus', focus); };
  }, [opened, payment?.paymentStatus, payment?.paymentIntentId, userId]);

  const start = () => action('checkout', async () => {
    const owner = identity.current;
    const checkout = await startProCheckout();
    if (!owner?.signal.aborted) { setState(value => ({ ...value, payment: checkout })); setOpened(false); setReview(false); }
  });
  const cancelCheckout = () => action('cancel-checkout', async () => {
    if (!payment?.paymentIntentId) return;
    const owner = identity.current;
    const checked = await cancelProCheckout(payment.paymentIntentId);
    const fresh = await getSubscription();
    if (!owner?.signal.aborted) { setState(value => ({ ...value, data: fresh, payment: checked })); setOpened(false); }
  });
  const endPro = () => action('cancel-pro', async () => {
    const owner = identity.current; const fresh = await cancelPro();
    if (!owner?.signal.aborted) { setState(value => ({ ...value, data: fresh })); setCancelDialog(false); }
  });
  const checkoutUrl = payment?.paymentStatus === 'PENDING' ? safeSubscriptionCheckout(payment.redirectUrl) : null;
  const paid = payment?.paymentStatus === 'SUCCEEDED';
  const terminal = payment && !['PENDING', 'SUCCEEDED'].includes(payment.paymentStatus);

  return <div className={`${styles.page} ${styles.providerPage}`} data-theme={isDark ? 'dark' : 'light'}>
    {error && <div className={styles.error} role="alert"><span>{error}</span><button type="button" className={styles.button} onClick={() => setRevision(value => value + 1)}>Try again</button></div>}
    {!data ? !error && <p role="status">Loading your subscription…</p> : <>
      {data.plan === 'PRO' && <section className={`${styles.notice} ${styles.success}`} aria-label="Current subscription"><strong>{paid ? 'Welcome to ServiceHub Pro' : 'Your Pro plan is active'}</strong><p>{paid ? 'Your Pro benefits are now active. ' : ''}Active until {date(data.subscriptionExpiresAt)}.</p><p>{data.subscriptionStatus === 'CANCELLED' ? 'Cancelled. Your paid benefits stay active until this date.' : 'Renew manually after expiry. No automatic charges.'}</p>{data.subscriptionStatus !== 'CANCELLED' && <div className={styles.actions}><button type="button" className={styles.button} onClick={() => setCancelDialog(true)} disabled={Boolean(busy)}>Cancel Pro</button></div>}</section>}
      {data.subscriptionStatus === 'EXPIRED' && data.plan === 'FREE' && <div className={styles.notice}><strong>Your Pro plan has expired.</strong><p>{data.activeListings > 3 ? `Your ${data.activeListings} existing listings stay active. Renew Pro, or reduce your active listings below three before publishing another.` : 'You’re on Free with a 10% GCash fee and up to three active listings.'}</p></div>}
      {payment?.paymentStatus === 'PENDING' ? <section className={styles.checkout} aria-labelledby="subscription-payment-heading"><h1 id="subscription-payment-heading">{opened ? 'Waiting for payment' : 'Your GCash checkout is ready'}</h1><p className={styles.muted}>ServiceHub Pro · One month</p><dl><dt>Total</dt><dd>{money.format(payment.amount)}</dd></dl>{payment.isTestMode && <p className={styles.notice}><strong>Test Mode.</strong> No real money is transferred.</p>}
        {checkoutUrl && <a className={`${styles.button} ${styles.primary}`} href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpened(true)}><GCashLogo />{opened ? 'Reopen GCash' : 'Continue to GCash'}</a>}
        {!checkoutUrl && <button className={`${styles.button} ${styles.primary}`} type="button" disabled={Boolean(busy)} onClick={() => void start()}>{busy === 'checkout' ? 'Preparing checkout…' : 'Retry checkout'}</button>}
        <div className={styles.actions}><button className={styles.button} type="button" disabled={Boolean(busy)} onClick={() => void action('check', refreshPayment)}><RefreshCw size={16} aria-hidden="true" />{busy === 'check' ? 'Checking…' : 'Check payment'}</button><button className={styles.button} type="button" onClick={() => void cancelCheckout()} disabled={Boolean(busy)}>Cancel checkout</button></div></section>
        : review && data.plan === 'FREE' ? <section className={styles.checkout} aria-labelledby="subscription-review-heading"><button className={styles.button} type="button" onClick={() => setReview(false)} disabled={Boolean(busy)}><ArrowLeft size={16} aria-hidden="true" />Back to plans</button><h1 id="subscription-review-heading" style={{ marginTop: 24 }}>ServiceHub Pro</h1><p className={styles.muted}>{money.format(data.monthlyPrice)}/month</p><ul>{['5% GCash transaction fee', 'Unlimited active service listings', 'Priority for featured placement'].map(item => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul><dl><dt>Total</dt><dd>{money.format(data.monthlyPrice)}</dd></dl><p className={styles.muted}>One calendar month from confirmed payment. Renew manually; no automatic charges.</p>{data.isTestMode && <p className={styles.notice}><strong>Test Mode.</strong> No real money is transferred.</p>}<button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => void start()} disabled={Boolean(busy)}>{busy === 'checkout' ? 'Preparing checkout…' : 'Continue to Payment'}</button></section>
        : <><Pricing currentPlan={data.plan} monthlyPrice={data.monthlyPrice} disabled={Boolean(busy)} onUpgrade={() => setReview(true)} /><p className={`${styles.muted} ${styles.pricingNote}`}>GCash fees are deducted from your earnings. No platform fee for cash payments.</p></>}
      {terminal && <div className={payment.paymentStatus === 'CANCELLED' ? styles.notice : styles.error} role="status"><strong>{subscriptionPaymentLabels[payment.paymentStatus]}</strong><p>{payment.paymentStatus === 'REFUNDED' ? (payment.isTestMode ? 'Test payment reversed. No real money was transferred.' : 'The payment was refunded. Pro was not activated.') : payment.paymentStatus === 'REFUND_REQUIRED' ? 'This payment needs a refund. Pro was not activated. Contact support if it remains pending.' : 'Pro was not activated. You can start a new checkout when you’re ready.'}</p></div>}
      <section className={styles.history} aria-labelledby="subscription-history-heading"><h2 id="subscription-history-heading">Payment history</h2>{!data.payments.length ? <p className={styles.muted}>No subscription payments yet.</p> : <div className={styles.tableWrap}><table className={styles.table}><caption className="sr-only">Your subscription payments</caption><thead><tr><th>Plan</th><th>Amount</th><th>Status</th><th>Period</th><th>Reference</th></tr></thead><tbody>{data.payments.map(item => <tr key={item.id}><td>Pro<small>{item.isTestMode ? 'Test Mode' : 'GCash'}</small></td><td>{money.format(item.amount)}</td><td>{subscriptionPaymentLabels[item.paymentStatus]}</td><td>{date(item.subscriptionStartedAt)}<small>{item.subscriptionExpiresAt ? `Until ${date(item.subscriptionExpiresAt)}` : 'Not activated'}</small></td><td>{item.paymentReference || '—'}<small>{date(item.createdAt)}</small></td></tr>)}</tbody></table></div>}</section>
      <ConfirmModal state={cancelDialog ? { isOpen: true, title: 'Cancel Pro?', message: `Your benefits stay active until ${date(data.subscriptionExpiresAt)}. After that, your account returns to Free.`, confirmText: 'Cancel Pro', cancelText: 'Keep Pro', variant: 'danger', isLoading: busy === 'cancel-pro', onConfirm: () => void endPro() } : null} onClose={() => { if (!busy) setCancelDialog(false); }} />
    </>}
  </div>;
}
