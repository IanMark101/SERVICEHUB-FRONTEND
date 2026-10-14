import { Flag } from '@phosphor-icons/react';

export default function ContentCaseTrigger({ variant = 'link', className = '', isDark = false, title: customTitle, label: actionText, onClick, disabled }: {
  variant?: 'link' | 'icon' | 'button'; className?: string; isDark?: boolean; title?: string; label: string; onClick?: () => void; disabled?: boolean;
}) {
  return (variant === 'icon' ? (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={customTitle || actionText}
        aria-label={customTitle || actionText}
        className={
          className ||
          `p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer select-none ${
            isDark
              ? 'text-neutral-500 hover:text-red-400 hover:bg-charcoal'
              : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
          }`
        }
      >
        <Flag className="w-3.5 h-3.5" weight="duotone" />
      </button>
    ) : (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={customTitle || actionText}
        className={
          className ||
          `rounded-lg px-2 py-1 text-xs font-semibold   focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isDark ? 'text-neutral-300' : 'text-ink-muted'
          }`
        }
      >
        {variant === 'button' && <Flag size={18} aria-hidden="true" />}{actionText}
      </button>
    ));
}
