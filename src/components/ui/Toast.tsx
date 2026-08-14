"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ── Icons & Styles ────────────────────────────────────────────────────────────

// ── Icons & Styles ────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    cardClasses: string;
    iconColor: string;
    titleColor: string;
    messageColor: string;
  }
> = {
  success: {
    icon: <CheckCircle size={18} />,
    cardClasses: 'bg-white border-emerald-200 dark:bg-[#172620] dark:border-emerald-800/60 shadow-xl shadow-emerald-950/10 dark:shadow-black/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-950 dark:text-emerald-300 font-bold',
    messageColor: 'text-emerald-900/90 dark:text-emerald-100/80',
  },
  error: {
    icon: <XCircle size={18} />,
    cardClasses: 'bg-white border-red-200 dark:bg-[#281818] dark:border-red-800/60 shadow-xl shadow-red-950/10 dark:shadow-black/50',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-950 dark:text-red-300 font-bold',
    messageColor: 'text-red-900/90 dark:text-red-100/80',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    cardClasses: 'bg-white border-amber-200 dark:bg-[#282216] dark:border-amber-800/60 shadow-xl shadow-amber-950/10 dark:shadow-black/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-950 dark:text-amber-300 font-bold',
    messageColor: 'text-amber-900/90 dark:text-amber-100/80',
  },
  info: {
    icon: <Info size={18} />,
    cardClasses: 'bg-white border-indigo-200 dark:bg-[#1a1d29] dark:border-indigo-800/60 shadow-xl shadow-indigo-950/10 dark:shadow-black/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    titleColor: 'text-indigo-950 dark:text-indigo-300 font-bold',
    messageColor: 'text-indigo-900/90 dark:text-indigo-100/80',
  },
};

// ── Toast Item Component ──────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const cfg = TOAST_CONFIG[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md min-w-[290px] max-w-[390px] relative transition-all duration-200 select-none ${cfg.cardClasses}`}
      style={{
        animation: 'toast-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <span className={`flex-shrink-0 mt-0.5 ${cfg.iconColor}`}>{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`m-0 text-xs leading-snug ${cfg.titleColor}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className={`mt-1 text-[11px] leading-relaxed font-medium ${cfg.messageColor}`}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="bg-transparent border-0 cursor-pointer p-1 text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string, duration = 4500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newToast: Toast = { id, type, title, message, duration };
    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5

    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast('success', title, message), [toast]);
  const error = useCallback((title: string, message?: string) => toast('error', title, message), [toast]);
  const warning = useCallback((title: string, message?: string) => toast('warning', title, message), [toast]);
  const info = useCallback((title: string, message?: string) => toast('info', title, message), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
