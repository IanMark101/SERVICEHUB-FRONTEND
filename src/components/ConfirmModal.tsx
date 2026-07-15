import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, HelpCircle, ShieldAlert, CheckCircle2, X, Loader2 } from 'lucide-react';

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
  const { isDark } = useApp();

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
    await onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          iconBg: isDark ? 'bg-red-955/20 border-red-900/30' : 'bg-red-50 border-red-200',
          btn: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'info':
        return {
          icon: <HelpCircle className="w-6 h-6 text-blue-500" />,
          iconBg: isDark ? 'bg-blue-955/20 border-blue-900/30' : 'bg-blue-50 border-blue-200',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          iconBg: isDark ? 'bg-emerald-955/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      case 'warning':
      default:
        return {
          icon: <ShieldAlert className="w-6 h-6 text-orange-500" />,
          iconBg: isDark ? 'bg-orange-950/20 border-orange-900/30' : 'bg-orange-50 border-orange-200',
          btn: 'bg-orange-600 hover:bg-orange-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className={`rounded-[24px] max-w-md w-full border shadow-xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200 transition-colors duration-200 ${
        isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors ${
            isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Content */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${styles.iconBg}`}>
            {styles.icon}
          </div>
          
          <h3 className={`text-lg font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            {title}
          </h3>
          
          <p className={`text-xs leading-relaxed max-w-sm font-medium ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            {message}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-neutral-850">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className={`flex-1 py-3 font-bold text-xs rounded-xl border transition-all ${
              isDark
                ? 'border-neutral-800 hover:bg-[#2c2b27] text-[#b4b0a9]'
                : 'border-slate-200 hover:bg-slate-50 text-slate-550'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
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
