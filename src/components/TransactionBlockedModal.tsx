import React from 'react';
import { useApp } from '../context/AppContext';
import { useTransactionPermission } from '../hooks/useTransactionPermission';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      
      {/* Modal Card container */}
      <div className={`rounded-[24px] max-w-md w-full border shadow-xl overflow-hidden p-6 relative transition-colors duration-200 ${
        isDark ? 'bg-[#22211e] border-neutral-800/80 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors ${
            isDark ? 'border-neutral-800 hover:bg-slate-800 text-neutral-450' : 'border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Title Header */}
        <div className="flex flex-col items-center text-center space-y-4 pt-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border animate-pulse ${
            isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <h3 className={`text-lg font-extrabold ${isDark ? 'text-[#f2efe9]' : 'text-slate-900'}`}>
            Verification Required
          </h3>
          
          <p className={`text-xs leading-relaxed max-w-sm font-medium ${isDark ? 'text-[#b4b0a9]' : 'text-slate-500'}`}>
            You may browse ServiceHub freely, but you must complete Cordova Residency Verification before participating in marketplace transactions.
          </p>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-neutral-850">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 font-bold text-xs rounded-xl border transition-all ${
              isDark
                ? 'border-neutral-800 hover:bg-neutral-850 text-[#b4b0a9]'
                : 'border-slate-200 hover:bg-slate-50 text-slate-550'
            }`}
          >
            Maybe Later
          </button>
          
          <button
            type="button"
            onClick={handleVerifyNow}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Verify Now
          </button>
        </div>

      </div>
    </div>
  );
}
