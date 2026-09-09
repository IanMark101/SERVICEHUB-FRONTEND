import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingFaqProps {
  isDark: boolean;
}

export default function LandingFaq({ isDark }: LandingFaqProps) {
  const [openFaqs, setOpenFaqs] = useState<{ [key: number]: boolean }>({});

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      q: "I need a service. How do I actually find a provider?",
      a: (
        <div className="space-y-3">
          <p>There are two ways to find someone, and you can use either one:</p>
          <p><strong>Way 1 — You browse and pick.</strong> Go to Seek Services, filter by category (like Plumbing or Tutoring), and look at provider cards. Each card shows their trust score, price, and whether they&apos;re available right now or how many people are already waiting in their queue. Pick one and book them directly.</p>
          <p><strong>Way 2 — You post, they come to you.</strong> If you&apos;re not sure who to pick, post a request instead: describe the job, set your budget range, and wait. Interested providers will see your request and send you their own offer with their price and availability. You compare the offers that come in and accept whichever one fits best.</p>
          <p>Both ways lead into the same booking lifecycle, with either an online Test Mode checkout or a provider-approved cash arrangement.</p>
        </div>
      )
    },
    {
      q: "I offer a service. How do I find people who need help?",
      a: (
        <div className="space-y-3">
          <p>Same two-way structure, from your side:</p>
          <p><strong>Way 1 — Seekers come to you.</strong> Once your service listing is approved, it shows up when seekers browse your category. They book you directly, and the request lands in your Incoming Requests tab for you to accept or decline.</p>
          <p><strong>Way 2 — You go looking.</strong> Check Browse Jobs to see requests seekers have posted. If you see one you can do, send them an offer with your price and availability. If they accept, it moves straight into the booking and payment step — same as a direct booking.</p>
        </div>
      )
    },
    {
      q: "Once I accept a booking or an offer, where does it go? What happens next?",
      a: (
        <div className="space-y-3">
          <p>The moment a booking is accepted (either you booked a provider directly, or your offer got accepted), it doesn&apos;t disappear — it moves into a clear, trackable path:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Payment step</strong> — if it&apos;s an online payment, you pay now (see the payment question below). If it&apos;s cash, you confirm a direct arrangement instead — no payment screen needed.</li>
            <li><strong>Activity tab</strong> — every booking you make, no matter which path it came from, shows up in your Activity tab. This is your one place to check on anything in progress.</li>
            <li><strong>For confirmed online bookings</strong> — Activity shows your queue position and estimated wait. Cash bookings use direct coordination instead.</li>
            <li><strong>When the provider is ready</strong> — the provider starts the eligible booking, and Activity shows it as &quot;In Progress.&quot;</li>
            <li><strong>When the job is done</strong> — the provider marks it complete, and it moves to &quot;Awaiting Your Confirmation&quot; in your Activity tab. You confirm the work is good (which records completion in the internal ledger) or report a problem if it&apos;s not.</li>
            <li><strong>Completed</strong> — once confirmed, it&apos;s marked done, ServiceHub records the internal payment status as RELEASED, and you&apos;re invited to leave a review. This does not represent a real provider payout.</li>
          </ol>
          <p>Nothing happens silently — every stage of a booking is visible in Activity from the moment it&apos;s accepted to the moment it&apos;s finished.</p>
        </div>
      )
    },
    {
      q: "How does online payment actually work, step by step?",
      a: (
        <div className="space-y-3">
          <p>Here&apos;s the exact sequence when you choose an eligible GCash or Maya Test Mode checkout instead of cash:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>You confirm the booking details</strong> — the price, the schedule, and any message to the provider.</li>
            <li><strong>You&apos;re taken to PayMongo&apos;s payment screen</strong> and complete the selected Test Mode checkout.</li>
            <li><strong>You complete the payment</strong> through the secure checkout.</li>
            <li><strong>ServiceHub records an internal payment hold</strong> — PAID_HELD is a capstone workflow status, not a licensed escrow account.</li>
            <li><strong>You&apos;re placed into the queue</strong> only after the signed PayMongo webhook confirms payment. The provider still chooses when to start the first eligible booking.</li>
            <li><strong>The provider does the work</strong>, then marks it complete.</li>
            <li><strong>You confirm the job is done</strong> — ServiceHub then records RELEASED in its internal provider ledger.</li>
            <li><strong>If something&apos;s wrong instead of confirming</strong>, you report the issue. ServiceHub records the internal payment status as frozen until an admin reviews the case and records the outcome, including an eligible Test Mode reversal.</li>
          </ol>
          <p>This capstone uses PayMongo Test Mode and does not perform real provider payouts. Cash payments remain direct arrangements outside ServiceHub and never receive an online queue position.</p>
        </div>
      )
    },
    {
      q: "Why can't I get a queue spot if I pay cash?",
      a: (
        <p>A queue spot is a commitment — it tells everyone else in line &quot;this person has completed checkout.&quot; Online payment confirms that commitment. Cash has no equivalent advance confirmation, so cash bookings are arranged directly with the provider without occupying an online queue position.</p>
      )
    },
    {
      q: "What if I'm not happy with the service?",
      a: (
        <p>Once a job is marked complete, you don&apos;t have to accept it immediately. You can report an issue with a reason and description. An admin reviews the booking history, agreement, payment record, and conversation before recording an appropriate resolution.</p>
      )
    }
  ];

  return (
    <section id="faq" className="py-20 px-6 md:px-12 w-full scroll-mt-20">
      <div className="max-w-4xl mx-auto space-y-10">
        <ScrollReveal className="text-center space-y-3">
          <span className="text-[10px] font-bold text-seeker-primary uppercase tracking-widest block font-sans">Detailed Flow Walkthrough</span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'
            }`}>
            How everything actually works
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
            }`}>
            Click on a question below to read the complete mechanical breakdown.
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          {faqData.map((item, idx) => {
            const isOpen = !!openFaqs[idx];
            return (
              <ScrollReveal
                key={idx}
                className={`rounded-[16px] border backdrop-blur-xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md ${isDark ? 'bg-[#1f1e1a]/30 border-[#33322e]/45' : 'bg-white/40 border-white/20'
                  }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className={`w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm transition-colors duration-250 cursor-pointer ${isDark ? 'text-[#f2efe9] hover:bg-[#2c2a27]/30' : 'text-slate-950 hover:bg-slate-50/50'
                    }`}
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                    }`} />
                </button>

                {isOpen && (
                  <div className={`px-5 pb-5 pt-1 border-t text-xs leading-relaxed font-medium animate-in slide-in-from-top-1 fade-in duration-200 ${isDark ? 'border-t border-neutral-855 text-[#b4b0a9]' : 'border-t border-slate-100 text-slate-600'
                    }`}>
                    {item.a}
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
