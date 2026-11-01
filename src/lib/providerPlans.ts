import type { ProviderPlan } from '../api/subscriptions.api';

/** Public pricing and the account comparison share the same plan copy. */
export const providerPlans = [
  { id: 'FREE', name: 'Free', price: 0, duration: '30 days', fee: 10,
    description: 'Try ServiceHub before committing.',
    features: ['1 active service listing', 'Basic analytics', 'Cash and GCash', 'Bookings, offers and messaging'],
    action: 'Start Free' },
  { id: 'BASIC', name: 'Basic', price: 99, duration: 'month', fee: 8,
    description: 'For independent service providers.',
    features: ['Up to 3 active listings', 'Full analytics', 'Cash and GCash', 'Continued marketplace access'],
    action: 'Choose Basic' },
  { id: 'PRO', name: 'Pro', price: 199, duration: 'month', fee: 5,
    description: 'For growing service businesses.',
    features: ['Unlimited active listings', 'Full analytics', 'Cash and GCash', 'Priority for featured placement'],
    action: 'Choose Pro' },
] as const satisfies readonly { id: ProviderPlan; name: string; price: number; duration: string; fee: number; description: string; features: readonly string[]; action: string }[];
export const planName = (plan: ProviderPlan) => providerPlans.find(item => item.id === plan)!.name;
export const membershipDate = (value: string | null) => value ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : 'Not started';
