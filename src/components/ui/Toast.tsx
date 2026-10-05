"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './feedback.css';

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

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={19} />,
  error: <XCircle size={19} />,
  warning: <AlertTriangle size={19} />,
  info: <Info size={19} />,
};

// ── Toast Item Component ──────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const duration = toast.duration || 4500;

  return (
    <div
      role="alert"
      data-feedback-kind={toast.type}
      aria-live="polite"
      className="servicehub-toast flex w-full min-w-0 items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-200 select-none shadow-lg"
      style={{
        animation: 'toast-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <span className="servicehub-toast__icon flex-shrink-0 mt-0.5">{TOAST_ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0 pr-2">
        <p className="m-0 text-xs tracking-tight leading-snug text-ink dark:text-white font-extrabold">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-[11px] leading-relaxed font-medium text-ink-muted">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="bg-transparent border-0 cursor-pointer p-1 text-ink-subtle hover:text-ink-secondary dark:text-ink-subtle dark:hover:text-ink flex-shrink-0 flex items-center justify-center rounded-lg transition-colors duration-150 active:scale-90"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>

      {/* Auto-Dismiss Progress Bar */}
      <div
        className="servicehub-toast__progress absolute bottom-0 left-0 h-[2.5px] opacity-75"
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
        @keyframes toast-enter {
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
          right: '16px',
          width: 'min(400px, calc(100vw - 32px))',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'all', width: '100%' }}>
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
