import React from 'react';
import {
  Check,
  Clock,
  Play,
  ClipboardText as FileCheck2,
  CheckCircle as CheckCircle2,
  Warning as AlertTriangle,
  XCircle,
} from '@phosphor-icons/react';

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
  completedSublabel?: string;
  compact?: boolean;
  isOnline?: boolean;
  started?: boolean;
  closedLabel?: string;
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
  completedSublabel = 'Paid',
  compact = false,
  isOnline = false,
  started,
  closedLabel = 'Canceled',
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
      label: queuePosition
        ? queuePosition === 1
          ? role === 'provider' ? 'Ready to Start' : 'First in Queue'
          : 'In Queue'
        : 'Confirmed',
      sublabel: queuePosition
        ? queuePosition === 1
          ? role === 'provider' ? 'Start when ready' : 'Waiting for provider'
          : `Position #${queuePosition}`
        : 'Scheduled',
      icon: queuePosition ? Clock : Check,
    },
    {
      id: 3,
      label: 'In Progress',
      sublabel: 'On-site Work',
      icon: Play,
    },
    {
      id: 4,
      label: 'Confirmation',
      sublabel: 'Seeker decision',
      icon: FileCheck2,
    },
    {
      id: 5,
      label: 'Completed',
      sublabel: completedSublabel,
      icon: CheckCircle2,
    },
  ];

  // A terminal cancellation stops the journey; do not show a future Completed step.
  if (isCanceled) {
    return <div className={`flex w-full items-center gap-2 rounded-2xl border border-stone-300 bg-stone-50 p-3.5 text-sm text-ink-secondary dark:border-neutral-700 dark:bg-charcoal/40 dark:text-ink ${className}`}>
      <XCircle className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
      <span className="font-semibold">Booking {closedLabel}</span>
      <span className="ml-auto text-xs text-ink-muted">Ended without completion</span>
    </div>;
  }

  if (compact) {
    const journeyStep = normStatus === 'in_progress' && started === false ? 2 : currentStep;
    const journeySteps = ['Booked', isOnline ? 'In Queue' : 'Accepted', 'In Progress', 'Confirmation', 'Completed'];
    return (
      <div className={`border-t pt-3 ${isDark ? 'border-neutral-800' : 'border-stone-200'} ${className}`}>
        <div className="mb-2 flex justify-end">
          <span className={`text-[10px] font-medium ${isDark ? 'text-ink-subtle' : 'text-ink-muted'}`}>
            {isCanceled ? 'Stopped' : isDisputed ? 'Paused for review' : `Step ${journeyStep} of 5`}
          </span>
        </div>
        <ol aria-label="Booking journey" className="grid grid-cols-1 gap-1 sm:grid-cols-5">
          {journeySteps.map((label, index) => {
            const step = index + 1;
            const reached = !isCanceled && step <= journeyStep;
            const current = !isCanceled && !isDisputed && step === journeyStep;
            return (
              <li key={label} className="flex min-w-0 items-center gap-3 py-1 text-left sm:block sm:py-0 sm:text-center">
                <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold sm:mx-auto ${
                  reached
                    ? role === 'provider' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-orange-600 bg-orange-600 text-white'
                    : isDark ? 'border-neutral-700 bg-charcoal text-ink-subtle' : 'border-stone-300 bg-white text-ink-muted'
                } ${current ? 'ring-2 ring-offset-1 ring-current/20' : ''}`}>
                  {step < journeyStep && !isDisputed ? <Check className="h-3 w-3" /> : step}
                </span>
                <span className={`block min-w-0 text-xs font-semibold leading-tight sm:mt-1 sm:text-[10px] ${
                  current ? role === 'provider' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'
                    : isDark ? 'text-ink-subtle' : 'text-ink-muted'
                }`}>{label}</span>
              </li>
            );
          })}
        </ol>
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
          ? 'bg-charcoal/80 border-neutral-800/80 shadow-inner'
          : 'bg-slate-50/80 border-slate-200/80'
      } ${className}`}
    >
      <div className="relative flex items-center justify-between w-full">
        {/* Background Connecting Track */}
        <div
          className={`absolute top-3.5 left-3 right-3 h-[2.5px] -translate-y-1/2 z-0 rounded-full transition-colors ${
            isDark ? 'bg-charcoal' : 'bg-slate-200'
          }`}
        />

        {/* Dynamic Glowing Filled Progress Track */}
        <div
          className={`absolute top-3.5 left-3 h-[2.5px] -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-out ${
            role === 'provider'
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              : 'bg-orange-500 shadow-[0_0_8px_rgba(217,119,87,0.4)]'
          }`}
          style={{ width: `calc(${progressPercent}% * 0.94)` }}
        />

        {/* Step Nodes */}
        {steps.map((step) => {
          const isPassed = currentStep > step.id;
          const isCurrent = currentStep === step.id;
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
                      ? `${accentBg} ${accentBorder} text-white`
                      : isCurrent
                      ? `${accentBg} ${accentBorder} text-white ring-4 ${accentPulse} scale-110 shadow-md`
                      : isDark
                      ? 'bg-charcoal-surface border-neutral-700 text-ink-muted'
                      : 'bg-white border-slate-300 text-ink-subtle'
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
                      ? `${accentText} font-black`
                      : isPassed
                      ? isDark
                        ? 'text-neutral-300'
                        : 'text-ink-secondary'
                      : isDark
                      ? 'text-ink-muted'
                      : 'text-ink-subtle'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`hidden sm:block text-[9px] font-medium leading-none mt-0.5 ${
                    isCurrent
                      ? isDark
                        ? 'text-ink-subtle'
                        : 'text-ink-muted'
                      : isDark
                      ? 'text-ink-muted'
                      : 'text-ink-subtle'
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
