import React from 'react';
import {
  Check,
  Clock,
  Play,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export type EngagementLifecycleStatus =
  | 'pending_provider'
  | 'queued'
  | 'in_progress'
  | 'awaiting_seeker_approval'
  | 'awaiting_approval'
  | 'completed'
  | 'disputed'
  | 'canceled'
  | string;

interface LifecycleStepperProps {
  status: EngagementLifecycleStatus;
  role?: 'seeker' | 'provider';
  queuePosition?: number;
  isDark?: boolean;
  className?: string;
}

interface StepConfig {
  id: number;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
}

export default function LifecycleStepper({
  status,
  role = 'seeker',
  queuePosition,
  isDark = true,
  className = '',
}: LifecycleStepperProps) {
  const normStatus = status?.toLowerCase();

  // Determine current step index (1-based)
  // 1: Booked/Pending, 2: Queued, 3: In Progress, 4: Awaiting Confirmation, 5: Completed
  let currentStep = 1;
  let isDisputed = false;
  let isCanceled = false;

  if (normStatus === 'completed') {
    currentStep = 5;
  } else if (
    normStatus === 'awaiting_seeker_approval' ||
    normStatus === 'awaiting_approval' ||
    normStatus === 'action_required'
  ) {
    currentStep = 4;
  } else if (normStatus === 'in_progress' || normStatus === 'active') {
    currentStep = 3;
  } else if (normStatus === 'queued' || normStatus === 'waiting') {
    currentStep = 2;
  } else if (normStatus === 'disputed') {
    isDisputed = true;
    currentStep = 3; // usually paused during progress
  } else if (normStatus === 'canceled') {
    isCanceled = true;
    currentStep = 1;
  } else {
    // 'pending_provider' or initial booking
    currentStep = 1;
  }

  // Accent color tokens
  const accentBorder = role === 'provider' ? 'border-emerald-500' : 'border-orange-500';
  const accentBg = role === 'provider' ? 'bg-emerald-600' : 'bg-orange-600';
  const accentText = role === 'provider' ? 'text-emerald-500' : 'text-orange-500';
  const accentPulse = role === 'provider' ? 'bg-emerald-500/20 ring-emerald-500/40' : 'bg-orange-500/20 ring-orange-500/40';

  const steps: StepConfig[] = [
    {
      id: 1,
      label: 'Booked',
      sublabel: 'Terms Set',
      icon: Check,
    },
    {
      id: 2,
      label: 'In Queue',
      sublabel: queuePosition ? `#${queuePosition} spot` : 'Positioned',
      icon: Clock,
    },
    {
      id: 3,
      label: 'In Progress',
      sublabel: 'On-site Work',
      icon: Play,
    },
    {
      id: 4,
      label: 'Review',
      sublabel: 'Confirmation',
      icon: FileCheck2,
    },
    {
      id: 5,
      label: 'Completed',
      sublabel: 'Escrow Paid',
      icon: CheckCircle2,
    },
  ];

  // Special view for Canceled
  if (isCanceled) {
    return (
      <div
        className={`w-full rounded-2xl p-3.5 border flex items-center justify-between text-xs transition-all ${
          isDark
            ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span className="font-bold text-slate-800 dark:text-neutral-200">
            Booking Canceled
          </span>
        </div>
        <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
          Inactive
        </span>
      </div>
    );
  }

  // Special view for Disputed
  if (isDisputed) {
    return (
      <div
        className={`w-full rounded-2xl p-3.5 border flex items-center justify-between text-xs transition-all ${
          isDark
            ? 'bg-red-950/20 border-red-900/40 text-red-300'
            : 'bg-red-50 border-red-200 text-red-700'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-xs block">
              Engagement Paused in Dispute
            </span>
            <span className="text-[10px] opacity-80">
              Awaiting mediation by ServiceHub Cordova administrators
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-500 px-2.5 py-1 rounded-lg border border-red-500/20">
          Under Review
        </span>
      </div>
    );
  }

  // Calculate percentage for progress line (0% to 100%)
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div
      className={`w-full rounded-2xl p-3.5 sm:p-4 border transition-all ${
        isDark
          ? 'bg-[#1a1916]/80 border-neutral-800/80 shadow-inner'
          : 'bg-slate-50/80 border-slate-200/80'
      } ${className}`}
    >
      <div className="relative flex items-center justify-between w-full">
        {/* Background Connecting Track */}
        <div
          className={`absolute top-3.5 left-3 right-3 h-[2.5px] -translate-y-1/2 z-0 rounded-full transition-colors ${
            isDark ? 'bg-neutral-800' : 'bg-slate-200'
          }`}
        />

        {/* Dynamic Glowing Filled Progress Track */}
        <div
          className={`absolute top-3.5 left-3 h-[2.5px] -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-out ${
            currentStep === 5
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : role === 'provider'
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              : 'bg-orange-500 shadow-[0_0_8px_rgba(217,119,87,0.4)]'
          }`}
          style={{ width: `calc(${progressPercent}% * 0.94)` }}
        />

        {/* Step Nodes */}
        {steps.map((step) => {
          const isPassed = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isFuture = currentStep < step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              {/* Node Circle */}
              <div className="relative flex items-center justify-center">
                {/* Active Pulsing Radar Ring */}
                {isCurrent && currentStep < 5 && (
                  <span
                    className={`absolute -inset-1.5 rounded-full animate-ping opacity-60 ${
                      role === 'provider' ? 'bg-emerald-400' : 'bg-orange-400'
                    }`}
                  />
                )}

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm border ${
                    isPassed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? currentStep === 5
                        ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-500/20 scale-110 shadow-md'
                        : `${accentBg} ${accentBorder} text-white ring-4 ${accentPulse} scale-110 shadow-md`
                      : isDark
                      ? 'bg-[#22211e] border-neutral-700 text-neutral-500'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <Icon className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-bold">{step.id}</span>
                  )}
                </div>
              </div>

              {/* Step Labels */}
              <div className="mt-2 text-center select-none">
                <span
                  className={`block text-[10px] sm:text-[11px] font-bold leading-tight transition-colors ${
                    isCurrent
                      ? currentStep === 5
                        ? 'text-emerald-500 font-black'
                        : `${accentText} font-black`
                      : isPassed
                      ? isDark
                        ? 'text-neutral-300'
                        : 'text-slate-700'
                      : isDark
                      ? 'text-neutral-500'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`hidden sm:block text-[9px] font-medium leading-none mt-0.5 ${
                    isCurrent
                      ? isDark
                        ? 'text-neutral-400'
                        : 'text-slate-600'
                      : isDark
                      ? 'text-neutral-600'
                      : 'text-slate-400'
                  }`}
                >
                  {step.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
