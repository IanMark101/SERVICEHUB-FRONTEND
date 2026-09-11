import { ClipboardCheck, MessageSquareText, Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingReviewsProps { isDark: boolean; }

export default function LandingReviews({ isDark }: LandingReviewsProps) {
  return (
    <section id="reviews" data-theme={isDark ? 'dark' : 'light'} className="scroll-mt-20 border-b border-stone-200 bg-stone-100/60 px-5 py-20 dark:border-white/10 dark:bg-[#1b1b18] sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><ScrollReveal><h2 className="font-serif text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">Reviews come after real service progress.</h2><p className="mt-5 text-base leading-7 text-slate-600 dark:text-stone-300">ServiceHub keeps reputation tied to completed bookings and visible trust history, so public claims reflect actual marketplace relationships.</p></ScrollReveal><ScrollReveal className="grid gap-3 sm:grid-cols-3">{[[ClipboardCheck, 'Complete', 'The booking reaches completed status.'], [MessageSquareText, 'Review', 'An eligible participant leaves service feedback.'], [Star, 'Reputation', 'Provider-facing ratings use completed-service reviews.']].map(([Icon, title, copy]) => { const C = Icon as typeof Star; return <div key={title as string} className="border-l-2 border-[#c86544] bg-white p-6 dark:bg-[#20201d]"><C size={19} className="text-[#c86544]" /><h3 className="mt-8 text-sm font-extrabold text-slate-950 dark:text-white">{title as string}</h3><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-stone-400">{copy as string}</p></div>; })}</ScrollReveal></div></section>
  );
}
