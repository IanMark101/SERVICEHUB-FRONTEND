import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PhonePasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldPhone: string;
  newPhone: string;
  onConfirm: (password: string) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
}

export default function PhonePasswordConfirmModal({
  isOpen,
  onClose,
  oldPhone,
  newPhone,
  onConfirm,
  isLoading = false,
  error,
}: PhonePasswordConfirmModalProps) {
  const { isDark } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    await onConfirm(password);
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-6 overflow-hidden ${
          isDark ? 'bg-[#1e1d1a] border-neutral-800 text-[#f2efe9]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Security Verification</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Please verify your identity to change your GCash & Mobile payout number.
            </p>
          </div>
        </div>

        {/* Number Comparison Badge */}
        <div
          className={`p-3.5 rounded-xl border mb-4 text-xs ${
            isDark ? 'bg-[#191815] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span>Current Number:</span>
            <span className="font-semibold text-neutral-300 line-through">
              {oldPhone || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between text-emerald-500 font-semibold">
            <span>New Payout GCash:</span>
            <span className="font-bold text-emerald-400">{newPhone}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`block text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Account Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#191815] border-neutral-800 text-[#f2efe9] focus:border-emerald-500 focus:outline-none'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 focus:outline-none'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Required to prevent unauthorized redirection of your payments.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Verify & Update Number</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
