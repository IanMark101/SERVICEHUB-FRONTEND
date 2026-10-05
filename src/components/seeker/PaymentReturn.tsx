'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { apiConfirmOnlineBooking, apiInitiatePayment } from '../../api/bookings.api';
import { useApp } from '../../context/AppContext';
import { getServicePaymentMethods } from '../../lib/paymentUtils';
import {
  clearGcashCheckout,
  isPayMongoCheckoutUrl,
  paymentReturnPath,
  readGcashCheckout,
  rememberGcashCheckout,
  type PendingGcashCheckout,
} from '../../lib/paymentCheckout';

type Phase = 'checking' | 'pending' | 'succeeded' | 'failed' | 'expired' | 'review' | 'unavailable';

export default function PaymentReturn({ paymentIntentId }: { paymentIntentId: string | null }) {
  const router = useRouter();
  const { user, services } = useApp();
  const [checkout, setCheckout] = useState<PendingGcashCheckout | null>(null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [checkVersion, setCheckVersion] = useState(0);

  useEffect(() => {
    if (!user?.id || !paymentIntentId) return;
    const stored = readGcashCheckout(user.id, paymentIntentId);
    const setupTimer = window.setTimeout(() => setCheckout(stored), 0);
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
        const status = result.data?.status;
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
    void check();
    return () => {
      active = false;
      clearTimeout(setupTimer);
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', checkOnReturn);
    };
  }, [user?.id, paymentIntentId, checkVersion]);

  const service = services.find((entry) => entry.id === checkout?.serviceId);
  const cashAvailable = checkout?.offerId ? true : service ? getServicePaymentMethods(service).cash : false;
  const cashHref = checkout?.offerId
    ? '/seeker/incoming-offers'
    : checkout?.serviceId ? `/seeker/seek-services?serviceId=${encodeURIComponent(checkout.serviceId)}` : '/seeker/seek-services';
  const providerUrl = isPayMongoCheckoutUrl(checkout?.redirectUrl) ? checkout.redirectUrl : null;
  const failed = phase === 'failed' || phase === 'expired';

  const tryAgain = async () => {
    if (!checkout || !paymentIntentId || retrying) return;
    setRetrying(true);
    setRetryError('');
    try {
      const result = await apiInitiatePayment({
        serviceId: checkout.serviceId,
        offerId: checkout.offerId,
        paymentMethodType: 'gcash',
      });
      const nextIntentId = result.data?.paymentIntentId;
      if (!nextIntentId || nextIntentId === paymentIntentId) {
        setRetryError('The previous attempt is still being checked. Check its status before paying again.');
        setCheckVersion((value) => value + 1);
        return;
      }
      rememberGcashCheckout({ ...checkout, paymentIntentId: nextIntentId, redirectUrl: result.data.redirectUrl });
      router.replace(paymentReturnPath(nextIntentId));
    } catch {
      setRetryError('A new GCash attempt could not be started. Return to the service or offer and try again.');
    } finally {
      setRetrying(false);
    }
  };

  const title = !paymentIntentId ? 'No GCash payment to check'
    : phase === 'succeeded' ? 'GCash payment confirmed'
      : failed ? 'GCash payment was not completed'
        : phase === 'review' ? 'This payment needs review'
          : phase === 'unavailable' ? 'Payment status is temporarily unavailable'
            : providerUrl && phase !== 'checking' ? 'Complete your GCash payment'
              : 'Checking your GCash payment';
  const description = phase === 'succeeded'
    ? 'Your booking was created and added to the provider’s paid work queue.'
    : failed
      ? 'No booking was created and no payment was recorded as successful.'
      : phase === 'review'
        ? 'No booking was created. ServiceHub is checking the Test Mode payment and reversal record before another attempt.'
        : phase === 'unavailable'
          ? 'We cannot confirm the payment right now. Do not pay again until its status is known.'
          : !paymentIntentId
            ? 'Return to a service listing or offer to start a new payment.'
            : 'No booking or queue position exists until ServiceHub verifies a successful GCash payment.';

  return (
    <div className="mx-auto max-w-2xl py-5 sm:py-10">
      <section aria-live="polite" className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-[#22211e] sm:p-9">
        <div className="flex items-start gap-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${phase === 'succeeded' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' : failed ? 'bg-stone-100 text-ink-secondary dark:bg-neutral-800 dark:text-ink' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'}`}>
            {phase === 'succeeded' ? <CheckCircle size={25} aria-hidden="true" /> : failed || phase === 'review' || !paymentIntentId ? <WarningCircle size={25} aria-hidden="true" /> : <CircleNotch size={25} aria-hidden="true" className={phase === 'checking' ? 'animate-spin' : ''} />}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-ink dark:text-ink sm:text-2xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-ink">{description}</p>
          </div>
        </div>

        <div className="mt-7 border-t border-stone-200 pt-6 dark:border-neutral-700">
          <p className="text-sm font-semibold text-ink dark:text-ink">GCash via PayMongo Test Mode</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted dark:text-ink-secondary">
            {phase === 'succeeded'
              ? 'ServiceHub verified the payment. If PayMongo is still open in another tab, you can close it.'
              : failed
                ? 'This attempt cannot be reused. If PayMongo is still open in another tab, you can close it and start a fresh attempt here.'
                : phase === 'review'
                  ? 'ServiceHub is reviewing this payment attempt. Do not start another payment until the result is resolved.'
                  : paymentIntentId
                    ? 'PayMongo opens in another tab. Finish the test payment there; both ServiceHub tabs check the same attempt. If PayMongo stays open, return here and select Check payment status.'
                    : 'Start a new GCash payment from a service listing or offer.'}
          </p>
        </div>

        {retryError && <p role="alert" className="mt-5 text-sm font-medium text-red-700 dark:text-red-400">{retryError}</p>}

        <div className="mt-7 flex flex-wrap gap-3">
          {phase === 'pending' && providerUrl && (
            <a href={providerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
              Open PayMongo Test Mode <ArrowRight size={17} aria-hidden="true" />
            </a>
          )}
          {failed && checkout && (
            <button type="button" onClick={() => { void tryAgain(); }} disabled={retrying} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-wait disabled:opacity-60">
              {retrying ? 'Starting a new attempt…' : 'Try GCash Again'}
            </button>
          )}
          {failed && cashAvailable && (
            <Link href={cashHref} className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-neutral-600 dark:text-ink dark:hover:bg-neutral-800">
              Choose On-site Cash
            </Link>
          )}
          {(phase === 'pending' || phase === 'unavailable') && paymentIntentId && (
            <button type="button" onClick={() => setCheckVersion((value) => value + 1)} className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-neutral-600 dark:text-ink dark:hover:bg-neutral-800">
              Check payment status
            </button>
          )}
          <Link href={phase === 'succeeded' ? '/seeker/seeker-activity' : cashHref} className="inline-flex min-h-11 items-center rounded-xl px-2 py-2.5 text-sm font-semibold text-orange-700 hover:text-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-orange-400">
            {phase === 'succeeded' ? 'View booking in Activity' : checkout ? checkout.offerId ? 'Back to Offers Received' : 'Back to service' : 'Browse services'}
          </Link>
        </div>
      </section>
    </div>
  );
}
