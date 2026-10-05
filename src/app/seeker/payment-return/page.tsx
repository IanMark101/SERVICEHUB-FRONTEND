import PaymentReturn from '../../../components/seeker/PaymentReturn';
import { resolveReturnPaymentIntentId } from '../../../lib/paymentCheckout';

export default async function PaymentReturnPage({ searchParams }: {
  searchParams: Promise<{ payment_intent_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const paymentIntentId = resolveReturnPaymentIntentId(params.payment_intent_id);
  return <PaymentReturn paymentIntentId={paymentIntentId} />;
}
