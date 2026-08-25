"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

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

// ── Configuration & Themes ───────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    cardClasses: string;
    iconColor: string;
    titleColor: string;
    messageColor: string;
    progressBar: string;
  }
> = {
  success: {
    icon: <CheckCircle2 size={19} />,
    cardClasses: 'bg-white/95 border-emerald-500/30 dark:bg-[#15231c]/95 dark:border-emerald-500/30 shadow-xl shadow-emerald-950/10 dark:shadow-black/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-slate-900 dark:text-[#f2efe9] font-extrabold',
    messageColor: 'text-slate-600 dark:text-emerald-200/80',
    progressBar: 'bg-emerald-500',
  },
  error: {
    icon: <XCircle size={19} />,
    cardClasses: 'bg-white/95 border-red-500/30 dark:bg-[#261616]/95 dark:border-red-500/30 shadow-xl shadow-red-950/10 dark:shadow-black/60',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-slate-900 dark:text-[#f2efe9] font-extrabold',
    messageColor: 'text-slate-600 dark:text-red-200/80',
    progressBar: 'bg-red-500',
  },
  warning: {
    icon: <AlertTriangle size={19} />,
    cardClasses: 'bg-white/95 border-amber-500/30 dark:bg-[#261f14]/95 dark:border-amber-500/30 shadow-xl shadow-amber-950/10 dark:shadow-black/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-slate-900 dark:text-[#f2efe9] font-extrabold',
    messageColor: 'text-slate-600 dark:text-amber-200/80',
    progressBar: 'bg-amber-500',
  },
  info: {
    icon: <Info size={19} />,
    cardClasses: 'bg-white/95 border-orange-500/30 dark:bg-[#241a14]/95 dark:border-orange-500/30 shadow-xl shadow-orange-950/10 dark:shadow-black/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
    titleColor: 'text-slate-900 dark:text-[#f2efe9] font-extrabold',
    messageColor: 'text-slate-600 dark:text-orange-200/80',
    progressBar: 'bg-orange-500',
  },
};

// ── Toast Item Component ──────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const cfg = TOAST_CONFIG[toast.type];
  const duration = toast.duration || 4500;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl min-w-[300px] max-w-[400px] relative overflow-hidden transition-all duration-200 select-none shadow-lg ${cfg.cardClasses}`}
      style={{
        animation: 'toast-spring-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <span className={`flex-shrink-0 mt-0.5 ${cfg.iconColor}`}>{cfg.icon}</span>
      <div className="flex-1 min-w-0 pr-2">
        <p className={`m-0 text-xs tracking-tight leading-snug ${cfg.titleColor}`}>
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
        className="bg-transparent border-0 cursor-pointer p-1 text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors duration-150 active:scale-90"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>

      {/* Auto-Dismiss Progress Bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2.5px] ${cfg.progressBar} opacity-75`}
        style={{
          width: '100%',
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-spring-in {
          0% { opacity: 0; transform: translateX(100%) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
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
