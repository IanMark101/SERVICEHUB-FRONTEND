import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, HelpCircle, ShieldAlert, CheckCircle2, X, Loader2 } from 'lucide-react';
import useDialogFocus from '../../hooks/useDialogFocus';
import './dialog.css';
import './feedback.css';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmModalProps {
  state: ConfirmModalState | null;
  onClose: () => void;
}

export default function ConfirmModal({ state, onClose }: ConfirmModalProps) {
  const { isDark, user } = useApp();
  const dialogRef = useDialogFocus(Boolean(state?.isOpen), Boolean(state?.isLoading), onClose);

  if (!state || !state.isOpen) return null;

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning',
    isLoading = false,
    onConfirm
  } = state;

  const handleConfirm = async () => {
    if (isLoading) return;
    await onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          iconBg: isDark ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-200',
          btn: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'info':
        return {
          icon: <HelpCircle className="w-6 h-6" />,
          iconBg: 'servicehub-dialog__feedback-icon',
          btn: 'text-white'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6" />,
          iconBg: 'servicehub-dialog__feedback-icon',
          btn: 'text-white'
        };
      case 'warning':
      default:
        return {
          icon: <ShieldAlert className="w-6 h-6" />,
          iconBg: 'servicehub-dialog__feedback-icon',
          btn: 'text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-message" aria-busy={isLoading} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div data-feedback-workspace={user?.role === 'provider' ? 'provider' : 'seeker'} className={`servicehub-dialog rounded-2xl max-w-lg w-full border shadow-xl p-6 relative animate-in zoom-in-95 duration-200 transition-colors duration-200 ${
        isDark ? 'bg-charcoal-surface border-neutral-800/80 text-white' : 'bg-white border-slate-200 text-ink'
      }`}>
        
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          disabled={isLoading}
          className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors ${
            isDark ? 'border-neutral-800 hover:bg-charcoal text-ink-subtle' : 'border-slate-200 hover:bg-slate-100 text-ink-subtle hover:text-ink-secondary'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Content */}
        <div className="flex flex-col items-center text-center space-y-3 pt-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${styles.iconBg}`}>
            {styles.icon}
          </div>
          
          <h3 id="confirm-modal-title" className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-ink'}`}>
            {title}
          </h3>
          
          <p id="confirm-modal-message" className="leading-relaxed max-w-sm font-medium">
            {message}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="servicehub-dialog__actions border-t border-slate-100 dark:border-neutral-850">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className={`flex-1 py-3 font-bold text-xs rounded-xl border transition-all ${
              isDark
                ? 'border-neutral-800 hover:bg-charcoal-hover text-ink-muted'
                : 'border-slate-200 hover:bg-slate-50 text-ink-muted'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            data-dialog-action={variant}
            className={`flex-1 py-3 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 ${styles.btn} ${
              isLoading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
