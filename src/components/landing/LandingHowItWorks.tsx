import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Clock,
  Check,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface LandingHowItWorksProps {
  isDark: boolean;
}

export default function LandingHowItWorks({ isDark }: LandingHowItWorksProps) {
  const [activeRole, setActiveRole] = useState<'seeker' | 'provider'>('seeker');
  const [activeStep, setActiveStep] = useState<number>(0);

  const seekerSteps = [
    {
      title: "Verify you're a Cordova resident",
      desc: "Sign up and upload a valid ID or proof of residency. Once approved, you unlock booking and posting.",
      icon: ShieldCheck,
      badge: "Onboarding & Trust",
      visual: (isDark: boolean) => (
        <div className={`p-4 rounded-xl border flex flex-col items-center w-full max-w-[200px] text-center space-y-2 transition-colors duration-300 ${
          isDark ? 'bg-neutral-850 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <ShieldCheck size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black tracking-wider uppercase text-seeker-primary">Resident ID</p>
            <p className="text-[10px] font-bold leading-none">Lando Cordova</p>
            <span className="inline-flex items-center text-[7.5px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full mt-1">
              ✓ VERIFIED RESIDENT
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Find a provider, two ways",
      desc: "Browse available local services and book directly at their listed price — or post what you need with your budget and let interested providers send you their offers.",
      icon: Users,
      badge: "Flexibility & Search",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-2 text-[10px] transition-colors duration-300 ${
          isDark ? 'bg-neutral-850 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className={`p-1.5 rounded-lg flex items-center space-x-1.5 border text-[9px] font-semibold ${
            isDark ? 'bg-neutral-855 border-neutral-855 text-neutral-450' : 'bg-white border-slate-200 text-slate-400'
          }`}>
            <Users size={9} className="text-seeker-primary" />
            <span>Search plumber, tutor...</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-seeker-primary text-white">Plumbing</span>
            <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded ${
              isDark ? 'bg-neutral-855 text-neutral-450' : 'bg-slate-200 text-slate-500'
            }`}>Cleaning</span>
          </div>
        </div>
      )
    },
    {
      title: "Pay securely with GCash, or choose cash",
      desc: "Pay online via GCash to lock in a fair queue spot, with your payment safely held in escrow until the job is done — or choose cash and arrange the visit directly with the provider.",
      icon: Lock,
      badge: "Escrow & Safety",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-1.5 text-center items-center transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
            <Lock size={14} />
          </div>
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">Escrow Active</p>
          <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-neutral-850' : 'bg-slate-200'}`}>
            <div className="bg-emerald-500 h-full w-[80%]" />
          </div>
          <p className="text-[8px] font-bold text-slate-400">Held safely in GCash</p>
        </div>
      )
    },
    {
      title: "Track your spot in line",
      desc: "If the provider is busy, see exactly where you stand in the queue and your estimated wait time — updated automatically.",
      icon: Clock,
      badge: "Live Queue",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-1.5 text-center items-center transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="p-2 rounded-full bg-orange-500/10 text-orange-500 animate-pulse">
            <Clock size={14} />
          </div>
          <p className="text-[8px] font-black text-seeker-primary uppercase tracking-wider">Live Queue Spot</p>
          <span className="text-lg font-black leading-none">#2</span>
          <p className="text-[8px] font-bold text-slate-400">Wait: ~15 mins</p>
        </div>
      )
    },
    {
      title: "Confirm the job, then it's done",
      desc: "Once the service is finished, confirm it's complete to release payment — or report an issue if something went wrong.",
      icon: Check,
      badge: "Disbursement",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-1.5 text-center items-center transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <Check size={14} />
          </div>
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">Released Payout</p>
          <div className="flex space-x-0.5 text-amber-500">
            <Star size={8} className="fill-amber-500 text-amber-500" />
            <Star size={8} className="fill-amber-500 text-amber-500" />
            <Star size={8} className="fill-amber-500 text-amber-500" />
            <Star size={8} className="fill-amber-500 text-amber-500" />
            <Star size={8} className="fill-amber-500 text-amber-500" />
          </div>
        </div>
      )
    }
  ];

  const providerSteps = [
    {
      title: "Get verified",
      desc: "Confirm you're a Cordova resident so seekers can trust your listing the moment they see it.",
      icon: ShieldCheck,
      badge: "Verification Badge",
      visual: (isDark: boolean) => (
        <div className={`p-4 rounded-xl border flex flex-col w-full max-w-[200px] space-y-1.5 text-center items-center transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
            <ShieldCheck size={14} />
          </div>
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">Provider Badge</p>
          <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600">✓ ADMIN APPROVED</span>
        </div>
      )
    },
    {
      title: "List your service",
      desc: "Set your price, how long each job takes, how many people you can queue at once, and which payments you accept.",
      icon: Users,
      badge: "Configure Offer",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-1.5 text-left transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <p className="text-[8px] font-black text-provider-primary uppercase">Service Config</p>
          <h5 className="font-extrabold text-[10px] leading-none">Appliance Repair</h5>
          <p className="text-[8.5px] font-semibold mt-1">Rate: ₱300 / hr</p>
          <p className="text-[8.5px] font-semibold">Max Queue: 3 clients</p>
        </div>
      )
    },
    {
      title: "Get reviewed before you go live",
      desc: "Every new listing is checked by an admin before it appears to seekers — so the marketplace stays clean and trustworthy for everyone.",
      icon: Eye,
      badge: "Marketplace Quality",
      visual: (isDark: boolean) => (
        <div className={`p-4 rounded-xl border flex flex-col w-full max-w-[200px] space-y-2 text-center items-center transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
            <Eye size={14} />
          </div>
          <p className="text-[8px] font-black text-amber-500 uppercase tracking-wider">Admin Review</p>
          <span className="text-[7.5px] font-black text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
            ⌛ PENDING REVIEW
          </span>
        </div>
      )
    },
    {
      title: "Take direct bookings or send offers",
      desc: "Accept seekers who book you directly, or browse posted requests and send your own offer with your price and availability.",
      icon: Clock,
      badge: "Interactive Bookings",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-2 text-[10px] transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <p className="text-[8px] font-black text-provider-primary uppercase">New Request</p>
          <div className={`p-1.5 rounded border text-[8px] font-semibold ${
            isDark ? 'bg-neutral-855 border-neutral-855 text-neutral-450' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <p className="font-extrabold text-[8.5px]">Direct Hire</p>
            <p>Customer: Ana S.</p>
          </div>
          <div className="flex space-x-1 justify-end">
            <button className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold text-[7px] cursor-pointer">Accept</button>
            <button className={`px-1.5 py-0.5 rounded border text-neutral-450 font-extrabold text-[7px] cursor-pointer ${
              isDark ? 'border-neutral-855' : 'border-slate-300'
            }`}>Decline</button>
          </div>
        </div>
      )
    },
    {
      title: "Get paid, safely",
      desc: "Online payments are held securely until the seeker confirms the job is done — then released straight to your wallet.",
      icon: Lock,
      badge: "Protected Earnings",
      visual: (isDark: boolean) => (
        <div className={`p-3 rounded-xl border flex flex-col w-full max-w-[200px] space-y-1.5 text-center items-center transition-colors duration-300 ${
          isDark ? 'bg-neutral-855 border-neutral-855' : 'bg-slate-100/85 border-slate-200'
        }`}>
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
            <Lock size={14} />
          </div>
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">Released Payout</p>
          <span className="text-xs font-black text-emerald-500">+₱700.00</span>
          <p className="text-[7.5px] font-semibold text-slate-400">GCash payout processed</p>
        </div>
      )
    }
  ];

  const currentSteps = activeRole === 'seeker' ? seekerSteps : providerSteps;

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % currentSteps.length);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev - 1 + currentSteps.length) % currentSteps.length);
  };

  const handleRoleChange = (role: 'seeker' | 'provider') => {
    setActiveRole(role);
    setActiveStep(0);
  };

  return (
    <section id="how-it-works" className="py-20 px-6 md:px-12 w-full scroll-mt-20 relative">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 glow-bubble-green -z-10 opacity-30 animate-pulse-glow" />

      <div className="max-w-6xl mx-auto space-y-12">
        <ScrollReveal className="text-center space-y-3">
          <span className="text-[10px] font-bold text-seeker-primary uppercase tracking-widest block font-sans">Interactive Guide</span>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-[#f2efe9]' : 'text-slate-900'
          }`}>How ServiceHub works</h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDark ? 'text-[#b4b0a9]' : 'text-slate-500'
          }`}>
            Select your role below and click through the steps to see the complete automated workflow.
          </p>

          {/* iOS style segmented role control switch */}
          <div className={`inline-flex p-1 rounded-2xl border border-slate-300/30 shadow-inner relative max-w-[340px] w-full ${
            isDark ? 'bg-neutral-850/80' : 'bg-slate-200/60'
          }`}>
            <button
              onClick={() => handleRoleChange('seeker')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer ${
                activeRole === 'seeker'
                  ? 'bg-seeker-primary text-white shadow-sm'
                  : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              I need a service (Seeker)
            </button>
            <button
              onClick={() => handleRoleChange('provider')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer ${
                activeRole === 'provider'
                  ? 'bg-provider-primary text-white shadow-sm'
                  : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              I want to offer a service
            </button>
          </div>
        </ScrollReveal>

        {/* Steps Horizontal Navigation Selector Buttons */}
        <ScrollReveal className="flex justify-between items-center relative max-w-2xl mx-auto py-4">
          <div className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 -z-10 ${
            isDark ? 'bg-neutral-850' : 'bg-slate-200'
          }`} />
          {currentSteps.map((_, idx) => {
            const isActive = idx === activeStep;
            const isPassed = idx < activeStep;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-9 h-9 rounded-full font-black text-xs border-2 flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer z-10 ${
                  isActive
                    ? activeRole === 'seeker'
                      ? 'bg-[#fbfaf7] text-seeker-primary border-seeker-primary scale-110 shadow-md shadow-orange-500/10'
                      : 'bg-[#fbfaf7] text-provider-primary border-provider-primary scale-110 shadow-md shadow-emerald-500/10'
                    : isPassed
                      ? activeRole === 'seeker'
                        ? 'bg-seeker-primary border-seeker-primary text-white'
                        : 'bg-provider-primary border-provider-primary text-white'
                      : isDark
                        ? 'bg-[#2c2b27] border-neutral-855 text-neutral-500'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </ScrollReveal>

        {/* Horizontal Slide step card Carousel */}
        <ScrollReveal className="relative overflow-hidden w-full max-w-5xl mx-auto rounded-[28px]">
          {/* Left Prev Arrow Button */}
          <button
            onClick={handlePrevStep}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border backdrop-blur-md shadow-sm transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-neutral-850/90 hover:bg-neutral-855 border-neutral-855/50 text-neutral-300'
                : 'bg-white/90 hover:bg-slate-50 border-slate-200/50 text-slate-500 shadow-sm'
            }`}
            title="Previous Step"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Right Next Arrow Button */}
          <button
            onClick={handleNextStep}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border backdrop-blur-md shadow-sm transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-neutral-850/90 hover:bg-neutral-855 border-neutral-855/50 text-neutral-300'
                : 'bg-white/90 hover:bg-slate-50 border-slate-200/50 text-slate-500 shadow-sm'
            }`}
            title="Next Step"
          >
            <ChevronRight size={18} />
          </button>

          {/* Carousel track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeStep * 100}%)` }}
          >
            {currentSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="w-full shrink-0 px-1 py-1">
                  <div className={`p-8 rounded-[28px] border backdrop-blur-xl shadow-lg min-h-[360px] flex flex-col justify-between transition-all duration-500 ${
                    isDark
                      ? 'bg-[#1f1e1a]/30 border-[#33322e]/45 shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
                      : 'bg-white/40 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
                          activeRole === 'seeker'
                            ? 'text-seeker-primary bg-orange-500/10 border-orange-500/20'
                            : 'text-provider-primary bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          {step.badge}
                        </span>
                        <span className={`text-3xl font-black opacity-10 tracking-tight ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          0{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                        {/* Detail text details */}
                        <div className="md:col-span-7 flex space-x-4 items-start text-left">
                          <div className={`p-3 rounded-2xl shadow-inner mt-1 ${
                            activeRole === 'seeker'
                              ? isDark
                                ? 'bg-orange-950/20 border border-orange-900/30 text-orange-400'
                                : 'bg-orange-55 border border-orange-100 text-orange-600'
                              : isDark
                                ? 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-450'
                                : 'bg-emerald-55 border border-emerald-100 text-emerald-700'
                          }`}>
                            <StepIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg tracking-tight text-slate-950 dark:text-[#f2efe9]">{step.title}</h3>
                            <p className={`text-sm md:text-base mt-3 leading-relaxed font-medium ${
                              isDark ? 'text-[#b4b0a9]' : 'text-slate-600'
                            }`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>

                        {/* Visual Demonstration: Step-Specific CSS Widget */}
                        <div className="md:col-span-5 flex justify-center items-center">
                          <div className="w-full flex justify-center items-center">
                            {step.visual(isDark)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bullet tracker dots */}
                    <div className="flex justify-center space-x-1.5 pt-6">
                      {currentSteps.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveStep(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            i === activeStep
                              ? activeRole === 'seeker' ? 'w-5 bg-seeker-primary' : 'w-5 bg-provider-primary'
                              : isDark ? 'w-1.5 bg-neutral-855 hover:bg-neutral-500' : 'w-1.5 bg-slate-200 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
