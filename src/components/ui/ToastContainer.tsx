import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Global event system for toasts
const TOAST_EVENT = 'toast-notification';

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const event = new CustomEvent(TOAST_EVENT, {
    detail: { message, type, duration, id: Date.now().toString() + Math.random().toString(36) }
  });
  window.dispatchEvent(event);
}

// Make globally available
if (typeof window !== 'undefined') {
  (window as any).showToast = showToast;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styleMap = {
  success: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
    bar: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-400',
    bar: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-400',
    bar: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: 'text-amber-400',
    bar: 'bg-amber-500',
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type, duration, id } = (e as CustomEvent).detail;
      const newToast: Toast = { id, message, type, duration };
      
      setToasts(prev => [...prev.slice(-4), newToast]); // Max 5 toasts

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [removeToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const styles = styleMap[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl ${styles.bg} ${styles.border} animate-slide-in`}
            role="alert"
          >
            <Icon size={18} className={`${styles.icon} shrink-0 mt-0.5`} />
            <p className={`text-sm font-medium flex-1 ${styles.text}`}>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white/80 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
