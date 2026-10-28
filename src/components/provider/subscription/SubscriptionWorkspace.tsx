'use client';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getSubscription, startFreeProviderPlan, getMembershipQuote, startMembershipCheckout, confirmProPayment, cancelProCheckout, cancelPro, type ProviderSubscription, type SubscriptionPayment, type PaidProviderPlan, type MembershipQuote } from '../../../api/subscriptions.api';
import { getApiErrorMessage } from '../../../lib/api/errors';
import GCashLogo from '../../ui/GCashLogo';
import ConfirmModal from '../../ui/ConfirmModal';
import SubscriptionSkeleton from './SubscriptionSkeleton';
import { subscriptionPaymentLabels, safeSubscriptionCheckout } from '../../../lib/subscriptions';
import styles from './Subscription.module.css';
import { planName, membershipDate } from '../../../lib/providerPlans';

export interface ProviderPricingProps {
  membership: ProviderSubscription; disabled: boolean; onChoose: (plan: PaidProviderPlan) => void;
}
const date = membershipDate;
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

/** Connects the pricing view to server-verified subscription and payment state. */
export default function SubscriptionWorkspace({ Pricing }: { Pricing: ComponentType<ProviderPricingProps> }) {
  const { user, isDark } = useApp();
  const userId = user && user.role !== 'admin' ? user.id : undefined;
  const returnIntent = useSearchParams().get('payment_intent_id');
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ userId?: string; data: ProviderSubscription | null; payment: SubscriptionPayment | null; error: string }>({ data: null, payment: null, error: '' });
  const [review, setReview] = useState<MembershipQuote | null>(null);
  const [busy, setBusy] = useState('');
  const [opened, setOpened] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const actionLock = useRef(false);
  const identity = useRef<AbortController | null>(null);
  useEffect(() => {
    queueMicrotask(() => { setReview(null); setBusy(''); setOpened(false); setCancelDialog(false); });
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController(); identity.current = controller;
    void getSubscription(controller.signal).then(async initial => {
      const data = initial.trialStarted ? initial : await startFreeProviderPlan(controller.signal);
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
    if (!owner?.signal.aborted) { setState(value => ({ ...value, data: fresh, payment: checked })); setReview(null); }
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

  const choosePlan = (plan: PaidProviderPlan) => action('quote', async () => {
    const owner = identity.current;
    const quote = await getMembershipQuote(plan);
    if (!owner?.signal.aborted) setReview(quote);
  });
  const start = () => action('checkout', async () => {
    const owner = identity.current;
    const quote = review ?? (payment ? await getMembershipQuote(payment.plan) : null);
    if (!quote || owner?.signal.aborted) return;
    if (new Date(quote.validUntil).getTime() <= Date.now()) {
      const fresh = await getMembershipQuote(quote.plan);
      if (!owner?.signal.aborted) { setReview(fresh); setState(value => ({ ...value, error: 'The previous price expired. Review the updated total before continuing.' })); }
      return;
    }
    const checkout = await startMembershipCheckout(quote.plan, quote.quoteToken);
    if (!owner?.signal.aborted) { setState(value => ({ ...value, payment: checkout })); setOpened(false); }
  });
  const cancelCheckout = () => action('cancel-checkout', async () => {
    if (!payment?.paymentIntentId) return;
    const owner = identity.current;
    const checked = await cancelProCheckout(payment.paymentIntentId);
    const fresh = await getSubscription();
    if (!owner?.signal.aborted) { setState(value => ({ ...value, data: fresh, payment: checked })); setOpened(false); setReview(null); }
  });
  const endMembership = () => action('cancel-membership', async () => {
    const owner = identity.current; const fresh = await cancelPro();
    if (!owner?.signal.aborted) { setState(value => ({ ...value, data: fresh })); setCancelDialog(false); }
  });
  const checkoutUrl = payment?.paymentStatus === 'PENDING' ? safeSubscriptionCheckout(payment.redirectUrl) : null;
  const paid = payment?.paymentStatus === 'SUCCEEDED';
  const terminal = payment && !['PENDING', 'SUCCEEDED'].includes(payment.paymentStatus);
  const disabled = Boolean(busy);

  return <div className={`${styles.page} ${styles.providerPage}`} data-theme={isDark ? 'dark' : 'light'}>
    {error && <div className={styles.error} role="alert"><span>{error}</span><button type="button" className={styles.button} onClick={() => setRevision(value => value + 1)} disabled={disabled}>Try again</button></div>}
    {!data ? !error && <SubscriptionSkeleton /> : <>
      <section className={`${styles.membership} ${!data.marketplaceAccess ? styles.expired : ''}`} aria-label="Current membership">
        <div className={styles.membershipHeading}><div><span>Current provider plan</span><h2>{planName(data.plan)} <small>{data.plan === 'FREE' ? '30-day trial' : `${money.format(data.monthlyPrice)}/month`}</small></h2></div>
          <strong className={styles.status}>{!data.marketplaceAccess ? 'Expired' : data.plan === 'FREE' ? `${data.daysRemaining} days left` : data.subscriptionStatus === 'CANCELLED' ? 'Ends at expiry' : 'Active'}</strong></div>
        <dl className={styles.membershipFacts}><div><dt>Started</dt><dd>{date(data.startsAt)}</dd></div><div><dt>{data.marketplaceAccess ? 'Ends' : 'Expired'}</dt><dd>{date(data.expiresAt)}</dd></div><div><dt>GCash fee</dt><dd>{data.commissionRateBps / 100}%</dd></div><div><dt>Active listings</dt><dd>{data.activeListings} / {data.activeListingLimit ?? 'Unlimited'}</dd></div></dl>
        {!data.marketplaceAccess ? <p>Existing bookings remain available. Choose Basic or Pro to accept new customers.</p> : data.plan === 'FREE' ? <p>Choose Basic or Pro when your Free period ends. No automatic charges.</p> : <div className={styles.membershipFoot}><p>{paid ? 'Payment confirmed. ' : ''}Renew manually after expiry. Existing bookings remain available.</p>{data.subscriptionStatus !== 'CANCELLED' && <button className={styles.textButton} type="button" onClick={() => setCancelDialog(true)} disabled={disabled}>Cancel membership</button>}</div>}
      </section>
      {payment?.paymentStatus === 'PENDING' ? <section className={styles.checkout} aria-labelledby="subscription-payment-heading">
        <h1 id="subscription-payment-heading">{opened ? 'Waiting for payment' : 'Your GCash checkout is ready'}</h1>
        <p className={styles.muted}>ServiceHub {planName(payment.plan)}{payment.billingAction === 'UPGRADE' ? ' upgrade' : ' membership'}</p>
        <dl><dt>Total</dt><dd>{money.format(payment.amount)}</dd></dl>
        {payment.isTestMode && <p className={styles.notice}><strong>Test Mode.</strong> No real money is transferred.</p>}
        {checkoutUrl ? <a className={`${styles.button} ${styles.primary}`} href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpened(true)}><GCashLogo />{opened ? 'Reopen GCash' : 'Continue to GCash'}</a>
          : <button className={`${styles.button} ${styles.primary}`} type="button" disabled={disabled} onClick={() => void start()}>{busy === 'checkout' ? 'Preparing checkout...' : 'Retry checkout'}</button>}
        <div className={styles.actions}><button className={styles.button} type="button" disabled={disabled} onClick={() => void action('check', refreshPayment)}><RefreshCw size={16} aria-hidden="true" />{busy === 'check' ? 'Checking...' : 'Check payment'}</button><button className={styles.button} type="button" onClick={() => void cancelCheckout()} disabled={disabled}>Cancel checkout</button></div>
      </section> : review ? <section className={styles.checkout} aria-labelledby="subscription-review-heading">
        <button className={styles.textButton} type="button" onClick={() => setReview(null)} disabled={disabled}><ArrowLeft size={16} aria-hidden="true" />Back to plans</button>
        <h1 id="subscription-review-heading" className={styles.reviewTitle}>{review.billingAction === 'UPGRADE' ? 'Upgrade to' : 'ServiceHub'} {planName(review.plan)}</h1>
        <p className={styles.muted}>{money.format(review.monthlyPrice)}/month</p>
        <ul>{(review.plan === 'BASIC' ? ['Up to 3 active listings', 'Full provider analytics', '8% GCash fee'] : ['Unlimited active listings', 'Full provider analytics', '5% GCash fee', 'Priority for featured placement']).map(item => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul>
        <dl><dt>{review.billingAction === 'UPGRADE' ? 'Prorated upgrade' : 'Total today'}</dt><dd>{money.format(review.amount)}</dd></dl>
        <p className={styles.muted}>{review.periodExpiresAt ? `The price difference covers the rest of your paid month. Your expiry stays ${date(review.periodExpiresAt)}.` : 'One calendar month from confirmed payment. Renew manually. No automatic charges.'}</p>
        {review.listingsToPause > 0 && <p className={styles.notice}>Your 3 oldest published active listings will stay active. {review.listingsToPause} additional {review.listingsToPause === 1 ? 'listing will' : 'listings will'} be paused. Your data and existing bookings are preserved.</p>}
        {data.isTestMode && <p className={styles.notice}><strong>Test Mode.</strong> No real money is transferred.</p>}
        <button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => void start()} disabled={disabled}>{busy === 'checkout' ? 'Preparing checkout...' : 'Continue to payment'}</button>
      </section> : <Pricing membership={data} disabled={disabled} onChoose={plan => void choosePlan(plan)} />}
      {terminal && <div className={payment.paymentStatus === 'CANCELLED' ? styles.notice : styles.error} role="status"><div><strong>{subscriptionPaymentLabels[payment.paymentStatus]}</strong><p>{payment.paymentStatus === 'REFUNDED' ? 'This payment was reversed. Your membership was not changed.' : payment.paymentStatus === 'REFUND_REQUIRED' ? 'This payment needs a refund. Your membership was not changed. Contact support if it remains pending.' : 'Your membership was not changed. You can choose a plan again when ready.'}</p></div></div>}
      <section className={styles.history} aria-labelledby="subscription-history-heading"><h2 id="subscription-history-heading">Payment history</h2>
        {!data.payments.length ? <p className={styles.muted}>No membership payments yet.</p> : <div className={styles.tableWrap}><table className={styles.table}><caption className="sr-only">Your provider membership payments</caption><thead><tr><th>Plan</th><th>Amount</th><th>Status</th><th>Period</th><th>Reference</th></tr></thead><tbody>{data.payments.map(item => <tr key={item.id}><td>{planName(item.plan)}<small>{item.isTestMode ? 'Test Mode' : 'GCash'}</small></td><td>{money.format(item.amount)}</td><td>{subscriptionPaymentLabels[item.paymentStatus]}</td><td>{date(item.subscriptionStartedAt)}<small>{item.subscriptionExpiresAt ? `Until ${date(item.subscriptionExpiresAt)}` : 'Not activated'}</small></td><td>{item.paymentReference || 'Pending'}<small>{date(item.createdAt)}</small></td></tr>)}</tbody></table></div>}
      </section>
      <ConfirmModal state={cancelDialog ? { isOpen: true, title: 'Cancel membership?', message: `Your paid access stays available until ${date(data.expiresAt)}. After expiry, new provider activity pauses until you renew. Existing bookings remain available.`, confirmText: 'Cancel membership', cancelText: 'Keep membership', variant: 'danger', isLoading: busy === 'cancel-membership', onConfirm: () => void endMembership() } : null} onClose={() => { if (!busy) setCancelDialog(false); }} />
    </>}
  </div>;
}
