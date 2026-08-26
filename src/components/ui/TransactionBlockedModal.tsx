import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { ShieldAlert, X } from 'lucide-react';

interface TransactionBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionBlockedModal({ isOpen, onClose }: TransactionBlockedModalProps) {
  const { isDark } = useApp();
  const { navigateToVerification } = useTransactionPermission();

  if (!isOpen) return null;

  const handleVerifyNow = () => {
    onClose();
    navigateToVerification();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-200">
      
      {/* Modal Card container */}
      <div className={`rounded-[24px] max-w-md w-full border shadow-2xl overflow-hidden p-6 relative transition-colors duration-200 ${
        isDark ? 'bg-[#1c1b18] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 p-1.5 rounded-xl border transition-all cursor-pointer ${
            isDark ? 'border-neutral-800 hover:bg-neutral-800/80 text-neutral-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Title Header */}
        <div className="flex flex-col items-center text-center space-y-3.5 pt-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            isDark ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Verification Required
          </h3>
          
          <p className={`text-xs leading-relaxed max-w-sm font-medium ${isDark ? 'text-[#b4b0a9]' : 'text-slate-600'}`}>
            You may browse ServiceHub freely, but you must complete Cordova Residency Verification before participating in marketplace transactions.
          </p>
        </div>

        {/* Action Buttons Footer - Clean Neutral Monochrome (Workspace-Agnostic) */}
        <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 font-bold text-xs rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'border-neutral-800 hover:bg-neutral-800/60 text-[#b4b0a9] hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Maybe Later
          </button>
          
          <button
            type="button"
            onClick={handleVerifyNow}
            className={`flex-1 py-2.5 font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer ${
              isDark
                ? 'bg-white hover:bg-neutral-100 text-neutral-950 shadow-white/10'
                : 'bg-neutral-900 hover:bg-black text-white shadow-neutral-900/20'
            }`}
          >
            Verify Now
          </button>
        </div>

      </div>
    </div>
  );
}
