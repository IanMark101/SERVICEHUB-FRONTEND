import React, { ReactNode } from 'react';
import { Tray as Inbox } from '@phosphor-icons/react';

interface EmptyStateProps {
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  actionClassName?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  accentColor?: 'orange' | 'emerald' | 'blue' | 'purple' | 'slate';
  children?: ReactNode;
}

export default function EmptyState({
  className = '',
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionClassName = '',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  accentColor = 'orange',
  children,
}: EmptyStateProps) {
  const colorSchemes = {
    orange: {
      iconBg: 'bg-orange-500/10 text-brand-text dark:text-orange-400 border-orange-500/20 shadow-orange-500/10',
      btn: 'bg-orange-700 hover:bg-orange-800 text-white shadow-orange-500/20',
      glow: 'from-orange-500/5 via-transparent to-transparent',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
      btn: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-500/20',
      glow: 'from-emerald-500/5 via-transparent to-transparent',
    },
    blue: {
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/10',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
      glow: 'from-blue-500/5 via-transparent to-transparent',
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/10',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20',
      glow: 'from-purple-500/5 via-transparent to-transparent',
    },
    slate: {
      iconBg: 'bg-slate-500/10 dark:bg-charcoal text-ink-muted dark:text-ink-muted border-slate-500/20 shadow-slate-500/10',
      btn: 'bg-charcoal hover:bg-charcoal dark:bg-charcoal dark:hover:bg-charcoal text-white shadow-slate-500/20',
      glow: 'from-slate-500/5 dark:from-charcoal via-transparent to-transparent',
    },
  };

  const scheme = colorSchemes[accentColor] || colorSchemes.orange;

  return (
    <div className={`workspace-surface relative overflow-hidden rounded-[24px] border border-slate-200/90 dark:border-neutral-800/80 bg-white/70 dark:bg-charcoal-surface/70 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm transition-all duration-200 ${className}`}>
      {/* Background ambient radial glow */}
      <div className={`absolute inset-0 bg-radial-gradient ${scheme.glow} pointer-events-none opacity-60`} />

      {/* Themed Icon with subtle double ring glow */}
      <div className={`relative z-10 w-16 h-16 rounded-2xl border flex items-center justify-center transition-transform duration-200 hover:scale-[1.03] ${scheme.iconBg}`}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Text block */}
      <div className="relative z-10 max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-ink dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel || children) && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="min-h-11 whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 hover:bg-slate-100 dark:bg-charcoal/60 dark:hover:bg-charcoal text-ink-secondary dark:text-ink transition-all duration-150 active:scale-95 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--workspace-focus,var(--text-primary))]"
            >
              {secondaryActionLabel}
            </button>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`min-h-11 whitespace-nowrap px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--workspace-focus,var(--text-primary))] ${scheme.btn} ${actionClassName}`}
            >
              <span>{actionLabel}</span>
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
